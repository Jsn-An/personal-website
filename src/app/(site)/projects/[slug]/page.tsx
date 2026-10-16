import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectGallery } from '@/components/projects/ProjectGallery';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { DefinitionList, type DefinitionItem } from '@/components/site/DefinitionList';
import { JsonLd } from '@/components/site/JsonLd';
import { PageHeader } from '@/components/site/PageHeader';
import { Prose } from '@/components/site/Prose';
import { Section } from '@/components/site/Section';
import { Chip } from '@/components/ui/Chip';
import { renderMarkdown } from '@/lib/markdown';
import {
  getAdjacentProjects,
  getProjectBySlug,
  getProjectSlugs,
  getRelatedProjects,
} from '@/lib/queries/projects';
import { breadcrumbJsonLd, buildMetadata, creativeWorkJsonLd } from '@/lib/seo';
import { formatDateRange } from '@/lib/utils';

/**
 * 项目详情（PRD §3.1 F-07）。
 * 两栏：正文（最大 68 字符宽）+ 右侧 sticky「项目信息」定义列表；
 * 正文用 Markdown 的 `##` 拆出「背景 / 挑战 / 方案 / 结果」分区，渲染后即为带横线的分区。
 */

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return buildMetadata({ title: '项目未找到', path: `/projects/${slug}` });

  return buildMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
    keywords: [...project.tech, ...project.tags],
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [{ html }, adjacent, related] = await Promise.all([
    renderMarkdown(project.description),
    getAdjacentProjects(slug),
    getRelatedProjects(slug, 2),
  ]);

  const infoItems: DefinitionItem[] = [
    ...(project.repoUrl
      ? [{ label: '仓库', value: '查看代码', href: project.repoUrl, external: true }]
      : []),
    ...(project.demoUrl
      ? [{ label: '演示', value: '打开演示', href: project.demoUrl, external: true }]
      : []),
    {
      label: '时间',
      value: formatDateRange(project.startDate, project.endDate, project.current),
    },
    { label: '角色', value: project.role },
  ];

  const crumbs = [
    { label: '首页', href: '/' },
    { label: '项目', href: '/projects' },
    { label: project.title },
  ];

  return (
    <>
      <Breadcrumb items={crumbs} />

      <PageHeader
        title={project.title}
        description={project.summary}
        meta={
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{formatDateRange(project.startDate, project.endDate, project.current)}</span>
            <span aria-hidden="true">·</span>
            <span>{project.role}</span>
            {project.needsDetail ? (
              <>
                <span aria-hidden="true">·</span>
                <Chip variant="muted">部分细节待补充</Chip>
              </>
            ) : null}
          </p>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
        <div className="min-w-0">
          <Prose html={html} />

          {project.gallery && project.gallery.length > 0 ? (
            <div className="mt-12">
              <Section title="截图">
                <ProjectGallery images={project.gallery} title={project.title} />
              </Section>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-1 border-b border-border pb-2 text-sm font-semibold text-text">
            项目信息
          </h2>
          <DefinitionList items={infoItems} labelWidth="w-12" />

          <h2 className="mt-6 mb-2 border-b border-border pb-2 text-sm font-semibold text-text">
            技术栈
          </h2>
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {project.tech.map((tech) => (
              <li key={tech}>
                <Chip>{tech}</Chip>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 mb-2 border-b border-border pb-2 text-sm font-semibold text-text">
            标签
          </h2>
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {project.tags.map((tag) => (
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
        </aside>
      </div>

      {adjacent.prev || adjacent.next ? (
        <nav
          aria-label="相邻项目"
          className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
        >
          {adjacent.prev ? (
            <Link
              href={`/projects/${adjacent.prev.slug}`}
              className="rounded-sm border border-border p-4 transition-colors duration-[120ms] hover:border-ink-40"
            >
              <span className="block text-xs text-text-subtle">上一个项目</span>
              <span className="mt-1 block font-serif text-base font-semibold text-text">
                {adjacent.prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {adjacent.next ? (
            <Link
              href={`/projects/${adjacent.next.slug}`}
              className="rounded-sm border border-border p-4 text-right transition-colors duration-[120ms] hover:border-ink-40 sm:text-right"
            >
              <span className="block text-xs text-text-subtle">下一个项目</span>
              <span className="mt-1 block font-serif text-base font-semibold text-text">
                {adjacent.next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}

      {related.length > 0 ? (
        <div className="mt-12">
          <Section title="相关项目" className="mb-0">
            <ul className="grid list-none gap-6 p-0 sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.slug} className="flex">
                  <div className="w-full">
                    <ProjectCard project={item} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      ) : null}

      <JsonLd data={creativeWorkJsonLd(project)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
