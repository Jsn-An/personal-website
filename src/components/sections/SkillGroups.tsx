import Link from 'next/link';
import { Chip } from '@/components/ui/Chip';
import { LevelBadge } from '@/components/ui/LevelBadge';
import type { SkillCategory } from '@/types/content';

/**
 * 技能网格（PRD §6.3「技能标签页内容」）。
 *
 * - 精选技能置顶，左侧 2px Cardinal 竖条标识
 * - 熟练度用离散标签而非进度条，避免视觉噪音（PRD §3.1 F-05）
 * - 无图标时渲染首字母方块
 */
export function SkillGrid({ category }: { category: SkillCategory }) {
  const skills = [...category.skills].sort((a, b) => Number(b.featured) - Number(a.featured));

  return (
    <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <li
          key={skill.id}
          className="relative flex items-center gap-3 rounded-sm border border-border bg-surface py-3 pr-4 pl-4"
        >
          {skill.featured ? (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 rounded-l-sm bg-cardinal"
            />
          ) : null}

          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-bg-subtle font-serif text-sm font-semibold text-text-muted"
          >
            {skill.name.slice(0, 1).toUpperCase()}
          </span>

          <span className="min-w-0 flex-1">
            {/*
              不做 truncate：技能名是本行的主要信息，被省略号截断会看不到全称
              （例如「图神经网络（GNN）」「Xilinx Vivado / FPGA」）。
              窄栏下允许折行，卡片高度不一致是可接受的。
            */}
            <span className="block text-sm font-medium text-text">{skill.name}</span>
            {skill.note ? (
              <span className="mt-0.5 block text-xs text-text-subtle">{skill.note}</span>
            ) : null}
          </span>

          <LevelBadge level={skill.level} />
        </li>
      ))}
    </ul>
  );
}

/**
 * 分类标签行（PRD §6.3）：激活项 Cardinal 实底 + 白字，默认 1px 描边 + 灰字。
 * 用链接而非按钮，让分类可直达、可分享。
 */
export function CategoryTabs({
  items,
  activeId,
  hrefFor,
}: {
  items: { id: string; label: string; count: number }[];
  activeId: string;
  hrefFor: (id: string) => string;
}) {
  return (
    <ul className="mb-8 flex list-none flex-wrap gap-2 p-0">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id}>
            <Link
              href={hrefFor(item.id)}
              aria-current={isActive ? 'true' : undefined}
              className={
                isActive
                  ? 'inline-flex items-center rounded-full border border-cardinal bg-cardinal px-3 py-1 text-sm text-white'
                  : 'inline-flex items-center rounded-full border border-border-strong px-3 py-1 text-sm text-text-muted transition-colors duration-[120ms] hover:border-ink-40 hover:text-text'
              }
            >
              {item.label}
              <span className="ml-2 text-xs opacity-80">{item.count}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** 首页「技能领域」区块：分类名称 + 该分类的技术栈 chip 群（精选项用实描边强调）。 */
export function SkillCategorySummary({ category }: { category: SkillCategory }) {
  return (
    <div className="border-b border-border py-6 last:border-b-0">
      <h3 className="text-sm font-semibold text-text">{category.name}</h3>
      <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
        {category.skills.map((skill) => (
          <li key={skill.id}>
            <Chip variant={skill.featured ? 'default' : 'muted'}>{skill.name}</Chip>
          </li>
        ))}
      </ul>
    </div>
  );
}
