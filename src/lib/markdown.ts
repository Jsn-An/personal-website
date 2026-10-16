import { toString } from 'hast-util-to-string';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface RenderedMarkdown {
  html: string;
  toc: TocEntry[];
}

/**
 * sanitize 白名单：在 GitHub schema 基础上扩展。
 *
 * 必须允许 `id`，否则 rehype-slug 注入的锚点 id 会被剥离，
 * 目录跳转与深链接随之失效（TECH_DESIGN §9）。
 */
const sanitizeSchema = {
  ...defaultSchema,
  // 单管理员 + 已 sanitize 的场景下，去除 user-content- 前缀以获得干净的锚点 URL。
  // 代价是理论上存在 DOM clobbering 的可能，但仅站主本人可写入内容，风险可接受。
  clobberPrefix: '',
  tagNames: [...(defaultSchema.tagNames ?? []), 'mark'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'id', 'className'],
    code: [...(defaultSchema.attributes?.['code'] ?? []), 'className', 'data-language'],
    span: [...(defaultSchema.attributes?.['span'] ?? []), 'className', 'data-line'],
  },
};

const prettyCodeOptions: PrettyCodeOptions = {
  // 与浅色主题一致（TECH_DESIGN §9）
  theme: 'github-light',
  keepBackground: false,
  defaultLang: { block: 'text', inline: 'text' },
};

/** 在 rehype-slug 之后收集 h2/h3，生成右侧目录（TECH_DESIGN §9）。
 *
 *  必须在 `rehypeAutolinkHeadings` **之前**运行：锚点插件会往标题里追加一个
 *  `<span aria-hidden>#</span>`，跑在它之后 `toString()` 会把「#」一并读进目录文字。
 */
function collectToc(store: TocEntry[]) {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return;
      const id = node.properties?.id;
      if (typeof id !== 'string' || id.length === 0) return;
      store.push({ id, text: toString(node), depth: node.tagName === 'h2' ? 2 : 3 });
    });
  };
}

/**
 * 给多行代码块补上行号属性。
 *
 * rehype-pretty-code 只在 meta 显式写了 `showLineNumbers` 时才输出这些属性，
 * 而本站内容由站主撰写，统一显示行号更实用，故在此统一补上。
 * 单行代码块不加行号（加了只是噪音）。
 */
function addCodeLineNumbers() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'pre') return;

      const code = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      );
      if (!code) return;

      const lineCount = code.children.filter(
        (child): child is Element =>
          child.type === 'element' && child.tagName === 'span' && 'data-line' in child.properties,
      ).length;
      if (lineCount <= 1) return;

      code.properties = {
        ...code.properties,
        'data-line-numbers': '',
        'data-line-numbers-max-digits': String(String(lineCount).length),
      };
    });
  };
}

/**
 * 在每个代码块上插入「复制」按钮。
 *
 * 按钮由本插件在 HTML 字符串里生成，因此**不需要客户端渲染**；
 * 点击行为由 `CodeBlockTools`（客户端组件）通过事件委托绑定（TECH_DESIGN §3）。
 * 该插件运行在 sanitize 之后，生成的是可信标记，不会被白名单剥离。
 */
function addCodeCopyButtons() {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'figure') return;
      if (!('data-rehype-pretty-code-figure' in node.properties)) return;
      if (!parent || typeof index !== 'number') return;

      const button: Element = {
        type: 'element',
        tagName: 'button',
        properties: {
          type: 'button',
          className: ['code-copy'],
          'data-code-copy': '',
          ariaLabel: '复制代码到剪贴板',
        },
        children: [{ type: 'text', value: '复制' }],
      };

      node.children = [button, ...node.children];
    });
  };
}

/** h2/h3 右侧的锚点链接（PRD §6.3 博客详情）。 */
const autolinkOptions = {
  behavior: 'append' as const,
  properties: {
    className: ['heading-anchor'],
    ariaLabel: '本节锚点链接',
  },
  content: {
    type: 'element' as const,
    tagName: 'span',
    properties: { 'aria-hidden': 'true' },
    children: [{ type: 'text' as const, value: '#' }],
  },
};

/**
 * 渲染 Markdown 为 HTML，并抽取目录。
 *
 * 管线顺序（TECH_DESIGN §9）：
 *   parse → GFM → rehype → slug → sanitize → 抽取目录 → autolink → pretty-code
 *         → 行号 → 复制按钮 → stringify
 *
 * 注意：autolink 与 pretty-code 放在 sanitize **之后**。
 * 它们生成的是可信标记，放在之后可避免被白名单剥离；
 * 而作者输入的部分已经先经过 sanitize 清洗。
 *
 * 抽取目录同样放在 autolink 之前，理由见 `collectToc` 的注释。
 *
 * 只允许在服务端调用（依赖 shiki 的高亮器）。
 */
export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const toc: TocEntry[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeSanitize, sanitizeSchema)
    .use(() => collectToc(toc))
    .use(rehypeAutolinkHeadings, autolinkOptions)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(addCodeLineNumbers)
    .use(addCodeCopyButtons)
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), toc };
}

/** 正文纯文本，用于搜索与摘要。 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^```[\s\S]*?^```/gm, ' ') // 代码块
    .replace(/^>\s?/gm, '') // 引用
    .replace(/^#{1,6}\s+/gm, '') // 标题
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 按「中文字符数 / 400 + 英文单词数 / 220」估算阅读时长（TECH_DESIGN §9）。 */
export function estimateReadingTime(markdown: string): number {
  const text = stripMarkdown(markdown);
  const cjkCount = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const wordCount = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjkCount / 400 + wordCount / 220));
}
