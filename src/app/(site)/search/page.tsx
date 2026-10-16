import type { Metadata } from 'next';
import Link from 'next/link';
import { PostHits, ProjectHits } from '@/components/search/SearchResults';
import { SearchBox } from '@/components/search/SearchBox';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EmptyState } from '@/components/site/EmptyState';
import { PageHeader } from '@/components/site/PageHeader';
import { Section } from '@/components/site/Section';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { searchContent, suggestionTags, tokenize } from '@/lib/search';
import { buildMetadata } from '@/lib/seo';

/**
 * 主搜索落地页（PRD §3.1 F-03）。
 * 结果按「项目 / 文章」两组分区展示；无结果时给出建议标签。
 * 依赖查询参数，动态渲染且不缓存（TECH_DESIGN §6.2），同时告诉爬虫不要索引结果页。
 */

export const metadata: Metadata = {
  ...buildMetadata({
    title: '搜索',
    description: '搜索安泽祎的项目与文章。',
    path: '/search',
  }),
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? '').slice(0, 100).trim();

  const results = query.length > 0 ? await searchContent(query) : null;
  const terms = tokenize(query);
  const tags = suggestionTags(8);

  return (
    <>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '搜索' }]} />

      <PageHeader
        title="搜索"
        description="同时检索项目与文章，标题命中的结果排在前面。"
      />

      <div className="mb-10 max-w-2xl">
        <SearchBox initialQuery={query} variant="hero" autoFocus={query.length === 0} />
      </div>

      {results === null ? (
        <EmptyState
          title="输入关键词开始搜索"
          description="可以搜索技术名词、项目名或文章标题。下面是站内出现频率较高的标签，点击即可查看相关内容。"
        >
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full border border-border-strong px-3 py-1 text-sm text-text-muted transition-colors duration-[120ms] hover:border-cardinal hover:text-cardinal"
            >
              {tag}
            </Link>
          ))}
        </EmptyState>
      ) : results.total === 0 ? (
        <EmptyState
          title={`没有找到与「${results.query}」相关的内容`}
          description="试试更短的关键词，或从下面的高频标签入手。"
        >
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center rounded-full border border-border-strong px-3 py-1 text-sm text-text-muted transition-colors duration-[120ms] hover:border-cardinal hover:text-cardinal"
            >
              {tag}
            </Link>
          ))}
          <ButtonLink href="/blog" variant="secondary">
            浏览全部文章
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <p className="mb-8 text-sm text-text-subtle" aria-live="polite">
            关键词「{results.query}」共命中 {results.total} 条（项目 {results.projects.length} · 文章{' '}
            {results.posts.length}）
          </p>

          {results.projects.length > 0 ? (
            <Section title={`项目（${results.projects.length}）`}>
              <ProjectHits hits={results.projects} terms={terms} />
            </Section>
          ) : null}

          {results.posts.length > 0 ? (
            <Section title={`文章（${results.posts.length}）`} className="mb-0">
              <PostHits hits={results.posts} terms={terms} />
            </Section>
          ) : null}
        </>
      )}
    </>
  );
}
