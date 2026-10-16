import { getProjectTagCounts } from '@/lib/queries/projects';
import { getPostTagCounts } from '@/lib/queries/posts';

/**
 * 标签聚合（PRD §3.1 F-10：`/tags/[tag]` 聚合该标签下的项目与文章）。
 */

export interface TagSummary {
  tag: string;
  projectCount: number;
  postCount: number;
  total: number;
}

export async function getTagSummaries(): Promise<TagSummary[]> {
  const [projectTags, postTags] = await Promise.all([getProjectTagCounts(), getPostTagCounts()]);

  const merged = new Map<string, { projectCount: number; postCount: number }>();
  projectTags.forEach(({ tag, count }) =>
    merged.set(tag, { projectCount: count, postCount: 0 }),
  );
  postTags.forEach(({ tag, count }) => {
    const existing = merged.get(tag);
    merged.set(tag, { projectCount: existing?.projectCount ?? 0, postCount: count });
  });

  return Array.from(merged.entries())
    .map(([tag, counts]) => ({
      tag,
      projectCount: counts.projectCount,
      postCount: counts.postCount,
      total: counts.projectCount + counts.postCount,
    }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag, 'zh-Hans-CN'));
}

export async function getTagSummary(tag: string): Promise<TagSummary | null> {
  const summaries = await getTagSummaries();
  return summaries.find((summary) => summary.tag === tag) ?? null;
}
