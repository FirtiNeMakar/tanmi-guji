import type { ExcavationScene } from "../types";

export const excavations: ExcavationScene[] = [
  {
    id: "dig-stratigraphy",
    title: "模拟聚落地层辨析",
    description: "练习观察叠压关系、层位记录和沉积扰动。",
    objective: "根据模拟土层记录发现物，说明上下层关系与证据限制。",
    simulated: true,
    layers: [
      { id: "surface", name: "表土层", depth: "0—20 厘米", description: "教学模拟层，含现代扰动示意；不对应真实遗址。", artifactIds: [] },
      { id: "occupation", name: "居住堆积层", depth: "20—45 厘米", description: "模拟生活堆积，观察陶器碎片与层位的关联。", artifactIds: ["banpo-face-fish-basin"] },
      { id: "earlier", name: "较早沉积层", depth: "45—70 厘米", description: "模拟较早沉积，不代表某真实文化的年代。", artifactIds: ["hemudu-rice"] },
    ],
    artifactIds: ["banpo-face-fish-basin", "hemudu-rice"],
    task: "逐层清理，记录两种教学材料出现的模拟层位，并说明为何不能只用深度判断绝对年代。",
    endCondition: "完成全部模拟层并打开两张材料卡片。",
    relatedLessonId: "lesson-stratigraphy",
  },
  {
    id: "dig-bronze-workshop",
    title: "模拟青铜作坊调查",
    description: "观察制作废料与成品材料如何帮助研究生产活动。",
    objective: "区分遗物和遗迹，认识工艺推断需要多类证据。",
    simulated: true,
    layers: [
      { id: "floor", name: "活动面", depth: "0—25 厘米", description: "教学模拟作坊地面，不对应任何实际遗址平面。", artifactIds: ["erlitou-bronze-jue"] },
      { id: "debris", name: "废弃堆积", depth: "25—50 厘米", description: "模拟生产废弃层，训练材料分类。", artifactIds: ["houmuwu-ding"] },
      { id: "subsoil", name: "下部沉积", depth: "50—75 厘米", description: "模拟自然沉积层；不为器物设定真实出土层位。", artifactIds: ["erlitou-turquoise-dragon"] },
    ],
    artifactIds: ["erlitou-bronze-jue", "houmuwu-ding", "erlitou-turquoise-dragon"],
    task: "发现教学材料后对照图鉴，区分青铜容器与镶嵌器物，并写出推断需要的额外证据。",
    endCondition: "完成全部模拟层并打开三张材料卡片。",
    relatedLessonId: "lesson-typology",
  },
  {
    id: "dig-mausoleum-context",
    title: "模拟陵园空间记录",
    description: "练习记录墓葬、陪葬坑和器物之间的空间关系。",
    objective: "理解陵园由多个遗迹构成，考古解释依赖位置和背景。",
    simulated: true,
    layers: [
      { id: "yard", name: "陵园地表", depth: "0—30 厘米", description: "教学示意空间，不是秦始皇陵真实测绘图。", artifactIds: ["qin-terracotta-kneeling-archer"] },
      { id: "pit", name: "陪葬坑模拟层", depth: "30—60 厘米", description: "模拟坑内材料记录，不对应真实坑内坐标。", artifactIds: ["qin-bronze-chariot"] },
      { id: "burial", name: "封土边缘模拟层", depth: "60—90 厘米", description: "教学情境；秦陵地宫未全面发掘，不能据此推演其内部。", artifactIds: ["changxin-lamp"] },
    ],
    artifactIds: ["qin-terracotta-kneeling-archer", "qin-bronze-chariot", "changxin-lamp"],
    task: "记录材料卡片对应的模拟单位，区分已知考古材料与教学情境设定。",
    endCondition: "完成全部模拟层并打开三张材料卡片。",
    relatedLessonId: "lesson-survey-record",
  },
];
