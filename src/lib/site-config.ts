import { env } from '@/lib/env';
import { profile } from '@/content/profile';

/** 构建期常量：内容最后更新日期，同时作为页脚年份来源（保证构建可复现）。 */
const LAST_UPDATED = '2026-10-16';
const siteYear = LAST_UPDATED.slice(0, 4);

/**
 * 站点级配置。当前由本地内容模块驱动；
 * 接入数据库后改为读取 SiteSettings 单例（TECH_DESIGN §6.2）。
 */
export const siteConfig = {
  url: env.siteUrl,
  title: `${profile.name} · 个人主页`,
  shortTitle: profile.name,
  description: `${profile.name}（${profile.nameEn}）的个人主页：${profile.affiliation}。${profile.headline}`,
  locale: 'zh_CN',
  /** 站点内容最后更新日期（构建期常量，保证构建可复现） */
  lastUpdated: LAST_UPDATED,
  author: {
    name: profile.name,
    nameEn: profile.nameEn,
  },
  /** 动态 OG 图片用文案。ImageResponse 默认字体不含中文字形，故只放拉丁字符。 */
  og: {
    name: profile.nameEn,
    role: 'Undergraduate Researcher',
    focus: 'Graph Neural Networks · Computer Vision',
  },
  /** 主导航（PRD §6.3 全局框架②） */
  nav: [
    { label: '首页', href: '/' },
    { label: '关于', href: '/about' },
    { label: '技能', href: '/skills' },
    { label: '项目', href: '/projects' },
    { label: '博客', href: '/blog' },
    { label: '联系', href: '/contact' },
  ],
  /** 顶栏小号链接（PRD §6.3 全局框架①） */
  utilityLinks: [
    { label: 'GitHub', href: profile.github, external: true },
    { label: 'RSS', href: '/rss.xml', external: false },
    { label: '邮件', href: `mailto:${profile.email}`, external: true },
  ],
  /** 页脚四列（PRD §6.3 全局框架④） */
  footer: {
    about: `${profile.name}的个人主页，用于沉淀科研经历与工程实践记录。内容按「标题 + 横线 + 内容」组织，不做装饰性视觉。`,
    columns: [
      {
        title: '站点导航',
        links: [
          { label: '关于', href: '/about' },
          { label: '技能', href: '/skills' },
          { label: '项目', href: '/projects' },
          { label: '博客', href: '/blog' },
          { label: '搜索', href: '/search' },
        ],
      },
      {
        title: '联系方式',
        links: [
          { label: profile.email, href: `mailto:${profile.email}` },
          { label: 'GitHub', href: profile.github, external: true },
          { label: '联系表单', href: '/contact' },
        ],
      },
      {
        title: '订阅',
        links: [
          { label: 'RSS 订阅', href: '/rss.xml' },
          { label: '标签总览', href: '/tags' },
        ],
      },
    ],
    /** 底部版权行（年份取自 lastUpdated，保证构建可复现） */
    credit: `© ${siteYear} ${profile.name}`,
  },
} as const;
