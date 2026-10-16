'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { profile } from '@/content/profile';

/** 当前路径是否命中该导航项（含子路径）。 */
function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 主导航（PRD §6.3 全局框架②）。
 * 桌面显示水平导航；移动端为汉堡按钮 + 右侧抽屉。
 *
 * 抽屉使用原生 <dialog>：
 * - showModal() 自带焦点陷阱与背景惰性化（PRD §5.3 的无障碍要求）
 * - Esc 关闭由浏览器处理，关闭后焦点自动回到触发按钮
 * - 点击 backdrop 关闭由下面的 onClick 处理
 */
export function SiteHeader() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeDrawer = (): void => {
    dialogRef.current?.close();
  };

  // 路由变化后收起抽屉：否则从抽屉点进新页面时它会继续盖住内容。
  useEffect(() => {
    closeDrawer();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-nav print:hidden">
      <div className="mx-auto flex h-18 w-full max-w-[1200px] items-center justify-between px-6 md:px-10 lg:px-16">
        <Link
          href="/"
          className="font-serif text-lg font-semibold text-text transition-colors duration-[120ms] hover:text-link"
          aria-label={`${profile.name} 首页`}
        >
          {profile.name}
          <span className="ml-2 hidden text-sm font-normal text-text-subtle sm:inline">
            {profile.nameEn}
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav aria-label="主导航" className="hidden md:block">
          <ul className="flex list-none items-center gap-6 p-0">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                  className={cn(
                    'border-b-[3px] pb-0.5 text-sm font-medium transition-colors duration-[120ms]',
                    isActivePath(pathname, item.href)
                      ? 'border-cardinal text-cardinal'
                      : 'border-transparent text-text-muted hover:text-text',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 移动端汉堡按钮 */}
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="inline-flex items-center gap-2 rounded-sm border border-border-strong px-3 py-2 text-sm font-medium text-text md:hidden"
          aria-haspopup="dialog"
        >
          菜单
          <span aria-hidden="true" className="text-text-subtle">
            ☰
          </span>
        </button>
      </div>

      {/* 移动端抽屉 */}
      {/*
        移动端抽屉（PRD §6.3：从右侧滑出）。

        `left-auto` 不能省：浏览器对 <dialog> 的默认样式里有 `inset-inline-start: 0`
        （即 left: 0），与这里的 `right-0` 同时生效时属于过度约束，
        在 LTR 下 left 胜出，抽屉会被钉在左侧。显式写 left-auto 才能靠右。
      */}
      <dialog
        ref={dialogRef}
        aria-label="站点导航"
        className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-none w-[min(20rem,85vw)] max-w-none bg-surface p-0 md:hidden"
        onClick={(event) => {
          // 点击 backdrop 时事件目标就是 dialog 自身
          if (event.target === dialogRef.current) closeDrawer();
        }}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <span className="font-serif text-base font-semibold">导航</span>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-sm border border-border-strong px-3 py-1.5 text-sm"
            >
              关闭
            </button>
          </div>

          <nav aria-label="移动端导航" className="px-6 py-4">
            <ul className="list-none p-0">
              {siteConfig.nav.map((item) => (
                <li key={item.href} className="border-b border-border last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={closeDrawer}
                    aria-current={isActivePath(pathname, item.href) ? 'page' : undefined}
                    className={cn(
                      'block py-3 text-base',
                      isActivePath(pathname, item.href)
                        ? 'font-semibold text-cardinal'
                        : 'text-text hover:text-link',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-6 py-6 text-sm">
            <p className="text-text-subtle">联系</p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-1 block break-all text-link hover:underline"
            >
              {profile.email}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 block text-link hover:underline"
            >
              GitHub
              <span className="sr-only">（在新窗口打开）</span>
            </a>
          </div>
        </div>
      </dialog>
    </header>
  );
}
