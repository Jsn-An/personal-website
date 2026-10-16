import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface DefinitionItem {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

/**
 * 定义列表（PRD §6.3）。
 * 用于个人页左栏的「联系方式」与项目详情右栏的「项目信息」。
 */
export function DefinitionList({
  items,
  className,
  labelWidth = 'w-20',
}: {
  items: DefinitionItem[];
  className?: string;
  labelWidth?: string;
}) {
  return (
    <dl className={cn('text-sm', className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex gap-3 border-b border-border py-2 last:border-b-0"
        >
          <dt className={cn('shrink-0 pt-px text-text-subtle', labelWidth)}>{item.label}</dt>
          <dd className="min-w-0 flex-1 break-words text-text">
            {item.href ? (
              item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-link hover:text-link-hover hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="text-link hover:text-link-hover hover:underline"
                >
                  {item.value}
                </Link>
              )
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
