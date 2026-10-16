import type { Post, Project } from '@/types/content';
import { stripMarkdown } from '@/lib/markdown';
import { posts } from '@/content/posts';
import { projects } from '@/content/projects';

/**
 * 站内搜索（PRD §3.1 F-03）。
 *
 * 当前内容是构建期确定的本地模块，数据量在数十条以内，
 * 因此用内存索引做子串匹配即可，无需 pg_trgm（TECH_DESIGN §8.5 的 v1 方案）。
 * 切换到数据库时，只需把 buildIndex / query 换成 SQL 实现，本文件的导出签名不变。
 *
 * 中文没有词边界，因此不做分词：把整个查询串与各字段做大小写无关的子串匹配，
 * 多词查询（空格分隔）要求每个词都命中（AND 语义）。
 */

export type SearchField = 'title' | 'tag' | 'excerpt' | 'body';

export interface SearchHit<T> {
  item: T;
  score: number;
  /** 命中权重最高的字段 */
  field: SearchField;
  /** 已做 HTML 转义的摘要片段，命中处用 <mark> 包裹（可直接用于 dangerouslySetInnerHTML） */
  snippetHtml: string;
}

export interface SearchResults {
  query: string;
  projects: SearchHit<Project>[];
  posts: SearchHit<Post>[];
  total: number;
}

interface IndexEntry<T> {
  item: T;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
  /** 正文原文（仅做过 Markdown 剥离），用于生成命中片段 */
  bodyRaw: string;
}

/** 字段权重：标题 > 标签 > 摘要 > 正文 */
const WEIGHT: Record<SearchField, number> = {
  title: 12,
  tag: 8,
  excerpt: 5,
  body: 2,
};

const projectIndex: IndexEntry<Project>[] = projects.map((project) => {
  const bodyRaw = stripMarkdown(project.description);
  return {
    item: project,
    title: project.title.toLowerCase(),
    tag: project.tags.concat(project.tech).join(' ').toLowerCase(),
    excerpt: project.summary.toLowerCase(),
    body: bodyRaw.toLowerCase(),
    bodyRaw,
  };
});

const postIndex: IndexEntry<Post>[] = posts.map((post) => {
  const bodyRaw = stripMarkdown(post.content);
  return {
    item: post,
    title: post.title.toLowerCase(),
    tag: post.tags.join(' ').toLowerCase(),
    excerpt: post.excerpt.toLowerCase(),
    body: bodyRaw.toLowerCase(),
    bodyRaw,
  };
});

/** 查询串 → 去重后的小写关键词。 */
export function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 0),
    ),
  );
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function scoreEntry(
  entry: IndexEntry<unknown>,
  terms: string[],
): { score: number; field: SearchField } | null {
  let score = 0;
  let bestField: SearchField = 'body';
  let bestFieldScore = 0;

  for (const term of terms) {
    let termScore = 0;
    const fields: SearchField[] = ['title', 'tag', 'excerpt', 'body'];

    for (const field of fields) {
      // 出现次数封顶 3 次，避免长正文靠重复堆分
      const hits = Math.min(countOccurrences(entry[field], term), 3);
      if (hits === 0) continue;
      const fieldScore = hits * WEIGHT[field];
      termScore += fieldScore;
      if (fieldScore > bestFieldScore) {
        bestFieldScore = fieldScore;
        bestField = field;
      }
    }

    // AND 语义：任一关键词完全未命中则该条不参与排序
    if (termScore === 0) return null;
    score += termScore;
  }

  return { score, field: bestField };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 在已转义的文本上包裹 <mark>。先分段再逐段转义，避免命中 HTML 实体。 */
export function highlight(text: string, terms: string[]): string {
  const usable = terms.filter((term) => term.length > 0).sort((a, b) => b.length - a.length);
  if (usable.length === 0) return escapeHtml(text);

  const pattern = new RegExp(`(${usable.map(escapeRegExp).join('|')})`, 'gi');
  return text
    .split(pattern)
    .map((part, index) => (index % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
    .join('');
}

/** 以首个命中位置为中心截取片段，两端加省略号。 */
function makeSnippet(text: string, terms: string[], radius = 90): string {
  const lower = text.toLowerCase();
  let firstIndex = -1;
  let matchedLength = 0;

  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
      matchedLength = term.length;
    }
  }

  if (firstIndex === -1) {
    return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  }

  const start = Math.max(0, firstIndex - Math.floor(radius / 2));
  const end = Math.min(text.length, firstIndex + matchedLength + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function toHits<T>(
  entries: IndexEntry<T>[],
  terms: string[],
  render: (entry: IndexEntry<T>) => string,
  limit: number,
): SearchHit<T>[] {
  const hits: SearchHit<T>[] = [];

  for (const entry of entries) {
    const scored = scoreEntry(entry, terms);
    if (!scored) continue;

    // 命中只出现在正文时，片段必须取自正文，否则访客看不到任何一个高亮
    const source = scored.field === 'body' ? entry.bodyRaw : render(entry);

    hits.push({
      item: entry.item,
      score: scored.score,
      field: scored.field,
      snippetHtml: highlight(makeSnippet(source, terms), terms),
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** 跨项目与文章搜索。 */
export async function searchContent(query: string, limitPerType = 20): Promise<SearchResults> {
  const terms = tokenize(query);
  if (terms.length === 0) {
    return { query, projects: [], posts: [], total: 0 };
  }

  const projectHits = toHits(projectIndex, terms, (entry) => entry.item.summary, limitPerType);
  const postHits = toHits(postIndex, terms, (entry) => entry.item.excerpt, limitPerType);

  return {
    query,
    projects: projectHits,
    posts: postHits,
    total: projectHits.length + postHits.length,
  };
}

export interface SearchSuggestion {
  type: '项目' | '文章';
  title: string;
  href: string;
  snippetHtml: string;
  score: number;
}

/** 首页搜索框的即时建议（PRD §3.1 F-03：300ms 防抖）。 */
export async function searchSuggestions(query: string, limit = 6): Promise<SearchSuggestion[]> {
  const results = await searchContent(query, limit);
  const suggestions: SearchSuggestion[] = [
    ...results.projects.map((hit) => ({
      type: '项目' as const,
      title: hit.item.title,
      href: `/projects/${hit.item.slug}`,
      snippetHtml: hit.snippetHtml,
      score: hit.score,
    })),
    ...results.posts.map((hit) => ({
      type: '文章' as const,
      title: hit.item.title,
      href: `/blog/${hit.item.slug}`,
      snippetHtml: hit.snippetHtml,
      score: hit.score,
    })),
  ];

  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** 无结果时的建议标签（PRD §3.1 F-03）。 */
export function suggestionTags(limit = 8): string[] {
  const counts = new Map<string, number>();
  const bump = (tag: string): void => {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  };
  projects.forEach((project) => project.tags.forEach(bump));
  posts.forEach((post) => post.tags.forEach(bump));

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN'))
    .slice(0, limit)
    .map(([tag]) => tag);
}
