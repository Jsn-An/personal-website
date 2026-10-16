import type { SkillCategory } from '@/types/content';

/**
 * 技能分类与熟练度。
 *
 * 来源：《安泽祎个人简历.pdf》「技术能力」一节。
 * 熟练度按简历原文措辞映射：熟练掌握 → ADVANCED，熟悉 → INTERMEDIATE，了解 → BEGINNER。
 */
export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    name: '编程语言',
    slug: 'languages',
    order: 1,
    skills: [
      { id: 'python', name: 'Python', level: 'ADVANCED', featured: true, note: '数据处理与实验开发' },
      { id: 'c', name: 'C', level: 'ADVANCED', featured: true, note: '算法与程序设计' },
      { id: 'sql', name: 'SQL', level: 'INTERMEDIATE', featured: false },
      { id: 'verilog', name: 'Verilog HDL', level: 'BEGINNER', featured: false },
    ],
  },
  {
    id: 'ml-cv',
    name: '机器学习与计算机视觉',
    slug: 'ml-cv',
    order: 2,
    skills: [
      { id: 'pytorch', name: 'PyTorch', level: 'ADVANCED', featured: true, note: '模型训练与优化' },
      { id: 'gnn', name: '图神经网络（GNN）', level: 'INTERMEDIATE', featured: true, note: '交通时空预测' },
      { id: 'opencv', name: 'OpenCV', level: 'ADVANCED', featured: false },
      { id: 'yolo', name: 'YOLO 目标检测', level: 'ADVANCED', featured: true, note: '训练、优化与部署' },
      { id: 'pandas', name: 'Pandas', level: 'ADVANCED', featured: false },
      { id: 'networkx', name: 'NetworkX', level: 'INTERMEDIATE', featured: false, note: '图构建' },
    ],
  },
  {
    id: 'tools',
    name: '系统与工具',
    slug: 'tools',
    order: 3,
    skills: [
      { id: 'linux', name: 'Linux 命令行', level: 'ADVANCED', featured: true, note: '日常开发与调试' },
      { id: 'git', name: 'Git', level: 'ADVANCED', featured: false },
      { id: 'venv', name: 'conda / venv 虚拟环境', level: 'ADVANCED', featured: false },
      { id: 'docker', name: 'Docker', level: 'BEGINNER', featured: false, note: '基本使用' },
    ],
  },
  {
    id: 'hardware',
    name: '硬件与嵌入式',
    slug: 'hardware',
    order: 4,
    skills: [
      { id: 'mcu', name: '单片机原理与应用', level: 'INTERMEDIATE', featured: false },
      { id: 'pcb', name: 'PCB 设计流程', level: 'INTERMEDIATE', featured: false },
      { id: 'soldering', name: '手工焊接', level: 'INTERMEDIATE', featured: false, note: '基本技巧' },
      { id: 'vivado', name: 'Xilinx Vivado / FPGA', level: 'BEGINNER', featured: false },
    ],
  },
];

export const allSkills = skillCategories.flatMap((category) => category.skills);

export const featuredSkills = allSkills.filter((skill) => skill.featured);
