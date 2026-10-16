'use client';

import { useEffect, useRef, useState } from 'react';
import type { TocEntry } from '@/lib/markdown';
import { cn } from '@/lib/utils';

/**
 * 文章右侧目录（PRD §6.3 博客详情）。
 * 左侧 1px 竖线，当前小节用 Cardinal 竖条 + Cardinal 文字高亮。
 *
 * 高亮用 IntersectionObserver 而非 scroll 监听：不需要计算滚动位置，
 * 也不会因为布局变化而失效（PRD §6.6 只允许状态变化，不做滚动动效）。
 */
export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  const visibleRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headings.length === 0) return;

    const visible = visibleRef.current;
    visible.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        // 取文档顺序中最靠前的可见小节，避免多个同时可见时反复跳变
        const first = headings.find((heading) => visible.has(heading.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: '-120px 0px -55% 0px' },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="本文目录" className="text-sm">
      <p className="mb-3 font-semibold text-text">目录</p>
      <ul className="list-none border-l border-border p-0">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  '-ml-px block border-l-2 py-1 leading-relaxed transition-colors duration-[120ms]',
                  item.depth === 3 ? 'pl-6' : 'pl-3',
                  isActive
                    ? 'border-cardinal font-medium text-cardinal'
                    : 'border-transparent text-text-muted hover:text-text',
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
