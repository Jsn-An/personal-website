'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * 代码块「复制」按钮的点击处理（PRD §3.1 F-09）。
 *
 * 按钮本身由 Markdown 管线在服务端生成（见 `lib/markdown.ts` 的 addCodeCopyButtons），
 * 因此这里只做事件委托，不再注入 DOM：
 * 好处是按钮随 HTML 一起到达，没有布局偏移，也不需要为每篇正文维护 React 状态。
 */
export function CodeBlockTools({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timers = new Set<number>();

    const handleClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest('button[data-code-copy]');
      if (!(button instanceof HTMLButtonElement) || !container.contains(button)) return;

      const pre = button.closest('figure')?.querySelector('pre');
      if (!pre) return;

      // 代码原文不含行号（行号由 CSS counter 生成），因此 innerText 即是可复制的代码
      const code = pre.textContent ?? '';
      if (code.length === 0 || !navigator.clipboard) return;

      void navigator.clipboard
        .writeText(code)
        .then(() => {
          button.textContent = '已复制';
          if (statusRef.current) statusRef.current.textContent = '代码已复制到剪贴板';
          timers.add(
            window.setTimeout(() => {
              button.textContent = '复制';
              if (statusRef.current) statusRef.current.textContent = '';
            }, 2000),
          );
        })
        .catch(() => {
          // 复制失败（权限被拒等）时不改变按钮文案，避免给出错误反馈
        });
    };

    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div ref={containerRef}>
      {children}
      <p ref={statusRef} aria-live="polite" className="sr-only" />
    </div>
  );
}
