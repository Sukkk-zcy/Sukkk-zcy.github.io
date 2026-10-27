# AGENTS.md

## 语言偏好

**必须使用中文**与用户交互。这是一个博客运维项目。

## 项目概览

Astro Theme Iris — 基于 Astro 6.x 的个人知识博客，支持 wikilinks、知识图谱、FlexSearch。主题基于 astro-pure，已深度定制。

- **博客地址**: https://sukkk-zcy.github.io/
- **GitHub 仓库**: `Sukkk-zcy/Sukkk-zcy.github.io`
- **部署分支**: `gh-pages`（GitHub Pages 服务该分支）
- **开发环境**: Windows 原生 Node.js / npm + PowerShell
- **项目根目录**: `E:\BLOG`（自 2026-10-15 迁回 Windows 后，以此目录为维护入口）
- **WSL 旧副本**: `\\wsl$\Ubuntu-24.04\home\zcy\Projects\BLOG` 已于 2026-10-15 经用户确认永久删除；博客仅在 `E:\BLOG` 维护。

## 目录结构

```
BLOG/
├── src/
│   ├── content/blog/          # 文章内容（.mdx）
│   │   ├── SDN/               # SDN 系列（7 篇）
│   │   ├── P4/                # P4 系列（3 篇）
│   │   ├── Embedded/          # 嵌入式开发（5 篇）
│   │   └── Devtools/          # 开发工具（4 篇）
│   ├── components/            # Astro 组件
│   ├── layouts/               # 页面布局
│   ├── plugins/               # 自定义 remark/rehype/shiki 插件
│   ├── utils/                 # 工具函数
│   └── assets/                # 静态资源（头像等）
├── packages/pure/             # 主题组件库（astro-pure）
├── public/                    # 静态资源
├── dist/                      # 构建产物（.gitignore）
└── astro.config.ts            # Astro 框架配置
```

## 常用命令

```powershell
Set-Location 'E:\BLOG'

# 首次安装或按锁文件重装（必须 --legacy-peer-deps，TypeScript 6.x 冲突）
npm ci --legacy-peer-deps
# 仅在需要更新依赖及锁文件时使用 npm install --legacy-peer-deps

# 开发
npm run dev              # 启动开发服务器
npm run dev:check        # 带类型检查的开发

# 构建（内存不足需设置 NODE_OPTIONS）
$env:NODE_OPTIONS = '--max-old-space-size=8192'
npm run build

# 代码质量
npm run lint             # ESLint（自带 --fix）
npm run format           # Prettier
npm run yijiansilian     # 一键：lint + sync + check + format（使用 npm，会修改文件）

# 清理缓存（确认无需保留构建产物后执行）
Remove-Item -LiteralPath '.astro', 'dist' -Recurse -Force -ErrorAction SilentlyContinue
```

## 部署

Windows PowerShell 操作示例。**执行发布及强制推送前必须取得用户确认**；普通迁移、自检不执行此流程。

`.nojekyll` 必须存在并随构建产物复制，否则 GitHub Pages 的 Jekyll 可能忽略 `_astro/`，导致 CSS / JS / 图片 404。复制时显式包含隐藏文件，避免遗漏该文件。

```powershell
Set-Location 'E:\BLOG'
$env:NODE_OPTIONS = '--max-old-space-size=8192'
npm run build
if ($LASTEXITCODE -ne 0) { throw '构建失败，停止部署' }

New-Item -Path 'dist\.nojekyll' -ItemType File -Force | Out-Null
if (Test-Path -LiteralPath 'deploy-temp') {
  throw 'deploy-temp 已存在，请先检查并另行处理，避免混入旧文件'
}
New-Item -Path 'deploy-temp' -ItemType Directory -ErrorAction Stop | Out-Null
Get-ChildItem -LiteralPath 'dist' -Force |
  Copy-Item -Destination 'deploy-temp' -Recurse -Force -ErrorAction Stop

Push-Location 'deploy-temp'
try {
  git init -b master
  if ($LASTEXITCODE -ne 0) { throw 'Git 初始化失败' }
  git add .
  if ($LASTEXITCODE -ne 0) { throw '暂存失败' }
  git commit -m "deploy: $(Get-Date -Format 'yyyy-MM-dd')" -m 'Made-with: Proma'
  if ($LASTEXITCODE -ne 0) { throw '提交失败' }
  git push -f git@github.com:Sukkk-zcy/Sukkk-zcy.github.io.git master:gh-pages
  if ($LASTEXITCODE -ne 0) { throw '推送失败' }
} finally {
  Pop-Location
}
# 部署目录保留供检查；确认无须保留后再清理，不自动删除。
```

## 文章管理

### 新建文章

在 `src/content/blog/<分类名>/` 下创建 `.mdx` 文件，文件名用 kebab-case。

### Frontmatter 模板

```yaml
---
title: "文章标题"
publishDate: 2026-07-20 00:00:00
description: "一句话描述"
tags: ["SDN", "OpenFlow"]      # 标签用正确大小写
categories: ["SDN"]            # 必须和目录名一致（大小写敏感）
language: "中文"
draft: false
comment: true
---
```

### 内容规范

- **分类是目录决定的**：`src/content/blog/SDN/xxx.mdx` → 自动归类为 SDN
- **frontmatter `categories` 字段**必须和目录名一致
- **标签大小写**：`SDN` 不是 `sdn`，`DDoS` 不是 `ddos`，`ESP32` 不是 `esp32`
- **文件命名**：kebab-case（`sdn-04-new-topic.mdx`）
- **引用文章**末尾必须包含参考文献章节

### 图片/图床

- **图床地址**: `https://sukk-imgbed.pages.dev`
- **图床管理后台**: `https://sukk-imgbed.pages.dev/dashboard`
- **认证码**: `29016`
- **上传方式**: Telegram Bot（CloudFlare ImgBed 方案）
- Markdown 中引用：`![描述](https://sukk-imgbed.pages.dev/file/xxx.png)`

## 架构要点

### Monorepo 结构

- `packages/pure/` — 主题组件库，提供组件、工具、类型
- `src/` — 博客内容和定制
- 根 `package.json` 定义 workspaces

### 关键配置文件

| 文件 | 用途 |
|------|------|
| `src/site.config.ts` | 站点标题、作者、菜单、页脚、集成 |
| `astro.config.ts` | Astro 配置、集成、Markdown 插件、mermaid 主题 |
| `uno.config.ts` | UnoCSS 样式、排版、主题色 |
| `tsconfig.json` | TypeScript 路径别名 |
| `eslint.config.mjs` | ESLint + Astro 插件 |
| `prettier.config.mjs` | Prettier + import 排序 |

### 路径别名

```
@/assets/*    → ./src/assets/*
@/components/* → ./src/components/*
@/layouts/*   → ./src/layouts/*
@/utils       → ./src/utils/index.ts
@/plugins/*   → ./src/plugins/*
@/pages/*     → ./src/pages/*
@/site-config → ./src/site.config.ts
```

### 样式规范

- 无分号、单引号、2 空格缩进、LF 换行
- Import 排序由 `@ianvs/prettier-plugin-sort-imports` 管理

### Mermaid 图表

- 主题：`base`（自定义配色），深色模式由 CSS 覆盖规则接管
- 配色：博客紫色调（`#f4f0ff` / `#b8a5f0` / `#8a7fb8`）
- 字体：`ui-sans-serif → PingFang SC → Microsoft YaHei`
- 深浅色适配：CSS 变量 + `.dark .mermaid` 覆盖
- **已知限制**：cluster 标题（subgraph 标题）紧贴顶部边框，是 mermaid 布局算法限制，无法用 CSS 修复

### 图床图片 vs 内联 SVG

- **截图/实物图**：上传图床，用 `![](url)` 引用
- **架构图/概念图**：优先用 mermaid（已定制主题），复杂排版可用内联 SVG + CSS 变量（自动适配深浅色）
- 内联 SVG 中的颜色用 `hsl(var(--primary))` 等 CSS 变量，深浅色自动切换

## 已知问题 & 历史修复

### Windows 分类大小写

Windows 文件系统不区分大小写，`post.filePath` 返回小写路径。已在 `src/utils/content-paths.ts` 的 `KNOWN_ACRONYMS` 中映射：`sdn→SDN`、`p4→P4`、`ddos→DDoS`、`esp32→ESP32`。

**重命名目录**必须用中间名过渡：`sdn → sdn_tmp → SDN`

### ArticleBottom 上下章导航

曾出现重定向问题（`/blog/sdn-03` → `/blog/sdn/sdn-03`），已修复为从 `entry.filePath` 提取完整路径。同分类内导航也已实现。

### Git 工作流

**禁止直接 `git pull`**：项目频繁更新，自动合并可能覆盖本地定制。改用：
```powershell
git fetch
if ($LASTEXITCODE -eq 0) { git merge --no-commit }
# 检查合并结果后再 commit
```

### npm 安装

TypeScript 6.x 与 `@astrojs/check` 冲突，必须 `--legacy-peer-deps`。`node_modules` 约 520MB，不要轻易删除。

Linux / WSL 与 Windows 的 `node_modules` 不可直接复用，迁移平台时须按锁文件重新安装。当前 Windows 仓库的本地 `core.autocrlf=false`，保留源码 LF；不要为本项目修改全局 Git 换行配置。

## 已禁用功能

- **Typst 集成**：依赖问题
- **远程字体**：网络问题
- **Giscus 评论**：未配置 repo/ID
- **Waline 评论**：`site.config.ts` 中 `waline.enable: false`

## 与其他项目的关系

本仓库**只负责博客**（内容写作 + 站点构建 + 部署）。

**P4 / SDN 的学习、实验与科研在 `~/Projects/P4Pro/`**，不要写进这里：

| 内容 | 归属 |
|------|------|
| 博客文章（.mdx）、友链、样式、部署 | **本仓库** |
| P4 实验、INT 研究、论文笔记、环境搭建 | `~/Projects/P4Pro/` |

**写 P4 相关文章时的交接方式**：在 P4Pro 会话里跑完实验，把笔记存到
`~/Projects/P4Pro/sessions/<日期>_<主题>/notes.md`；然后在 BLOG 会话里读该文件写文章。
不要把实验过程搬进博客会话（详见 P4Pro 的会话约定）。

<!-- proma:project-map:start -->
## 项目地图补充（Proma 维护）

以下是截至 2026-10-15 按 manifest、源码、配置与目录核验的增量说明；与上文旧示例不一致时，以本区块及对应源码为准。当日修复后已重新运行针对性测试、类型检查与构建，详见下方修复报告。

### 架构与定位入口

- 根 `package.json` 的 workspaces 为 `packages/*`；当前根项目与主题依赖的 Astro 同步固定为 `6.4.8`，本地主题包 `packages/pure/package.json` 为 `astro-pure@1.4.6`。
- `packages/pure/index.ts` 是主题集成入口，按配置注入 MDX、UnoCSS 和 Markdown 插件；站点层的 `astro.config.ts` 负责静态输出及本地插件配置。
- `src/content.config.ts` 定义文章集合及校验，实际接受 `.md` 和 `.mdx`。除上文模板外，支持可选 `slug`、`series`、`seriesOrder`、`seriesTitle`。
- `src/pages/blog/[...id].astro` 生成文章及兼容重定向；`src/utils/content-paths.ts` 统一路径与目录分类。默认 URL 为小写 `/blog/<分类>/<文件名>`；显式 `slug` 可生成不含分类的固定 URL，重名会在生成文章路径时报错。修改链接、导航或 sitemap 时须同时考虑此例外，不能只假定嵌套路径。
- `src/pages/contentIndex.json.ts` 是搜索和知识关系的内容索引生成入口；wikilink 编译入口见 `src/plugins/remark-wikilinks.ts` 与 `src/utils/wikilink-map.ts`，反链逻辑见 `src/utils/backlinks.ts`。
- RSS 入口为 `src/pages/rss.xml.ts`，正文转换见 `src/utils/rss-content.ts`：仅解析 MDX AST，不执行组件或表达式，保留可读正文，处理双链、GFM 与安全的绝对 URL。本地图片按文章源文件目录解析。
- `astro.config.ts` 默认仅监听 `127.0.0.1`；确有局域网预览需求时再显式使用 `--host`，不要默认对外开放开发服务。
- 内容分类仍为上文四类；2026-10-15 按用户确认删除本地测试文章后，文章文件共 20 篇：Devtools 5、Embedded 5、P4 3、SDN 7（不代表已发布篇数）。上文 Devtools 4 篇是旧计数，后续按目录核验，不靠固定数字判断。

### 验证与命令边界

| 目的 | 已核验命令与注意事项 |
|------|--------------------|
| 生成类型与类型检查 | `npm run sync` → `npm run check`（`astro sync` → `astro check`）；这不是单元测试，sync 会生成本地文件。 |
| 针对性回归测试 | `npm test` 使用 Node 原生测试，覆盖首页、RSS、文章 UI 结构及 Markdown/MDX 编译（`tests/home-links.test.mjs`、`tests/rss-content.test.ts`、`tests/article-ui.test.mjs`、`tests/markdown-rendering.test.ts`）；不是全站自动化端到端测试。 |
| 内容渲染验收 | `npm run test:render` 先重新构建，再运行 `tests/rendered-content.test.ts`，逐篇对比表格单元格、Mermaid 源码、代码正文、双链等，并检查全部 HTML 的站内文件和锚点；实际浏览器图表渲染仍需另外验收。 |
| 静态构建 | `npm run build` 只执行 `astro build`，不包含 `astro check`；内存设置沿用上文。 |
| 完整构建脚本 | `npm run build:full` 执行 `astro-pure check && astro check && astro build`；主题 check 的实现见 `packages/pure/scripts/check.mjs`，仅在 `BUN_LINK_PKG=true` 时执行 Bun 链接操作，并非测试套件。默认 Windows/npm 流程不要启用该变量。 |
| 本地预览 | 构建后 `npm run preview`，检查文章、分类、搜索与知识图谱等受影响页面。 |
| 仅检查、不自动修复源码 | `npx --no-install eslint "src/**/*.{js,ts,jsx,tsx,astro}"`；指定文件的格式检查用 `npx --no-install prettier --check <文件路径>`。 |
| 自动修改文件 | `npm run lint` 含 `--fix`，`npm run format` 含 `--write`；`npm run yijiansilian` 也会修改文件，不能当作只读自检。 |
| 清理 | `npm run clean` 会递归删除 `.astro`、`.vercel`、`dist`、`deploy-temp`；必须先确认这些产物无须保留，不作例行验证。 |

- 根 manifest 已有上述针对性 `test` 脚本；主题包自身的 `test` 仍仅输出“no test specified”并以失败退出，勿与根测试混淆。`.github/workflows/` 为空；不要将类型检查、构建或历史报告冒称为全站测试覆盖。
- `public/.nojekyll` 已存在；发布仍按上文取得确认并检查产物。README 中的 `.\deploy.ps1` 目前无对应文件，不可直接照抄执行；部署入口以上文人工流程为准。
- 修改前检查 Git 状态，保留用户已有改动和未跟踪文章，不为维护文档运行全仓格式化、清理、提交或发布。

### 关键文档索引

- `README.md`：站点简介、分类和技术栈入口；部署脚本示例有上述缺口。
- `docs/REVIEW-2026-08.md`：2026-08-20 的审查与建议，是历史证据而非当前待办或用户画像，不能直接把全部问题视为仍未解决。
- `docs/BUGFIX-2026-08.md`：对应修复、误报澄清与当时验证结果。阅读审查结论时应一并核对；其中 Linux 路径与部署示例不是当前 Windows 执行入口。
- [2026-10-15 迁移报告](C:/Users/29016/.proma/agent-workspaces/blog/77ec985c-716b-4ae1-9c0a-2e7489dd3b12/migration-report.md)：Windows 迁移、旧副本删除、备份和回退证据。正文包含私有配置的保存位置，不公开上传报告或备份。
- [2026-10-15 全面自检报告](C:/Users/29016/.proma/agent-workspaces/blog/77ec985c-716b-4ae1-9c0a-2e7489dd3b12/fullcheck-report.md)：文章结构、构建、HTTP 和浏览器的历史验证结果及未解决项；不是当前每次修改后的自动验收。

### 历史复核补充（2026-10-15）

- 当日 19:33（GMT+8）的自检最终记录确认：测试文章只保留本地，未提交、推送或部署。随后用户在本会话明确确认“删除 C1–C4”，已于 2026-10-15 删除 `src/content/blog/Devtools/windows-blog-publish-test.mdx`；本轮未重建或发布，现有 `dist` 不作为最新内容基线，后续部署前必须重新构建。旧自检报告中 21 篇文章及测试页的结果仅代表删除前状态。
- 上述早期自检报告曾记录依赖告警37项、首页失效入口和RSS兼容问题；2026-10-15 晚间修复后，本地重新审计为9项（critical 1、high 1、moderate 1、low 6），首页引用与RSS正文扫描通过。剩余项涉及Astro主版本及其图片/数学依赖，不能视为已通过安全审计；不使用强制升级或不兼容override来隐藏告警。
- [2026-10-15 修复与剩余风险报告](C:/Users/29016/.proma/agent-workspaces/blog/77ec985c-716b-4ae1-9c0a-2e7489dd3b12/remediation/report.md)：12项针对性测试、173文件类型检查、74页构建和312项HTTP验证通过，20篇原文章未改动。该报告生成时仅重建本地 dist，尚未发布；后续发布状态见下条。
- [2026-10-15 发布记录](C:/Users/29016/.proma/agent-workspaces/blog/70d5c40c-8e28-415d-b298-4ff80ca15bc1/deployment/report.md)：经用户授权，已于当日 21:28（GMT+8）完成部署核验，`gh-pages` 提交为 `8aea01b053f16b16aff8339fbe7657c02184a21d`，GitHub Pages 任务成功；本轮重新通过 12 项测试、173 文件检查、74 页构建，线上 312 个文件 HTTP 与内容比对全部通过，RSS 的 20 条文章正文有效。源码 main 仍未提交或推送；此前 9 项依赖风险未在本轮解决或重新审计。
- 发布安全补充：新建独立部署仓库后，在 `git add` 前设置仓库级 `git config core.autocrlf false`（不改全局配置）；推送前保留旧部署提交，并优先使用带精确旧提交约束的 `--force-with-lease` 替代无条件 `-f`。本次 `deploy-temp/` 保留了 `refs/deploy-backups/previous-gh-pages`（旧版本 `9cec02e`），不可未经检查自动清理；回滚仍须授权。
### 内容渲染复核补充（2026-10-16）

- 共享 Markdown/MDX 插件入口为 `src/plugins/markdown-config.ts`；`astro.config.ts` 同时供给 unified processor 与 MDX 兼容数组。当前 `@astrojs/mdx@5.0.6` 不继承 processor 的隐式 GFM 默认值，必须显式注册 `remark-gfm`；不要因弃用提示直接删掉 MDX 仍读取的兼容数组。`src/plugins/remark-mermaid.ts` 在代码高亮前生成 Mermaid 容器，浏览器渲染仍由 `astro-mermaid` 负责。
- `src/plugins/remark-wikilinks.ts` 会重组表格内被 GFM 竖线拆开的 `[[目标|别名]]` 单元格，再解析链接；改动 GFM 或双链时须验证列数及后续文字，不能只检查表格数量。中文标点紧邻粗体分隔符时也应检查是否残留星号。
- 本轮本地验收：20 篇、52 张表格/696 个单元格、32 个 Mermaid、99 个围栏代码块、52 个双链、26 张图片；22 项单元/结构/编译测试和21项构建产物检查通过，180文件类型检查、74页构建通过。此处是截至当轮的快照，不作为以后修改后的验收结论。随后经用户授权，表格修复已于当日15:05（GMT+8）完成上线核验，gh-pages提交为`131c19039e68cb45ba408d5ba7e3d396df7848fa`，Pages任务成功，线上20篇文章HTML与本地哈希一致。旧版`3f1a706`保留于部署仓库的`refs/deploy-backups/pre-table-fix-20261016-1500`，main源码仍未提交或推送；详见[发布记录](C:/Users/29016/.proma/agent-workspaces/blog/ba322364-3a0c-415c-a4b3-4529c2a61bb7/deployment-table-fix.md)。详见 [渲染检查报告](C:/Users/29016/.proma/agent-workspaces/blog/ba322364-3a0c-415c-a4b3-4529c2a61bb7/rendering-check-report.md)。
<!-- proma:project-map:end -->

<!-- proma:knowledge-maintenance:start -->
## 协作知识演进（Proma 维护）

- 保持本文件中的项目地图与已验证项目事实同步；命令、架构、边界和入口变化时做最小更新，不复制到协作记忆。
- Proma 工作区的 `memory/` 是可扩展的长期协作知识库：`MEMORY.md` 只做主题索引和路由，按证据创建用户画像、协作偏好、纠错与经验、决策理由等主题文件；不要把临时过程或长篇证据写入其中。
- 用户画像按具体领域渐进修订，不以“新手/专家”等全局标签定性。只有稳定、会改变未来协作判断的信息才值得维护。若记忆时间敏感、状态会更新，或记录具有后续判断价值的阶段性进展，须在对应正文相邻标注事实/状态的发生、生效或截至时间（至少日期；日内顺序、截止点或时区会影响判断时写明时间和时区），不能用文件修改时间替代；稳定事实无需额外添加时间戳。
- 基于明确、稳定证据的 Memory 最小增量可直接写入并在完成后说明；仅在删除或大段覆盖、与既有记录冲突、存在不确定推断，或可能涉及敏感个人信息时，先提出候选并取得确认。项目地图的已验证事实可直接更新。历史会话仅在用户授权后作为分批、限量的补充证据，不得全量扫描。
<!-- proma:knowledge-maintenance:end -->
