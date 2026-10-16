import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { fontVariables } from '@/lib/fonts';
import { absoluteUrl, personJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { profile } from '@/content/profile';
import { JsonLd } from '@/components/site/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.shortTitle}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortTitle,
  authors: [{ name: profile.name, url: absoluteUrl('/about') }],
  creator: profile.name,
  publisher: profile.name,
  keywords: [...profile.interests, profile.name, profile.nameEn, '计算机视觉', '图神经网络'],
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/rss.xml' },
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: siteConfig.shortTitle,
    locale: siteConfig.locale,
    title: siteConfig.title,
    description: siteConfig.description,
    url: absoluteUrl('/'),
  },
  twitter: { card: 'summary_large_image' },
  // 简历与联系方式不做自动识别，避免移动端把文本变成拨号链接（PRD §5.5）
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 刘海屏适配（PRD §5.5）
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        {children}
        <JsonLd data={personJsonLd()} />
      </body>
    </html>
  );
}
