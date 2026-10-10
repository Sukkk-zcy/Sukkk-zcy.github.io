# P4 实验学习计划

> 面向「懂 SDN、没做过 P4 实验」的起点，目标是从零跑通 P4，再进入 INT 研究。
> 环境：WSL2 + Ubuntu 24.04，工具链已装好并验证可用。

---

## 一、先建立直觉：P4 和 SDN 的关系

你学过的 SDN 是**控制面可编程**：控制器（Ryu/ONOS）决定转发策略，通过 OpenFlow 把流表下发给交换机。

但交换机本身的**数据面是固定的**——它能解析哪些协议、匹配哪些字段、做什么动作，出厂就定死了。OpenFlow 的匹配字段集合也是规范预定义的（MAC、IP、端口等）。

**P4 把这个限制打开了**：数据面本身变成一段你可以写的程序。

| | 传统网络 | SDN + OpenFlow | P4 |
|---|---|---|---|
| 控制面 | 每台设备各自决策 | ✅ 集中可编程 | ✅ 集中可编程 |
| 数据面 | ❌ 固件固定 | ❌ 固定字段集 | ✅ **你自己写** |
| 能解析自定义协议 | 不能 | 不能 | **能** |
| 能改转发逻辑 | 等厂商固件 | 只能用预设字段 | **改 P4 代码重新编译** |

一句话：**OpenFlow 让你能「配置」交换机，P4 让你能「编程」交换机。**

---

## 二、P4 程序的结构（读代码前先记住这个）

一个 P4 程序就是描述「报文进来后怎么处理」的流水线，V1Model 架构下有 6 个块：

```
报文进入
   ↓
[1] Parser          把字节流解析成报头（提取以太网头、IP 头……）
   ↓
[2] VerifyChecksum  校验和验证
   ↓
[3] Ingress         ★核心：查表 + 执行动作（决定转发到哪、改什么字段）
   ↓
[4] Egress          出端口前的处理
   ↓
[5] ComputeChecksum 重算校验和
   ↓
[6] Deparser        把报头重新序列化成字节流
   ↓
报文发出
```

**最需要理解的是 [1] Parser 和 [3] Ingress**，其余在入门阶段多是占位。

---

## 三、学习路径（5 个实验，已全部验证可运行）

### 环境准备

```bash
# 已克隆的仓库
~/p4-language-guide-zh/    # P4 中文教程 + 5 个示例
~/p4runtime-cn-labs/       # P4Runtime 控制平面教程
~/p4-cases/                # 14 个进阶案例
~/TT-INT/                  # INT 研究实现（后期用）

# 免 sudo 运行实验的封装脚本（本机 sudo 需密码，已解决）
~/bin/p4rootless
```

运行任意实验：
```bash
cd ~/p4-language-guide-zh
p4rootless bash examples/01-hello/run.sh
```

---

### 实验 1 · Hello P4（报文反射）⭐

**做什么**：程序把每个报文从进入的端口原路发回。

**学到什么**：
- P4 程序的完整骨架长什么样
- `p4c` 编译 → `simple_switch` 加载 → 发包验证 的完整流程
- `standard_metadata` 是什么（P4 内置的元数据，含 `ingress_port`、`egress_spec`）

**核心代码**（就一行）：
```p4
apply {
    std_meta.egress_spec = std_meta.ingress_port;  // 从哪进来就从哪出去
}
```

**验证方式**：从 h1/h2 各发 60/128/1514 字节的帧，检查原主机收到逐字节一致的反射帧。

---

### 实验 2 · L2 交换机（静态转发 + 泛洪）⭐⭐

**做什么**：按目的 MAC 转发；未知地址泛洪到其他端口。

**学到什么**：
- **Parser 提取报头**：`pkt.extract(hdr.ethernet)` 把 14 字节以太网头解析成字段
- **match-action 表**：`dmac` 表按目的 MAC 精确匹配，命中则执行 `forward(port)`
- **多播组（Multicast Group）**：泛洪靠控制平面配置的组实现
- **Egress 过滤回源**：`egress_port == ingress_port` 的副本被丢弃

**核心代码**：
```p4
table dmac {
    key = { hdr.ethernet.dstAddr: exact; }     // 精确匹配目的 MAC
    actions = { forward; broadcast; }           // 命中转发，未命中泛洪
    default_action = broadcast(1);
}
```

**为什么重要**：这是第一个「有流表」的实验，你能看到**控制平面写入表项 → 数据面查表转发**的完整闭环。这正好对应你学过的 OpenFlow 流表。

---

### 实验 3 · IPv4 路由器（L3 转发）⭐⭐⭐

**做什么**：解析 IP 头，按目的 IP 查路由表转发，并做路由器该做的事。

**学到什么**：
- **多层解析**：以太网头 → 按 etherType 分支 → 解析 IPv4 头
- **LPM 匹配**：最长前缀匹配（`lpm` match kind），这是路由表的核心
- **TTL 递减**：`hdr.ipv4.ttl = hdr.ipv4.ttl - 1`（数据面真的在改包！）
- **校验和重算**：改了 TTL 就要重算 IP 校验和
- **MAC 改写**：路由器要替换源/目的 MAC

**怎么证明它真的在工作**：ping 输出里 `ttl=63` 而不是 64 —— 说明 P4 程序在数据面把 TTL 减了 1。

**为什么重要**：这是最接近真实网络设备行为的实验，也是理解「可编程数据面到底能改什么」的关键。

---

### 实验 4 · ACL 防火墙（三元匹配）⭐⭐⭐

**做什么**：按 IP/端口规则允许或拒绝流量，并统计计数。

**学到什么**：
- **ternary 匹配**：支持通配符的匹配方式（比 exact 灵活，比 lpm 通用）
- **优先级（priority）**：多条规则命中时的裁决
- **counter 外部对象**：数据面统计流量（这是 INT 的基础构件之一）

**核心代码**：
```p4
table acl {
    key = {
        hdr.ipv4.srcAddr: ternary;
        hdr.ipv4.dstAddr: ternary;
        hdr.ipv4.protocol: ternary;
    }
    actions = { permit; deny; }
    size = 64;
}
```

**为什么重要**：ternary + counter 是后面做安全类研究（入侵检测、限流）的基础。

---

### 实验 5 · ECMP 负载均衡（哈希 + 多路径）⭐⭐⭐⭐

**做什么**：把流量按五元组哈希分散到多条等价路径。

**学到什么**：
- **哈希外部对象**：`hash()` 计算流标识
- **action selector / 等价组**：多路径选择的机制
- **同流稳定性**：同一条流始终走同一条路径（避免乱序）

**验证输出**：
```
PASS：500 条 TCP 流各发 2 帧，逐帧 CRC32、MAC、TTL、校验和及负载一致
本组样本：nh1 250 条流，nh2 250 条流
```

**为什么重要**：这是数据中心网络的核心功能，也是研究里常见的实验场景。

---

## 四、学习节奏建议

| 天 | 任务 | 重点 |
|----|------|------|
| 第 1 天 | 读教程第 2、3 章 + 跑通实验 1 | 建立流水线直觉 |
| 第 2 天 | 读第 6 章（Parser）+ 实验 2 | 理解报头解析 |
| 第 3-4 天 | 读第 7、8 章（控制块/表）+ 实验 3 | 理解 match-action |
| 第 5 天 | 读第 11 章（V1Model）+ 实验 4 | 理解架构与外部对象 |
| 第 6-7 天 | 实验 5 + 读第 12 章（Extern） | 哈希、counter、meter |

**读代码的方法**：不要只看，要**改**。比如：
- 实验 1：把反射改成「丢弃所有包」，看还能不能 ping 通
- 实验 2：加一条表项，让某个 MAC 转发到指定端口
- 实验 3：把 TTL 递减去掉，观察 ping 的 ttl 变成 64
- 实验 4：改规则，让原本允许的流量被拒绝

**改坏了再跑一次就好**，实验脚本每次都会重新编译，不影响原文件。

---

## 五、进阶：P4Runtime 控制平面

跑通上面 5 个实验后，你已经会写数据面了。但表项都是 `simple_switch_CLI` 手工敲的——真实系统里，控制平面是**程序**。

`p4runtime-cn-labs` 的 7 个实验就是讲这个：

| 实验 | 内容 |
|------|------|
| 01 | 编译 pipeline，查看 P4Info |
| 02 | P4Runtime Shell 安装 pipeline、读写表项 |
| 03 | Python 建立 gRPC session |
| 04 | Read/Write/batch 与错误处理 |
| 05 | 读取 counter，配置 meter |
| 06 | ActionProfile、ECMP、multicast |
| 07 | PacketIn/PacketOut 与控制器仲裁 |

**这一步的意义**：从「手工配置交换机」升级到「写程序控制网络」——这才是 SDN 的本意。

---

## 六、再进阶：INT 带内网络遥测

这是你导师和师兄的研究方向。有了前面基础后：

**先读论文**：
- TT-INT（师兄一作，IEEE TNSM 2026）：时间阈值触发的轻量级 INT

**核心思想**：
传统 INT 每个包每一跳都插遥测数据，开销巨大。TT-INT 只在「距上次插入超过时间阈值」时才插：

```p4
delta = ingress_global_timestamp - last_ts[flow]
if delta >= time_th[flow] && count < max_cnt[flow]:
    push (switch_id, init_ttl - ipv4.ttl)
    last_ts[flow] = ingress_global_timestamp
```

**需要的额外依赖**：
```bash
pip3 install scapy              # 发包/收包
curl -LsSf https://astral.sh/uv/install.sh | sh   # 测试环境
```

**跑仓库**：
```bash
cd ~/TT-INT
bash tests/run.sh        # 免 root 的 BMv2 功能测试
```

**为什么这是你的方向**：师兄和你是同门（同一导师陈珏），TT-INT 是论文级实现而非玩具，包含论文 Algorithm 2 的 P4 代码、每流三寄存器设计、双测试套件。吃透它，你就有做自己选题的基础。

---

## 七、参考资源

| 资源 | 用途 |
|------|------|
| `~/p4-language-guide-zh/docs/` | P4_16 中文教程 16 章（主力教材） |
| `~/p4-language-guide-zh/appendix/B-术语表.md` | 中英术语对照 |
| `~/p4-language-guide-zh/appendix/D-常见问题.md` | 调试技巧 |
| `~/p4-cases/` | 14 个进阶案例（Go 控制器 + 自动测试） |
| `~/TT-INT/` | INT 研究实现 |
| [P4-16 规范](https://p4.org/p4-specs/) | 权威语法参考 |
| [P4 官方 tutorials](https://github.com/p4lang/tutorials) | 官方练习 |
