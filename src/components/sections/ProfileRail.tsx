import Image from 'next/image';
import Link from 'next/link';
import { DefinitionList, type DefinitionItem } from '@/components/site/DefinitionList';
import { PrintButton } from '@/components/site/PrintButton';
import type { Profile } from '@/types/content';

/**
 * 个人页左栏（PRD §6.3）。
 *
 * 桌面：300px 宽、sticky，滚动时保持可见（由页面用 lg:sticky 包裹）。
 * 移动端：堆叠到内容区上方，头像缩小、联系方式变为紧凑列表。
 */
export function ProfileRail({ profile }: { profile: Profile }) {
  const contactItems: DefinitionItem[] = [
    { label: '邮箱', value: profile.email, href: `mailto:${profile.email}`, external: true },
    { label: '城市', value: profile.location },
    {
      label: 'GitHub',
      value: profile.githubHandle,
      href: profile.github,
      external: true,
    },
    { label: '状态', value: profile.availability },
  ];

  return (
    <div>
      <div className="flex items-center gap-5 lg:block">
        {/* 1:1 头像位。没有授权照片时用具名首字母方块占位，而不是放一个假头像。 */}
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={`${profile.name}的照片`}
            width={300}
            height={300}
            priority
            className="size-24 shrink-0 rounded-sm border border-border object-cover lg:aspect-square lg:h-auto lg:w-full"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-24 shrink-0 items-center justify-center rounded-sm border border-border bg-bg-subtle font-serif text-3xl font-semibold text-text-subtle lg:size-[300px] lg:w-full lg:text-7xl"
          >
            {profile.name.slice(0, 1)}
          </div>
        )}

        <div className="min-w-0 lg:mt-6">
          <p className="font-serif text-2xl font-bold text-text">{profile.name}</p>
          <p className="mt-1 text-sm text-text-subtle">{profile.nameEn}</p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{profile.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">{profile.affiliation}</p>
        </div>
      </div>

      <h2 className="mt-8 mb-1 border-b border-border pb-2 text-sm font-semibold text-text">
        联系方式
      </h2>
      <DefinitionList items={contactItems} labelWidth="w-14" />

      <div className="mt-6 flex flex-wrap gap-3">
        <PrintButton />
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-cardinal px-4 py-2 text-sm font-semibold text-white transition-colors duration-[120ms] hover:bg-cardinal-dark"
        >
          联系我
        </Link>
      </div>
    </div>
  );
}
