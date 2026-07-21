# Astro Iris Blog 运维手册

## 基本信息

- **项目位置**: `E:\BLOG`
- **主题**: astro-theme-iris（Astro 框架，不是 Hugo）
- **博客地址**: https://sukkk-zcy.github.io/
- **GitHub 用户名**: `Sukkk-zcy`
- **GitHub 仓库**: `Sukkk-zcy/Sukkk-zcy.github.io`
- **部署分支**: `gh-pages`（GitHub Pages 服务该分支）

---

## 目录结构

```
E:\BLOG/
├── src/
│   ├── content/
│   │   └── blog/           # 文章内容（.mdx 文件）
│   │       ├── SDN/        # SDN 分类（7 篇）
│   │       ├── P4/         # P4 分类（3 篇）
│   │       ├── Embedded/   # 嵌入式开发分类（4 篇）
│   │       └── Devtools/   # 开发环境搭建分类（4 篇）
│   ├── components/         # Astro 组件
│   ├── layouts/            # 页面布局
│   └── utils/
│       └── content-paths.ts  # 分类/标签路径工具函数
├── packages/pure/          # 主题组件包（含 ArticleBottom.astro 等）
├── .github/workflows/      # GitHub Actions 部署配置
├── public/                 # 静态资源
├── dist/                   # 构建产物（.gitignore）
├── deploy-temp/            # 部署临时目录（可删）
└── site.config.ts          # 站点配置
```

---

## 部署方式

### 方式一：GitHub Actions 自动部署（推荐）

推送代码到 GitHub 后自动构建部署。

- **工作流文件**: `.github/workflows/deploy.yml`
- **流程**: Node.js 20 → npm install --legacy-peer-deps → astro build → 部署到 gh-pages

### 方式二：本地手动部署

```powershell
# 1. 构建
cd E:\BLOG
npx astro build

# 2. 部署到 gh-pages
Remove-Item -Path "E:\BLOG\deploy-temp" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "E:\BLOG\deploy-temp" | Out-Null
Copy-Item -Path "E:\BLOG\dist\*" -Destination "E:\BLOG\deploy-temp\" -Recurse -Force
New-Item -ItemType File -Force -Path "E:\BLOG\deploy-temp\.nojekyll" | Out-Null
Push-Location E:\BLOG\deploy-temp
git init; git add .; git commit -m "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git remote add origin https://Sukkk-zcy:ghp_<TOKEN>@github.com/Sukkk-zcy/Sukkk-zcy.github.io.git
git push -f origin master:gh-pages
Pop-Location
```

**注意**: push 使用 token-in-URL 方式绕过 GitHub Desktop 凭证弹窗。Token 可能过期，需要到 GitHub Settings > Developer settings > Personal access tokens 重新生成。

---

## 文章管理

### 新建文章

1. 在 `src/content/blog/<分类名>/` 下创建 `.mdx` 文件
2. 分类名必须使用正确大小写：`SDN`、`P4`、`Embedded`、`Devtools`
3. 文件名用 kebab-case：`sdn-04-new-topic.mdx`

### Frontmatter 模板

```yaml
---
title: "文章标题"
publishDate: 2025-07-20
description: "一句话描述"
tags: ["SDN", "OpenFlow"]      # 标签用正确大小写
categories: ["SDN"]            # 必须和目录名一致
series: ["SDN 学习指南"]        # 系列名（可选）
language: "中文"
draft: false
comment: true
---
```

### 标签规范

- SDN（不是 sdn）
- P4（不是 p4）
- DDoS（不是 ddos 或 DDOS）
- ESP32（不是 esp32）

### 分类系统

- **Astro 分类是基于目录结构的**，不是 frontmatter
- `src/content/blog/SDN/sdn-01-xxx.mdx` → 自动归类为 SDN
- frontmatter 的 `categories` 字段也需要写，但分类页面实际读取的是目录路径

---

## 重要修改记录

### 1. 分类大小写修复（2026-07-20）

**问题**: 分类显示为 "Sdn" 而不是 "SDN"

**原因**: Windows 文件系统不区分大小写，`post.filePath` 返回的小写路径

**修复**:
- `src/utils/content-paths.ts` 中 `getCategoryLabel()` 添加了已知缩写映射（KNOWN_ACRONYMS）
- 目录名改为正确大小写：`sdn` → `SDN`、`p4` → `P4`、`embedded` → `Embedded`、`devtools` → `Devtools`
- Windows 下重命名需用中间名过渡：`sdn` → `sdn_tmp` → `SDN`

### 2. ArticleBottom 上下章导航修复（2026-07-20）

**问题**: 上下章切换时出现重定向页面（从 `/blog/sdn-03` 重定向到 `/blog/sdn/sdn-03`）

**原因**: `getEntrySlug()` 只返回文件名，缺少分类前缀

**修复**: 改为 `getEntryPath()`，从 `entry.filePath` 提取完整路径（含分类目录）

### 3. ArticleBottom 分类内导航

**问题**: SDN-01 的"下一篇"链接到其他分类的文章

**修复**: 修改 `ArticleBottom.astro`，先按分类过滤同系列文章，再计算上下篇

### 4. 标签大小写修复（2026-07-20）

**问题**: 知识图谱中 sdn/SDN 显示为两个不同节点

**修复**: 所有 `.mdx` 文件中的标签统一为正确大小写

---

## npm 依赖

- 安装时需要 `--legacy-peer-deps`（TypeScript 6.x 与 @astrojs/check 版本冲突）
- `node_modules` 约 520MB，不建议删除，除非要彻底重装

```powershell
npm install --legacy-peer-deps
```

---

## 已禁用功能

- **typst**: 依赖问题，已禁用
- **远程字体**: 网络问题，已禁用
- **Giscus 评论**: 未配置 repo，待启用

---

## 配置文件

- `src/site.config.ts` — 站点标题、作者、GitHub 等基础信息
- `astro.config.mjs` — Astro 框架配置（集成、构建选项等）
- `.github/workflows/deploy.yml` — GitHub Actions 部署流水线
- `packages/pure/components/pages/ArticleBottom.astro` — 文章底部上下章导航（已自定义）

---

## 常见问题

### npm install 失败

```powershell
npm install --legacy-peer-deps
```

### 构建前清理缓存

```powershell
Remove-Item -Path "E:\BLOG\.astro" -Recurse -Force
Remove-Item -Path "E:\BLOG\dist" -Recurse -Force
npx astro build
```

### 文章图片

- 图床地址: `https://sukk-imgbed.pages.dev`
- 图床管理后台: `https://sukk-imgbed.pages.dev/dashboard`
- 认证码: `29016`
- 上传端点: `/upload?authCode=29016&uploadChannel=telegram`
- Markdown 中直接用 `![](https://sukk-imgbed.pages.dev/xxx)` 引用图床图片

### push 到 GitHub 超时

使用代理：
```powershell
git config --global http.proxy http://127.0.0.1:7892
```
