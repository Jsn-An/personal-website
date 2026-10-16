import type { Metadata } from 'next';
import type { Post, Project } from '@/types/content';
import { profile } from '@/content/profile';
import { siteConfig } from '@/lib/site-config';

/** 生成绝对 URL（canonical / OG / JSON-LD 统一走这里）。 */
export function absoluteUrl(path = '/'): string {
  const base = siteConfig.url.replace(/\/+$/, '');
  if (path === '/' || path === '') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export interface PageMetaInput {
  /** 页面标题，不含站点名；根模板会自动追加 */
  title: string;
  description?: string;
  /** 站内路径，用于生成 canonical 与 og:url */
  path: string;
  keywords?: readonly string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  tags?: readonly string[];
  /** 为 true 时不套用标题模板（首页用） */
  absoluteTitle?: boolean;
}

/**
 * 构造页面 metadata（TECH_DESIGN §12）。
 * 每页必须提供独立的 title / description / canonical。
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path,
  keywords,
  type = 'website',
  publishedTime,
  tags,
  absoluteTitle = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: { canonical: url },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: siteConfig.shortTitle,
      locale: siteConfig.locale,
      publishedTime: type === 'article' ? publishedTime : undefined,
      tags: tags ? [...tags] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/* ────────────────────────── JSON-LD（TECH_DESIGN §12） ────────────────────────── */

export function personJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    alternateName: profile.nameEn,
    description: profile.headline,
    jobTitle: profile.title,
    email: `mailto:${profile.email}`,
    affiliation: { '@type': 'Organization', name: profile.affiliation },
    homeLocation: { '@type': 'Place', name: profile.location },
    sameAs: [profile.github],
    url: absoluteUrl('/'),
  };
}

export function blogPostingJsonLd(post: Post): Record<string, unknown> {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: 'zh-CN',
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Person',
      name: profile.name,
      alternateName: profile.nameEn,
      url: absoluteUrl('/about'),
    },
  };
}

export function creativeWorkJsonLd(project: Project): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    keywords: [...project.tech, ...project.tags].join(', '),
    creator: { '@type': 'Person', name: profile.name, alternateName: profile.nameEn },
    dateCreated: project.startDate,
    ...(project.endDate ? { dateModified: project.endDate } : {}),
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
  };
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}
