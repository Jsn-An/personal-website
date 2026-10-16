import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

/**
 * 动态 OG 卡片（TECH_DESIGN §12）。
 *
 * ⚠️ ImageResponse 的内置字体只覆盖拉丁字形，画中文字符会渲染成方块，
 *    因此这里只用 siteConfig.og 里的英文文案。
 *    如需中文 OG 图，需要额外加载一份中文字体子集（体积较大），暂不做。
 */

export const alt = `${siteConfig.og.name} — ${siteConfig.og.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 顶部：Cardinal 主色横条，作为品牌记忆点 */}
        <div style={{ display: 'flex', height: 8, width: 180, backgroundColor: '#8C1515' }} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 700, color: '#2E2D29', lineHeight: 1.1 }}>
            {siteConfig.og.name}
          </div>
          <div style={{ marginTop: 20, fontSize: 34, color: '#53565A' }}>
            {siteConfig.og.role}
          </div>
          <div style={{ marginTop: 12, fontSize: 28, color: '#767674' }}>
            {siteConfig.og.focus}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '2px solid #D5D5D4',
            paddingTop: 24,
            fontSize: 24,
            color: '#53565A',
          }}
        >
          <div>{siteConfig.url.replace(/^https?:\/\//, '')}</div>
          <div>Graph Neural Networks · Computer Vision</div>
        </div>
      </div>
    ),
    size,
  );
}
