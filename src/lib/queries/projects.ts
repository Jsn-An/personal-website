import type { Project } from '@/types/content';
import { allTags, featuredProjects, projects } from '@/content/projects';

/**
 * 项目的只读查询（AGENTS.md §3）。
 */

export type ProjectSort = 'newest' | 'featured';

/** 发布时间倒序（结束时间为空的项目视为进行中，排在最前）。 */
function byNewest(a: Project, b: Project): number {
  const aKey = a.endDate ?? '9999-99';
  const bKey = b.endDate ?? '9999-99';
  if (aKey === bKey) return a.startDate < b.startDate ? 1 : -1;
  return aKey < bKey ? 1 : -1;
}

export async function getProjects(): Promise<Project[]> {
  return [...projects].sort(byNewest);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return featuredProjects.slice(0, limit);
}

export async function getProjectTagOptions(): Promise<string[]> {
  return allTags;
}

export async function getProjectList(options: {
  tag?: string;
  sort?: ProjectSort;
}): Promise<Project[]> {
  const { tag, sort = 'newest' } = options;
  const filtered = tag ? projects.filter((project) => project.tags.includes(tag)) : [...projects];

  return sort === 'featured'
    ? filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || byNewest(a, b))
    : filtered.sort(byNewest);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getProjectSlugs(): Promise<string[]> {
  return projects.map((project) => project.slug);
}

/** 上一个 / 下一个项目（列表顺序：时间倒序）。 */
export async function getAdjacentProjects(
  slug: string,
): Promise<{ prev: Project | null; next: Project | null }> {
  const ordered = await getProjects();
  const index = ordered.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? (ordered[index - 1] ?? null) : null,
    next: index < ordered.length - 1 ? (ordered[index + 1] ?? null) : null,
  };
}

/** 除自身外、共享标签最多的项目（项目详情底部推荐）。 */
export async function getRelatedProjects(slug: string, limit = 2): Promise<Project[]> {
  const current = await getProjectBySlug(slug);
  if (!current) return [];

  return projects
    .filter((project) => project.slug !== slug)
    .map((project) => ({
      project,
      shared: project.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared || byNewest(a.project, b.project))
    .slice(0, limit)
    .map((entry) => entry.project);
}

export async function getProjectTagCounts(): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  projects.forEach((project) => {
    project.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hans-CN'));
}
