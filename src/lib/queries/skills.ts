import type { Skill, SkillCategory } from '@/types/content';
import { allSkills, featuredSkills, skillCategories } from '@/content/skills';

/**
 * 技能的只读查询（AGENTS.md §3）。
 */

export async function getSkillCategories(): Promise<SkillCategory[]> {
  return [...skillCategories].sort((a, b) => a.order - b.order);
}

export async function getFeaturedSkills(): Promise<Skill[]> {
  return featuredSkills;
}

export async function getSkillTotals(): Promise<{ categories: number; skills: number }> {
  return { categories: skillCategories.length, skills: allSkills.length };
}
