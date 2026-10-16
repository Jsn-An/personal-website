import { Roboto_Mono, Roboto_Slab, Source_Sans_3, Source_Serif_4 } from 'next/font/google';

/**
 * Stanford 官方字体族（identity.stanford.edu/design-elements/typography）。
 *
 * 只加载实际使用的字重与拉丁子集；中文一律走 globals.css 中的系统字体栈兜底，
 * 禁止把中文打包进 webfont（AGENTS.md §4.4）。
 */

export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-roboto-slab',
  display: 'swap',
});

export const fontVariables = [
  sourceSans.variable,
  sourceSerif.variable,
  robotoMono.variable,
  robotoSlab.variable,
].join(' ');
