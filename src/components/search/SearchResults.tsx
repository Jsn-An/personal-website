import Link from 'next/link';
import { highlight, type SearchHit } from '@/lib/search';
import type { Post, Project } from '@/types/content';
import { formatDate, formatDateRange } from '@/lib/utils';

/**
 * 搜索结果列表（PRD §3.1 F-03）。
 *
 * 与普通列表的区别只在「命中呈现」：摘要显示的是**命中片段**而非固定摘要，
 * 关键词连同命中的标签一起高亮。片段与标签都由 `lib/search.ts` 逐段转义后
 * 仅包裹 `<mark>`，因此可以安全地交给 dangerouslySetInnerHTML。
 */
function HighlightedTag({ tag, terms }: { tag: string; terms: string[] }) {
  const html = highlight(tag, terms);
  const matched = html.includes('<mark>');

  return (
    <span
      className={
        matched
          ? 'ml-1 inline-flex items-center rounded-full border border-cardinal px-2.5 py-0.5 text-xs text-text'
          : 'ml-1 inline-flex items-center rounded-full border border-border-strong px-2.5 py-0.5 text-xs text-text-muted'
      }
      // eslint-disable-next-line react/no-danger -- 已逐段转义，仅含 <mark>
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Snippet({ html }: { html: string }) {
  return (
    <p
      className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted"
      // eslint-disable-next-line react/no-danger -- 片段由 lib/search.ts 转义后仅包裹 <mark>
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ProjectHits({ hits, terms }: { hits: SearchHit<Project>[]; terms: string[] }) {
  return (
    <ul className="list-none p-0">
      {hits.map((hit) => (
        <li key={hit.item.slug} className="border-b border-border py-6 last:border-b-0">
          <h3 className="font-serif text-[1.375rem] font-semibold leading-snug">
            <Link
              href={`/projects/${hit.item.slug}`}
              className="text-text transition-colors duration-[120ms] hover:text-link"
            >
              {hit.item.title}
            </Link>
          </h3>

          <Snippet html={hit.snippetHtml} />

          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-text-subtle">
            <span>{hit.item.role}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDateRange(hit.item.startDate, hit.item.endDate, hit.item.current)}</span>
            {hit.item.tags.map((tag) => (
              <HighlightedTag key={tag} tag={tag} terms={terms} />
            ))}
            {hit.item.tech.slice(0, 3).map((tech) => (
              <HighlightedTag key={tech} tag={tech} terms={terms} />
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function PostHits({ hits, terms }: { hits: SearchHit<Post>[]; terms: string[] }) {
  return (
    <ul className="list-none p-0">
      {hits.map((hit) => (
        <li key={hit.item.slug} className="border-b border-border py-6 last:border-b-0">
          <h3 className="font-serif text-[1.375rem] font-semibold leading-snug">
            <Link
              href={`/blog/${hit.item.slug}`}
              className="text-text transition-colors duration-[120ms] hover:text-link"
            >
              {hit.item.title}
            </Link>
          </h3>

          <Snippet html={hit.snippetHtml} />

          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-text-subtle">
            <time dateTime={hit.item.publishedAt}>{formatDate(hit.item.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{hit.item.readingTime} 分钟</span>
            {hit.item.tags.map((tag) => (
              <HighlightedTag key={tag} tag={tag} terms={terms} />
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}
