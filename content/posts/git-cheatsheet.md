---
title: "Git 常用命令速查手册"
date: 2026-06-22
draft: false
tags: ["Git", "工具", "版本控制"]
categories: ["开发工具"]
summary: "日常开发中最常用的 Git 命令整理，方便快速查阅。"
ShowToc: true
TocOpen: true
ShowReadingTime: true
cover:
  image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop"
  alt: "git logo"
  caption: "Git 版本控制"
  relative: false
math: false
---

## 基础配置

```bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 查看配置
git config --list
```

## 仓库操作

```bash
# 初始化仓库
git init

# 克隆远程仓库
git clone <url>
git clone --depth 1 <url>  # 浅克隆，只取最新提交
```

## 日常工作流

```bash
# 查看状态
git status

# 添加文件到暂存区
git add <file>           # 添加指定文件
git add .                # 添加所有更改
git add -p               # 交互式添加（选择性暂存）

# 提交
git commit -m "描述信息"
git commit -am "描述信息"  # 跳过 add，直接提交已跟踪文件的更改

# 推送
git push origin main
git push -u origin main  # 设置上游分支
```

## 分支操作

```bash
# 查看分支
git branch               # 本地分支
git branch -a            # 所有分支（含远程）
git branch -v            # 最后提交信息

# 创建分支
git branch <name>

# 切换分支
git checkout <name>
git switch <name>        # 新命令（推荐）

# 创建并切换
git checkout -b <name>
git switch -c <name>

# 删除分支
git branch -d <name>     # 安全删除
git branch -D <name>     # 强制删除
```

## 合并与变基

```bash
# 合并
git merge <branch>
git merge --no-ff <branch>  # 创建合并提交

# 变基
git rebase <branch>
git rebase --abort       # 中止变基
git rebase --continue    # 继续变基
```

## 撤销操作

```bash
# 撤销工作区更改
git checkout -- <file>
git restore <file>       # 新命令

# 撤销暂存
git reset HEAD <file>
git restore --staged <file>  # 新命令

# 撤销提交
git reset --soft HEAD~1   # 保留更改在暂存区
git reset --mixed HEAD~1  # 保留更改在工作区（默认）
git reset --hard HEAD~1   # 彻底撤销（危险！）

# 安全回退
git revert <commit>       # 创建新提交来撤销
```

## 查看历史

```bash
# 查看日志
git log
git log --oneline         # 简洁模式
git log --graph           # 图形化
git log -p <file>         # 查看文件修改历史

# 查看差异
git diff                  # 工作区 vs 暂存区
git diff --staged         # 暂存区 vs 最新提交
git diff main..feature    # 两个分支差异
```

## 标签操作

```bash
# 查看标签
git tag

# 创建标签
git tag v1.0.0
git tag -a v1.0.0 -m "版本说明"  # 附注标签

# 推送标签
git push origin v1.0.0
git push origin --tags    # 推送所有标签
```

## 远程操作

```bash
# 查看远程
git remote -v

# 添加远程
git remote add origin <url>

# 拉取
git fetch origin
git pull origin main     # fetch + merge
git pull --rebase        # fetch + rebase
```

## 暂存工作

```bash
# 暂存当前更改
git stash
git stash save "描述"

# 恢复暂存
git stash pop            # 恢复并删除
git stash apply          # 恢复但不删除

# 查看暂存列表
git stash list

# 删除暂存
git stash drop
git stash clear
```

## 实用别名

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
```

---

> 掌握这些命令，日常开发中的 Git 操作就游刃有余了！
