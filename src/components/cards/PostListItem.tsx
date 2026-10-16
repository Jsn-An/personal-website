import Link from 'next/link';
import { Chip } from '@/components/ui/Chip';
import type { Post } from '@/types/content';
import { formatDate } from '@/lib/utils';

/**
 * 博客列表行（PRD §6.3）。
 * 编辑式列表：不用卡片，用横线分隔；标题衬线 22px，hover 变 Cardinal。
 */
export function PostListItem({ post }: { post: Post }) {
  return (
    <li className="border-b border-border py-6 last:border-b-0">
      <h3 className="font-serif text-[1.375rem] font-semibold leading-snug">
        <Link
          href={`/blog/${post.slug}`}
          className="text-text transition-colors duration-[120ms] hover:text-link"
        >
          {post.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">{post.excerpt}</p>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-text-subtle">
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime} 分钟</span>
        {post.isSample ? (
          <>
            <span aria-hidden="true">·</span>
            <Chip variant="muted">示例文章</Chip>
          </>
        ) : null}
        {post.tags.map((tag) => (
          <Chip key={tag} className="ml-1">
            {tag}
          </Chip>
        ))}
      </p>
    </li>
  );
}
