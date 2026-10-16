import type { ReactNode } from 'react';

/**
 * 空状态（PRD §3.1 F-06 / F-05：列表无结果时给出友好说明与下一步入口）。
 */
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-border bg-bg-subtle px-6 py-12 text-center">
      <p className="font-serif text-lg font-semibold text-text">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-[52ch] text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
