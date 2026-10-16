import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 类名合并：条件类名一律走这里，禁止手写字符串拼接（AGENTS.md §4.4）。 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** 2024.10-2025.9 → 2024 年 10 月 — 2025 年 9 月 */
export function formatDateRange(start: string, end: string | null, current = false): string {
  const from = formatMonth(start);
  if (current || !end) return `${from} — 至今`;
  return `${from} — ${formatMonth(end)}`;
}

/** 2026-10-16 → 2026 年 10 月 16 日 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

/** 2026-10-16 → 2026 年 10 月 */
export function formatMonth(iso: string): string {
  const [year, month] = iso.split('-');
  return `${year} 年 ${Number(month)} 月`;
}

/** 2026-10-16 → 2026-10-16（用于 <time dateTime>） */
export function isoDate(iso: string): string {
  return iso;
}
