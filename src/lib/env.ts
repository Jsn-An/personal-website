/**
 * 环境变量集中出口。业务代码禁止直接读 process.env（AGENTS.md §4.1）。
 */

function optional(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  siteUrl: optional(process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000'),
} as const;
