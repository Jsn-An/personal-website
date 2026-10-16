import type { ReactNode } from 'react';

/** 页面标题区：衬线大标题 + 可选说明（PRD §6.4 字号阶梯 h1）。 */
export function PageHeader({
  title,
  description,
  meta,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-8">
      <h1 className="font-serif text-3xl font-bold leading-tight text-text sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-[68ch] text-base text-text-muted">{description}</p>
      ) : null}
      {meta ? <div className="mt-4 text-sm text-text-subtle">{meta}</div> : null}
    </header>
  );
}
