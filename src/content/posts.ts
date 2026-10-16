import type { Post } from '@/types/content';

/**
 * 博客文章。
 *
 * ⚠️ 当前没有任何一篇是正式发布内容。以下三篇都是根据简历中的科研经历
 *    生成的**示例文章**（isSample: true），用于验证列表、详情、目录、
 *    代码高亮与标签等页面能力，页面上会显示「示例文章」标记。
 *
 *    内容严格限定在简历已有事实范围内，未编造实验数据或结论。
 *    正式写作时请替换或删除这些条目。
 *
 *    「示例文章」的说明由详情页按 `isSample` 自动渲染（`blog/[slug]/page.tsx`），
 *    因此正文里**不要**再重复写一遍免责声明。
 */
export const posts: Post[] = [
  {
    slug: 'why-multi-scale-frequency-for-gnn-traffic-prediction',
    title: '用图神经网络做交通预测：为什么需要多尺度频域特征',
    excerpt:
      '交通流量同时包含短时波动、日周期与周周期。单一时域的建模方式容易顾此失彼，而频域视角可以把不同周期成分拆开处理。',
    publishedAt: '2026-09-28',
    tags: ['图神经网络', '时空预测', '科研笔记'],
    readingTime: 6,
    featured: true,
    isSample: true,
    content: `

## 问题的起点

城市交通流量预测的核心困难在于：一条路段的流量从来不是独立变化的。上游路口的拥堵会向下游传导，商业区与住宅区在一天中的高峰时段恰好相反，周末与工作日的模式也不一样。

把路网建模成图、用图神经网络（GNN）在节点之间传播信息，是目前处理这类空间依赖的主流做法。但只做空间建模还不够——**时间维度上的成分本身就不是单一尺度的**。

## 三种时间尺度混在一起

如果直接看一条路段的流量曲线，它其实是三件事的叠加：

1. **短时波动**：几分钟到十几分钟的扰动，来自信号灯配时、随机到达。
2. **日周期**：早晚高峰形成的双峰结构，周期约 24 小时。
3. **周周期**：工作日与周末的差异，周期约 168 小时。

时域模型要同时拟合这三种成分，往往需要在感受野和参数量上做妥协。感受野太短抓不到周周期，太长则容易把短时波动平滑掉。

## 频域视角的价值

换个角度看：上面三种成分在频域上落在**不同的频率区间**。日周期对应低频，短时波动对应高频。这就意味着可以在频域上把它们分开处理，分别建模后再融合，而不是让一个模型去硬扛所有尺度。

具体到实现上，我们用 Python 完成数据处理与路网图构建：

\`\`\`python
import networkx as nx
import pandas as pd

# 用路段作为节点、连通关系作为边，构建路网图
edges = pd.read_csv('road_network_edges.csv')
graph = nx.from_pandas_edgelist(
    edges,
    source='from_node',
    target='to_node',
    edge_attr=['length', 'lanes'],
    create_using=nx.DiGraph,
)

# 邻接矩阵是后续 GNN 传播的基础
adjacency = nx.to_numpy_array(graph)

# 用拉普拉斯矩阵的特征值分布观察图上的频率结构
laplacian = nx.laplacian_matrix(graph).toarray()
\`\`\`

## 外部事件：被忽略的另一半信息

只有历史流量序列的模型有一个共同缺陷：它假设未来会重复过去。但现实里最影响流量的往往是**突发事件**——交通事故、临时管制、极端天气、节假日。

这类信息不在流量序列里，必须在模型中显式引入。我们的做法是把外部事件作为额外输入融合进模型，让预测同时依赖历史流量与事件状态。

## 从建模到验证

改进方案确定后，剩下的工作是设计并完成对比实验：同样的数据、同样的评价方式，比较改进前后的模型。这一步的价值不在结论本身，而在于它能回答「频域特征到底有没有贡献」这个问题。

整个研究的过程——从数据处理、图构建、模型改进，到对比实验与线上答辩——最终凝结成一篇会议论文：

> *Enhancing Spatiotemporal Graph Networks for Traffic Prediction with Multi-Scale Frequency and External Events*
> Springer Nature, ICMLC 2026, Volume 1

## 一点体会

做完这个项目我最大的感受是：**模型结构的选择往往是被数据的结构决定的**。当你发现一个模型需要同时学好几件互相冲突的事情时，通常意味着应该在输入或表示层面先把它们拆开，而不是继续加参数。

频域只是其中一种拆法。`,
  },
  {
    slug: 'deploying-yolo-on-device',
    title: '把 YOLO 从训练跑到设备端：一次机器人视觉项目的工程记录',
    excerpt:
      '从训练脚本到设备上真正跑起来，中间隔着数据链路、控制交互和结果存储。记录一次目标检测系统集成的实际过程。',
    publishedAt: '2026-09-14',
    tags: ['计算机视觉', '目标检测', '工程实践'],
    readingTime: 7,
    featured: true,
    isSample: true,
    content: `

## 训练只是开始

在实验室里让 YOLO 收敛并不难。难的是把它放到一台真实设备上，让它稳定地认识画面里的破损，把结果交给控制模块，并且把每一次识别沉淀成能被查询的数据。

在一个破损检测项目里我担任组长，负责目标检测与数据处理模块。这里记录几个当时真正花时间的地方。

## 一、先定义清楚「识别结果」是什么

最开始我们只在画面上画框，看起来一切正常。但控制模块需要知道的不是「框在哪」，而是**破损的类型和数量**。这两者的差距，就是后面所有返工的原因。

所以第一步是把推理输出收敛成一份结构化结果：

\`\`\`python
from dataclasses import dataclass, asdict
from collections import Counter

@dataclass
class Detection:
    label: str
    confidence: float
    bbox: tuple[int, int, int, int]

def summarize(detections: list[Detection], threshold: float = 0.5) -> dict:
    """把逐帧检测结果汇总成控制模块需要的统计量。"""
    kept = [d for d in detections if d.confidence >= threshold]
    counts = Counter(d.label for d in kept)
    return {
        'total': len(kept),
        'by_label': dict(counts),
        'detections': [asdict(d) for d in kept],
    }
\`\`\`

这一步定义清楚之后，视觉模块与控制模块之间的接口才稳定下来。

## 二、处理链路要能解释

检测结果偶尔会出现抖动：同一处破损在相邻帧里时有时无。直接计数就会重复统计。

解决方式不是把阈值一路调高（那会漏检），而是在统计层做去重——按位置聚类后再计数。这个逻辑放在模型之外，比塞进模型里更容易调试。

## 三、让结果可以被追问

系统跑起来之后，需求变成了「能不能直接问它现在的情况」。我们接入了 DeepSeek API，把统计结果作为上下文交给模型，让它回答关于当前设备状态的问题。

这里的关键是**不要把原始画面丢给语言模型**，而是只给结构化的统计数据：

\`\`\`python
import json

def build_question(stats: dict, user_question: str) -> str:
    return (
        '以下是设备当前的破损检测统计数据（JSON）：\\n'
        f'{json.dumps(stats, ensure_ascii=False, indent=2)}\\n\\n'
        f'请基于上述数据回答问题：{user_question}'
    )
\`\`\`

这样做的好处是回答有据可依，而不是让模型对着画面自由发挥。

## 四、集成的成本被低估了

回头看，真正消耗时间的不是模型，而是**跨模块联调**：视觉模块的输出格式、控制模块的读取时机、存储的并发写入，任何一处不一致都会表现为「系统不工作」，而定位问题需要同时理解三个模块。

也是在这个项目里，我第一次体会到为什么要先把接口和数据契约定下来，再并行开发各模块。

## 小结

从训练到部署，中间隔着的是**定义、契约和可解释性**三件事，而不是更复杂的模型。这个认识对我后面的项目影响很大。`,
  },
  {
    slug: 'gcn-lstm-for-edge-offloading',
    title: '边缘网络的任务卸载怎么建模：GCN 与 LSTM 为什么要组合',
    excerpt:
      '边缘节点的负载既有空间上的相互影响，也有时间上的演化规律。理解这一点，就能理解 GCN-LSTM 这类组合模型的动机。',
    publishedAt: '2026-08-30',
    tags: ['边缘计算', '图神经网络', '课程项目'],
    readingTime: 5,
    featured: false,
    isSample: true,
    content: `

## 场景

在 6G 与 AIoT 的设想里，终端产生的计算任务不会全都送到云端，而是下沉到离用户更近的边缘节点。问题是：**任务该卸载到哪个节点？**

答案取决于各节点当前的负载。而负载本身是动态的——用户移动、任务突发、节点之间的流量互相挤占。

## 两类依赖，两个模型

把边缘节点看作图的节点，它们的负载之间存在两类依赖：

**空间依赖**：相邻节点覆盖的区域重叠，负载会互相转移。一个节点过载，邻近节点很快也会被波及。图卷积（GCN）正好用来在图上传播和聚合这类信息。

**时间依赖**：单个节点的负载随时间是连续演化的，当前负载与过去若干个时间步强相关。LSTM 擅长建模这种序列关系。

单独用任何一个都不够：只用 GCN，模型不知道负载正在上升还是下降；只用 LSTM，模型意识不到隔壁节点已经在排队。

## 组合的方式

把两者串联起来：

\`\`\`python
import torch
import torch.nn as nn

class GCNLSTMPredictor(nn.Module):
    """先用 GCN 聚合空间邻居信息，再把序列交给 LSTM 建模时间演化。"""

    def __init__(self, in_features: int, hidden: int, out_features: int):
        super().__init__()
        self.gcn = nn.Linear(in_features, hidden)   # 简化的图卷积：邻居聚合
        self.lstm = nn.LSTM(hidden, hidden, batch_first=True)
        self.head = nn.Linear(hidden, out_features)

    def forward(self, x, adjacency):
        # x: (batch, time, nodes, features)
        batch, time, nodes, _ = x.shape

        outputs = []
        for t in range(time):
            # 空间维度：用邻接矩阵加权聚合邻居
            aggregated = adjacency @ x[:, t, :, :]
            outputs.append(torch.relu(self.gcn(aggregated)))

        # 时间维度：把每个节点的时间序列交给 LSTM
        spatial = torch.stack(outputs, dim=1)           # (batch, time, nodes, hidden)
        spatial = spatial.permute(0, 2, 1, 3)           # (batch, nodes, time, hidden)
        spatial = spatial.reshape(batch * nodes, time, -1)

        sequence, _ = self.lstm(spatial)
        prediction = self.head(sequence[:, -1, :])
        return prediction.view(batch, nodes, -1)
\`\`\`

注意这里用的是简化版的图卷积（邻接矩阵加权聚合），实际项目中还需要考虑归一化与自环。

## 仿真框架比模型更重要

这个项目是仿真研究，没有真实边缘网络的负载数据，需要自行生成。而在没有统一实验框架的情况下，比较「不同的卸载与调度策略」是没有意义的——因为它们面对的场景可能根本不一样。

所以真正的工作量在于：

1. 用 Python 生成合理的节点拓扑与负载序列；
2. 构建图结构；
3. 在同一套场景下实现并对比多种卸载/调度策略。

模型只是框架里的一个可替换部件。**在这样的研究里，框架的可比性比单个模型的精度更值钱。**

## 代码

实现已开源：[Jsn-An/6G-GCNLSTM](https://github.com/Jsn-An/6G-GCNLSTM)。`,
  },
];

export const publishedPosts = [...posts].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);

export const postTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) =>
  a.localeCompare(b, 'zh-Hans-CN'),
);
