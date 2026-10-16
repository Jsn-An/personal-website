import type { Post } from '@/types/content';
import { posts } from '@/content/posts';
import { stripMarkdown } from '@/lib/markdown';

/**
 * 文章的只读查询（AGENTS.md §3）。
 *
 * 当前数据源是本地内容模块；切到 Prisma 时只需改本文件的实现。
 * 所有导出只返回已发布内容——本地模块里的条目一律视为已发布（示例文章另行标记）。
 */

export const POSTS_PER_PAGE = 8;

/** 发布时间倒序。 */
const ordered: Post[] = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export async function getPublishedPosts(): Promise<Post[]> {
  return ordered;
}

export async function getLatestPosts(limit = 3): Promise<Post[]> {
  return ordered.slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return ordered.find((post) => post.slug === slug) ?? null;
}

export async function getPostSlugs(): Promise<string[]> {
  return ordered.map((post) => post.slug);
}

export async function getPostYears(): Promise<number[]> {
  const years = new Set(ordered.map((post) => Number(post.publishedAt.slice(0, 4))));
  return Array.from(years).sort((a, b) => b - a);
}

export async function getPostTagCounts(): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  ordered.forEach((post) => {
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hans-CN'));
}

export interface PostListFilter {
  q?: string;
  tag?: string;
  year?: number;
  page?: number;
}

export interface PostListResult {
  items: Post[];
  total: number;
  page: number;
  pageCount: number;
  /** 命中的总篇数（不受分页影响） */
  filteredTotal: number;
}

/**
 * 博客列表的筛选 + 编号式分页（PRD §3.1 F-08）。
 * 服务端执行，靠 URL 查询参数表达筛选状态，结果可分享。
 */
export async function getPostList(filter: PostListFilter = {}): Promise<PostListResult> {
  const { q, tag, year, page = 1 } = filter;

  let items = ordered;

  if (tag) {
    items = items.filter((post) => post.tags.includes(tag));
  }

  if (typeof year === 'number' && Number.isFinite(year)) {
    items = items.filter((post) => post.publishedAt.startsWith(String(year)));
  }

  if (q && q.trim().length > 0) {
    const terms = q.trim().toLowerCase().split(/\s+/);
    items = items.filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.tags.join(' ')} ${stripMarkdown(
        post.content,
      )}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  const pageCount = Math.max(1, Math.ceil(items.length / POSTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * POSTS_PER_PAGE;

  return {
    items: items.slice(start, start + POSTS_PER_PAGE),
    total: ordered.length,
    filteredTotal: items.length,
    page: safePage,
    pageCount,
  };
}

/** 上一篇（更新）/ 下一篇（更旧）。 */
export async function getAdjacentPosts(
  slug: string,
): Promise<{ prev: Post | null; next: Post | null }> {
  const index = ordered.findIndex((post) => post.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? (ordered[index - 1] ?? null) : null,
    next: index < ordered.length - 1 ? (ordered[index + 1] ?? null) : null,
  };
}

/** 共享标签最多的其他文章（文章详情底部「相关文章」）。 */
export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const current = await getPostBySlug(slug);
  if (!current) return [];

  return ordered
    .filter((post) => post.slug !== slug)
    .map((post) => ({
      post,
      shared: post.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort(
      (a, b) => b.shared - a.shared || b.post.publishedAt.localeCompare(a.post.publishedAt),
    )
    .slice(0, limit)
    .map((entry) => entry.post);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  return ordered.filter((post) => post.tags.includes(tag));
}

export async function getPostTotals(): Promise<{ published: number; tags: number }> {
  const tags = new Set(ordered.flatMap((post) => post.tags));
  return { published: ordered.length, tags: tags.size };
}
