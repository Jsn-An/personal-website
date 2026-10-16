import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { profile } from '@/content/profile';

/**
 * 深色顶栏（PRD §6.3 全局框架①）。
 *
 * ★ 本层禁止使用 Cardinal Red 文字（在 #2E2D29 底上对比度仅 1.45:1）。
 *   仅可用 --color-text-on-dark（13.8:1）与 --color-text-on-dark-muted（9.56:1）。
 */
export function UtilityBar() {
  return (
    <div className="bg-surface-dark text-text-on-dark print:hidden">
      <div className="mx-auto flex h-10 w-full max-w-[1200px] items-center justify-between px-6 md:px-10 lg:px-16">
        <p className="truncate text-[0.8125rem] text-text-on-dark-muted">{profile.affiliation}</p>

        <ul className="hidden list-none items-center gap-5 p-0 md:flex">
          {siteConfig.utilityLinks.map((item) => (
            <li key={item.label}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[0.8125rem] text-text-on-dark-muted underline-offset-2 transition-colors duration-[120ms] hover:text-text-on-dark hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="text-[0.8125rem] text-text-on-dark-muted underline-offset-2 transition-colors duration-[120ms] hover:text-text-on-dark hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
