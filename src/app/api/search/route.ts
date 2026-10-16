import { NextResponse } from 'next/server';
import { searchContent, searchSuggestions } from '@/lib/search';

/** 查询串长度上限，避免超长输入进入匹配逻辑。 */
const MAX_QUERY_LENGTH = 100;

/**
 * 搜索接口（TECH_DESIGN §6.2）。
 *
 * `?q=` 默认返回首页搜索框用的建议列表；
 * `?mode=full` 返回完整的两组结果。不缓存。
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH);

  if (query.trim().length === 0) {
    return NextResponse.json({ suggestions: [], projects: [], posts: [], total: 0 });
  }

  if (searchParams.get('mode') === 'full') {
    const results = await searchContent(query);
    return NextResponse.json(results);
  }

  return NextResponse.json({ suggestions: await searchSuggestions(query) });
}
