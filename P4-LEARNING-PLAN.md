# P4 实验学习计划

> 基于 zhh2001 的中文教程仓库，系统化学习 P4 可编程数据面。

## 环境准备

### 已安装

| 工具 | 版本 |
|------|------|
| Python 3 | 3.12.3 |
| Mininet | 2.3.1 |
| p4c | 1.2.5.15 |
| simple_switch | 1.15.4 |
| simple_switch_grpc | ✅ |
| OVS | 3.3.4 |
| Wireshark | 4.2.2 |
| Docker | 29.1.3 |

### 需要安装

```bash
# P4Runtime Python 客户端（p4runtime-cn-labs 需要）
pip3 install p4runtime-sh protobuf grpcio

# Go（p4-cases 需要控制器编译）
# 检查是否已装
go version || echo "需要安装 Go 1.25+"

# Scapy（自动化测试需要）
pip3 install scapy
```

### 克隆教程仓库

```bash
cd ~/
git clone https://github.com/zhh2001/p4-language-guide-zh.git
git clone https://github.com/zhh2001/p4runtime-cn-labs.git
git clone https://github.com/zhh2001/p4-cases.git
```

---

## 阶段一：P4 语言基础（2 周）

> 教材：`p4-language-guide-zh` 前 9 章 + 示例 01-02

### 阅读计划

| 天 | 章节 | 内容 |
|----|------|------|
| 1-2 | 01-02 | 环境搭建 + P4 概述 |
| 3-4 | 03 | 第一个 P4 程序（Hello） |
| 5-6 | 04-05 | 语法基础 + 类型系统 |
| 7-8 | 06 | Parser 解析器 |
| 9-10 | 07-08 | 控制块与动作 + 匹配动作表 |
| 11 | 09 | Deparser 反解析器 |

### 实验

| # | 实验 | 仓库/示例 | 目标 |
|---|------|-----------|------|
| 1 | Hello P4 | `p4-language-guide-zh/examples/01-hello` | p4c 编译 → BMv2 运行 → Mininet ping |
| 2 | L2 静态转发 | `p4-language-guide-zh/examples/02-l2-switch` | 静态 MAC 表，理解 match-action |

### 产出

- 写一篇「P4 实验（一）：Hello World 到 L2 转发」
- 记录编译、运行、调试的完整过程

---

## 阶段二：P4 架构与实战（2 周）

> 教材：`p4-language-guide-zh` 第 10-13 章 + 示例 03-05

### 阅读计划

| 天 | 章节 | 内容 |
|----|------|------|
| 1-2 | 10-11 | 架构与包 + V1Model 架构 |
| 3-4 | 12 | 外部对象 Extern（counter/meter/register/hash） |
| 5 | 13 | 注解与高级特性 |

### 实验

| # | 实验 | 仓库/示例 | 目标 |
|---|------|-----------|------|
| 3 | IPv4 路由器 | `p4-language-guide-zh/examples/03-ipv4-router` | LPM 路由、TTL、校验和、MAC 改写 |
| 4 | ACL 防火墙 | `p4-language-guide-zh/examples/04-acl` | 三元组匹配、优先级 |
| 5 | ECMP 负载均衡 | `p4-language-guide-zh/examples/05-ecmp` | 哈希、多路径 |

### 产出

- 写一篇「P4 实验（二）：IPv4 路由与 ACL」
- 写一篇「P4 实验（三）：ECMP 负载均衡」

---

## 阶段三：P4Runtime 控制平面（2-3 周）

> 教材：`p4-language-guide-zh` 第 14-15 章 + `p4runtime-cn-labs` 全部 7 个实验

### 阅读计划

| 天 | 内容 |
|----|------|
| 1-2 | 第 14 章：BMv2 编译与运行 |
| 3-4 | 第 15 章：P4Runtime 控制平面 |

### 实验（p4runtime-cn-labs）

| # | 实验 | 目标 |
|---|------|------|
| 6 | Lab 01: Pipeline | 编译最小 pipeline，查看 P4Info |
| 7 | Lab 02: Table Entry | P4Runtime Shell 安装 pipeline、读写表项 |
| 8 | Lab 03: Python Client | 用 Python 建立 gRPC session |
| 9 | Lab 04: Read/Write | 处理 Read、Write、batch 和错误详情 |
| 10 | Lab 05: Resources | 读取 counter，配置 meter |
| 11 | Lab 06: Selector | ActionProfile、ECMP 和 multicast |
| 12 | Lab 07: Stream Arbitration | PacketIn/PacketOut，控制器仲裁 |

### 产出

- 写一篇「P4 实验（四）：P4Runtime 控制平面入门」
- 写一篇「P4 实验（五）：Packet I/O 与控制器仲裁」

---

## 阶段四：P4 综合案例（3-4 周）

> 教材：`p4-cases` 全部 14 个案例

### 案例列表

| # | 案例 | 核心概念 | 难度 |
|---|------|----------|------|
| 13 | 01 Packet Reflector | Parse → Match-Action → Deparse | ⭐ |
| 14 | 02 Repeater | if-else vs 查找表 | ⭐ |
| 15 | 03 L2 Forwarding | EXACT 表 + action 参数 | ⭐⭐ |
| 16 | 04 L2 Broadcast | PRE / MulticastGroup | ⭐⭐ |
| 17 | 05 L2 Learning | Digest（数据面→控制面） | ⭐⭐⭐ |
| 18 | 06 INT | 多交换机 + IPv4 Options + 逐跳遥测 | ⭐⭐⭐ |
| 19 | 07 Meter | Meter extern / 三色标记 | ⭐⭐⭐ |
| 20 | 08 Counter | Counter extern / 读取累积值 | ⭐⭐⭐ |
| 21 | 09 ECMP Hash | 5-tuple hash + ecmp group | ⭐⭐⭐ |
| 22 | 10 Firewall ACL | TERNARY 表 + priority | ⭐⭐⭐ |
| 23 | 11 VXLAN Encap | 头部插入 / setValid() | ⭐⭐⭐⭐ |
| 24 | 12 Register Flow Counter | register + hash | ⭐⭐⭐⭐ |
| 25 | 13 Clone to CPU | CloneSession + PacketIn | ⭐⭐⭐⭐ |
| 26 | 14 IPv6 LPM | 128 位 LPM + L3 重写 | ⭐⭐⭐⭐ |

### 产出

- 每 3-4 个案例写一篇文章
- 最终形成「P4 编程案例集」系列

---

## 阶段五：INT 带内遥测（2 周）

> 教材：`p4-cases/06_int` + `zhh2001/int`

### 实验

| # | 实验 | 目标 |
|---|------|------|
| 27 | 基础 INT | 多交换机遥测、Header 插入、SwID 记录 |
| 28 | TT-INT | 时间阈值触发的轻量级 INT |

### 产出

- 写一篇「P4 实验（六）：INT 带内网络遥测」

---

## 阶段六：综合项目（4 周）

> 参考：`P4Sentinel`（146⭐）+ 自己的研究方向

### 方向

- P4 数据面 + Ryu/Go 控制面 + ML 检测
- 或：P4 流量分类 + INT 遥测 + 可视化

### 产出

- 可作为论文实验基础
- 写一篇「P4 综合项目：可编程数据面 + 智能流控」

---

## 学习节奏建议

| 周次 | 阶段 | 每日时间 |
|------|------|----------|
| 1-2 | 阶段一：语言基础 | 2-3 小时 |
| 3-4 | 阶段二：架构实战 | 2-3 小时 |
| 5-7 | 阶段三：P4Runtime | 3-4 小时 |
| 8-11 | 阶段四：综合案例 | 3-4 小时 |
| 12-13 | 阶段五：INT | 2-3 小时 |
| 14-17 | 阶段六：综合项目 | 4+ 小时 |

---

## 参考资源

- [P4 官方教程](https://github.com/p4lang/tutorials)
- [P4 语言规范](https://p4.org/p4-specs/)
- [BMv2 文档](https://github.com/p4lang/behavioral-model)
- [P4Runtime 规范 v1.5.0](https://p4lang.github.io/p4runtime/spec/v1.5.0/)
