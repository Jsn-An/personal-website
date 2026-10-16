import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

/**
 * 爬虫规则（PRD §3.1 F-13）。
 * 屏蔽后台与接口；搜索结果页用页面级 `robots: { index: false }` 单独处理，
 * 因为它是动态查询结果，没有稳定的收录价值。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
