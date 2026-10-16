'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchSuggestion } from '@/lib/search';
import { cn } from '@/lib/utils';

/** PRD §3.1 F-03：300ms 防抖；TECH_DESIGN §8.5：AbortController 取消过期请求。 */
const DEBOUNCE_MS = 300;

/**
 * 主搜索框。
 *
 * 交互模型是 WAI-ARIA combobox + listbox：焦点始终留在输入框，
 * 用 aria-activedescendant 指向当前建议项，方向键移动、Enter 选定、Esc 关闭。
 * 提交后跳到 `/search?q=`，由服务端渲染结果分区（保证结果页可分享、可索引）。
 */
export function SearchBox({
  initialQuery = '',
  variant = 'default',
  autoFocus = false,
}: {
  initialQuery?: string;
  variant?: 'default' | 'hero';
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // 输入 → 防抖请求建议。
  // 注意：清空查询时不在这个 effect 里做同步 setState（会触发级联渲染），
  // 而是在 onChange 里直接收拾状态。
  useEffect(() => {
    const query = value.trim();
    if (query.length === 0) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { suggestions: [] }))
        .then((data: { suggestions?: SearchSuggestion[] }) => {
          const next = data.suggestions ?? [];
          setSuggestions(next);
          setActiveIndex(-1);
          // 只有在输入框仍持有焦点时才展开，避免用户已离开后弹出面板
          setOpen(next.length > 0 && document.activeElement === inputRef.current);
        })
        .catch(() => {
          // 请求被取消（用户继续输入）或网络失败：保留上一次结果，不打断输入
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // 点击面板外部时收起
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent): void => {
      if (!containerRef.current) return;
      if (!(event.target instanceof Node)) return;
      if (!containerRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const goToSearch = (query: string): void => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const selectSuggestion = (suggestion: SearchSuggestion): void => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(suggestion.href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      if (suggestions.length === 0) return;
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex((index) => (index >= suggestions.length - 1 ? 0 : index + 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!open || suggestions.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
      return;
    }

    if (event.key === 'Escape') {
      if (!open) return;
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === 'Enter') {
      const suggestion = activeIndex >= 0 ? suggestions[activeIndex] : undefined;
      if (suggestion) {
        event.preventDefault();
        selectSuggestion(suggestion);
      }
      // 没有高亮建议时交给表单默认提交行为
    }
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        action="/search"
        method="get"
        onSubmit={(event) => {
          event.preventDefault();
          goToSearch(value);
        }}
        className={cn(
          'flex items-stretch overflow-hidden rounded-sm border bg-surface',
          'focus-within:border-cardinal focus-within:ring-2 focus-within:ring-cardinal/25',
          isHero ? 'border-border-strong' : 'border-border-strong',
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          搜索项目、技能或文章
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          placeholder="搜索项目、技能或文章"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            // 清空输入时立刻收起面板，不需要等一个效果周期
            if (next.trim().length === 0) {
              setSuggestions([]);
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          className={cn(
            'min-w-0 flex-1 bg-transparent px-4 text-text outline-none',
            'placeholder:text-text-subtle',
            // 移动端字号不得小于 16px，否则 iOS Safari 会自动放大页面（PRD §5.5）
            isHero ? 'h-14 text-base' : 'h-11 text-base',
          )}
        />
        <button
          type="submit"
          className={cn(
            'shrink-0 bg-cardinal font-semibold text-white transition-colors duration-[120ms] hover:bg-cardinal-dark',
            isHero ? 'px-6 text-base' : 'px-5 text-sm',
          )}
        >
          搜索
        </button>
      </form>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="搜索建议"
          className="absolute inset-x-0 top-full z-20 mt-1 list-none rounded-sm border border-border bg-surface p-0 py-1 shadow-popover"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.href}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              // 用 pointerdown 而非 click：它在输入框失焦前触发，
              // 且不为 role=option 引入键盘事件（键盘交互由输入框的方向键负责）
              onPointerDown={(event) => {
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
              onPointerEnter={() => setActiveIndex(index)}
              className={cn(
                'cursor-pointer px-4 py-2',
                index === activeIndex ? 'bg-bg-subtle' : 'bg-transparent',
              )}
            >
              <span className="flex items-baseline gap-2">
                <span className="shrink-0 text-xs text-text-subtle">{suggestion.type}</span>
                <span className="min-w-0 truncate text-sm font-medium text-text">
                  {suggestion.title}
                </span>
              </span>
              <span
                className="mt-0.5 line-clamp-1 block text-xs text-text-muted"
                // eslint-disable-next-line react/no-danger -- 片段由 lib/search.ts 逐段转义后仅包裹 <mark>
                dangerouslySetInnerHTML={{ __html: suggestion.snippetHtml }}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
