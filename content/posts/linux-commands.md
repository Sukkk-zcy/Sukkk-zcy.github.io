---
title: "Linux 常用命令总结"
date: 2026-06-24
draft: false
tags: ["Linux", "命令行", "工具"]
categories: ["开发工具"]
summary: "开发者必备的 Linux 命令行速查手册。"
ShowToc: true
TocOpen: true
ShowReadingTime: true
math: false
---

## 文件操作

```bash
# 查看当前目录
pwd

# 列出文件
ls              # 列出文件
ls -la          # 显示详细信息，包含隐藏文件
ls -lh          # 人类可读的文件大小

# 切换目录
cd /path/to/dir
cd ~            # 回到家目录
cd -            # 回到上一个目录

# 创建目录
mkdir dir_name
mkdir -p path/to/dir  # 递归创建

# 创建/修改文件
touch file.txt
echo "content" > file.txt    # 覆盖写入
echo "content" >> file.txt   # 追加写入

# 复制
cp source dest
cp -r source_dir dest_dir   # 递归复制目录

# 移动/重命名
mv source dest

# 删除
rm file.txt
rm -rf directory   # 强制递归删除（危险！）
```

## 文本处理

```bash
# 查看文件
cat file.txt          # 查看全部
head -n 20 file.txt   # 查看前 20 行
tail -n 20 file.txt   # 查看后 20 行
tail -f log.txt       # 实时查看文件

# 搜索
grep "pattern" file.txt
grep -r "pattern" /path/   # 递归搜索
grep -i "pattern" file     # 忽略大小写

# 排序和去重
sort file.txt
sort file.txt | uniq
```

## 系统信息

```bash
# 系统信息
uname -a              # 系统信息
hostname              # 主机名
uptime                # 运行时间

# 磁盘使用
df -h                 # 磁盘空间
du -sh *              # 当前目录大小
du -sh directory      # 指定目录大小

# 内存使用
free -h

# 进程
top                   # 实时进程
ps aux                # 所有进程
ps aux | grep name    # 查找进程

# 网络
ifconfig              # 网络接口
ip addr               # 新命令
curl url              # HTTP 请求
wget url              # 下载文件
```

## 权限管理

```bash
# 修改权限
chmod 755 file        # rwxr-xr-x
chmod +x script.sh    # 添加执行权限
chmod -R 755 dir/     # 递归修改

# 修改所有者
chown user:group file
```

## 压缩解压

```bash
# tar
tar -czf archive.tar.gz dir/    # 压缩
tar -xzf archive.tar.gz         # 解压

# zip
zip -r archive.zip dir/
unzip archive.zip
```

## 实用技巧

```bash
# 命令历史
history
!!                   # 执行上一条命令
!n                   # 执行第 n 条命令

# 管道和重定向
command1 | command2   # 管道
command > file.txt    # 输出重定向
command >> file.txt   # 追加重定向
command 2>&1          # 合并错误输出

# 后台运行
command &             # 后台运行
nohup command &       # 退出终端后继续运行
```

## 常用快捷键

| 快捷键 | 说明 |
|--------|------|
| `Ctrl + C` | 终止当前命令 |
| `Ctrl + Z` | 挂起当前命令 |
| `Ctrl + R` | 搜索历史命令 |
| `Ctrl + A` | 移动到行首 |
| `Ctrl + E` | 移动到行尾 |
| `Ctrl + W` | 删除前一个单词 |
| `Tab` | 自动补全 |

---

> 熟练掌握这些命令，Linux 操作将变得得心应手！
