import type { Metadata } from 'next';
import { ContactSection } from '@/components/sections/ContactSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { SkillCategorySummary } from '@/components/sections/SkillGroups';
import { StatStrip } from '@/components/sections/StatStrip';
import { PostListItem } from '@/components/cards/PostListItem';
import { ProjectCard } from '@/components/cards/ProjectCard';
import { EntryList, SectionMoreLink } from '@/components/site/EntryList';
import { Section } from '@/components/site/Section';
import { getLatestPosts } from '@/lib/queries/posts';
import { getProfile } from '@/lib/queries/profile';
import { getFeaturedProjects } from '@/lib/queries/projects';
import { getSkillCategories } from '@/lib/queries/skills';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

/**
 * 首页（PRD §3.1 F-02）：搜索优先 Hero + 数据条 + 四个横线分区。
 *
 * 内容当前来自构建期的本地模块，因此整页静态生成，无需 revalidate。
 * 切换到数据库后，这里改为 ISR + `revalidateTag('projects')` 等（TECH_DESIGN §4）。
 */
export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  path: '/',
  absoluteTitle: true,
});

export default async function HomePage() {
  const [profile, featuredProjects, skillCategories, latestPosts] = await Promise.all([
    getProfile(),
    getFeaturedProjects(3),
    getSkillCategories(),
    getLatestPosts(3),
  ]);

  return (
    <>
      <HeroSection />

      <StatStrip stats={profile.stats} />

      <Section
        title="精选项目"
        action={<SectionMoreLink href="/projects">查看全部项目</SectionMoreLink>}
      >
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <li key={project.slug} className="flex">
              <div className="w-full">
                <ProjectCard project={project} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="技能领域" action={<SectionMoreLink href="/skills">查看技能总览</SectionMoreLink>}>
        <div>
          {skillCategories.map((category) => (
            <SkillCategorySummary key={category.id} category={category} />
          ))}
        </div>
      </Section>

      <Section title="最新文章" action={<SectionMoreLink href="/blog">全部文章</SectionMoreLink>}>
        <EntryList>
          {latestPosts.map((post) => (
            <PostListItem key={post.slug} post={post} />
          ))}
        </EntryList>
      </Section>

      <Section title="联系" className="mb-0">
        <ContactSection />
      </Section>
    </>
  );
}
