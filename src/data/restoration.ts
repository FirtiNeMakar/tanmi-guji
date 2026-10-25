import type { RestorationTask } from "../types";

export const restorationTasks: RestorationTask[] = [
  {
    id: "restore-yangshao-pot",
    title: "彩陶罐结构拼合",
    background: "以仰韶文化彩陶器为知识背景。拼片形状为教学示意，不是某件出土器物的真实碎片。",
    artifactId: "yangshao-painted-jar",
    fragments: [
      { id: "rim", name: "口沿片", target: "口沿位置", symbol: "⌒" },
      { id: "body", name: "腹部片", target: "器身位置", symbol: "◖" },
      { id: "base", name: "底部片", target: "器底位置", symbol: "⌣" },
    ],
    rule: "选择一个碎片，再点击器物相应部位；每个碎片只能放置一次。",
    explanation: "陶器拼合需要观察断口和纹饰连续性。真实修复不应为追求完整而强行拼接。",
  },
  {
    id: "restore-ding",
    title: "鼎形陶器部件识别",
    background: "以史前鼎形陶器为背景，学习辨认器身、器足和口部；部件为教学模型。",
    artifactId: "longshan-black-ding",
    fragments: [
      { id: "rim", name: "口部构件", target: "口部位置", symbol: "⌒" },
      { id: "body", name: "鼎身构件", target: "器身位置", symbol: "◖" },
      { id: "legs", name: "器足构件", target: "器足位置", symbol: "⋔" },
    ],
    rule: "先选碎片，再选择与结构相符的目标位；选错时会收到提示，允许继续尝试。",
    explanation: "器形分类基于可观察特征，功能判断还要结合器物痕迹和出土背景。",
  },
  {
    id: "restore-bell",
    title: "编钟结构认知",
    background: "以曾侯乙墓编钟为知识背景。该操作只学习部件关系，不复原真实钟组或音律。",
    artifactId: "marquis-yi-bells",
    fragments: [
      { id: "frame", name: "钟架", target: "支架位置", symbol: "╫" },
      { id: "bells", name: "钟体", target: "悬挂位置", symbol: "◉" },
      { id: "support", name: "底座", target: "底座位置", symbol: "▰" },
    ],
    rule: "按支撑结构、悬挂关系依次选择部件和对应位置。",
    explanation: "编钟是成组乐器；研究其音乐功能需结合器物形制、铭文、测音和墓葬背景。",
  },
  {
    id: "restore-lamp",
    title: "长信宫灯构件拼合",
    background: "以长信宫灯的结构为背景，拼合教学示意件；不模拟真实文物保护处理。",
    artifactId: "changxin-lamp",
    fragments: [
      { id: "body", name: "灯体", target: "灯体位置", symbol: "◖" },
      { id: "arm", name: "导烟部件", target: "导烟位置", symbol: "⌜" },
      { id: "base", name: "灯座", target: "灯座位置", symbol: "⌣" },
    ],
    rule: "观察灯体、导烟结构和底座的相对位置后操作。",
    explanation: "长信宫灯结构可拆卸并有导烟设计。教学拼合帮助认识结构，不代表真实修复方案。",
  },
  {
    id: "restore-chariot",
    title: "铜车马结构辨识",
    background: "以秦始皇陵铜车马为背景，学习车体、轮和构件关系；碎片是教学图示，不是真实出土碎片。",
    artifactId: "qin-bronze-chariot",
    fragments: [
      { id: "body", name: "车舆", target: "车舆位置", symbol: "▰" },
      { id: "wheel", name: "车轮", target: "车轮位置", symbol: "◉" },
      { id: "fitting", name: "连接构件", target: "连接位置", symbol: "⌁" },
    ],
    rule: "先选择构件，再点击车体示意图上的相应位置；选择错误可重新尝试。",
    explanation: "铜车马出土时破碎，经过考古清理、研究和保护修复。真实文物操作需专业人员实施。",
  },
];
