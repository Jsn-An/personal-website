'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';

const DEBOUNCE_MS = 300;

interface ToolbarState {
  q: string;
  tag: string;
  year: string;
}

function buildUrl({ q, tag, year }: ToolbarState): string {
  const params = new URLSearchParams();
  if (q.trim().length > 0) params.set('q', q.trim());
  if (tag.length > 0) params.set('tag', tag);
  if (year.length > 0) params.set('year', year);
  const search = params.toString();
  return search.length > 0 ? `/blog?${search}` : '/blog';
}

/**
 * 博客列表工具行（PRD §3.1 F-08）：搜索框 + 标签 / 年份筛选。
 *
 * 筛选状态全部落在 URL 查询参数上，由服务端渲染结果，
 * 这样任何一组筛选都可分享、可收藏，也不需要把文章数据发到浏览器。
 */
export function BlogToolbar({
  q,
  tag,
  year,
  tags,
  years,
}: {
  q: string;
  tag?: string;
  year?: number;
  tags: { tag: string; count: number }[];
  years: number[];
}) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState(q);

  const currentTag = tag ?? '';
  const currentYear = year ? String(year) : '';

  // 输入防抖：300ms 后用 replace 更新 URL，避免每敲一个字都压入一条历史记录
  useEffect(() => {
    if (query === q) return;

    const timer = window.setTimeout(() => {
      router.replace(buildUrl({ q: query, tag: currentTag, year: currentYear }), {
        scroll: false,
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, q, currentTag, currentYear, router]);

  const hasFilter = q.trim().length > 0 || currentTag.length > 0 || currentYear.length > 0;

  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-sm">
        <label htmlFor={inputId} className="sr-only">
          在文章中搜索
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          autoComplete="off"
          placeholder="在文章中搜索"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            router.replace(buildUrl({ q: query, tag: currentTag, year: currentYear }));
          }}
          className="h-11 w-full rounded-sm border border-border-strong bg-surface px-4 text-base text-text outline-none transition-colors duration-[120ms] placeholder:text-text-subtle focus:border-cardinal focus:ring-2 focus:ring-cardinal/25"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label htmlFor={`${inputId}-tag`} className="sr-only">
            按标签筛选
          </label>
          <select
            id={`${inputId}-tag`}
            value={currentTag}
            onChange={(event) =>
              router.push(
                buildUrl({ q: query, tag: event.target.value, year: currentYear }),
                { scroll: false },
              )
            }
            className="h-11 rounded-sm border border-border-strong bg-surface px-3 text-sm text-text"
          >
            <option value="">全部标签</option>
            {tags.map((entry) => (
              <option key={entry.tag} value={entry.tag}>
                {entry.tag}（{entry.count}）
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${inputId}-year`} className="sr-only">
            按年份筛选
          </label>
          <select
            id={`${inputId}-year`}
            value={currentYear}
            onChange={(event) =>
              router.push(
                buildUrl({ q: query, tag: currentTag, year: event.target.value }),
                { scroll: false },
              )
            }
            className="h-11 rounded-sm border border-border-strong bg-surface px-3 text-sm text-text"
          >
            <option value="">全部年份</option>
            {years.map((value) => (
              <option key={value} value={String(value)}>
                {value} 年
              </option>
            ))}
          </select>
        </div>

        {hasFilter ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              router.push('/blog');
            }}
            className="h-11 rounded-sm border border-border-strong px-3 text-sm text-text-muted transition-colors duration-[120ms] hover:border-ink-40 hover:text-text"
          >
            清除筛选
          </button>
        ) : null}
      </div>
    </div>
  );
}
