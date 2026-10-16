import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { profile } from '@/content/profile';

/**
 * 页脚（PRD §6.3 全局框架④）。
 *
 * ★ 与顶栏同理：深色底上禁止 Cardinal Red 文字，链接只用
 *   --color-text-on-dark-muted，hover 提升到 --color-text-on-dark 并加下划线，
 *   不依赖颜色变化传达可交互性（PRD §5.5）。
 */
export function SiteFooter() {
  const { footer } = siteConfig;

  return (
    <footer className="mt-16 bg-surface-dark text-text-on-dark print:hidden">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-12 md:px-10 lg:px-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-base font-semibold">{profile.name}</p>
            <p className="mt-1 text-sm text-text-on-dark-muted">{profile.nameEn}</p>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-text-on-dark-muted">
              {footer.about}
            </p>
          </div>

          {footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold text-text-on-dark">{column.title}</h2>
              <ul className="mt-4 list-none space-y-2 p-0">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="break-all text-sm text-text-on-dark-muted underline-offset-2 transition-colors duration-[120ms] hover:text-text-on-dark hover:underline"
                      >
                        {link.label}
                        <span className="sr-only">（在新窗口打开）</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="break-all text-sm text-text-on-dark-muted underline-offset-2 transition-colors duration-[120ms] hover:text-text-on-dark hover:underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-[0.8125rem] text-text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.credit}</p>
          <p>最后更新：{siteConfig.lastUpdated}</p>
        </div>
      </div>
    </footer>
  );
}
