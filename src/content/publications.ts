/**
 * 论文与会议成果。
 *
 * 来源：《安泽祎个人简历.pdf》。PRD §10.2 曾把「是否单列论文分区」列为开放问题，
 * 这里不新增标签页，而是作为「荣誉」标签页下的一个分区呈现，
 * 保持 PRD §6.3 已定义的五个标签页结构不变。
 */
export interface Publication {
  id: string;
  title: string;
  /** 本人署名位置 */
  authorRole: string;
  /** 全部作者（原样保留简历写法） */
  authors: string;
  venue: string;
  status: string;
  url?: string;
}

export const publications: Publication[] = [
  {
    id: 'icmlc-2026-traffic-gnn',
    title:
      'Enhancing Spatiotemporal Graph Networks for Traffic Prediction with Multi-Scale Frequency and External Events',
    authorRole: '第一作者',
    authors: 'Zeyi An et al.',
    venue: 'Springer Nature, ICMLC 2026, Volume 1',
    status: '已录用，待发表',
  },
  {
    id: 'ship-detection-harmonic-ghost-yolo',
    title:
      'Towards Lightweight Ship Detection: Harmonic-Ghost YOLO and a Dedicated Ship Dataset',
    authorRole: '第三作者',
    authors: 'et al., Zeyi An',
    venue: '大连海事大学人工智能学院船舶目标检测课题',
    status: '已完成',
  },
];
