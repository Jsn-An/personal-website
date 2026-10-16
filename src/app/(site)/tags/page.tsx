import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EmptyState } from '@/components/site/EmptyState';
import { PageHeader } from '@/components/site/PageHeader';
import { getTagSummaries } from '@/lib/queries/tags';
import { buildMetadata } from '@/lib/seo';

/** 标签总览：聚合展示每个标签下的项目数与文章数（PRD §3.1 F-10 的入口页）。 */

export const metadata: Metadata = buildMetadata({
  title: '标签',
  description: '按标签浏览安泽祎的项目与文章：图神经网络、计算机视觉、边缘计算、科研方法等。',
  path: '/tags',
});

export default async function TagsPage() {
  const summaries = await getTagSummaries();

  return (
    <>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '标签' }]} />

      <PageHeader
        title="标签"
        description={`共 ${summaries.length} 个标签。点开任一标签可同时看到相关的项目与文章。`}
      />

      {summaries.length === 0 ? (
        <EmptyState title="暂无标签" description="内容发布后，这里是标签的聚合入口。" />
      ) : (
        <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((summary) => (
            <li key={summary.tag}>
              <Link
                href={`/tags/${encodeURIComponent(summary.tag)}`}
                className="flex items-center justify-between gap-4 rounded-sm border border-border bg-surface px-4 py-3 transition-colors duration-[120ms] hover:border-ink-40"
              >
                <span className="min-w-0 truncate text-sm font-medium text-text">
                  {summary.tag}
                </span>
                <span className="shrink-0 text-xs text-text-subtle">
                  项目 {summary.projectCount} · 文章 {summary.postCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
