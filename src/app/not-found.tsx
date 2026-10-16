import Link from 'next/link';
import { SearchBox } from '@/components/search/SearchBox';
import { SiteFrame } from '@/components/site/SiteFrame';

/**
 * 404 页面（PRD §3.1 F-14）。
 *
 * 根级 not-found 渲染在 `(site)/layout` 之外，因此需要自己套上站点框架，
 * 保证 404 与其它页面保持同一套导航与页脚。
 */
export default function NotFound() {
  return (
    <SiteFrame>
      <div className="max-w-[68ch]">
        <p className="font-serif text-sm font-semibold uppercase tracking-wide text-cardinal">
          404
        </p>
        <h1 className="type-h1 mt-3 font-serif font-bold text-text">页面不存在</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          这个地址没有对应的内容。可能是链接过期，或者地址里有拼写错误。
        </p>

        <div className="mt-8 max-w-xl">
          <SearchBox />
        </div>

        <ul className="mt-8 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm">
          <li>
            <Link href="/" className="text-link hover:text-link-hover hover:underline">
              返回首页
            </Link>
          </li>
          <li>
            <Link href="/projects" className="text-link hover:text-link-hover hover:underline">
              浏览项目
            </Link>
          </li>
          <li>
            <Link href="/blog" className="text-link hover:text-link-hover hover:underline">
              阅读文章
            </Link>
          </li>
          <li>
            <Link href="/tags" className="text-link hover:text-link-hover hover:underline">
              按标签查找
            </Link>
          </li>
        </ul>
      </div>
    </SiteFrame>
  );
}
