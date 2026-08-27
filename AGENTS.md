# AGENTS.md

## 语言偏好

**必须使用中文**与用户交互。这是一个博客运维项目。

## 项目概览

Astro Theme Iris — 基于 Astro 6.x 的个人知识博客，支持 wikilinks、知识图谱、FlexSearch。主题基于 astro-pure，已深度定制。

- **博客地址**: https://sukkk-zcy.github.io/
- **GitHub 仓库**: `Sukkk-zcy/Sukkk-zcy.github.io`
- **部署分支**: `gh-pages`（GitHub Pages 服务该分支）
- **开发环境**: WSL2 + Ubuntu 24.04

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
├── P4-LEARNING-PLAN.md        # P4 实验学习计划
└── astro.config.ts            # Astro 框架配置
```

## 常用命令

```bash
# 安装（必须 --legacy-peer-deps，TypeScript 6.x 冲突）
npm install --legacy-peer-deps

# 开发
npm run dev              # 启动开发服务器
npm run dev:check        # 带类型检查的开发

# 构建（内存不足需设置 NODE_OPTIONS）
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# 代码质量
npm run lint             # ESLint（自带 --fix）
npm run format           # Prettier
npm run yijiansilian     # 一键：lint + sync + check + format（需 bun）

# 清理缓存
rm -rf .astro dist
```

## 部署

```bash
# 1. 构建
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# 2. 确保 .nojekyll 存在（GitHub Pages 必须，否则忽略 _astro 目录）
touch dist/.nojekyll

# 3. 部署到 gh-pages
# 注意：必须用 `cp -r dist/. deploy-temp/`（点号结尾）而非 `cp -r dist/* deploy-temp/`
# 因为 bash 的 `*` 通配符默认不展开以 `.` 开头的隐藏文件，会漏掉 `.nojekyll`
# 没有 .nojekyll → GitHub Pages 启用 Jekyll → Jekyll 忽略 _astro/ 目录 → 所有 CSS/JS/图片 404
mkdir -p deploy-temp && cp -r dist/. deploy-temp/
cd deploy-temp && git init && git add . && git commit -m "deploy: $(date '+%Y-%m-%d')"
git push -f git@github.com:Sukkk-zcy/Sukkk-zcy.github.io.git master:gh-pages
cd .. && rm -rf deploy-temp
```

Windows PowerShell 等价命令：
```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"; npm run build
New-Item -Path "dist\.nojekyll" -ItemType File -Force | Out-Null
Copy-Item -Path "dist\*" -Destination "deploy-temp\" -Recurse -Force
Push-Location deploy-temp
git init; git add .; git commit -m "deploy: $(Get-Date)"
git push -f git@github.com:Sukkk-zcy/Sukkk-zcy.github.io.git master:gh-pages
Pop-Location
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
```bash
git fetch && git merge --no-commit
# 检查合并结果后再 commit
```

### npm 安装

TypeScript 6.x 与 `@astrojs/check` 冲突，必须 `--legacy-peer-deps`。`node_modules` 约 520MB，不要轻易删除。

## 已禁用功能

- **Typst 集成**：依赖问题
- **远程字体**：网络问题
- **Giscus 评论**：未配置 repo/ID
- **Waline 评论**：`site.config.ts` 中 `waline.enable: false`

## 实验环境（WSL2）

SDN/P4 实验在 WSL2 + Ubuntu 24.04 上进行，工具链已预装：

| 工具 | 版本 | 用途 |
|------|------|------|
| Python 3 | 3.12.3 | 控制平面脚本 |
| Mininet | 2.3.1 | 网络拓扑仿真 |
| p4c | 1.2.5.15 | P4 编译器 |
| simple_switch | 1.15.4 | BMv2 软件交换机 |
| simple_switch_grpc | — | P4Runtime gRPC 支持 |
| OVS | 3.3.4 | Open vSwitch |
| Wireshark | 4.2.2 | 抓包分析 |
| Docker | 29.1.3 | 容器化环境 |

### 需要安装

```bash
# P4Runtime Python 客户端
pip3 install p4runtime-sh protobuf grpcio

# Go（p4-cases 控制器编译需要）
wget https://go.dev/dl/go1.25.1.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.25.1.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

# Scapy（自动化测试）
pip3 install scapy
```

### 参考仓库（zhh2001）

| 仓库 | 内容 |
|------|------|
| `zhh2001/p4-language-guide-zh` | P4 中文教程 16 章 + 5 个可运行示例 |
| `zhh2001/p4runtime-cn-labs` | P4Runtime 中文实战 7 个实验 |
| `zhh2001/p4-cases` | 14 个 P4 案例（Go 控制器 + 自动测试） |
| `zhh2001/int` | INT 带内网络遥测 |
| `zhh2001/P4Sentinel` | 可编程数据面流控框架（146⭐） |

详见 `P4-LEARNING-PLAN.md`。
