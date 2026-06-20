---
title: "Python 基础：列表与字典完全指南"
date: 2026-06-21
draft: false
tags: ["Python", "编程入门", "数据结构"]
categories: ["Python 教程"]
summary: "Python 中列表和字典的详细用法，包含大量实用示例。"
ShowToc: true
TocOpen: true
ShowReadingTime: true
cover:
  image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop"
  alt: "python code"
  caption: "Python 编程"
  relative: false
math: false
---

## 列表 (List)

列表是 Python 中最常用的数据结构之一，是有序的可变序列。

### 创建列表

```python
# 空列表
empty_list = []

# 直接创建
fruits = ["苹果", "香蕉", "橙子"]

# 使用 list() 构造函数
numbers = list(range(1, 11))

# 列表推导式
squares = [x**2 for x in range(10)]
even_numbers = [x for x in range(20) if x % 2 == 0]
```

### 常用操作

```python
fruits = ["苹果", "香蕉", "橙子"]

# 访问元素
print(fruits[0])      # 苹果
print(fruits[-1])     # 橙子

# 切片
print(fruits[1:3])    # ['香蕉', '橙子']
print(fruits[:2])     # ['苹果', '香蕉']
print(fruits[::2])    # ['苹果', '橙子']

# 修改元素
fruits[0] = "草莓"

# 添加元素
fruits.append("葡萄")        # 末尾添加
fruits.insert(1, "芒果")    # 指定位置插入
fruits.extend(["西瓜", "樱桃"])  # 扩展列表

# 删除元素
fruits.remove("香蕉")    # 按值删除
popped = fruits.pop()    # 弹出末尾元素
del fruits[0]            # 按索引删除
```

### 列表方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `append(x)` | 末尾添加元素 | `list.append(1)` |
| `extend(iterable)` | 扩展列表 | `list.extend([2, 3])` |
| `insert(i, x)` | 指定位置插入 | `list.insert(0, 0)` |
| `remove(x)` | 按值删除 | `list.remove(1)` |
| `pop([i])` | 弹出元素 | `list.pop()` |
| `clear()` | 清空列表 | `list.clear()` |
| `index(x)` | 查找索引 | `list.index(1)` |
| `count(x)` | 计数 | `list.count(1)` |
| `sort()` | 排序 | `list.sort()` |
| `reverse()` | 反转 | `list.reverse()` |
| `copy()` | 复制 | `list.copy()` |

## 字典 (Dictionary)

字典是键值对的无序集合，通过键来快速查找值。

### 创建字典

```python
# 空字典
empty_dict = {}

# 直接创建
person = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}

# 使用 dict() 构造函数
car = dict(brand="特斯拉", model="Model 3", year=2024)

# 字典推导式
squares_dict = {x: x**2 for x in range(6)}
```

### 常用操作

```python
person = {"name": "张三", "age": 25}

# 访问值
print(person["name"])           # 张三
print(person.get("email", "N/A"))  # N/A（键不存在时返回默认值）

# 修改/添加
person["age"] = 26
person["email"] = "zhangsan@example.com"

# 删除
del person["email"]
removed = person.pop("age")

# 遍历
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")
```

### 实用技巧

```python
# 合并字典
dict1 = {"a": 1, "b": 2}
dict2 = {"c": 3, "d": 4}
merged = {**dict1, **dict2}

# 字典排序
sorted_dict = dict(sorted(person.items(), key=lambda x: x[1]))

# 检查键是否存在
if "name" in person:
    print("存在")
```

## 列表 vs 字典

| 特性 | 列表 | 字典 |
|------|------|------|
| 有序 | ✅ | ❌ (3.7+) |
| 可变 | ✅ | ✅ |
| 索引 | 数字 | 键 |
| 查找速度 | O(n) | O(1) |
| 适用场景 | 序列数据 | 关联数据 |

## 练习题

1. 创建一个包含 1-100 中所有偶数的列表
2. 统计一个字符串中每个字符出现的次数
3. 将两个列表合并为一个字典

## 下一篇

> 下一篇我们将学习 Python 的函数和类，敬请期待！
