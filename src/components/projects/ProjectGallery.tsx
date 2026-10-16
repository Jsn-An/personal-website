'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

/**
 * 项目截图画廊 + 灯箱（PRD §3.1 F-07）。
 *
 * 灯箱复用原生 `<dialog>`：showModal() 自带焦点陷阱、Esc 关闭、
 * 关闭后焦点归还触发按钮，与移动端抽屉保持同一套无障碍行为（PRD §5.3）。
 * 触发按钮本身就是 `<img>` 之外的可聚焦元素，因此键盘可完整操作。
 */
export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const open = (index: number): void => {
    setActiveIndex(index);
    dialogRef.current?.showModal();
  };

  const active = images[activeIndex];

  return (
    <>
      <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
        {images.map((src, index) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => open(index)}
              aria-label={`放大查看第 ${index + 1} 张图（共 ${images.length} 张）`}
              className="relative block aspect-video w-full overflow-hidden rounded-sm border border-border transition-colors duration-[120ms] hover:border-ink-40"
            >
              <Image
                src={src}
                alt={`${title}的截图 ${index + 1}`}
                fill
                sizes="(min-width: 640px) 22vw, 45vw"
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`${title}的截图`}
        className="m-auto max-h-[92vh] max-w-[min(1100px,92vw)] bg-surface p-0"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <p className="text-sm text-text-muted">
            第 {activeIndex + 1} / {images.length} 张
          </p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-sm border border-border-strong px-3 py-1 text-sm"
          >
            关闭
          </button>
        </div>

        <div className="relative aspect-video w-[min(1100px,92vw)]">
          {active ? (
            <Image
              src={active}
              alt={`${title}的截图 ${activeIndex + 1}`}
              fill
              sizes="92vw"
              className="object-contain"
            />
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="flex items-center justify-center gap-3 border-t border-border px-4 py-2">
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index <= 0 ? images.length - 1 : index - 1))}
              className="rounded-sm border border-border-strong px-3 py-1 text-sm"
            >
              上一张
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index >= images.length - 1 ? 0 : index + 1))}
              className="rounded-sm border border-border-strong px-3 py-1 text-sm"
            >
              下一张
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
