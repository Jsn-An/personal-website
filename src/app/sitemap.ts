import type { MetadataRoute } from 'next';
import { getPostSlugs } from '@/lib/queries/posts';
import { getProjectSlugs } from '@/lib/queries/projects';
import { getTagSummaries } from '@/lib/queries/tags';
import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

/**
 * 站点地图（PRD §3.1 F-13）：只收录已发布内容。
 * 个人页的每个标签都是独立的可索引入口（PRD §5.2），因此逐条列出。
 */

const ABOUT_TABS = ['intro', 'skills', 'experience', 'education', 'awards'] as const;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/skills', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/projects', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
  { path: '/tags', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date(`${siteConfig.lastUpdated}T00:00:00Z`);

  const [projectSlugs, postSlugs, tags] = await Promise.all([
    getProjectSlugs(),
    getPostSlugs(),
    getTagSummaries(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 默认标签页的 canonical 就是 /about，因此跳过 intro，避免重复收录
  const tabEntries: MetadataRoute.Sitemap = ABOUT_TABS.slice(1).map((tab) => ({
    url: absoluteUrl(`/about?tab=${tab}`),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const projectEntries: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: absoluteUrl(`/projects/${slug}`),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: absoluteUrl(`/blog/${slug}`),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((summary) => ({
    url: absoluteUrl(`/tags/${encodeURIComponent(summary.tag)}`),
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticEntries, ...tabEntries, ...projectEntries, ...postEntries, ...tagEntries];
}
