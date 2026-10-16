import type { Metadata } from 'next';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EmptyState } from '@/components/site/EmptyState';
import { PageHeader } from '@/components/site/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ChipLink } from '@/components/ui/Chip';
import { getProjectList, getProjectTagCounts, getProjectTagOptions, type ProjectSort } from '@/lib/queries/projects';
import { buildMetadata } from '@/lib/seo';

/**
 * 项目列表（PRD §3.1 F-06）。
 * 筛选与排序状态全部走 URL 查询参数，结果可分享；卡片网格桌面三列 / 平板两列 / 手机单列。
 */

export const metadata: Metadata = buildMetadata({
  title: '项目',
  description:
    '安泽祎的项目与科研课题：图神经网络交通预测、GCN-LSTM 边缘网络任务卸载、机器人视觉感知系统、轻量化船舶目标检测。',
  path: '/projects',
  keywords: ['项目', '图神经网络', '目标检测', '边缘计算', '科研'],
});

const SORTS: { id: ProjectSort; label: string }[] = [
  { id: 'newest', label: '最新' },
  { id: 'featured', label: '精选优先' },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sort?: string }>;
}) {
  const params = await searchParams;

  const [tagOptions, tagCounts] = await Promise.all([
    getProjectTagOptions(),
    getProjectTagCounts(),
  ]);

  const activeTag = params.tag && tagOptions.includes(params.tag) ? params.tag : undefined;
  const activeSort: ProjectSort = params.sort === 'featured' ? 'featured' : 'newest';

  const projects = await getProjectList({ tag: activeTag, sort: activeSort });

  const hrefFor = (nextTag?: string, nextSort: ProjectSort = activeSort): string => {
    const query = new URLSearchParams();
    if (nextTag) query.set('tag', nextTag);
    if (nextSort !== 'newest') query.set('sort', nextSort);
    const search = query.toString();
    return search.length > 0 ? `/projects?${search}` : '/projects';
  };

  const countFor = new Map(tagCounts.map((entry) => [entry.tag, entry.count]));

  return (
    <>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '项目' }]} />

      <PageHeader
        title="项目"
        description="科研课题与工程实践。每篇都按「背景 / 挑战 / 方案 / 结果」组织，尽量交代清楚做了什么、为什么这么做。"
      />

      <div className="mb-8 space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-text-subtle">标签</span>
          <ChipLink href={hrefFor(undefined)} active={activeTag === undefined}>
            全部
          </ChipLink>
          {tagCounts.map((entry) => (
            <ChipLink
              key={entry.tag}
              href={hrefFor(entry.tag)}
              active={activeTag === entry.tag}
            >
              {entry.tag}
              <span className="ml-1.5 text-xs opacity-80">{countFor.get(entry.tag)}</span>
            </ChipLink>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-text-subtle">排序</span>
          {SORTS.map((sort) => (
            <ChipLink
              key={sort.id}
              href={hrefFor(activeTag, sort.id)}
              active={activeSort === sort.id}
            >
              {sort.label}
            </ChipLink>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="这个标签下还没有项目"
          description="换一个标签，或浏览全部项目。"
        >
          <ButtonLink href="/projects" variant="secondary">
            查看全部项目
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <p className="mb-6 text-sm text-text-subtle" aria-live="polite">
            共 {projects.length} 个项目
          </p>
          <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.slug} className="flex">
                <div className="w-full">
                  <ProjectCard project={project} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
