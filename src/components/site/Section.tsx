import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * 分区：全站唯一的内容组织单元 —— 「标题 + 1px 横线 + 内容」（PRD §6.1 原则 4）。
 * 页面内容必须经由本组件组织，不要手写标题与横线（AGENTS.md §4.2）。
 */
export function Section({
  title,
  children,
  className,
  id,
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
  /** 标题右侧的附加操作，例如「查看全部」 */
  action?: ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section id={id} aria-labelledby={headingId} className={cn('mb-12', className)}>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h2 id={headingId} className="font-serif text-2xl font-semibold text-text">
          {title}
        </h2>
        {action ? <div className="shrink-0 text-sm">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
