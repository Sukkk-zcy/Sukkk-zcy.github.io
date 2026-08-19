# Changelog

## 2026-07-20

### 移除文章底部版权信息区域

- 移除了 `src/layouts/BlogPost.astro` 中的 `Copyright` 组件
- 该组件包含了文章标题、链接、作者、发布日期、版权声明和 "Buy me a cup of coffee" 按钮
- 同时从导入语句中移除了 `Copyright` 组件
- 构建测试通过，无错误
- 已部署到 GitHub Pages

