import { cn } from '@/lib/utils';

/**
 * Markdown 正文容器。
 *
 * 传入的 html 必须来自 renderMarkdown()（已过 rehype-sanitize）。
 * 禁止把未清洗的内容传进来 —— AGENTS.md §4.5。
 */
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn('prose-site', className)}
      // eslint-disable-next-line react/no-danger -- 内容已由 renderMarkdown() 经 rehype-sanitize 清洗
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
