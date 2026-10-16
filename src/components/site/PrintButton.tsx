'use client';

/**
 * 打印 / 另存为 PDF。
 *
 * PRD §10.2 把「简历以 PDF 静态文件提供，还是用页面形式呈现」列为开放问题。
 * 这里选择后者：个人页本身就是结构化简历，配合 globals.css 的打印样式
 * 即可由浏览器导出 PDF，无需另外维护一份容易过期的 PDF 文件。
 *
 * 另外，原始简历 PDF 含手机号，而手机号按既有结论不对外展示
 * （见 src/content/profile.ts 的说明），因此不直接对外提供该文件。
 */
export function PrintButton({ children = '打印 / 另存为 PDF' }: { children?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-sm border border-cardinal bg-transparent px-4 py-2 text-sm font-semibold text-cardinal transition-colors duration-[120ms] hover:bg-cardinal/5"
    >
      {children}
    </button>
  );
}
