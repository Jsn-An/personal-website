import type { Metadata } from 'next';
import { MailtoComposer } from '@/components/contact/MailtoComposer';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { DefinitionList, type DefinitionItem } from '@/components/site/DefinitionList';
import { PageHeader } from '@/components/site/PageHeader';
import { Section } from '@/components/site/Section';
import { profile } from '@/content/profile';
import { buildMetadata } from '@/lib/seo';

/**
 * 联系页（PRD §3.1 F-11）。
 * 主渠道是邮箱与 GitHub；表单当前以 mailto 方式工作（见 MailtoComposer 的说明）。
 */

export const metadata: Metadata = buildMetadata({
  title: '联系',
  description: `联系安泽祎：邮箱 ${profile.email}，或通过 GitHub 查看代码。当前${profile.availability}。`,
  path: '/contact',
  keywords: ['联系', '邮箱', 'GitHub'],
});

export default function ContactPage() {
  const items: DefinitionItem[] = [
    { label: '邮箱', value: profile.email, href: `mailto:${profile.email}`, external: true },
    { label: 'GitHub', value: `github.com/${profile.githubHandle}`, href: profile.github, external: true },
    { label: '所在', value: profile.location },
    { label: '机构', value: profile.affiliation },
    { label: '状态', value: profile.availability },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '联系' }]} />

      <PageHeader
        title="联系"
        description="科研合作、实习机会、技术讨论都欢迎。邮件是最可靠的方式，我通常会在几天内回复。"
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div className="min-w-0">
          <Section title="写一封邮件">
            <MailtoComposer to={profile.email} />
          </Section>
        </div>

        <aside>
          <h2 className="mb-1 border-b border-border pb-2 text-sm font-semibold text-text">
            联系方式
          </h2>
          <DefinitionList items={items} labelWidth="w-12" />

          <h2 className="mt-8 mb-3 border-b border-border pb-2 text-sm font-semibold text-text">
            关于回复
          </h2>
          <p className="text-sm leading-relaxed text-text-muted">
            邮件请尽量说明来意与背景。如果是关于某篇文章或某个项目的讨论，附上对应的页面链接会让我更快进入上下文。
          </p>
        </aside>
      </div>
    </>
  );
}
