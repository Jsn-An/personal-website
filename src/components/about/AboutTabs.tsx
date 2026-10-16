'use client';

import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AboutTab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * 个人页标签页（PRD §3.1 F-04、TECH_DESIGN §8.3）。
 *
 * 实现要点：
 * - 完整 WAI-ARIA Tabs 模式：role=tablist/tab/tabpanel、aria-selected、aria-controls、
 *   roving tabIndex，方向键与 Home/End 切换（AGENTS.md §4.6）。
 * - 所有面板都由服务端一次性渲染，切换只改 `hidden`，不为一次视图切换付出 RSC 往返。
 * - 标签状态写入 URL 查询参数，使 `?tab=skills` 可分享、可直接访问、可被独立索引。
 *   这里用 history.replaceState 而不是 router.replace：内容已在 HTML 里，
 *   不需要重新请求服务端。
 */
export function AboutTabs({
  tabs,
  initialTab,
  ariaLabel = '个人资料分区',
}: {
  tabs: AboutTab[];
  initialTab: string;
  ariaLabel?: string;
}) {
  const fallback = tabs[0]?.id ?? '';
  const [activeId, setActiveId] = useState(
    tabs.some((tab) => tab.id === initialTab) ? initialTab : fallback,
  );
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = useCallback((id: string, moveFocus = false) => {
    setActiveId(id);
    window.history.replaceState(null, '', `${window.location.pathname}?tab=${id}`);
    if (moveFocus) tabRefs.current[id]?.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const lastIndex = tabs.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = lastIndex;

    if (nextIndex === null) return;
    event.preventDefault();

    const nextTab = tabs[nextIndex];
    if (nextTab) select(nextTab.id, true);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-6 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab, index) => {
          const isSelected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[tab.id] = element;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                '-mb-px shrink-0 whitespace-nowrap border-b-[3px] py-3 text-sm font-semibold transition-colors duration-[180ms]',
                isSelected
                  ? 'border-cardinal text-cardinal'
                  : 'border-transparent text-text-muted hover:text-text',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== activeId}
          className="pt-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
