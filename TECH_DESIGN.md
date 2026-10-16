# 技术设计文档 — 个人展示网站

| 项目 | 内容 |
| --- | --- |
| 版本 | v2.0 |
| 对应 PRD | `PRD.md` v2.0 |
| 最后更新 | 2026-10-16 |
| 设计参照 | Stanford Profiles 版式 + Stanford 官方色板与字体 |

> **v2.0 变更说明**：移除星空背景与深色主题，改为浅色学术风格。
> 相应地删除 Canvas/WebGL 相关方案，新增字体自托管、版式组件、
> 搜索实现与对比度守卫等内容。

---

## 1. 技术栈

| 层 | 选型 | 理由 |
| --- | --- | --- |
| 框架 | **Next.js (App Router)** + React + TypeScript (strict) | 一仓库内同时承载 SSG/ISR 的公开站点与动态后台；RSC 降低客户端 JS |
| 样式 | **Tailwind CSS v4**（CSS-first `@theme` token） | token 与工具类统一，设计约束可集中表达 |
| UI 基础 | **shadcn/ui**（Radix + Tailwind） | 复制到仓库即拥有，无运行时依赖，无障碍行为已处理（含 Tabs、Dialog） |
| 字体 | **`next/font/google` 自托管** | Source Serif 4 / Source Sans 3 / Roboto Mono / Roboto Slab，零第三方请求 |
| 数据库 | **PostgreSQL**（Neon，带连接池） | 托管、免运维、与 Vercel 网络延迟低；`pg_trgm` 支撑搜索 |
| ORM | **Prisma** | 类型安全、迁移清晰、社区成熟 |
| 认证 | **Auth.js v5**（Credentials Provider） | 与 Next.js 深度集成，单管理员场景足够 |
| 校验 | **Zod** | 前后端共用同一套 schema |
| 表单 | **React Hook Form** + `@hookform/resolvers` | 非受控、性能好、与 Zod 组合成熟 |
| Markdown | **unified**（remark parse → remark-gfm → rehype-sanitize → rehype-pretty-code/Shiki） | 可插拔管线，完全可控 |
| 代码高亮主题 | **Shiki `github-light`** | 与浅色主题一致 |
| 编辑器 | **CodeMirror 6**（Markdown 模式） | 体积可控、移动端可用、可扩展快捷键 |
| 数据请求 | RSC 直查 + **Server Actions**；客户端用 **TanStack Query** 仅限后台交互 | 减少 API 层样板 |
| 表格 | **TanStack Table** + URL 状态（`nuqs`） | 排序/筛选/分页可分享链接 |
| 通知 | **Sonner** | 轻量 toast |
| 图标 | **Lucide**（按需引入） | 树摇友好、风格统一 |
| 分析 | **Vercel Analytics** + Web Vitals 上报 | 隐私友好、零配置 |
| 限流 | **Upstash Redis**（`@upstash/ratelimit`） | Serverless 友好的滑动窗口限流 |
| 存储 | **Vercel Blob**（备选：Cloudflare R2） | 与 `next/image` 集成简单 |
| 测试 | **Vitest** + RTL + **Playwright** + axe-core | 单元/集成/E2E/a11y 全覆盖 |
| 质量 | ESLint（flat config）+ Prettier + Husky + lint-staged + Lighthouse CI | 提交即拦截 |
| 部署 | **Vercel**（Production + Preview 环境） | 与 Next.js 最佳契合，预览环境即 PR 预览 |

**架构决策记录（ADR 摘要）**

- **ADR-001 选 App Router 而非 Pages Router**：需要 RSC 减少客户端 JS，并用 `revalidateTag` 做精确增量重建。
- **ADR-002 后台与前台同仓库、同部署**：单管理员场景下拆分会带来认证与共享类型的重复成本，收益不足。
- **ADR-003 自建后台而非 Headless CMS**：需求包含定制的版式组件与拖拽排序交互，通用 CMS 的定制成本高于自建。
- **ADR-004 博客存 Markdown 而非 HTML**：保留可移植性（便于导出/迁移），渲染层可随时更换。
- **ADR-005 移除装饰性背景动画**：学术风格定位下，装饰动画与「排版主导」原则冲突，且是移动端性能负担。
  改为纯 CSS 静态浅色背景，删除全部 Canvas/WebGL 代码与相关性能预算。
- **ADR-006 设计 token 直接采用 Stanford 官方色板**：不自定义品牌色。
  强调色限定在官方色板内可选，避免任意取色破坏对比度合规。
- **ADR-007 个人页标签页状态存入 URL 查询参数**：保证可分享、可直达、可被搜索引擎独立索引，
  且允许服务端按标签只查询所需数据。

---

## 2. 系统架构

```
                         ┌──────────────────────────────┐
   访客浏览器  ──────────▶│  Vercel Edge Network (CDN)   │
                         └──────────────┬───────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
         ┌──────────▼──────────┐              ┌─────────────▼─────────────┐
         │ 公开站点 (RSC/SSG)   │              │ 后台 (动态, no-store)      │
         │ /  /about  /projects │              │ /admin/*  /api/admin/*    │
         │ /blog  /search       │              │ Server Actions + REST     │
         └──────────┬──────────┘              └─────────────┬─────────────┘
                    │                                       │
                    │  ┌────────────────────────────────────┘
                    │  │  Auth.js 会话校验 (每请求服务端验证)
                    ▼  ▼
         ┌──────────────────────┐        ┌───────────────────┐
         │ src/lib/queries/*    │        │ src/lib/actions/* │
         │ 带 cacheTag 的数据读取 │        │ Zod 校验 + 写库     │
         └──────────┬───────────┘        └─────────┬─────────┘
                    │                              │
                    │   revalidateTag / revalidatePath
                    ▼                              ▼
         ┌──────────────────────────────────────────────────┐
         │            Prisma Client (单例, 连接池)            │
         └──────────────────────┬───────────────────────────┘
                                ▼
                    ┌────────────────────────┐
                    │  PostgreSQL (Neon)     │
                    │  + pg_trgm 扩展         │
                    └────────────────────────┘

   外部服务: Vercel Blob(图片) · Upstash Redis(限流) · 邮件 API(通知)
```

---

## 3. 目录结构

```
personal-page/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/                 # 只追加，不手改
│   └── seed.ts
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (site)/                 # 公开站点路由组
│   │   │   ├── layout.tsx          # 顶栏 + 导航 + 页脚 + 字体变量
│   │   │   ├── page.tsx            # 首页
│   │   │   ├── about/page.tsx      # 个人页（左栏 + 标签页）
│   │   │   ├── skills/page.tsx     # 技能独立页（可选，标签页外的直达入口）
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── tags/[tag]/page.tsx
│   │   │   ├── search/page.tsx     # 主搜索落地页
│   │   │   └── contact/page.tsx
│   │   ├── (admin)/
│   │   │   ├── login/page.tsx
│   │   │   └── admin/
│   │   │       ├── layout.tsx      # AdminShell + 会话守卫
│   │   │       ├── page.tsx        # 概览
│   │   │       ├── posts/
│   │   │       ├── projects/
│   │   │       ├── skills/
│   │   │       ├── timeline/
│   │   │       ├── media/
│   │   │       ├── messages/
│   │   │       └── settings/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── contact/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── admin/…             # 仅用于非表单类操作
│   │   ├── rss.xml/route.ts
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── opengraph-image.tsx
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   └── globals.css             # Tailwind + @theme 设计 token
│   ├── components/
│   │   ├── ui/                     # shadcn 基础组件
│   │   ├── site/                   # 布局与结构组件
│   │   │   ├── UtilityBar.tsx
│   │   │   ├── SiteHeader.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── Section.tsx         # 分区：标题 + 横线 + 内容
│   │   │   ├── TabBar.tsx          # WAI-ARIA Tabs
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── SkipLink.tsx
│   │   │   └── Prose.tsx           # Markdown 正文容器
│   │   ├── sections/               # 首页与详情页的页面级区块
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StatStrip.tsx
│   │   │   ├── FeaturedProjects.tsx
│   │   │   ├── SkillGroups.tsx
│   │   │   ├── LatestPosts.tsx
│   │   │   └── ProfileRail.tsx
│   │   └── admin/                  # DataTable / MarkdownEditor / MediaPicker …
│   ├── lib/
│   │   ├── db.ts                   # Prisma 单例
│   │   ├── auth.ts                 # Auth.js 配置
│   │   ├── env.ts                  # 环境变量校验后导出
│   │   ├── markdown.ts             # unified 管线
│   │   ├── search.ts               # pg_trgm 查询封装
│   │   ├── rate-limit.ts
│   │   ├── storage.ts              # Blob 上传封装
│   │   ├── validators/             # Zod schema（前后端共用）
│   │   ├── queries/                # 带 cacheTag 的只读查询
│   │   ├── actions/                # Server Actions（写操作）
│   │   ├── seo.ts                  # metadata / JSON-LD 构造
│   │   └── utils.ts                # cn() 等
│   ├── styles/
│   └── types/
├── e2e/                            # Playwright 用例
├── .env.example
├── next.config.ts
├── eslint.config.mjs
├── AGENTS.md
├── PRD.md
└── TECH_DESIGN.md
```

---

## 4. 渲染与缓存策略

| 路由 | 策略 | 失效方式 |
| --- | --- | --- |
| `/` `/about` `/skills` `/projects` `/blog` | 静态生成 + ISR（`revalidate = 3600` 兜底） | 内容变更时 `revalidateTag('projects')` 等 |
| `/about?tab=*` | 静态生成，各 tab 在构建时预渲染 | `revalidateTag('profile')` |
| `/projects/[slug]` | ISR + `generateStaticParams` | `revalidateTag('project:'+slug)` |
| `/blog/[slug]` | ISR + `generateStaticParams` | `revalidateTag('post:'+slug)` |
| `/tags/[tag]` | ISR | `revalidateTag('tags')` |
| `/search` | 动态（依赖查询参数，`no-store`） | 不缓存 |
| `/admin/*` | 动态（`export const dynamic = 'force-dynamic'`） | 不缓存 |
| `/api/admin/*` | 动态，`no-store` | 不缓存 |
| `/rss.xml` `/sitemap.xml` | ISR（1 小时） | `revalidateTag('posts')` |

**缓存标签约定**

```
profile | settings | skills | projects | project:<slug>
posts | post:<slug> | tags | media | messages
```

任何写操作完成后，由 Server Action 显式调用对应的 `revalidateTag()`，
再 `revalidatePath('/')` 处理导航类聚合页。

**个人页标签页与缓存的配合**

`?tab=` 参数不参与缓存键的拆分——整页在构建时预渲染所有标签内容，
切换标签由客户端切换已渲染的 `tabpanel` 可见性（同时更新 URL 与 `aria-selected`）。
这样既保持静态生成的性能优势，又满足「可直接访问某个标签」的 SEO 需求。

---

## 5. 数据库设计（Prisma）

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PostStatus    { DRAFT PUBLISHED ARCHIVED }
enum ProjectStatus { ACTIVE ARCHIVED WIP }
enum TimelineType  { WORK EDUCATION AWARD SERVICE }
enum SkillLevel    { BEGINNER INTERMEDIATE ADVANCED EXPERT }

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String?
  totpSecret   String?                          // P1: 2FA
  role         String    @default("ADMIN")
  lastLoginAt  DateTime?
  failedLogins Int       @default(0)
  lockedUntil  DateTime?
  posts        Post[]
  revisions    Revision[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model SiteSettings {
  id           Int      @id @default(1)          // 单例
  siteTitle    String
  tagline      String?
  description  String?
  logoUrl      String?
  faviconUrl   String?
  // 强调色：Zod 校验限定在 Stanford 官方色板枚举内，默认 Cardinal Red
  accentColor  String   @default("#8C1515")
  socialLinks  Json     @default("[]")           // [{ label, url, icon }]
  footerText   String?
  seoDefaults  Json     @default("{}")           // { titleTemplate, keywords, ogImage }
  analyticsId  String?
  resumeUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Profile {
  id           Int             @id @default(1)     // 单例
  fullName     String
  headline     String
  bio          String           @db.Text           // Markdown，对应「简介」标签页
  avatarUrl    String?
  title        String?                             // 职务 / 头衔
  affiliation  String?                             // 所属机构
  location     String?
  email        String?
  website      String?
  availability String?                             // 开放机会 / 忙碌
  yearsExp     Int?
  timeline     TimelineEntry[]
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

model TimelineEntry {
  id           String       @id @default(cuid())
  profileId    Int
  profile      Profile      @relation(fields: [profileId], references: [id], onDelete: Cascade)
  type         TimelineType                        // WORK / EDUCATION / AWARD / SERVICE
  organization String
  role         String
  description  String?      @db.Text
  location     String?
  startDate    DateTime
  endDate      DateTime?
  current      Boolean      @default(false)
  url          String?
  order        Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([profileId, type, order])
}

model SkillCategory {
  id     String  @id @default(cuid())
  name   String  @unique
  slug   String  @unique
  order  Int     @default(0)
  skills Skill[]

  @@index([order])
}

model Skill {
  id         String        @id @default(cuid())
  categoryId String
  category   SkillCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name       String
  level      SkillLevel    @default(INTERMEDIATE)   // 渲染为离散标签，不渲染进度条
  iconUrl    String?                                 // 无图标时渲染首字母方块
  featured   Boolean       @default(false)
  order      Int           @default(0)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@unique([categoryId, name])
  @@index([categoryId, order])
}

model Project {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  summary     String
  // description 为 Markdown，用二级标题拆出「背景 / 挑战 / 方案 / 结果」分区
  description String        @db.Text
  coverUrl    String?
  gallery     Json          @default("[]")     // [mediaId | url]
  repoUrl     String?
  demoUrl     String?
  role        String?
  status      ProjectStatus @default(ACTIVE)
  featured    Boolean       @default(false)
  published   Boolean       @default(false)
  startDate   DateTime?
  endDate     DateTime?
  order       Int           @default(0)
  tags        ProjectTag[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  @@index([published, order])
  @@index([featured])
}

model Post {
  id          String     @id @default(cuid())
  slug        String     @unique
  title       String
  excerpt     String?
  content     String     @db.Text            // 原始 Markdown
  coverUrl    String?
  status      PostStatus @default(DRAFT)
  publishedAt DateTime?
  readingTime Int?                           // 分钟，保存时计算
  viewCount   Int        @default(0)
  featured    Boolean    @default(false)
  authorId    String
  author      AdminUser  @relation(fields: [authorId], references: [id])
  tags        PostTag[]
  revisions   Revision[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  deletedAt   DateTime?

  @@index([status, publishedAt])
}

model Tag {
  id       String       @id @default(cuid())
  name     String       @unique
  slug     String       @unique
  projects ProjectTag[]
  posts    PostTag[]
}

model ProjectTag {
  projectId String
  tagId     String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])
}

model PostTag {
  postId String
  tagId  String
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}

model Media {
  id          String   @id @default(cuid())
  url         String
  pathname    String   @unique
  filename    String
  mimeType    String
  size        Int
  width       Int?
  height      Int?
  blurDataUrl String?
  alt         String?
  createdAt   DateTime @default(now())

  @@index([createdAt])
}

model Message {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String?
  body      String   @db.Text
  isRead    Boolean  @default(false)
  ipHash    String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([isRead, createdAt])
}

model Revision {
  id         String    @id @default(cuid())
  entityType String                        // "Post" | "Project" | "Profile" ...
  entityId   String
  snapshot   Json
  authorId   String
  author     AdminUser @relation(fields: [authorId], references: [id])
  createdAt  DateTime  @default(now())

  @@index([entityType, entityId, createdAt])
}

model Redirect {
  id        String   @id @default(cuid())
  fromPath  String   @unique
  toPath    String
  createdAt DateTime @default(now())
}
```

**搜索相关索引（手工迁移）**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX post_title_trgm    ON "Post" USING gin (title   gin_trgm_ops);
CREATE INDEX post_excerpt_trgm  ON "Post" USING gin (excerpt gin_trgm_ops);
CREATE INDEX project_title_trgm ON "Project" USING gin (title gin_trgm_ops);
CREATE INDEX project_summary_trgm ON "Project" USING gin (summary gin_trgm_ops);
```

**迁移与种子**

- 开发：`prisma migrate dev`；生产：CI 中 `prisma migrate deploy`。
- `pg_trgm` 扩展与 GIN 索引写在独立迁移文件中，需要数据库超级用户权限，
  在 Neon 上通过 `DIRECT_URL` 执行。
- `seed.ts` 写入：管理员账号（从环境变量读取初始密码，首次登录强制修改）、
  `SiteSettings`、`Profile` 单例、示例技能分类与项目、示例文章。
- 迁移文件只追加，不修改历史文件。

---

## 6. 接口设计

### 6.1 约定

- 公开读接口：`GET`，走缓存，返回 `{ data }` 或直接 `{ items, total, page, pageSize }`。
- 管理端写操作：优先 **Server Actions**（表单场景），需要被客户端异步调用的用 Route Handler。
- 所有写操作：Zod 校验 → 会话校验 → 执行 → `revalidateTag` → 返回 `{ ok: true }` 或 `{ ok: false, error }`。
- 错误码：400 参数错误 / 401 未认证 / 403 无权限 / 404 不存在 / 409 冲突（slug 重复） / 429 限流 / 500 服务端错误。

### 6.2 公开接口

| 方法 | 路径 | 说明 | 缓存 |
| --- | --- | --- | --- |
| GET | `/api/profile` | 个人介绍 + 经历（含全部 type） | tag `profile` |
| GET | `/api/skills` | 分类及技能 | tag `skills` |
| GET | `/api/projects?tag=&featured=&page=` | 项目列表 | tag `projects` |
| GET | `/api/projects/[slug]` | 项目详情 | tag `project:<slug>` |
| GET | `/api/posts?tag=&q=&year=&page=` | 文章列表（仅已发布） | tag `posts` |
| GET | `/api/posts/[slug]` | 文章详情（含渲染后 HTML 与目录） | tag `post:<slug>` |
| GET | `/api/search?q=&type=` | 跨项目与文章的搜索 | 不缓存 |
| GET | `/api/tags` | 标签及计数 | tag `tags` |
| GET | `/api/settings/public` | 站点公开配置（标题、社交链接、强调色） | tag `settings` |
| POST | `/api/contact` | 提交联系表单（限流 + 蜜罐字段） | 不缓存 |
| GET | `/rss.xml` | RSS 2.0 | 1 小时 |
| GET | `/sitemap.xml` | 站点地图 | 1 小时 |
| GET | `/robots.txt` | 爬虫规则 | 静态 |

### 6.3 管理端接口（需会话）

| 方法 | 路径 / Action | 说明 |
| --- | --- | --- |
| POST | `/api/auth/callback/credentials` | Auth.js 登录 |
| POST | `/api/auth/signout` | 登出 |
| — | Server Action `saveProject` / `deleteProject` / `reorderProjects` | 项目 CRUD 与排序 |
| — | Server Action `savePost` / `publishPost` / `archivePost` / `deletePost` | 文章生命周期 |
| — | Server Action `saveSkillCategory` / `saveSkill` / `reorderSkills` | 技能管理 |
| — | Server Action `saveProfile` / `saveTimelineEntry` / `deleteTimelineEntry` | 个人介绍与经历 |
| — | Server Action `saveSettings` | 站点设置（强调色受枚举校验） |
| — | Server Action `markMessageRead` / `deleteMessage` | 消息 |
| POST | `/api/upload` | 上传图片到 Blob 并写入 `Media`（含类型/大小校验、EXIF 剥离） |
| POST | `/api/admin/preview-token` | 生成草稿预览签名链接（P1） |
| GET | `/api/admin/stats` | 概览统计与最近编辑 |

### 6.4 类型共享

Zod schema 定义在 `src/lib/validators/`，同时导出类型给前端表单与 Server Action，
杜绝两端校验逻辑漂移。

---

## 7. 认证与授权

```
请求 /admin/* 或 /api/admin/*
  → Auth.js middleware 快速拦截（未登录直接跳转登录页）
  → 页面/接口内部再次 requireAdmin()（服务端真实校验，防中间件绕过）
  → 通过则渲染，失败则 401 或重定向
```

- **密码**：Argon2id 哈希（`@node-rs/argon2` 或 `argon2`），不可逆、加盐。
- **会话**：Auth.js JWT 策略，Cookie 设置 `httpOnly`、`secure`、`sameSite=lax`、`__Host-` 前缀。
- **防爆破**：同一邮箱 5 次失败锁定 15 分钟；同 IP 每分钟最多 5 次尝试（Upstash 滑动窗口）。
- **CSRF**：由 Auth.js 内建令牌机制处理；Server Actions 受 Next.js 原生保护。
- **会话时效**：7 天，敏感操作（改密码、改邮箱）要求重新验证。
- **权限模型**：单角色 `ADMIN`，全部管理端接口校验 `role === 'ADMIN'`。
- **首登强制改密**：种子账号首次登录必须修改初始密码。

---

## 8. 版式与排版实现

### 8.1 字体加载

```ts
// src/app/layout.tsx
import { Source_Sans_3, Source_Serif_4, Roboto_Mono, Roboto_Slab } from 'next/font/google';

export const sans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const mono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const slab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-slab',
  display: 'swap',
});
```

- 四款字体全部走 `next/font` 自托管，避免第三方请求与渲染阻塞。
- 中文正文不打包进字体文件，走系统字体栈兜底
  （`"PingFang SC", "Microsoft YaHei", sans-serif`），避免中文字体体积失控。
- 每个 `<html>` 上挂 `variable`，在 `@theme` 中引用。

### 8.2 分区组件：全站唯一的内容组织单元

```tsx
// src/components/site/Section.tsx
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl font-semibold text-[--color-text]
                     border-b border-[--color-border] pb-3 mb-6">
        {title}
      </h2>
      {children}
    </section>
  );
}
```

所有页面内容都必须经由 `Section` 组织，以保证「标题 + 横线 + 内容」的节奏一致。

### 8.3 个人页两栏骨架

```tsx
// src/app/(site)/about/page.tsx
<div className="grid gap-12 lg:grid-cols-[300px_1fr]">
  <aside className="lg:sticky lg:top-24 lg:self-start">
    <ProfileRail profile={profile} />
  </aside>
  <div>
    <TabBar tabs={TABS} active={tab} />
    {renderTabPanel(tab)}
  </div>
</div>
```

- 左栏用 `lg:sticky lg:top-24 lg:self-start`，桌面滚动时保持可见；移动端自动堆叠。
- 标签页状态放在 URL 查询参数（`?tab=skills`）而非组件 state，
  保证可分享、可被搜索引擎分别索引。
- `TabBar` 实现完整 WAI-ARIA Tabs 模式：

```tsx
// src/components/site/TabBar.tsx
<div role="tablist" aria-label="个人资料分区" className="flex gap-8 border-b border-[--color-border]">
  {tabs.map(t => (
    <button
      key={t.id}
      role="tab"
      id={`tab-${t.id}`}
      aria-selected={t.id === active}
      aria-controls={`panel-${t.id}`}
      tabIndex={t.id === active ? 0 : -1}
      className={cn(
        'py-3 text-sm font-semibold border-b-[3px] -mb-px transition-colors duration-[180ms]',
        t.id === active
          ? 'text-[--color-cardinal] border-[--color-cardinal]'
          : 'text-[--color-text-muted] border-transparent hover:text-[--color-text]',
      )}
    >
      {t.label}
    </button>
  ))}
</div>
```

- 键盘行为：左右方向键在标签间移动，`Home` / `End` 跳到首尾。
- 所有标签内容都参与服务端渲染，切换时只改变 `hidden` 属性，避免客户端重复请求。

### 8.4 编辑式列表

```tsx
// 博客列表行：不用卡片，用横线分隔
<li className="py-6 border-b border-[--color-border] last:border-b-0">
  <Link className="font-serif text-[1.375rem] font-semibold
                   text-[--color-text] hover:text-[--color-link]">
    {post.title}
  </Link>
  <p className="mt-2 text-sm text-[--color-text-muted] line-clamp-2">{post.excerpt}</p>
  <p className="mt-3 text-[0.8125rem] text-[--color-text-subtle]">
    <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
    {' · '}{post.readingTime} 分钟
    {post.tags.map(t => <Tag key={t.id} {...t} />)}
  </p>
</li>
```

### 8.5 搜索实现

首页主搜索框需要同时覆盖项目与文章：

- **v1**：服务端 `ILIKE` 查询加 `pg_trgm` GIN 索引（标题 + 摘要 + 正文），
  用 `similarity()` 参与排序。
- **v2 候选**：内容量超过约 500 条后换 `tsvector` 全文检索或轻量外部搜索。
- 搜索结果页 `/search?q=` 复用 `EntryList` 与 `ProjectCard`，
  分区展示「项目」与「文章」两组结果。
- 输入框做 300ms 防抖 + `AbortController` 取消过期请求。
- 高亮匹配片段时用 `<mark>`，背景色 `--color-illuminating`，文字保持 `--color-text`。

### 8.6 深色底栏的对比度守卫

顶栏与页脚使用 `#2E2D29` 底色。**该底色上禁止使用 Cardinal Red 文字**
（实测对比度仅 1.45:1）。可用组合：

- 主文字：`#FFFFFF`（13.8:1）
- 次级文字：`#DAD7CB`（9.56:1）
- 链接 hover：`#DAD7CB` 加下划线

在 ESLint 自定义规则或 Storybook 加一条检查项，捕获「深色底 + 红色字」的组合。

### 8.7 无装饰性背景

页面背景为纯白（`--color-bg`），仅依赖 `--color-bg-subtle`（`#F4F4F4`）区分区块。
不使用任何背景图、渐变、噪点纹理、`backdrop-filter` 或固定背景层。
这一决定同时消除了原方案中的 Canvas 渲染、`requestAnimationFrame` 循环、
DPR 处理、离屏暂停与设备档位探测等全部复杂度。

---

## 9. Markdown 渲染管线

```ts
// src/lib/markdown.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
```

- **顺序**：parse → GFM（表格/任务列表/脚注）→ rehype → slug 注入 → 标题锚点
  → sanitize → Shiki 高亮 → stringify。
- **sanitize**：基于 `defaultSchema` 做白名单扩展（允许 `className` 用于高亮、
  `id` 用于锚点），**不允许** `script` / `iframe` / 事件属性 / `javascript:` 协议。
- **代码高亮**：Shiki 主题 **`github-light`**，与浅色主题一致；
  支持行高亮（`{1,3-5}`）与文件名标注（```` ```ts title="x.ts" ````）。
- **缓存**：以 `postId + updatedAt` 为键缓存渲染结果（`unstable_cache` 或内存 LRU），
  避免每次请求重复编译。
- **阅读时长**：保存时按「中文字符数 / 400 + 英文单词数 / 220」估算并写入 `Post.readingTime`。
- **目录**：渲染时同步抽取 `h2/h3` 生成 `TableOfContents` 数据。
- **项目正文**：同一管线复用，约定用 `##` 拆出「背景 / 挑战 / 方案 / 结果」，
  渲染后即为带横线的分区。

---

## 10. 图片与媒体

- 上传流程：客户端直传 → `/api/upload` 校验
  （MIME 白名单 `image/jpeg|png|webp|avif|gif`、单文件 ≤ 5MB）→ 剥离 EXIF
  → 写入 Vercel Blob → 生成模糊占位（`plaiceholder` 或 `sharp`）→ 写 `Media` 表。
- 展示：统一用 `next/image`，`next.config.ts` 中配置 `remotePatterns` 白名单；
  封面固定 `aspect-ratio` 防 CLS。
- 项目画廊：`gallery` 字段存 mediaId 数组，详情页用轻量灯箱
  （`yet-another-react-lightbox` 或自研）。
- 头像：1:1 方形，左栏显示尺寸 300px，输出多尺寸；移动端可裁为圆形。
- 清理：删除 `Media` 前检查引用；支持「未引用资源」列表批量清理（P2）。

---

## 11. 设计 token 与样式

`src/app/globals.css`（Tailwind v4 CSS-first）：

```css
@import "tailwindcss";

@theme {
  /* ── Stanford 官方主色 ── */
  --color-cardinal: #8C1515;
  --color-cardinal-light: #B83A4B;
  --color-cardinal-dark: #820000;
  --color-white: #FFFFFF;
  --color-black: #2E2D29;
  --color-cool-grey: #53565A;

  /* ── Black 10% 阶梯 ── */
  --color-ink-90: #43423E;
  --color-ink-80: #585754;
  --color-ink-70: #6D6C69;
  --color-ink-60: #767674;
  --color-ink-50: #979694;
  --color-ink-40: #ABABA9;
  --color-ink-30: #C0C0BF;
  --color-ink-20: #D5D5D4;
  --color-ink-10: #EAEAEA;

  /* ── 官方强调色（仅分类/图表/标签） ── */
  --color-palo-alto: #175E54;
  --color-palo-verde: #279989;
  --color-bay: #6FA287;
  --color-sky: #4298B5;
  --color-lagunita: #007C92;
  --color-poppy: #E98300;
  --color-spirited: #E04F39;
  --color-plum: #620059;
  --color-brick: #651C32;
  --color-archway: #5D4B3C;
  --color-stone: #7F7776;
  --color-fog: #DAD7CB;
  --color-olive: #8F993E;
  --color-illuminating: #FEDD5C;

  /* ── 语义映射 ── */
  --color-bg: #FFFFFF;
  --color-bg-subtle: #F4F4F4;
  --color-surface: #FFFFFF;
  --color-surface-dark: #2E2D29;
  --color-border: #D5D5D4;
  --color-border-strong: #C0C0BF;
  --color-text: #2E2D29;
  --color-text-muted: #53565A;
  --color-text-subtle: #767674;
  --color-text-on-dark: #FFFFFF;
  --color-text-on-dark-muted: #DAD7CB;
  --color-link: #8C1515;
  --color-link-hover: #820000;
  --color-focus: #8C1515;
  --color-success: #175E54;
  --color-warning: #E98300;
  --color-danger: #8C1515;

  /* ── 圆角（学术风格偏好方角） ── */
  --radius-sm: 2px;
  --radius-md: 4px;

  /* ── 字体 ── */
  --font-sans: var(--font-sans), "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-serif: var(--font-serif), Georgia, "Songti SC", serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;
  --font-slab: var(--font-slab), Georgia, serif;
}

/* 焦点环：全站统一 */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

```css
/* 正文排版容器 */
.prose-site {
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 68ch;
}
.prose-site h2 {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}
.prose-site h3 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; }
.prose-site blockquote {
  border-left: 3px solid var(--color-cardinal);
  padding-left: 1rem;
  color: var(--color-text-muted);
}
.prose-site a { color: var(--color-link); text-decoration: underline; text-underline-offset: 2px; }
.prose-site code {
  font-family: var(--font-mono);
  background: var(--color-ink-10);
  padding: .1em .35em;
  border-radius: var(--radius-sm);
}
.prose-site pre {
  background: #F4F4F4;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  overflow-x: auto;
}
.prose-site table { width: 100%; border-collapse: collapse; }
.prose-site th { border-bottom: 1px solid var(--color-border-strong); text-align: left; padding: .5rem .75rem; }
.prose-site td { border-bottom: 1px solid var(--color-border); padding: .5rem .75rem; }
```

- `SiteSettings.accentColor` 注入为 `--color-cardinal` 的覆盖值，
  但取值范围由 Zod 枚举限定在官方色板，防止低对比度取色。
- 类名合并统一用 `cn()`（`clsx` + `tailwind-merge`）。
- 阴影用量降到最低，层级主要靠边框与底色区分。

---

## 12. SEO 实现

| 项 | 实现 |
| --- | --- |
| Metadata | Next.js Metadata API；`generateMetadata` 读取内容实体 |
| 标题模板 | `%s · {siteTitle}`（在根 layout 定义） |
| Canonical | 每页基于 `NEXT_PUBLIC_SITE_URL` 生成绝对地址 |
| 个人页标签 | `?tab=` 组合生成 canonical 与独立 title，便于分别索引 |
| Open Graph | `opengraph-image.tsx` 用 `ImageResponse` 按标题动态生成品牌化卡片，主色 Cardinal Red |
| JSON-LD | `Person`（首页）、`BlogPosting`（文章）、`CreativeWork`（项目）、`BreadcrumbList` |
| Sitemap | `app/sitemap.ts` 动态列出所有已发布项目与文章 |
| Robots | `app/robots.ts` 允许抓取公开页，屏蔽 `/admin` 与 `/api` |
| RSS | `app/rss.xml/route.ts` 输出最新 20 篇 |
| 301 重定向 | slug 变更时写入 `Redirect` 表，中间件处理 |

---

## 13. 错误处理与可观测性

- **边界**：每个路由组配 `error.tsx` 与 `loading.tsx`；根级 `global-error.tsx`。
- **错误上报**：Server Action 与 Route Handler 统一 `try/catch`，生产环境上报到 Sentry
  （或 Vercel Observability），开发环境打印详情。
- **用户可见错误**：不暴露堆栈；统一文案 + 可追踪 ID。
- **日志**：结构化日志（`pino`），记录操作类型、实体、耗时、结果，
  **绝不记录密码与完整会话令牌**。
- **Web Vitals**：`useReportWebVitals` 上报到分析平台，
  性能预算告警阈值按 PRD §5.1 设置。

---

## 14. 测试策略

| 层级 | 工具 | 覆盖内容 |
| --- | --- | --- |
| 单元 | Vitest + RTL | `lib/utils`、Zod schema、Markdown 管线、阅读时长计算、搜索查询构造 |
| 集成 | Vitest + 测试库 Postgres | Server Action 的校验/写入/失效逻辑，查询层的筛选与分页，搜索排序 |
| E2E | Playwright | 前台浏览与导航、博客阅读、标签筛选、搜索、联系表单、后台登录 → 建文章 → 发布 → 前台可见 |
| 可访问性 | Playwright + axe-core | 每个主要页面的严重级别违规数必须为 0 |
| 对比度 | 自定义断言 | 校验顶栏/页脚与正文的文字色对比度 ≥ 4.5:1 |
| 视觉 | Playwright 截图快照 | 首页/个人页/项目/博客在 375px 与 1440px 两种尺寸的快照 |
| 性能 | Lighthouse CI | PR 预览环境上跑，Performance/A11y/SEO 低于 90 则失败 |

关键 E2E 用例（必须通过）：

```
E2E-1  后台登录成功 / 密码错误被拒 / 连续失败触发锁定
E2E-2  创建文章 → 存草稿（前台不可见）→ 发布（前台可见、出现在 sitemap 与 RSS）
E2E-3  编辑文章标题与 slug → 旧 slug 301 跳转新 slug
E2E-4  新增项目并设为精选 → 首页精选区出现
E2E-5  拖拽调整技能顺序 → 前台顺序同步
E2E-6  上传图片 → 媒体库出现 → 用作封面 → 详情页正确渲染
E2E-7  联系表单提交 → 后台消息列表可见（含限流验证）
E2E-8  个人页各标签页可通过 URL 直达，且标签键盘导航（方向键/Home/End）可用
E2E-9  首页搜索框输入关键词 → 结果页分区展示项目与文章 → 高亮命中片段
```

---

## 15. 部署与 CI/CD

**环境**

| 环境 | 分支 | 数据库 | 说明 |
| --- | --- | --- | --- |
| Local | — | 本地 Postgres 或 Neon dev 分支 | `pnpm dev` |
| Preview | 任意 PR | Neon 预览分支 | Vercel Preview + Lighthouse CI |
| Production | `main` | Neon 主库 | 自定义域名 + 自动 HTTPS |

**GitHub Actions（PR）**

```
install → typecheck → lint → unit/integration test → build → e2e (Playwright) → Lighthouse CI
```

**生产发布（push to main）**

```
install → prisma migrate deploy → build → Vercel deploy → 冒烟测试（/ 与 /api/posts 返回 200）
```

- 回滚：Vercel 一键回滚到上一个部署；
  数据库迁移采用向后兼容策略（先加列、后删列的两次发布）。
- 备份：Neon 自动备份 + 每周导出 JSON 内容快照到对象存储。

---

## 16. 环境变量

```bash
# .env.example
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"   # Prisma 迁移用

AUTH_SECRET="openssl rand -base64 32 生成"
AUTH_URL="http://localhost:3000"

NEXT_PUBLIC_SITE_URL="http://localhost:3000"

BLOB_READ_WRITE_TOKEN=""            # Vercel Blob

UPSTASH_REDIS_REST_URL=""           # 限流
UPSTASH_REDIS_REST_TOKEN=""

CONTACT_NOTIFY_EMAIL=""             # 收到联系表单时通知
RESEND_API_KEY=""                   # 邮件发送（可选）

SEED_ADMIN_EMAIL=""
SEED_ADMIN_PASSWORD=""
```

> 只有确实需要暴露给浏览器的值才加 `NEXT_PUBLIC_` 前缀。

---

## 17. 性能与安全清单

**上线前性能检查**

- [ ] 移动端 Lighthouse Performance ≥ 90
- [ ] 首屏 JS（gzip）< 120KB
- [ ] CLS < 0.05（所有图片有固定宽高比，字体有 `swap` 与尺寸兜底）
- [ ] 字体仅加载实际字重与拉丁子集，中文走系统字体栈
- [ ] 所有图片走 `next/image`，设置 `sizes` 与固定宽高比
- [ ] 路由级代码分割确认（后台 chunk 不进前台）
- [ ] 第三方脚本全部 `next/script` 延迟加载
- [ ] 无 `backdrop-filter`、无固定背景层、无背景动画

**上线前安全检查**

- [ ] `/admin/*` 未登录不可访问，且 API 层独立校验
- [ ] 密码哈希算法为 Argon2id，种子密码已更换
- [ ] Markdown 渲染经 sanitize，原始 HTML 被禁用
- [ ] 登录与联系表单限流生效
- [ ] 上传接口校验 MIME 与大小，EXIF 已剥离
- [ ] 安全响应头（CSP、HSTS、X-Content-Type-Options、Referrer-Policy）已配置
- [ ] `.env` 未被提交，`git log` 无密钥泄露
- [ ] 生产环境错误页不暴露堆栈

**上线前可访问性检查**

- [ ] 所有文字色对比度 ≥ 4.5:1，未使用 `--color-ink-40` 及更浅色作为文字
- [ ] 深色顶栏与页脚未使用 Cardinal Red 文字
- [ ] `:focus-visible` 焦点环在所有交互元素上可见
- [ ] Skip link 可用
- [ ] 标签页为完整 WAI-ARIA Tabs 实现，键盘可操作
- [ ] 弹窗与抽屉有焦点陷阱，`Esc` 可关闭
- [ ] 全站 axe-core 严重级别违规为 0
