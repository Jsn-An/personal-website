import type { Metadata } from 'next';
import { AboutTabs, type AboutTab } from '@/components/about/AboutTabs';
import { SkillGrid } from '@/components/sections/SkillGroups';
import { ProfileRail } from '@/components/sections/ProfileRail';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EntryList, EntryRow } from '@/components/site/EntryList';
import { JsonLd } from '@/components/site/JsonLd';
import { Prose } from '@/components/site/Prose';
import { Section } from '@/components/site/Section';
import { Chip } from '@/components/ui/Chip';
import { timeline } from '@/content/timeline';
import { renderMarkdown } from '@/lib/markdown';
import { getProfile, getPublications } from '@/lib/queries/profile';
import { getSkillCategories } from '@/lib/queries/skills';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';import { formatDateRange } from '@/lib/utils';

/**
 * 个人介绍页（PRD §3.1 F-04）：左栏 300px sticky + 右侧标签页。
 *
 * 标签状态写在 URL 查询参数上（`?tab=skills`），因此：
 * - 可直接访问、可分享；
 * - `generateMetadata` 为每个标签生成独立的 canonical 与 title，便于分别索引；
 * - 五个标签面板全部参与服务端渲染，切换标签只改 `hidden` 属性，不重新请求数据
 *   （TECH_DESIGN §4「个人页标签页与缓存的配合」）。
 */

const TABS = [
  { id: 'intro', label: '简介' },
  { id: 'skills', label: '技能' },
  { id: 'experience', label: '经历' },
  { id: 'education', label: '教育' },
  { id: 'awards', label: '荣誉' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const DEFAULT_TAB: TabId = 'intro';

const TAB_DESCRIPTION: Record<TabId, string> = {
  intro: '安泽祎的个人简介：大连海事大学计算机科学与技术专业在读本科生，研究方向为图神经网络与计算机视觉。',
  skills: '安泽祎的技能总览：编程语言、机器学习与计算机视觉、系统与工具、硬件与嵌入式四类，按熟练度分级。',
  experience: '安泽祎的科研与实践经历：图神经网络交通预测、机器人视觉感知、边缘网络任务卸载与船舶目标检测。',
  education: '安泽祎的教育背景：大连海事大学计算机科学与技术专业（拔尖实验班）。',
  awards: '安泽祎的论文成果、竞赛获奖与奖学金记录。',
};

function normalizeTab(value: string | undefined): TabId {
  return TABS.some((tab) => tab.id === value) ? (value as TabId) : DEFAULT_TAB;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const tab = normalizeTab(params.tab);
  const label = TABS.find((item) => item.id === tab)?.label ?? '关于';

  return buildMetadata({
    title: tab === DEFAULT_TAB ? '关于' : `关于 · ${label}`,
    description: TAB_DESCRIPTION[tab],
    path: tab === DEFAULT_TAB ? '/about' : `/about?tab=${tab}`,
  });
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = normalizeTab(params.tab);

  const [profile, categories, publications] = await Promise.all([
    getProfile(),
    getSkillCategories(),
    getPublications(),
  ]);

  // 简介与每条经历的正文都经同一条 sanitize 管线渲染
  const [bio, renderedTimeline] = await Promise.all([
    renderMarkdown(profile.bio),
    Promise.all(
      timeline.map(async (entry) => ({
        entry,
        html: entry.description.trim().length > 0
          ? (await renderMarkdown(entry.description)).html
          : '',
      })),
    ),
  ]);

  const byType = {
    work: renderedTimeline.filter((item) => item.entry.type === 'WORK'),
    service: renderedTimeline.filter((item) => item.entry.type === 'SERVICE'),
    education: renderedTimeline.filter((item) => item.entry.type === 'EDUCATION'),
    awards: renderedTimeline.filter((item) => item.entry.type === 'AWARD'),
  };

  const tabs: AboutTab[] = [
    {
      id: 'intro',
      label: '简介',
      content: (
        <>
          <Section title="个人简介">
            <Prose html={bio.html} />
          </Section>

          <Section title="研究兴趣">
            <ul className="flex list-none flex-wrap gap-2 p-0">
              {profile.interests.map((interest) => (
                <li key={interest}>
                  <Chip variant="default">{interest}</Chip>
                </li>
              ))}
            </ul>
          </Section>
        </>
      ),
    },
    {
      id: 'skills',
      label: '技能',
      content: (
        <>
          {categories.map((category) => (
            <Section key={category.id} title={category.name} id={`skill-${category.id}`}>
              <SkillGrid category={category} />
            </Section>
          ))}
        </>
      ),
    },
    {
      id: 'experience',
      label: '经历',
      content: (
        <>
          <Section title="科研与工作经历">
            <EntryList>
              {byType.work.map(({ entry, html }) => (
                <EntryRow
                  key={entry.id}
                  title={entry.role}
                  subtitle={entry.organization}
                  period={formatDateRange(entry.startDate, entry.endDate, entry.current)}
                  descriptionHtml={html}
                  href={entry.url}
                />
              ))}
            </EntryList>
          </Section>

          <Section title="社会实践与服务">
            <EntryList>
              {byType.service.map(({ entry, html }) => (
                <EntryRow
                  key={entry.id}
                  title={entry.role}
                  subtitle={entry.organization}
                  period={formatDateRange(entry.startDate, entry.endDate, entry.current)}
                  descriptionHtml={html}
                  href={entry.url}
                />
              ))}
            </EntryList>
          </Section>
        </>
      ),
    },
    {
      id: 'education',
      label: '教育',
      content: (
        <Section title="教育背景">
          <EntryList>
            {byType.education.map(({ entry, html }) => (
              <EntryRow
                key={entry.id}
                title={entry.role}
                subtitle={entry.organization}
                period={formatDateRange(entry.startDate, entry.endDate, entry.current)}
                descriptionHtml={html}
                href={entry.url}
              />
            ))}
          </EntryList>
        </Section>
      ),
    },
    {
      id: 'awards',
      label: '荣誉',
      content: (
        <>
          <Section title="论文成果">
            <EntryList>
              {publications.map((publication) => (
                <li key={publication.id} className="border-b border-border py-6 last:border-b-0">
                  <p className="font-serif text-base leading-snug font-medium text-text">
                    {publication.title}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    {publication.authors} · {publication.venue}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-text-subtle">
                    {publication.authorRole} · {publication.status}
                  </p>
                </li>
              ))}
            </EntryList>
          </Section>

          <Section title="竞赛获奖与奖学金">
            <EntryList>
              {byType.awards.map(({ entry }) => (
                <EntryRow
                  key={entry.id}
                  title={entry.role}
                  subtitle={entry.organization}
                  period={formatDateRange(entry.startDate, entry.endDate, entry.current)}
                  href={entry.url}
                />
              ))}
            </EntryList>
          </Section>
        </>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '关于' }]} />

      <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ProfileRail profile={profile} />
        </aside>

        <div className="min-w-0">
          <h1 className="sr-only">{`关于 ${profile.name}`}</h1>
          <AboutTabs tabs={tabs} initialTab={activeTab} />
        </div>
      </div>

      <JsonLd
        data={breadcrumbJsonLd([{ label: '首页', href: '/' }, { label: '关于', href: '/about' }])}
      />
    </>
  );
}
