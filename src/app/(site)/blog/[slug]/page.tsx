import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeBlockTools } from '@/components/blog/CodeBlockTools';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { PostListItem } from '@/components/cards/PostListItem';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EntryList } from '@/components/site/EntryList';
import { JsonLd } from '@/components/site/JsonLd';
import { Prose } from '@/components/site/Prose';
import { Section } from '@/components/site/Section';
import { Chip } from '@/components/ui/Chip';
import { renderMarkdown } from '@/lib/markdown';
import {
  getAdjacentPosts,
  getPostBySlug,
  getPostSlugs,
  getRelatedPosts,
} from '@/lib/queries/posts';
import { blogPostingJsonLd, breadcrumbJsonLd, buildMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

/**
 * 文章详情（PRD §3.1 F-09）。
 * 两栏：正文（最大 68 字符宽）+ 右侧 sticky 目录；
 * 底部为上一篇 / 下一篇与相关文章。
 */

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return buildMetadata({ title: '文章未找到', path: `/blog/${slug}` });

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    tags: post.tags,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [{ html, toc }, adjacent, related] = await Promise.all([
    renderMarkdown(post.content),
    getAdjacentPosts(slug),
    getRelatedPosts(slug, 3),
  ]);

  const crumbs = [
    { label: '首页', href: '/' },
    { label: '文章', href: '/blog' },
    { label: post.title },
  ];

  return (
    <>
      <Breadcrumb items={crumbs} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
        <article className="min-w-0">
          <header className="mb-8">
            <h1 className="font-serif text-3xl font-bold leading-tight text-text sm:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-subtle">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime} 分钟</span>
              {post.isSample ? (
                <>
                  <span aria-hidden="true">·</span>
                  <Chip variant="muted">示例文章</Chip>
                </>
              ) : null}
            </p>

            <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="inline-flex items-center rounded-full border border-border-strong px-2.5 py-0.5 text-xs text-text-muted transition-colors duration-[120ms] hover:border-cardinal hover:text-cardinal"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>

            <hr className="mt-6 border-0 border-t border-border" />
          </header>

          {post.coverUrl ? (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-sm border border-border">
              <Image
                src={post.coverUrl}
                alt={`${post.title}的封面图`}
                fill
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          {post.isSample ? (
            <p className="mb-8 border-l-[3px] border-cardinal bg-bg-subtle py-3 pl-4 text-sm text-text-muted">
              这是一篇<strong className="font-semibold text-text">示例文章</strong>
              ，用于验证列表、详情、目录与代码高亮等页面能力，并非正式发布的技术文章。
            </p>
          ) : null}

          <CodeBlockTools>
            <Prose html={html} />
          </CodeBlockTools>
        </article>

        {/*
          目录只在双栏布局（lg 及以上）出现。
          移动端单列时若把它放在正文之前，读者要先划过整份目录才看到标题，
          首屏完全没有文章信息；放在正文之后又失去导航价值。因此窄屏直接不渲染。
        */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TableOfContents items={toc} />
          </div>
        </aside>
      </div>

      {adjacent.prev || adjacent.next ? (
        <nav
          aria-label="相邻文章"
          className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {adjacent.prev ? (
            <Link
              href={`/blog/${adjacent.prev.slug}`}
              className="rounded-sm border border-border p-4 transition-colors duration-[120ms] hover:border-ink-40"
            >
              <span className="block text-xs text-text-subtle">上一篇（较新）</span>
              <span className="mt-1 block font-serif text-base font-semibold text-text">
                {adjacent.prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {adjacent.next ? (
            <Link
              href={`/blog/${adjacent.next.slug}`}
              className="rounded-sm border border-border p-4 transition-colors duration-[120ms] hover:border-ink-40"
            >
              <span className="block text-xs text-text-subtle">下一篇（较早）</span>
              <span className="mt-1 block font-serif text-base font-semibold text-text">
                {adjacent.next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}

      {related.length > 0 ? (
        <div className="mt-12">
          <Section title="相关文章" className="mb-0">
            <EntryList>
              {related.map((item) => (
                <PostListItem key={item.slug} post={item} />
              ))}
            </EntryList>
          </Section>
        </div>
      ) : null}

      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
