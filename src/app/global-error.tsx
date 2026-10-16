'use client';

import './globals.css';
import { fontVariables } from '@/lib/fonts';

/**
 * 根级错误边界（TECH_DESIGN §13）。
 * 它替换整个根布局，因此必须自己输出 html / body 与字体变量。
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN" className={fontVariables}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-text">
        <main className="max-w-[68ch]">
          <p className="font-serif text-sm font-semibold uppercase tracking-wide text-cardinal">
            出错了
          </p>
          <h1 className="type-h1 mt-3 font-serif font-bold">站点暂时不可用</h1>
          <p className="mt-4 leading-relaxed text-text-muted">
            页面渲染过程中发生了未预期的错误。请稍后重试。
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-cardinal px-4 py-2 text-sm font-semibold text-white transition-colors duration-[120ms] hover:bg-cardinal-dark"
          >
            重试
          </button>
        </main>
      </body>
    </html>
  );
}
