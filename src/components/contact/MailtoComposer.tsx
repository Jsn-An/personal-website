'use client';

import { useId, useState } from 'react';

/**
 * 联系表单。
 *
 * ⚠️ 实现方式说明：本站当前没有数据库与邮件服务（PRD §3.2 A-12 的「消息收件箱」
 *    需要 Postgres 与限流组件，属于后续里程碑）。为了不提供一个点了没反应的假表单，
 *    这里把表单做成**邮件撰写器**：校验通过后在浏览器端组装 mailto: 链接，
 *    由访客自己的邮件客户端发送。服务端收件箱上线后替换本组件的提交逻辑即可，
 *    字段与校验规则（AGENTS.md §4.5 要求的 Zod schema）保持一致。
 */
export function MailtoComposer({ to }: { to: string }) {
  const nameId = useId();
  const subjectId = useId();
  const bodyId = useId();
  const errorId = useId();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState(false);

  const buildHref = (): string => {
    const params = new URLSearchParams();
    params.set('subject', subject.trim().length > 0 ? subject.trim() : `来自 ${name.trim()} 的留言`);
    params.set('body', `${body.trim()}\n\n——${name.trim()}`);
    return `mailto:${to}?${params.toString()}`;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (name.trim().length === 0 || body.trim().length === 0) {
      setError('请填写「称呼」与「正文」两项。');
      setPrepared(false);
      return;
    }

    setError('');
    setPrepared(true);
    // 打开访客自己的邮件客户端，正文与主题已预填
    window.location.href = buildHref();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[68ch]" noValidate>
      <div className="mb-5">
        <label htmlFor={nameId} className="block text-sm font-medium text-text">
          称呼 <span className="text-text-subtle">（必填）</span>
        </label>
        <input
          id={nameId}
          name="name"
          value={name}
          required
          autoComplete="name"
          aria-invalid={error.length > 0 && name.trim().length === 0}
          aria-describedby={error.length > 0 ? errorId : undefined}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 h-11 w-full rounded-sm border border-border-strong bg-surface px-3 text-base text-text outline-none transition-colors duration-[120ms] focus:border-cardinal focus:ring-2 focus:ring-cardinal/25"
        />
      </div>

      <div className="mb-5">
        <label htmlFor={subjectId} className="block text-sm font-medium text-text">
          主题 <span className="text-text-subtle">（可选）</span>
        </label>
        <input
          id={subjectId}
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-2 h-11 w-full rounded-sm border border-border-strong bg-surface px-3 text-base text-text outline-none transition-colors duration-[120ms] focus:border-cardinal focus:ring-2 focus:ring-cardinal/25"
        />
      </div>

      <div className="mb-5">
        <label htmlFor={bodyId} className="block text-sm font-medium text-text">
          正文 <span className="text-text-subtle">（必填）</span>
        </label>
        <textarea
          id={bodyId}
          name="body"
          value={body}
          required
          rows={8}
          aria-invalid={error.length > 0 && body.trim().length === 0}
          aria-describedby={error.length > 0 ? errorId : undefined}
          onChange={(event) => setBody(event.target.value)}
          className="mt-2 w-full rounded-sm border border-border-strong bg-surface px-3 py-2 text-base leading-relaxed text-text outline-none transition-colors duration-[120ms] focus:border-cardinal focus:ring-2 focus:ring-cardinal/25"
        />
      </div>

      {error.length > 0 ? (
        <p id={errorId} role="alert" className="mb-4 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-sm bg-cardinal px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-[120ms] hover:bg-cardinal-dark"
        >
          打开邮件客户端
        </button>

        <a
          href={prepared ? buildHref() : `mailto:${to}`}
          className="text-sm text-link hover:text-link-hover hover:underline"
        >
          或直接写信给 {to}
        </a>
      </div>

      <p aria-live="polite" className="mt-4 text-sm text-text-muted">
        {prepared
          ? '已生成邮件草稿。若邮件客户端没有自动打开，请点击上面的链接。'
          : '提交后会在你本机的邮件客户端中打开一封预填好主题与正文的邮件，由你确认后发送。'}
      </p>
    </form>
  );
}
