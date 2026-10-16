import Link from 'next/link';
import { profile } from '@/content/profile';

/** 首页末段「联系」分区（PRD §6.3）：邮箱 + 社交链接 + 留言入口。 */
export function ContactSection() {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div>
        <h3 className="text-sm font-semibold text-text">直接联系</h3>
        <ul className="mt-3 list-none space-y-2 p-0 text-sm">
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="break-all text-link hover:text-link-hover hover:underline"
            >
              {profile.email}
            </a>
          </li>
          <li>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="text-link hover:text-link-hover hover:underline"
            >
              GitHub · {profile.githubHandle}
              <span className="sr-only">（在新窗口打开）</span>
            </a>
          </li>
          <li className="text-text-muted">{profile.location}</li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text">当前状态</h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{profile.availability}</p>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          欢迎就科研合作、实习机会或技术问题联系。
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center justify-center rounded-sm border border-cardinal px-4 py-2 text-sm font-semibold text-cardinal transition-colors duration-[120ms] hover:bg-cardinal/5"
        >
          打开联系页面
        </Link>
      </div>
    </div>
  );
}
