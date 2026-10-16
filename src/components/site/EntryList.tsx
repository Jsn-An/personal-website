import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** 编辑式条目列表：每行下压 1px 横线，末行去掉（PRD §6.3）。 */
export function EntryList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn('list-none p-0', className)}>{children}</ul>;
}

/**
 * 单条经历。
 *
 * @param descriptionHtml 由 renderMarkdown() 渲染，已 sanitize。
 */
export function EntryRow({
  title,
  subtitle,
  period,
  descriptionHtml,
  href,
}: {
  title: string;
  subtitle?: string;
  period?: string;
  descriptionHtml?: string;
  href?: string;
}) {
  return (
    <li className="border-b border-border py-6 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-medium leading-snug text-text">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-link hover:text-link-hover hover:underline"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        {period ? <p className="shrink-0 text-sm text-text-subtle">{period}</p> : null}
      </div>

      {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}

      {descriptionHtml ? (
        <div
          className="mt-3 text-sm text-text-muted [&_a]:text-link [&_a]:hover:underline [&_li]:mt-1 [&_li]:leading-relaxed [&_p]:mt-1 [&_ul]:list-disc [&_ul]:pl-5"
          // eslint-disable-next-line react/no-danger -- 内容已由 renderMarkdown() 经 rehype-sanitize 清洗
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      ) : null}
    </li>
  );
}

/** 「查看全部」这类区块级链接。 */
export function SectionMoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="text-link hover:text-link-hover hover:underline">
      {children}
    </Link>
  );
}
