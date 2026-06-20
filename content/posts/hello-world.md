---
title: "Hello World - 搭建我的学习博客"
date: 2026-06-20
draft: false
tags: ["入门", "Hugo", "GitHub Pages"]
categories: ["博客搭建"]
summary: "使用 Hugo + PaperMod 搭建个人学习博客的第一步。"
ShowToc: true
TocOpen: true
ShowReadingTime: true
ShowWordCount: true
cover:
  image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop"
  alt: "laptop with code"
  caption: "Photo by Glenn Carstens-Peters on Unsplash"
  relative: false
math: true
---

## 为什么写博客？

写博客是学习最好的方式之一。通过输出倒逼输入，帮助自己更好地理解和记忆知识。

> "费曼学习法的核心就是：用简单的语言解释复杂的概念。"

## 技术栈选择

| 组件 | 选择 | 理由 |
|------|------|------|
| 静态站点生成器 | Hugo | 构建速度极快，毫秒级编译 |
| 主题 | PaperMod | 简洁优雅，功能全面 |
| 部署 | GitHub Pages | 免费、稳定、自动部署 |
| 编辑器 | VS Code + Markdown | 专注内容创作 |

## Hugo 安装

```bash
# macOS
brew install hugo

# Windows
winget install Hugo.Hugo.Extended

# Linux
sudo apt install hugo
```

## 创建新站点

```bash
hugo new site my-blog
cd my-blog
git init
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

## 配置文件

```toml
baseURL = "https://example.github.io/"
languageCode = "zh-cn"
title = "我的博客"
theme = "PaperMod"
```

## Hello World

```python
def hello_world():
    print("Hello, World!")
    
if __name__ == "__main__":
    hello_world()
```

## 数学公式

质能方程：

$$E = mc^2$$

行内公式：$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$

欧拉公式：$e^{i\pi} + 1 = 0$

## Mermaid 流程图

```mermaid
graph LR
    A[写 Markdown] --> B[Hugo 构建]
    B --> C[GitHub Pages]
    C --> D[全球访问]
    style A fill:#f9f,stroke:#333
    style D fill:#bbf,stroke:#333
```

## 代码高亮

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Hugo!")
}
```

## 下一步

- [x] 搭建博客
- [x] 选择主题
- [ ] 配置评论系统
- [ ] 添加更多内容
- [ ] 优化 SEO

---

> 写下你的第一篇博客，开启学习之旅！
