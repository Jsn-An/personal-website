import { getPublishedPosts } from '@/lib/queries/posts';
import { absoluteUrl } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { profile } from '@/content/profile';

/**
 * RSS 2.0 订阅源（PRD §3.1 F-12）：输出最新 20 篇，含摘要。
 * 属于「优先 Server Actions / Route Handler」之外的只读输出，因此用 Route Handler 实现。
 */

const MAX_ITEMS = 20;

/** 与 sitemap 一致：静态生成 + 1 小时兜底重建（TECH_DESIGN §4）。 */
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RSS 的 pubDate 要求 RFC 822 格式。 */
function toRfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

export async function GET(): Promise<Response> {
  const posts = (await getPublishedPosts()).slice(0, MAX_ITEMS);
  const siteUrl = absoluteUrl('/');
  const lastBuildDate =
    posts.length > 0 && posts[0] ? toRfc822(posts[0].publishedAt) : new Date(0).toUTCString();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const categories = post.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
${categories}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
    <managingEditor>${escapeXml(profile.email)} (${escapeXml(profile.name)})</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
