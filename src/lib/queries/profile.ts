import type { Profile, TimelineEntry, TimelineType } from '@/types/content';
import type { Publication } from '@/content/publications';
import { profile } from '@/content/profile';
import { timeline } from '@/content/timeline';
import { publications } from '@/content/publications';

/**
 * 个人介绍的只读查询（AGENTS.md §3：`src/lib/queries/` 是唯一的读数据入口）。
 *
 * 当前数据源是构建期的本地内容模块；切换到 Prisma 时只改本文件的实现，
 * 页面代码不需要变动（故这里全部声明为 async）。
 */

export async function getProfile(): Promise<Profile> {
  return profile;
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  return timeline;
}

export async function getTimelineByType(type: TimelineType): Promise<TimelineEntry[]> {
  return timeline.filter((entry) => entry.type === type);
}

/** 经历标签页：工作经历与社会服务合并展示。 */
export async function getExperience(): Promise<TimelineEntry[]> {
  return timeline.filter((entry) => entry.type === 'WORK' || entry.type === 'SERVICE');
}

export async function getPublications(): Promise<Publication[]> {
  return publications;
}
