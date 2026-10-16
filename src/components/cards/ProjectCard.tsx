import Image from 'next/image';
import Link from 'next/link';
import { Chip } from '@/components/ui/Chip';
import type { Project } from '@/types/content';
import { formatDateRange } from '@/lib/utils';

/**
 * 项目卡片（PRD §6.3）。
 * 白底 + 1px 描边 + 2px 圆角 + 无阴影；hover 时边框加深并在左侧出现 4px Cardinal 竖条。
 * 封面图按 16:9 固定宽高比渲染，避免 CLS；未提供封面时不渲染图片区。
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col rounded-sm border border-border bg-surface p-6 transition-colors duration-[120ms] hover:border-ink-40">
      {/* hover 时出现的左侧强调竖条 */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 rounded-l-sm bg-cardinal opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100"
      />

      {project.coverUrl ? (
        <div className="relative mb-5 aspect-video overflow-hidden rounded-sm border border-border">
          <Image
            src={project.coverUrl}
            alt={`${project.title}的封面图`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold leading-snug text-text">
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors duration-[120ms] after:absolute after:inset-0 after:content-[''] group-hover:text-link"
          >
            {project.title}
          </Link>
        </h3>
        {project.featured ? <Chip variant="muted">精选</Chip> : null}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-text-muted">{project.summary}</p>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {project.tech.slice(0, 4).map((tech) => (
            <Chip key={tech}>{tech}</Chip>
          ))}
          {project.tech.length > 4 ? (
            <span className="text-xs text-text-subtle">+{project.tech.length - 4}</span>
          ) : null}
        </div>

        <p className="mt-4 text-[0.8125rem] text-text-subtle">
          {project.role}
          {' · '}
          {formatDateRange(project.startDate, project.endDate, project.current)}
        </p>
      </div>
    </article>
  );
}
