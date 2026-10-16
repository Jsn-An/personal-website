import type { ReactNode } from 'react';
import { SiteFrame } from '@/components/site/SiteFrame';

/** 公开站点路由组。后台路由组将使用独立 layout，不继承本框架。 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
