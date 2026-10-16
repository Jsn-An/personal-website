/**
 * 内容实体类型。
 *
 * 当前用于本地内容模块；字段命名与 TECH_DESIGN §5 的 Prisma 模型保持一致，
 * 以便后续切换到数据库时无需改动页面代码。
 */

export type TimelineType = 'WORK' | 'EDUCATION' | 'AWARD' | 'SERVICE';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  BEGINNER: '入门',
  INTERMEDIATE: '熟悉',
  ADVANCED: '熟练',
  EXPERT: '精通',
};

export interface Profile {
  name: string;
  nameEn: string;
  headline: string;
  title: string;
  affiliation: string;
  location: string;
  email: string;
  github: string;
  githubHandle: string;
  availability: string;
  /**
   * 1:1 头像地址。留空时渲染首字母方块占位
   * （本项目暂无本人授权使用的照片，故当前为空）。
   */
  avatarUrl?: string;
  /** Markdown，对应个人页「简介」标签页 */
  bio: string;
  interests: string[];
  stats: { label: string; value: string }[];
}

export interface TimelineEntry {
  id: string;
  type: TimelineType;
  organization: string;
  role: string;
  /** Markdown，条目的要点列表 */
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  url?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  featured: boolean;
  /** 无图标时渲染首字母方块 */
  note?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  skills: Skill[];
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  /** Markdown，用二级标题拆出「背景 / 挑战 / 方案 / 结果」分区 */
  description: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  tech: string[];
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  /** 16:9 封面图地址；留空时卡片不渲染图片区域（避免占位图带来的空白） */
  coverUrl?: string;
  /** 详情页截图/示意图列表，点击可开灯箱 */
  gallery?: string[];
  featured: boolean;
  /** true 表示内容由简历推导、需要本人补充细节 */
  needsDetail?: boolean;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown */
  content: string;
  publishedAt: string;
  tags: string[];
  readingTime: number;
  featured: boolean;
  /** 16:9 封面图地址；留空时不渲染封面区 */
  coverUrl?: string;
  /**
   * true 表示这是根据简历经历生成的示例文章，非正式发布内容。
   * 页面上会显示「示例文章」标记，可随时删除。
   */
  isSample: boolean;
}
