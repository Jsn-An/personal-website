import { absoluteUrl } from '@/lib/seo';

/**
 * JSON-LD 结构化数据（TECH_DESIGN §12）。
 *
 * 数据全部由站内内容构造，不接受用户输入；即便如此仍转义 `<`，
 * 避免正文里出现 `</script>` 时提前闭合标签。
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- 内容由站内数据 JSON.stringify 后转义，无用户输入
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** 供页面直接取用的绝对地址，避免每处重复 import absoluteUrl。 */
export const siteUrl = absoluteUrl;
