import type { Project } from '@/types/content';

/**
 * 项目。
 *
 * 来源：《安泽祎个人简历.pdf》「社会实践与科研经历」一节。
 *
 * ⚠️ 简历只提供了每个项目的一句话概述。下面的正文按「背景 / 挑战 / 方案 / 结果」
 *    四个分区组织，内容严格限定在简历已有的事实范围内，未编造任何指标或结论。
 *    标记 needsDetail 的项目需要本人补充细节（数据集规模、baseline、评价指标、
 *    最终数值等）。搜索 `needsDetail` 即可定位。
 */
export const projects: Project[] = [
  {
    slug: 'gnn-traffic-prediction',
    title: '基于多尺度频域与外部事件增强的 GNN 交通预测',
    summary:
      '在 CMU 教授指导下主导的城市交通时空预测研究，提出融合多尺度频域特征与外部事件信息的图神经网络改进方案，成果以第一作者发表于 ICMLC 2026。',
    description: `## 背景

城市交通流量预测依赖路网中节点之间的空间关联与时间上的周期规律。传统时序模型难以同时刻画这两类结构，而图神经网络（GNN）可以把路网建模为图，在节点之间传播信息，因此成为交通时空预测的主流方案。

本研究在 CMU 教授指导下开展，目标是改进现有 GNN 预测模型对**多尺度频域特征**与**外部事件信息**的利用能力。

## 挑战

- 交通流同时包含短时波动、日周期与周周期等多种时间尺度，单一尺度的建模容易顾此失彼。
- 现实中交通事故、天气、节假日等外部事件会显著改变流量分布，但常规模型只使用历史流量序列，无法感知这类信息。
- 路网规模带来的计算开销，要求在建模精度与训练成本之间做取舍。

## 方案

- 使用 Python（Pandas、NetworkX）完成原始数据处理与路网图构建，将路段抽象为节点、连通关系抽象为边。
- 针对时间尺度问题，引入多尺度频域特征，从频域角度刻画不同周期成分。
- 针对外部事件问题，将事件信息作为额外输入融合进模型。
- 设计并完成对比实验，验证上述改进相对基线模型的效果。

## 结果

- 完成模型改进与对比实验，并负责线上学术汇报与答辩展示。
- 以第一作者撰写会议论文《Enhancing Spatiotemporal Graph Networks for Traffic Prediction with Multi-Scale Frequency and External Events》，将发表于 Springer Nature，ICMLC 2026, Volume 1。`,
    role: '研究组负责人 · 第一作者',
    startDate: '2024-10',
    endDate: '2025-09',
    current: false,
    tech: ['Python', 'PyTorch', 'Pandas', 'NetworkX', '图神经网络'],
    tags: ['图神经网络', '时空预测', '科研'],
    featured: true,
    needsDetail: true,
  },
  {
    slug: 'edge-offloading-gcn-lstm',
    title: '基于 GCN-LSTM 的 5G/6G 边缘网络拥塞预测与任务卸载优化',
    summary:
      '香港大学工程学院 6G 与 AIoT 暑期课程的小组项目，用 Python 完成数据生成、图构建与多种卸载/调度策略的仿真对比，代码已开源。',
    description: `## 背景

6G 与 AIoT 场景下，终端设备产生的计算任务需要在边缘节点之间分配。边缘节点的负载分布随时间变化，如何预测拥塞并据此决定任务卸载到哪个节点，直接决定了系统的响应质量。

本项目为香港大学工程学院「6G 与人工智能物联网（AIoT）」暑期夏令营的小组作业，由本人担任小组组长。

## 挑战

- 边缘节点拓扑天然是图结构，节点负载之间存在相互影响，需要能同时建模空间依赖与时间演化的方法。
- 任务是仿真研究，需要自行构造合理的负载数据与场景。
- 卸载与调度策略有多种组合，需要统一实验框架才能公平比较。

## 方案

- 采用 GCN（图卷积）建模边缘节点之间的空间依赖，用 LSTM 建模负载的时间演化，构成 GCN-LSTM 预测模型。
- 用 Python 完成仿真所需数据的生成与图结构构建。
- 实现多种任务卸载与调度策略，在同一框架下做仿真对比。

## 结果

- 完成课程要求的 42 学时学习并交付小组项目。
- 代码开源至 GitHub：[Jsn-An/6G-GCNLSTM](https://github.com/Jsn-An/6G-GCNLSTM)。`,
    role: '小组组长',
    startDate: '2026-07',
    endDate: '2026-08',
    current: false,
    tech: ['Python', 'GCN', 'LSTM', '边缘计算'],
    tags: ['图神经网络', '边缘计算', '课程项目'],
    repoUrl: 'https://github.com/Jsn-An/6G-GCNLSTM',
    featured: true,
    needsDetail: true,
  },
  {
    slug: 'robot-vision-inspection',
    title: '智能机器人视觉感知系统',
    summary:
      '面向设备破损检测的机器人视觉感知系统，完成 YOLO 模型的训练、优化与部署，并接入 DeepSeek API 实现基于统计数据的智能问答。',
    description: `## 背景

设备表面破损检测长期依赖人工目视，效率低且难以保证一致性。项目目标是在机器人平台上构建一套视觉感知系统，自动完成破损类型的识别、计数与记录。

本人担任组长，负责目标检测与数据处理模块。

## 挑战

- 需要把模型真正跑在设备端，对推理速度与资源占用有实际约束。
- 识别结果不能只停留在画面上，还要与控制模块交互，并沉淀成可查询的结构化数据。
- 从模型到系统整合，涉及视觉、控制与后端多个环节的联调。

## 方案

- 基于 Python（OpenCV、PyTorch）搭建视觉处理链路。
- 完成 YOLO 模型的训练、优化与部署，实现目标检测与数据处理模块。
- 完成系统集成与联调，实现视觉识别结果与控制模块之间的数据交互。
- 实现设备端破损类型识别结果的实时分类计数与存储。
- 接入 DeepSeek API，支持基于统计数据与用户信息的智能问答交互。

## 结果

- 打通「识别 → 计数 → 存储 → 问答」的完整链路，系统在设备端完成集成与联调。`,
    role: '组长',
    startDate: '2025-03',
    endDate: '2025-08',
    current: false,
    tech: ['Python', 'OpenCV', 'PyTorch', 'YOLO', 'DeepSeek API'],
    tags: ['计算机视觉', '目标检测', '系统集成'],
    featured: true,
    needsDetail: true,
  },
  {
    slug: 'ship-detection-dataset',
    title: '轻量化船舶目标检测与专用数据集构建',
    summary:
      '大连海事大学人工智能学院船舶目标检测课题，负责数据预处理、标注与数据集构建，并以第三作者完成论文《Towards Lightweight Ship Detection》。',
    description: `## 背景

船舶目标检测在海上监管与航行安全场景中有明确需求，但通用检测数据集对船舶这一特定类别的覆盖往往不足，且海上场景的尺度变化与背景干扰明显。

本项目为大连海事大学人工智能学院课题，本人作为项目组成员参与。

## 挑战

- 缺少面向船舶的专用数据集，需要从零完成数据预处理、标注与数据集构建。
- 船舶目标在不同拍摄距离下尺度差异大，对轻量化模型的检测能力提出要求。

## 方案

- 负责数据预处理与数据标注，构建面向船舶检测的专用数据集。
- 协助完成模型的训练与评估工作。

## 结果

- 完成专用数据集构建，支撑课题的模型训练与评估。
- 以第三作者完成文章《Towards Lightweight Ship Detection: Harmonic-Ghost YOLO and a Dedicated Ship Dataset》。`,
    role: '项目组成员 · 第三作者',
    startDate: '2025-09',
    endDate: '2026-01',
    current: false,
    tech: ['Python', 'YOLO', '数据标注', '数据集构建'],
    tags: ['计算机视觉', '目标检测', '科研'],
    featured: false,
    needsDetail: true,
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export const allTags = Array.from(
  new Set(projects.flatMap((project) => project.tags)),
).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
