import Link from 'next/link';
import { Fragment } from 'react';

export interface Crumb {
  label: string;
  href?: string;
}

/** 面包屑导航（PRD §6.3）。分隔符为斜杠，当前页不加链接。 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="面包屑" className="mb-4 text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden="true" className="text-ink-40">
                /
              </li>
            ) : null}
            <li>
              {item.href ? (
                <Link href={item.href} className="text-link hover:text-link-hover hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-text-subtle">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
