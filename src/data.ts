import type { Artifact, Layer } from "./types";

export const artifacts: Artifact[] = [
  {
    id: "pottery-01",
    name: "陶制容器残片",
    chineseName: "陶器碎片",
    period: "古代聚落教学模型",
    material: "烧制黏土",
    purpose: "可能用于储存或烹饪食物",
    layer: 2,
    description: "器物口沿和纹饰可用于对比同类器物，判断时还应结合出土层位和位置。",
    symbol: "◒",
  },
  {
    id: "coin-01",
    name: "古钱币教学模型",
    chineseName: "古钱币",
    period: "教学模型",
    material: "仿青铜材料",
    purpose: "交易与结算",
    layer: 3,
    description: "形制、铭文和金属成分能够提供线索，断代还需多项独立证据相互印证。",
    symbol: "◎",
  },
  {
    id: "boneflute-01",
    name: "骨笛教学模型",
    chineseName: "骨笛模型",
    period: "教学模型",
    material: "安全仿骨材料",
    purpose: "可能用于演奏或仪式",
    layer: 3,
    description: "器物用途需要证据支持。考古学家会结合形制、加工痕迹和出土背景进行推断。",
    symbol: "♬",
  },
];

export const layers: Layer[] = [
  { id: 1, title: "表土层", chineseTitle: "第一层 · 表土", depth: "0–20 厘米", description: "含植物根系和现代混入物，土层可能受到扰动。", color: "#D9BC91" },
  { id: 2, title: "文化层", chineseTitle: "第二层 · 文化层", depth: "20–45 厘米", description: "本教学探方的这一层埋有陶器碎片。", color: "#B7835C", artifactId: "pottery-01" },
  { id: 3, title: "深层", chineseTitle: "第三层 · 深层", depth: "45–70 厘米", description: "本教学探方的深层埋有两件教学标本。", color: "#80563F", artifactId: "coin-01" },
];