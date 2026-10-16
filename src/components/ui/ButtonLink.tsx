import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary';

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition-colors duration-[120ms]';

const variants: Record<ButtonVariant, string> = {
  // Cardinal 实底仅用于主按钮，不作为大面积填充（AGENTS.md §4.4）
  primary: 'bg-cardinal text-white hover:bg-cardinal-dark',
  secondary: 'border border-cardinal bg-transparent text-cardinal hover:bg-cardinal/5',
};

/** 站内链接按钮。 */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

/** 外部链接按钮（新窗口打开，含 rel 与无障碍提示）。 */
export function ExternalButtonLink({
  href,
  children,
  variant = 'secondary',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(base, variants[variant], className)}
    >
      {children}
      <span className="sr-only">（在新窗口打开）</span>
    </a>
  );
}
