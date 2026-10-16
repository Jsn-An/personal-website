import Link from 'next/link';
import { SearchBox } from '@/components/search/SearchBox';
import { profile } from '@/content/profile';

/**
 * 首页 Hero（PRD §6.3：搜索优先）。
 * 目标：首屏无需滚动即见姓名、一句话简介与搜索框。
 */
export function HeroSection() {
  return (
    <section className="mb-12 border-b border-border pb-12">
      {/*
        这里不再重复机构名：它已经出现在上方深色顶栏（UtilityBar）里，
        紧挨着再写一遍在视觉上是同一个信息出现两次。
      */}
      <h1 className="type-display font-serif font-bold text-text">{profile.name}</h1>
      <p className="mt-1 font-serif text-lg text-text-subtle">{profile.nameEn}</p>

      <p className="mt-4 max-w-[68ch] text-xl leading-relaxed text-text-muted">
        {profile.headline}
      </p>

      <div className="mt-8 max-w-2xl">
        <SearchBox variant="hero" />
      </div>

      <ul className="mt-6 flex list-none flex-wrap items-center gap-x-6 gap-y-2 p-0 text-sm">
        <li>
          <Link href="/projects" className="text-link hover:text-link-hover hover:underline">
            查看全部项目
          </Link>
        </li>
        <li>
          <Link href="/blog" className="text-link hover:text-link-hover hover:underline">
            阅读博客
          </Link>
        </li>
        <li>
          <Link href="/about" className="text-link hover:text-link-hover hover:underline">
            查看个人介绍与经历
          </Link>
        </li>
        <li>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
            className="text-link hover:text-link-hover hover:underline"
          >
            GitHub
            <span className="sr-only">（在新窗口打开）</span>
          </a>
        </li>
      </ul>
    </section>
  );
}
