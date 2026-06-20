---
title: "Python 基础：列表与字典"
date: 2026-06-20
draft: false
tags: ["Python", "编程入门"]
categories: ["Python 教程"]
summary: "Python 中列表和字典的基本用法。"
ShowToc: true
TocOpen: true
---

## 列表 (List)

列表是 Python 中最常用的数据结构之一。

```python
# 创建列表
fruits = ["苹果", "香蕉", "橙子"]

# 访问元素
print(fruits[0])  # 苹果

# 切片
print(fruits[1:3])  # ['香蕉', '橙子']

# 列表推导式
squares = [x**2 for x in range(10)]
```

## 字典 (Dictionary)

```python
# 创建字典
person = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}

# 访问值
print(person["name"])

# 遍历
for key, value in person.items():
    print(f"{key}: {value}")
```

## 总结

| 结构 | 特点 | 适用场景 |
|------|------|----------|
| 列表 | 有序、可变 | 存储序列数据 |
| 字典 | 键值对、快速查找 | 存储关联数据 |
