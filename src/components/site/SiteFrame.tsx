import type { ReactNode } from 'react';
import { Container } from '@/components/site/Container';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SkipLink } from '@/components/site/SkipLink';
import { UtilityBar } from '@/components/site/UtilityBar';

/**
 * 公开站点的四层框架（PRD §6.3）：
 * ① 深色顶栏 → ② 白色主导航 → ③ 内容容器 → ④ 深色页脚。
 *
 * 抽成独立组件是因为 404 与错误页也需要同一套框架，
 * 而它们渲染在路由组之外（Next.js 的根 not-found / error 不经过 (site)/layout）。
 */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <UtilityBar />
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container className="py-10 md:py-12">{children}</Container>
      </main>
      <SiteFooter />
    </>
  );
}
