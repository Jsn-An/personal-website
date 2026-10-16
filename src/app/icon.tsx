import { ImageResponse } from 'next/og';

/**
 * 站点图标（favicon）。
 * 用姓氏首字母的方块做标记，避免额外维护一个二进制图片资产；
 * 同样受 ImageResponse 的拉丁字形限制，故不用中文。
 */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#8C1515',
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        A
      </div>
    ),
    size,
  );
}
