import type { TimelineEntry } from '@/types/content';

/**
 * 经历、教育、荣誉、社会服务。
 *
 * 来源：《安泽祎个人简历.pdf》。
 * 个人页据此拆成「经历 / 教育 / 荣誉」三个标签页分区（PRD §6.3）。
 */
export const timeline: TimelineEntry[] = [
  {
    id: 'hku-6g-aiot',
    type: 'WORK',
    organization: '香港大学工程学院',
    role: '6G 与人工智能物联网（AIoT）暑期夏令营 · 小组组长',
    description: `- 完成 6G 与 AIoT 共 42 学时暑期课程，学习 6G 网络、边缘计算、AIoT 及无线通信中的研究和应用
- 带领小组完成项目「基于 GCN-LSTM 的 5G/6G 边缘网络拥塞预测与任务卸载优化」
- 使用 Python 完成数据生成、图构建及多种卸载/调度策略的仿真对比，代码开源至 GitHub`,
    startDate: '2026-07',
    endDate: '2026-08',
    current: false,
    url: 'https://github.com/Jsn-An/6G-GCNLSTM',
  },
  {
    id: 'ship-detection',
    type: 'WORK',
    organization: '大连海事大学 人工智能学院',
    role: '船舶目标检测研究项目 · 项目组成员',
    description: `- 参加本校人工智能学院船舶目标检测课题
- 负责数据预处理、数据标注与数据集构建
- 协助完成模型训练与评估工作
- 以第三作者完成文章《Towards Lightweight Ship Detection: Harmonic-Ghost YOLO and a Dedicated Ship Dataset》`,
    startDate: '2025-09',
    endDate: '2026-01',
    current: false,
  },
  {
    id: 'robot-vision',
    type: 'WORK',
    organization: '智能机器人视觉感知系统',
    role: '组长',
    description: `- 机器人视觉感知系统研发，完成目标检测与数据处理模块实现
- 基于 Python（OpenCV、PyTorch）实现 YOLO 模型训练、优化与部署
- 完成系统集成与联调，实现视觉识别结果与控制模块的数据交互
- 实现设备端破损类型识别结果的实时分类计数与存储，接入 DeepSeek API，支持基于统计数据的智能问答交互`,
    startDate: '2025-03',
    endDate: '2025-08',
    current: false,
  },
  {
    id: 'gnn-traffic',
    type: 'WORK',
    organization: '图神经网络交通预测学习研究',
    role: '研究组负责人',
    description: `- 在 CMU 教授指导下，主导完成基于图神经网络（GNN）的城市交通时空预测研究
- 使用 Python（Pandas、NetworkX）完成数据处理、图构建与模型训练
- 基于多尺度频域特征与外部事件信息改进模型，完成对比实验
- 负责线上学术汇报与答辩展示，讲解研究内容与实验结果
- 以第一作者撰写会议论文《Enhancing Spatiotemporal Graph Networks for Traffic Prediction with Multi-Scale Frequency and External Events》，将发表于 Springer Nature, ICMLC 2026, Volume 1`,
    startDate: '2024-10',
    endDate: '2025-09',
    current: false,
  },
  {
    id: 'volunteer-teaching',
    type: 'SERVICE',
    organization: '河南汝州焦村小学',
    role: '暑期乡村支教实践 · 支教团成员',
    description: `- 担任体育、数学老师，以专业能力教授、训练小学生乒乓球
- 承担团队成员的行程安排、票务与早晚餐食烹制等后勤保障工作`,
    startDate: '2024-07',
    endDate: '2024-08',
    current: false,
  },
  {
    id: 'dlmu-cs',
    type: 'EDUCATION',
    organization: '大连海事大学',
    role: '计算机科学与技术 · 在读本科生（拔尖实验班）',
    description: `- 绩点排名前十五（拔尖实验班独立排名）
- 专业课成绩突出：计算机组成原理、计算机系统结构、人工智能、信息系统等
- 英语六级 529，雅思（学术）6.5`,
    startDate: '2023-09',
    endDate: '2027-06',
    current: true,
  },
  {
    id: 'award-robot-2025',
    type: 'AWARD',
    organization: '第二十七届中国机器人及人工智能大赛',
    role: '全国总决赛 一等奖',
    description: '',
    startDate: '2025-01',
    endDate: '2025-12',
    current: false,
  },
  {
    id: 'award-lanqiao-2025',
    type: 'AWARD',
    organization: '第十六届蓝桥杯全国软件和信息技术专业人才大赛',
    role: '辽宁赛区 三等奖',
    description: '',
    startDate: '2025-01',
    endDate: '2025-12',
    current: false,
  },
  {
    id: 'award-scholarship-activity-2024',
    type: 'AWARD',
    organization: '大连海事大学',
    role: '单项奖学金 · 竞赛活动奖',
    description: '',
    startDate: '2024-01',
    endDate: '2024-12',
    current: false,
  },
  {
    id: 'award-scholarship-2024',
    type: 'AWARD',
    organization: '大连海事大学',
    role: '优秀学生奖学金 三等奖',
    description: '',
    startDate: '2024-01',
    endDate: '2024-12',
    current: false,
  },
];

export const timelineByType = {
  work: timeline.filter((entry) => entry.type === 'WORK' || entry.type === 'SERVICE'),
  education: timeline.filter((entry) => entry.type === 'EDUCATION'),
  awards: timeline.filter((entry) => entry.type === 'AWARD'),
};
