/**
 * 跳到主要内容链接，位于 DOM 首位，聚焦时可见（PRD §5.3）。
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-2 focus:z-50 focus:rounded-sm focus:bg-cardinal focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white print:hidden"
    >
      跳到主要内容
    </a>
  );
}
