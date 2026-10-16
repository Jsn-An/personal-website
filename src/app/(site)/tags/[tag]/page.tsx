import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostListItem } from '@/components/cards/PostListItem';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EmptyState } from '@/components/site/EmptyState';
import { EntryList } from '@/components/site/EntryList';
import { JsonLd } from '@/components/site/JsonLd';
import { PageHeader } from '@/components/site/PageHeader';
import { Section } from '@/components/site/Section';
import { getProjectList } from '@/lib/queries/projects';
import { getPostsByTag } from '@/lib/queries/posts';
import { getTagSummaries, getTagSummary } from '@/lib/queries/tags';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

/**
 * 标签聚合页（PRD §3.1 F-10）：/tags/[tag] 同时展示该标签下的项目与文章，
 * 复用项目卡片与编辑式列表行两个既有组件。
 */

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const summaries = await getTagSummaries();
  return summaries.map((summary) => ({ tag: summary.tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const summary = await getTagSummary(decoded);
  const path = `/tags/${encodeURIComponent(decoded)}`;

  if (!summary) return buildMetadata({ title: '标签未找到', path });

  return buildMetadata({
    title: `标签：${decoded}`,
    description: `标签「${decoded}」下的全部内容：${summary.projectCount} 个项目、${summary.postCount} 篇文章。`,
    path,
    keywords: [decoded],
  });
}

export default async function TagDetailPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const summary = await getTagSummary(decoded);
  if (!summary) notFound();

  const [projects, posts] = await Promise.all([
    getProjectList({ tag: decoded, sort: 'newest' }),
    getPostsByTag(decoded),
  ]);

  const crumbs = [
    { label: '首页', href: '/' },
    { label: '标签', href: '/tags' },
    { label: decoded },
  ];

  return (
    <>
      <Breadcrumb items={crumbs} />

      <PageHeader
        title={`标签：${decoded}`}
        description={`共 ${summary.total} 条内容（项目 ${summary.projectCount} · 文章 ${summary.postCount}）。`}
      />

      {summary.total === 0 ? (
        <EmptyState title="这个标签下暂无内容" description="浏览标签总览可以看到全部有内容的标签。">
          <Link
            href="/tags"
            className="inline-flex items-center rounded-sm border border-cardinal px-4 py-2 text-sm font-semibold text-cardinal transition-colors duration-[120ms] hover:bg-cardinal/5"
          >
            查看标签总览
          </Link>
        </EmptyState>
      ) : (
        <>
          {projects.length > 0 ? (
            <Section title={`项目（${projects.length}）`}>
              <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <li key={project.slug} className="flex">
                    <div className="w-full">
                      <ProjectCard project={project} />
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {posts.length > 0 ? (
            <Section title={`文章（${posts.length}）`} className="mb-0">
              <EntryList>
                {posts.map((post) => (
                  <PostListItem key={post.slug} post={post} />
                ))}
              </EntryList>
            </Section>
          ) : null}
        </>
      )}

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
