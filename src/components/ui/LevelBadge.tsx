import { SKILL_LEVEL_LABEL, type SkillLevel } from '@/types/content';
import { cn } from '@/lib/utils';

/**
 * 熟练度标签。
 * PRD §3.1 F-05：用离散标签而非进度条，避免视觉噪音。
 */
export function LevelBadge({ level, className }: { level: SkillLevel; className?: string }) {
  return (
    <span
      className={cn(
        'shrink-0 text-xs leading-5',
        level === 'EXPERT' || level === 'ADVANCED' ? 'text-text-muted' : 'text-text-subtle',
        className,
      )}
    >
      {SKILL_LEVEL_LABEL[level]}
    </span>
  );
}
