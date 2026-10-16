import type { Metadata } from 'next';
import { CategoryTabs, SkillGrid } from '@/components/sections/SkillGroups';
import { Breadcrumb } from '@/components/site/Breadcrumb';
import { EmptyState } from '@/components/site/EmptyState';
import { PageHeader } from '@/components/site/PageHeader';
import { Section } from '@/components/site/Section';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { getSkillCategories } from '@/lib/queries/skills';
import { buildMetadata } from '@/lib/seo';

/**
 * 技能独立页（PRD §3.1 F-05，TECH_DESIGN §3 目录结构中的 `/skills`）。
 * 与个人页的「技能」标签页共用 SkillGrid，但分类筛选走 `?category=`，可直达可分享。
 */

export const metadata: Metadata = buildMetadata({
  title: '技能',
  description:
    '安泽祎的技能总览：编程语言、机器学习与计算机视觉、系统与工具、硬件与嵌入式。熟练度用离散标签（入门 / 熟悉 / 熟练 / 精通）表示。',
  path: '/skills',
  keywords: ['技能', 'Python', 'PyTorch', '图神经网络', '计算机视觉', 'Linux'],
});

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categories = await getSkillCategories();

  const requested = categories.find((category) => category.id === params.category);
  const activeId = requested ? requested.id : 'all';
  const visible = requested ? [requested] : categories;

  const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0);

  return (
    <>
      <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '技能' }]} />

      <PageHeader
        title="技能"
        description={`共 ${categories.length} 个分类、${totalSkills} 项技能。熟练度按简历中的措辞映射为离散等级，不使用进度条。`}
      />

      <CategoryTabs
        items={[
          { id: 'all', label: '全部', count: totalSkills },
          ...categories.map((category) => ({
            id: category.id,
            label: category.name,
            count: category.skills.length,
          })),
        ]}
        activeId={activeId}
        hrefFor={(id) => (id === 'all' ? '/skills' : `/skills?category=${id}`)}
      />

      {visible.length === 0 ? (
        <EmptyState
          title="暂无技能条目"
          description="技能数据尚未录入。可以先看看项目或文章了解实际做过什么。"
        >
          <ButtonLink href="/projects" variant="secondary">
            浏览项目
          </ButtonLink>
        </EmptyState>
      ) : (
        visible.map((category) => (
          <Section key={category.id} title={category.name} id={`skill-${category.id}`}>
            <SkillGrid category={category} />
          </Section>
        ))
      )}

      <Section title="熟练度说明" className="mb-0">
        <dl className="max-w-[68ch] text-sm">
          <div className="flex gap-4 border-b border-border py-2">
            <dt className="w-16 shrink-0 text-text-subtle">精通</dt>
            <dd className="text-text-muted">可独立完成复杂任务并解决边界问题（简历中未使用该等级）</dd>
          </div>
          <div className="flex gap-4 border-b border-border py-2">
            <dt className="w-16 shrink-0 text-text-subtle">熟练</dt>
            <dd className="text-text-muted">对应简历中的「熟练掌握」，用于真实项目</dd>
          </div>
          <div className="flex gap-4 border-b border-border py-2">
            <dt className="w-16 shrink-0 text-text-subtle">熟悉</dt>
            <dd className="text-text-muted">对应简历中的「熟悉」，能在指导下使用</dd>
          </div>
          <div className="flex gap-4 py-2">
            <dt className="w-16 shrink-0 text-text-subtle">入门</dt>
            <dd className="text-text-muted">对应简历中的「了解」，具备基本概念</dd>
          </div>
        </dl>
      </Section>
    </>
  );
}
