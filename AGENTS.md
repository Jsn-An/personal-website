# AGENTS.md

本文件是给 AI 编码助手（以及新加入的开发者）的项目说明书。
开始任何工作前请先读完本文件，再读 `PRD.md`（做什么）与 `TECH_DESIGN.md`（怎么做）。

---

## 1. 项目概览

学术风格的个人展示网站，版式与分区秩序参照 **Stanford Profiles**，
采用 **Stanford 官方色板与字体**。包含公开站点（个人介绍、技能、项目、博客、搜索）
与自建后台（内容管理）。单管理员，无用户注册。

**设计立场**：排版主导、低装饰。白底、1px 横线分区、衬线标题、极少量动效。
**明确不存在**：深色主题、星空或任何背景动画、视差、入场动画、滚动触发效果。

**核心技术**：Next.js App Router · React · TypeScript (strict) · Tailwind CSS v4 ·
PostgreSQL + Prisma · Auth.js v5 · Zod · Vercel

**字体**：Source Serif 4（标题）/ Source Sans 3（正文与 UI）/ Roboto Mono（代码）/
Roboto Slab（数字统计）

---

## 2. 常用命令

```bash
pnpm install              # 安装依赖
pnpm dev                  # 本地开发 (http://localhost:3000)
pnpm build                # 生产构建
pnpm start                # 运行生产构建
pnpm lint                 # ESLint
pnpm typecheck            # tsc --noEmit
pnpm format               # Prettier 写入
pnpm test                 # Vitest 单元/集成
pnpm test:e2e             # Playwright 端到端
pnpm db:migrate           # prisma migrate dev
pnpm db:deploy            # prisma migrate deploy（生产）
pnpm db:seed              # 写入种子数据
pnpm db:studio            # Prisma Studio 查看数据
```

提交前必须全部通过：`pnpm typecheck && pnpm lint && pnpm test`。

先查 `package.json` 的 `scripts` 确认真实命令名，不要臆造。

---

## 3. 仓库地图

| 路径 | 职责 | 注意 |
| --- | --- | --- |
| `src/app/(site)/` | 公开站点页面 | 默认 Server Component，静态/ISR |
| `src/app/(admin)/` | 后台页面 | 全部动态，必须校验会话 |
| `src/app/api/` | Route Handler | 仅用于公开读接口、搜索、上传、联系表单、Auth |
| `src/components/ui/` | shadcn 基础组件 | 可改，但保持无障碍属性 |
| `src/components/site/` | 布局与结构组件 | `Section` / `Container` / `TabBar` / `Prose` / `Breadcrumb` / `SiteHeader` / `SiteFooter` / `MobileNav` / `UtilityBar` / `PageHeader` / `SkipLink` |
| `src/components/sections/` | 页面级区块 | Hero / StatStrip / FeaturedProjects / SkillGroups / LatestPosts / ProfileRail |
| `src/components/admin/` | 后台业务组件 | 表单与表格 |
| `src/lib/queries/` | **唯一**的读数据入口 | 必须带 `cacheTag` |
| `src/lib/actions/` | **唯一**的写数据入口 | 必须 Zod 校验 + revalidate |
| `src/lib/validators/` | Zod schema | 前后端共用，单一事实来源 |
| `src/lib/markdown.ts` | Markdown 渲染管线 | 安全敏感，勿绕过 sanitize |
| `src/lib/search.ts` | 搜索查询封装 | `pg_trgm` 相关逻辑集中在此 |
| `prisma/schema.prisma` | 数据模型 | 改后必须迁移 |
| `prisma/migrations/` | 迁移历史 | **只追加，禁止修改已有文件** |

---

## 4. 编码规范

### 4.1 TypeScript

- `strict: true`，禁止 `any`（必要时用 `unknown` + 类型收窄）。
- 禁止非空断言 `!`，除非紧跟同一行注释说明为何一定存在。
- 对外导出的函数显式标注返回类型；优先 `type`（对象）与 `interface`（可扩展契约）二选一并保持一致。
- 使用 `import type` 导入纯类型。
- 环境变量通过 `src/lib/env.ts` 统一校验后导出，禁止在业务代码里直接读 `process.env`。

### 4.2 React / Next.js

- **默认 Server Component**。仅在需要状态、事件、浏览器 API 时加 `"use client"`，
  并把 `"use client"` 推到组件树尽可能深的叶子节点。
- 数据获取只在 Server Component 或 Server Action 中进行，**不在客户端组件里直接访问数据库**。
- 禁止在组件中 `import { prisma }`；一律通过 `src/lib/queries/*`。
- 写操作一律放在 `src/lib/actions/*`，使用 `'use server'`。
- 路由组划分清楚：公开页放进 `(site)`，后台放进 `(admin)`。
- 使用 `next/image` 与 `next/font`，禁止 `<img>` 与外部 `<link>` 引入字体。
- 使用 `Link` 做站内跳转，禁止用 `<a>` 触发整页刷新。
- 每个异步路由段配 `loading.tsx`，需要时配 `error.tsx`。
- 页面内容必须经由 `Section` 组件组织，保持「标题 + 横线 + 内容」的节奏统一。

### 4.3 命名

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 组件文件 | PascalCase | `ProjectCard.tsx` |
| 非组件文件 | kebab-case | `rate-limit.ts` |
| 目录 | kebab-case | `media-picker/` |
| 组件 / 类型 | PascalCase | `Project`, `PostStatus` |
| 函数 / 变量 | camelCase | `getPublishedPosts` |
| 常量 | SCREAMING_SNAKE | `MAX_UPLOAD_SIZE` |
| 数据库表 | PascalCase 单数（Prisma 默认） | `Project` |
| 数据库字段 | camelCase | `publishedAt` |

### 4.4 样式与设计约束

**颜色**

- 颜色只能取自 `src/app/globals.css` 的 `@theme` 中定义的 Stanford 官方色板 token，
  禁止在任何地方硬编码 HEX 值。
- 文字色不得浅于 `--color-ink-60`（`#767674`，对比度 4.55:1）。
  `--color-ink-40`（`#ABABA9`）及更浅的墨色**仅可用于边框与装饰，禁止用作文字**。
- **Cardinal Red 是强调色，不是填充色。** 全页配比约为 中性 80% / 墨色阶梯 15% / 红色 5%。
  不得用红色做大面积背景，不得用红色做正文。
- **深色底（`--color-surface-dark`）上禁止使用 Cardinal Red 文字**
  （对比度仅 1.45:1）。深色底上只能用 `--color-text-on-dark`（白）
  或 `--color-text-on-dark-muted`（`#DAD7CB`）。
- 官方强调色（Palo Alto、Sky、Poppy、Plum 等）仅用于标签分类、图表与状态标识，
  不得成为主色，不得用于正文或大面积填充。

**排版**

- 页面标题、分区标题、卡片标题用 `font-serif`（Source Serif 4）；
  正文与 UI 用默认 `font-sans`（Source Sans 3）；代码用 `font-mono`；
  数字统计用 `font-slab`。不要混用。
- 正文不得小于 16px，行高 1.5。
- 正文容器最大宽度 68 字符（`max-w-[68ch]`）。
- `next/font` 只加载字体实际使用的字重与拉丁子集；中文一律走系统字体栈
  （`"PingFang SC", "Microsoft YaHei"`）兜底，**禁止把中文打包进 webfont**。

**形状与层级**

- 圆角上限 4px（`--radius-sm: 2px`、`--radius-md: 4px`）。
  胶囊形（`rounded-full`）仅允许用于 chip / badge。
- 卡片**不得使用阴影**，层级靠 1px 边框（`--color-border`）与底色区分。
- 全站仅允许两处阴影：sticky 导航 `0 1px 3px rgba(0,0,0,.08)`、
  下拉浮层 `0 2px 8px rgba(0,0,0,.12)`。
- 不使用 `backdrop-filter`，不使用固定背景层，不使用背景图或装饰渐变。

**布局**

- 「移动优先」：默认样式针对窄屏，用 `sm:` `md:` `lg:` 向上扩展。
- 内容容器统一用 `Container` 组件（最大 1200px + 断点留白），不要自己写 `max-w-*`。
- 分区之间用 `Section` 组件，不要手写标题与横线。

**动效**

- 只允许状态变化类过渡：颜色 `120ms`、标签下划线 `180ms`、
  抽屉/折叠 `200ms`（`cubic-bezier(.22,1,.36,1)`）。
- **禁止新增**：入场动画、滚动触发动画、视差、背景动画、卡片上浮、
  图片放大、数字滚动、页面切换动画。
- 只动画 `color` / `border-color` / `opacity` / `transform`。

### 4.5 数据与安全

- 每个写操作：`Zod 校验 → 会话校验 → 业务逻辑 → revalidateTag → 返回结果`，缺一不可。
- 所有管理端 Route Handler 与 Server Action 必须调用 `requireAdmin()`。
- Markdown 一律经 `renderMarkdown()`，不得使用 `dangerouslySetInnerHTML` 绕过 sanitize。
- 用户输入（联系表单、alt 文本）在展示时转义。
- 日志中禁止出现密码、令牌、完整 Cookie。
- 不得提交 `.env*`（`.env.example` 除外）。
- `SiteSettings.accentColor` 必须经枚举校验（限定在官方色板内），不得放开为任意字符串。

### 4.6 无障碍

- 所有交互元素必须有可见焦点态，统一走 `:focus-visible` 的 2px 强调色焦点环。
- 标签页必须实现完整 WAI-ARIA Tabs 模式：`role="tablist"` / `role="tab"` / `role="tabpanel"`，
  `aria-selected`、`aria-controls`、`tabIndex` 均正确设置，支持方向键与 Home/End。
- 弹窗与抽屉必须有焦点陷阱，`Esc` 可关闭，关闭后焦点归还触发元素。
- 表单控件必须有 `<label>`，错误提示用 `aria-describedby` 关联。
- 图片必须有 `alt`；装饰性图标加 `aria-hidden="true"`。
- 关键信息不得只依赖 hover 呈现。

### 4.7 依赖管理

- 新增依赖前先确认是否能用现有依赖实现。
- 单个新增依赖的 gzip 体积 **> 20KB** 时，必须在 PR 描述中说明理由与替代方案。
- 前台路由不得引入后台专用依赖（如表格、编辑器）——用动态导入隔离。

---

## 5. 修改前的检查清单

任何涉及以下内容的变化，都要同步更新对应文件：

| 变化 | 必须更新 |
| --- | --- |
| 新增/修改数据表或字段 | `prisma/schema.prisma` + 新迁移 + `TECH_DESIGN.md` 第 5 节 |
| 新增接口或 Server Action | `TECH_DESIGN.md` 第 6 节 |
| 新增环境变量 | `.env.example` + `TECH_DESIGN.md` 第 16 节 + 本文件第 7 节 |
| 新增设计 token 或改变色彩用法 | `globals.css` + `TECH_DESIGN.md` 第 11 节 + 本文件第 4.4 节 |
| 变更页面分区或标签页结构 | `PRD.md` §6.3 |
| 变更功能范围或优先级 | `PRD.md` §3 |
| 变更构建/测试命令 | 本文件第 2 节 |
| 新增架构级选择 | `TECH_DESIGN.md` 第 1 节 ADR 区 |

---

## 6. 完成标准（Definition of Done）

- [ ] `pnpm typecheck` 通过
- [ ] `pnpm lint` 无警告
- [ ] 相关单元/集成测试已补，`pnpm test` 通过
- [ ] 涉及用户可见流程时，有对应 E2E 或已手工验证并说明步骤
- [ ] 在 360px、768px、1440px 三个宽度下目视检查
- [ ] 键盘可完整操作新增交互；控件有可见焦点
- [ ] 标签页/弹窗的 ARIA 属性与键盘行为符合第 4.6 节
- [ ] 所有文字色对比度 ≥ 4.5:1，且未使用 `--color-ink-40` 及更浅色作为文字
- [ ] 顶栏与页脚文字对比度达标，且未使用 Cardinal Red 文字
- [ ] 未引入任何装饰性动效
- [ ] 卡片无阴影，圆角不超过 4px，颜色全部来自 `@theme` token
- [ ] 新增页面有 `metadata`（title/description/canonical）
- [ ] 无 `console.log` 残留（生产代码）
- [ ] 相关文档已按第 5 节更新

---

## 7. 环境变量速查

见 `TECH_DESIGN.md` 第 16 节。关键几条：

| 变量 | 用途 | 是否暴露到浏览器 |
| --- | --- | --- |
| `DATABASE_URL` | 运行时连接（带连接池） | 否 |
| `DIRECT_URL` | Prisma 迁移直连（含扩展安装） | 否 |
| `AUTH_SECRET` | 会话签名 | 否 |
| `NEXT_PUBLIC_SITE_URL` | 绝对 URL 生成 | 是 |
| `BLOB_READ_WRITE_TOKEN` | 图片上传 | 否 |
| `UPSTASH_REDIS_REST_*` | 限流 | 否 |
| `SEED_ADMIN_*` | 种子管理员账号 | 否 |

---

## 8. 禁止事项

- ❌ 修改 `prisma/migrations/` 中已存在的迁移文件
- ❌ 在组件里直接访问数据库或 `process.env`
- ❌ 使用 `any`、`@ts-ignore`（需要时改用 `@ts-expect-error` 并写原因）
- ❌ 用 `dangerouslySetInnerHTML` 渲染未经 sanitize 的内容
- ❌ 提交密钥、令牌、真实用户数据
- ❌ 为图省事关闭 ESLint 规则（确需关闭必须同行注明原因）
- ❌ 在前台页面引入后台专用重量级依赖
- ❌ 硬编码颜色值（必须走 `@theme` token）
- ❌ 使用比 `--color-ink-60` 更浅的墨色作为文字
- ❌ 在深色顶栏或页脚使用 Cardinal Red 文字
- ❌ 把 Cardinal Red 用作大面积填充或正文颜色
- ❌ 引入装饰性动画（视差、入场、滚动触发、背景动效）
- ❌ 给卡片添加阴影，或使用超过 4px 的圆角
- ❌ 使用 `backdrop-filter` 或固定背景层
- ❌ 把中文打包进 webfont
- ❌ 引入与服务端渲染不兼容的浏览器全局访问（组件顶层直接用 `window`）

---

## 9. Git 约定

- 分支：`feat/xxx`、`fix/xxx`、`chore/xxx`、`docs/xxx`
- 提交信息遵循 Conventional Commits：
  `feat(blog): 支持按标签筛选文章` / `fix(auth): 修复连续失败未锁定`
- 一个 PR 只做一件事；数据库迁移与业务代码同一 PR 提交，便于一起回滚评估。
- PR 描述包含：改了什么、为什么、如何验证、截图（涉及 UI 时）。

---

## 10. 遇到不确定时

1. 先读 `PRD.md` 判断这是否在范围内；不在范围内先提问，不要自行扩范围。
2. 涉及架构选择时，先给出 1–3 个方案与权衡，再实施，
   并把结论补进 `TECH_DESIGN.md` 的 ADR 区。
3. 涉及视觉设计时，先确认是否符合 PRD §6.1 的五条设计原则；
   任何试图重新引入装饰性视觉元素（星空、渐变、动画、深色主题）的改动，
   都需要先回到 PRD 层面确认，不要在实现层悄悄加回来。
4. 性能或安全相关的改动，宁可保守，并在 PR 中显式说明影响。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
