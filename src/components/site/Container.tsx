import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * 内容容器（PRD §6.3 全局框架③）。
 * 最大宽度 1200px，左右留白：移动端 24px / 平板 40px / 桌面 64px。
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1200px] px-6 md:px-10 lg:px-16', className)}>
      {children}
    </div>
  );
}
