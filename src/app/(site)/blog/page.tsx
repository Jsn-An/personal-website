import type { Metadata } from 'next';
import { BlogToolbar } from '@/components/blog/BlogToolbar';
import { PostListItem } from '@/components/cards/PostListItem';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EmptyState } from '@/components/site/EmptyState';
import { EntryList } from '@/components/site/EntryList';
import { PageHeader } from '@/components/site/PageHeader';
import { Pagination } from '@/components/site/Pagination';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { getPostList, getPostTagCounts, getPostYears, POSTS_PER_PAGE } from '@/lib/queries/posts';
import { buildMetadata } from '@/lib/seo';

/**
 * 博客列表（PRD §3.1 F-08）：编辑式列表行（非卡片）+ 工具行 + 编号式分页。
 *
 * 搜索、标签、年份、页码全部由 URL 查询参数表达，服务端渲染结果，
 * 因此任何一组筛选都可分享、可收藏。
 */

export const metadata: Metadata = buildMetadata({
  title: '文章',
  description:
    '安泽祎的技术文章：图神经网络交通预测、边缘计算任务卸载、计算机视觉工程实践与科研方法笔记。',
  path: '/blog',
  keywords: ['技术博客', '图神经网络', '计算机视觉', '边缘计算', '科研笔记'],
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; year?: string }>;
}) {
  const params = await searchParams;

  const q = (params.q ?? '').slice(0, 100);
  const requestedTag = params.tag ?? '';
  const requestedYear = Number.parseInt(params.year ?? '', 10);

  const [tags, years] = await Promise.all([getPostTagCounts(), getPostYears()]);
  const activeTag = tags.some((entry) => entry.tag === requestedTag) ? requestedTag : undefined;
  const activeYear = years.includes(requestedYear) ? requestedYear : undefined;

  const result = await getPostList({ q, tag: activeTag, year: activeYear });

  const hrefForPage = (page: number): string => {
    const query = new URLSearchParams();
    if (q.trim().length > 0) query.set('q', q.trim());
    if (activeTag) query.set('tag', activeTag);
    if (activeYear) query.set('year', String(activeYear));
    if (page > 1) query.set('page', String(page));
    const search = query.toString();
    return search.length > 0 ? `/blog?${search}` : '/blog';
  };

  const hasFilter = q.trim().length > 0 || activeTag !== undefined || activeYear !== undefined;

  return (
    <>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '文章' }]} />

      <PageHeader
        title="文章"
        description="多数文章由真实项目中的问题驱动，而不是二手资料整理。"
      />

      <BlogToolbar q={q} tag={activeTag} year={activeYear} tags={tags} years={years} />

      {/* 数量由这里统一播报，避免与页头文案重复同一条信息 */}
      <p className="mb-2 text-sm text-text-subtle" aria-live="polite">
        {hasFilter
          ? `筛选出 ${result.filteredTotal} 篇，共 ${result.total} 篇`
          : `共 ${result.total} 篇，每页 ${POSTS_PER_PAGE} 篇`}
      </p>

      {result.items.length === 0 ? (
        <EmptyState
          title="没有匹配的文章"
          description="换一个关键词或标签试试，也可以清空筛选查看全部文章。"
        >
          <ButtonLink href="/blog" variant="secondary">
            清空筛选
          </ButtonLink>
          <ButtonLink href="/search">用主搜索查找项目和文章</ButtonLink>
        </EmptyState>
      ) : (
        <>
          <EntryList>
            {result.items.map((post) => (
              <PostListItem key={post.slug} post={post} />
            ))}
          </EntryList>

          <Pagination page={result.page} pageCount={result.pageCount} hrefFor={hrefForPage} />
        </>
      )}
    </>
  );
}
