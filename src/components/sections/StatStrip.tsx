/**
 * 数据条（PRD §6.3 首页）。
 * 数字用 Roboto Slab，标签用小号 --color-text-muted。
 */
export function StatStrip({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <dl className="my-12 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-8 sm:grid-cols-4">
      {stats.map((stat) => (
        // flex-col-reverse 让 DOM 保持 dt → dd 的正确顺序，同时把数字显示在上方
        <div key={stat.label} className="flex flex-col-reverse gap-1">
          <dt className="text-sm text-text-muted">{stat.label}</dt>
          <dd className="font-slab text-2xl font-medium text-text">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
