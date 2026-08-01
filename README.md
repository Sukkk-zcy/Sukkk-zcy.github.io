# Sukkk 的博客

个人技术博客，记录网络、嵌入式与开发工具的学习与实践。基于 [astro-theme-pure](https://github.com/cworld1/astro-theme-pure) 定制（Astro 6.x），并融合了知识管理能力（Wiki 链接、知识图谱、全文搜索）。

**博客地址**：[https://sukkk-zcy.github.io](https://sukkk-zcy.github.io)

## 内容分类

- **SDN**：SDN 架构、OpenFlow 协议、Mininet 实验、入侵检测与机器学习应用
- **P4**：P4 语言入门、程序结构、V1Model 流水线、P4Runtime
- **Embedded**：ESP32 开发、Blinker 物联网、固件烧录、硬件 DIY
- **Devtools**：开发环境搭建、终端配置（Nushell / Starship）、实用工具推荐

## 技术栈

- [Astro](https://astro.build) - 静态站点生成
- [astro-pure](https://github.com/cworld1/astro-pure) - 主题框架
- [UnoCSS](https://unocss.dev) - 原子化样式
- [FlexSearch](https://github.com/nextapps-de/flexsearch) - 全文搜索
- [Mermaid](https://mermaid.js.org) - 图表支持

## 本地开发

```bash
# 安装依赖（TypeScript 6.x 冲突，必须加 --legacy-peer-deps）
npm install --legacy-peer-deps

# 开发服务器
npm run dev

# 构建（内存不足时需设置 NODE_OPTIONS）
$env:NODE_OPTIONS="--max-old-space-size=8192"; npm run build

# 部署（推送到 gh-pages 分支）
.\deploy.ps1
```

## 联系方式

- **GitHub**：[Sukkk-zcy](https://github.com/Sukkk-zcy)
- **博客**：[sukkk-zcy.github.io](https://sukkk-zcy.github.io)

## 许可证

代码基于 [Apache 2.0 License](LICENSE)。
