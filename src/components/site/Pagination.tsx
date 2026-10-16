import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * 编号式分页（PRD §6.3 博客列表）。
 * 激活页 Cardinal 实底 + 白字；页码由服务端渲染，靠 URL 参数表达状态。
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  className,
}: {
  page: number;
  pageCount: number;
  /** 由调用方决定页码如何映射到 URL */
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = pageWindow(page, pageCount);

  return (
    <nav aria-label="分页" className={cn('mt-8', className)}>
      <ul className="flex list-none flex-wrap items-center gap-2 p-0">
        <li>
          <PageLink href={hrefFor(page - 1)} disabled={page <= 1} label="上一页" />
        </li>

        {pages.map((entry, index) =>
          entry === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-text-subtle">
              …
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={hrefFor(entry)}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`第 ${entry} 页`}
                className={cn(
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-3 text-sm transition-colors duration-[120ms]',
                  entry === page
                    ? 'border-cardinal bg-cardinal font-semibold text-white'
                    : 'border-border-strong text-text-muted hover:border-ink-40 hover:text-text',
                )}
              >
                {entry}
              </Link>
            </li>
          ),
        )}

        <li>
          <PageLink href={hrefFor(page + 1)} disabled={page >= pageCount} label="下一页" />
        </li>
      </ul>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-9 items-center rounded-sm border border-border px-3 text-sm text-text-subtle"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-sm border border-border-strong px-3 text-sm text-text-muted transition-colors duration-[120ms] hover:border-ink-40 hover:text-text"
    >
      {label}
    </Link>
  );
}

/** 页码窗口：首尾各保留一页，中间用 null 表示省略号。 */
function pageWindow(page: number, pageCount: number): (number | null)[] {
  const candidates = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = Array.from(candidates)
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);

  const result: (number | null)[] = [];
  let previous = 0;

  for (const value of sorted) {
    if (previous !== 0 && value - previous > 1) result.push(null);
    result.push(value);
    previous = value;
  }

  return result;
}
