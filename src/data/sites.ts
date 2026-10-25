import type { SiteRecord } from "../types";
import { artifactSources } from "./artifacts";

const source = artifactSources.archaeologySource;
export const sites: SiteRecord[] = [
  { id: "jiahu", name: "贾湖遗址", location: "河南省舞阳县", period: "新石器时代", note: "以聚落、骨器和刻符等材料著称；刻符性质需谨慎讨论。", source },
  { id: "yangshao", name: "仰韶村遗址", location: "河南省渑池县", period: "新石器时代", note: "仰韶文化名称来源地。", source },
  { id: "banpo", name: "半坡遗址", location: "陕西省西安市", period: "新石器时代", note: "黄河中游重要聚落遗址，出土彩陶和房址等材料。", source },
  { id: "peiligang", name: "裴李岗遗址", location: "河南省新郑市", period: "新石器时代", note: "裴李岗文化命名遗址之一。", source },
  { id: "hemudu", name: "河姆渡遗址", location: "浙江省余姚市", period: "新石器时代", note: "出土稻谷等植物遗存、骨器和木构件。", source },
  { id: "liangzhu", name: "良渚遗址群", location: "浙江省杭州市余杭区", period: "新石器时代", note: "包含城址、墓地、水利系统等遗址要素。", source },
  { id: "hongshan", name: "红山文化遗址群", location: "内蒙古东南部、辽宁西部等地", period: "新石器时代", note: "区域文化遗址群，玉器及礼仪遗存是研究内容之一。", source },
  { id: "dawenkou", name: "大汶口文化遗址群", location: "山东及周边地区", period: "新石器时代", note: "具有区域和分期差异的考古学文化遗址群。", source },
  { id: "chengziya", name: "城子崖遗址", location: "山东省济南市章丘区", period: "新石器时代至历史时期", note: "龙山文化研究的重要遗址。", source },
  { id: "taosi", name: "陶寺遗址", location: "山西省襄汾县", period: "新石器时代晚期", note: "大型聚落及相关遗迹为研究社会复杂化提供材料。", source },
  { id: "erlitou", name: "二里头遗址", location: "河南省洛阳市偃师区", period: "青铜时代早期", note: "发现宫殿区、道路和手工业遗迹；与夏文化的关系仍需论证。", source },
  { id: "zhengzhou-shang", name: "郑州商城遗址", location: "河南省郑州市", period: "商代早期", note: "早商都邑遗址之一，出土城垣和青铜器等材料。", source },
  { id: "anying", name: "殷墟", location: "河南省安阳市", period: "商代晚期", note: "商代晚期都城遗址，出土甲骨刻辞、青铜器和墓葬等。", source },
  { id: "ningxiang", name: "宁乡青铜器出土地", location: "湖南省宁乡市及周边", period: "商代", note: "四羊方尊等青铜器出土地信息应以具体器物考古记录为准。", source },
  { id: "zhouyuan", name: "周原遗址", location: "陕西省宝鸡市扶风、岐山一带", period: "西周", note: "西周重要遗址区域，包含宫殿、墓葬和铸铜遗存。", source },
  { id: "jin-marquis-cemetery", name: "晋侯墓地", location: "山西省曲沃县北赵村", period: "西周至春秋", note: "晋国贵族墓地，为研究西周至春秋历史提供材料。", source },
  { id: "qin-shihuang-mausoleum", name: "秦始皇陵及兵马俑坑", location: "陕西省西安市临潼区", period: "秦代", note: "大型陵园遗址；俑坑为陵园组成部分，地宫未全面发掘。", source },
  { id: "liya", name: "里耶古城遗址", location: "湖南省龙山县", period: "秦代", note: "出土秦代简牍等材料，为研究基层行政提供重要证据。", source },
  { id: "mawangdui", name: "马王堆汉墓", location: "湖南省长沙市", period: "西汉", note: "出土帛画、漆器、简帛和纺织品等多类材料。", source },
  { id: "zhang-rong-cemetery", name: "章灵丘北墓地（张荣家族墓地）", location: "山东省济南市", period: "西汉至清代墓葬；张荣家族墓地为元代", note: "2021—2022年发掘清理墓葬102座；具体信息以发掘报告为准。", source: { title: "张荣家族墓地考古报道", organization: "济南市考古研究院 / 中国文物报", url: "https://mp.weixin.qq.com/s/VELo788qDpHyPxfJnjpF8Q" } },
  { id: "mancheng", name: "满城汉墓", location: "河北省保定市满城区", period: "西汉", note: "中山靖王刘胜及其妻窦绾墓葬群。", source },
  { id: "leitai", name: "雷台汉墓", location: "甘肃省武威市", period: "东汉", note: "出土铜奔马等器物，具体材料应参照馆藏资料。", source },
  { id: "marquis-yi", name: "曾侯乙墓", location: "湖北省随州市", period: "战国早期", note: "曾侯乙编钟等器物出土地点。", source },
  { id: "wangshan", name: "望山楚墓", location: "湖北省荆州市江陵区", period: "战国时期", note: "越王勾践剑出土墓地相关地点。", source },
];
