import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChipVariant = 'default' | 'active' | 'muted';

/**
 * 标签 / 筛选 chip（PRD §6.3）。
 * 默认：1px 描边 + 灰字；激活：Cardinal 实底 + 白字。
 * 胶囊形仅允许用于 chip（AGENTS.md §4.4）。
 *
 * `whitespace-nowrap` 是必需的：chip 常与标题同处一个 flex 行，
 * 允许换行会把「精选」拆成上下两个字。
 */
export function Chip({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: ChipVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs leading-5',
        variant === 'active' && 'border border-cardinal bg-cardinal text-white',
        variant === 'default' && 'border border-border-strong text-text-muted',
        variant === 'muted' && 'border border-border bg-bg-subtle text-text-subtle',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 可点击的筛选 chip（服务端渲染，靠 URL 参数切换激活态）。 */
export function ChipLink({
  children,
  href,
  active,
}: {
  children: ReactNode;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors duration-[120ms]',
        active
          ? 'border border-cardinal bg-cardinal text-white'
          : 'border border-border-strong text-text-muted hover:border-ink-40 hover:text-text',
      )}
    >
      {children}
    </Link>
  );
}
