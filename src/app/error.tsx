'use client';

import Link from 'next/link';
import { SiteFrame } from '@/components/site/SiteFrame';

/**
 * 路由级错误边界（PRD §3.1 F-14，TECH_DESIGN §13）。
 * 不向访客暴露堆栈；只给出可执行的动作。
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SiteFrame>
      <div className="max-w-[68ch]">
        <p className="font-serif text-sm font-semibold uppercase tracking-wide text-cardinal">
          出错了
        </p>
        <h1 className="type-h1 mt-3 font-serif font-bold text-text">页面加载失败</h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          服务端返回了一个错误。可以重试一次，或者返回首页继续浏览。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-sm bg-cardinal px-4 py-2 text-sm font-semibold text-white transition-colors duration-[120ms] hover:bg-cardinal-dark"
          >
            重试
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-cardinal px-4 py-2 text-sm font-semibold text-cardinal transition-colors duration-[120ms] hover:bg-cardinal/5"
          >
            返回首页
          </Link>
        </div>
      </div>
    </SiteFrame>
  );
}
