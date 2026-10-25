import type { ArtifactRecord, ContentSource, TeachingImage } from "../types";
import { quizzes } from "./quizzes";

const archaeologySource: ContentSource = {
  title: "中国考古网",
  organization: "中国社会科学院考古研究所",
  url: "https://www.kaogu.cn/",
};
const museumSource: ContentSource = {
  title: "中国国家博物馆",
  organization: "中国国家博物馆",
  url: "https://www.chnmuseum.cn/",
};
const heritageSource: ContentSource = {
  title: "国家文物局",
  organization: "国家文物局",
  url: "https://www.ncha.gov.cn/",
};
const missingImage = (): TeachingImage => ({
  url: null,
  alt: "图片暂缺",
  attribution: "尚未核实可合法使用的对应馆藏图片",
  license: "未确认开放许可，不展示第三方图片",
  sourceUrl: null,
});
const record = (
  id: string,
  name: string,
  period: string,
  dateRange: string,
  findspot: string,
  material: string,
  technique: string,
  use: string,
  feature: string,
  siteId: string,
  articleIds: string[],
  terms: string[],
  source: ContentSource = archaeologySource,
): ArtifactRecord => ({
  id, name, period, dateRange, findspot, material, technique, use,
  features: [feature],
  siteId,
  image: missingImage(),
  source,
  articleIds,
  terms,
  quizIds: quizzes.filter((question) => question.artifactId === id || Boolean(question.articleId && articleIds.includes(question.articleId))).map(({ id: quizId }) => quizId),
});

export const artifacts: ArtifactRecord[] = [
  record("jiahu-bone-flute", "贾湖骨笛", "新石器时代", "约公元前7000—前5700年", "河南舞阳贾湖遗址", "鹤类等鸟类骨骼", "钻孔制笛，孔数与笛体因个体而异", "可能用于发声或音乐活动；具体场景需结合研究讨论", "是研究早期音声活动和骨器加工的重要材料", "jiahu", ["neolithic-settlements"], ["bone-tool", "context", "use-wear"]),
  record("jiahu-turtle-shell", "贾湖刻符龟甲", "新石器时代", "约公元前7000—前5700年", "河南舞阳贾湖遗址", "龟甲", "刻划符号", "用途和符号性质尚未定论，不能直接等同成熟文字", "刻符的功能、与文字关系仍属研究问题", "jiahu", ["neolithic-settlements", "archaeology-method"], ["inscription", "hypothesis", "context"]),
  record("banpo-face-fish-basin", "人面鱼纹彩陶盆", "新石器时代仰韶文化", "约公元前4800—前4300年（半坡遗址相关年代框架）", "陕西西安半坡遗址墓葬", "陶", "泥条盘筑、彩绘后烧制", "曾用于丧葬相关情境；图像含义有不同解释", "人面与鱼纹组合显著，需结合墓葬背景理解", "banpo", ["yangshao-painted-pottery"], ["pottery", "burial-context", "typology"], museumSource),
  record("yangshao-pointed-bottle", "仰韶尖底瓶", "新石器时代仰韶文化", "约公元前5000—前3000年（类型和区域有差异）", "黄河中游多处仰韶文化遗址", "陶", "泥条盘筑、拍打成形", "常见生活陶器；具体使用方式需依据器形及痕迹分析", "尖底、双耳等形制可用于类型学比较", "yangshao", ["yangshao-painted-pottery"], ["typology", "use-wear", "archaeological-culture"]),
  record("yangshao-painted-jar", "仰韶彩陶罐", "新石器时代仰韶文化", "约公元前5000—前3000年（区域分期存在差异）", "黄河中游仰韶文化遗址", "陶、矿物颜料", "陶坯表面绘彩并烧制", "日常生活或仪式用途需结合出土情境判断", "纹样与器形可比较不同遗址和阶段", "yangshao", ["yangshao-painted-pottery"], ["pottery", "typology", "context"]),
  record("hemudu-rice", "河姆渡稻谷遗存", "新石器时代河姆渡文化", "约公元前5000—前3300年", "浙江余姚河姆渡遗址", "植物遗存（稻谷、稻壳等）", "炭化和水浸环境保存，具体样本状态有差异", "研究稻作、植物利用和环境适应", "需通过植物考古和出土层位分析，不能只凭单粒样本概括农业体系", "hemudu", ["hemudu-rice", "neolithic-settlements"], ["archaeobotany", "stratigraphy", "subsistence"]),
  record("hemudu-bone-spade", "河姆渡骨耜", "新石器时代河姆渡文化", "约公元前5000—前3300年", "浙江余姚河姆渡遗址", "动物肩胛骨等骨材", "加工、磨制并穿孔装柄", "可能用于翻土等生产活动，具体用途结合痕迹和环境判断", "骨制农具与稻作遗存共同提供生计证据", "hemudu", ["hemudu-rice", "neolithic-settlements"], ["bone-tool", "subsistence", "use-wear"]),
  record("hemudu-ivory-bird", "河姆渡双鸟朝阳纹象牙器", "新石器时代河姆渡文化", "约公元前5000—前3300年", "浙江余姚河姆渡遗址", "象牙", "雕刻、镂刻和磨制", "图像意义与具体功能尚不能仅凭纹样确定", "双鸟与太阳形象组合，是研究史前雕刻和图像表达的材料", "hemudu", ["hemudu-rice"], ["iconography", "context", "craft"]),
  record("liangzhu-jade-cong", "良渚玉琮", "新石器时代良渚文化", "约公元前3300—前2300年", "良渚遗址群及长江下游相关遗址", "软玉", "切割、钻孔、琢磨和抛光", "用于礼仪或身份表达的解释较常见，具体意义需谨慎", "方柱形外廓与圆形内孔等特征具有代表性", "liangzhu", ["neolithic-settlements"], ["jade", "ritual", "craft"]),
  record("liangzhu-jade-bi", "良渚玉璧", "新石器时代良渚文化", "约公元前3300—前2300年", "良渚遗址群", "软玉", "片切、钻孔、磨制和抛光", "可能具有礼仪或身份意义，具体用途非单一结论", "圆形扁平器形常与墓葬组合关系一并研究", "liangzhu", ["neolithic-settlements"], ["jade", "burial-context", "typology"]),
  record("liangzhu-stone-axe", "良渚石钺", "新石器时代良渚文化", "约公元前3300—前2300年", "良渚文化墓葬和聚落遗址", "石", "磨制、刃部加工", "可能兼具实用、仪式或身份象征功能，需看具体个体与背景", "形制和刃部痕迹帮助判断功能与使用史", "liangzhu", ["neolithic-settlements"], ["use-wear", "burial-context", "typology"]),
  record("hongshan-jade-dragon", "红山文化玉龙", "新石器时代红山文化", "约公元前4500—前3000年", "内蒙古赤峰、辽宁西部红山文化分布区", "玉石", "琢制、磨光、穿孔", "功能和象征含义有多种解释", "卷曲动物形玉器具有鲜明造型；须避免把后世龙观念直接套用", "hongshan", ["neolithic-settlements"], ["jade", "iconography", "hypothesis"]),
  record("dawenkou-white-pottery", "大汶口白陶鬶", "新石器时代大汶口文化", "约公元前4300—前2500年（区域分期概述）", "山东及周边大汶口文化遗址", "白陶", "成形、烧制，器形具流和足", "可能用于炊煮或盛液，需结合使用痕迹与组合判断", "器形复杂，体现制陶技术发展", "dawenkou", ["neolithic-settlements"], ["pottery", "typology", "use-wear"]),
  record("longshan-eggshell-cup", "蛋壳黑陶高柄杯", "新石器时代龙山文化", "约公元前2500—前1900年（地区差异）", "山东龙山文化遗址，以日照两城镇等发现著称", "陶", "精细轮制、镂孔和磨光，器壁极薄", "可能用于特定礼仪或宴饮场景，具体功能需结合出土组合", "胎薄、柄高、制作精细，是龙山制陶代表类型", "chengziya", ["longshan-society"], ["craft", "typology", "diagnostic-trait"]),
  record("longshan-black-ding", "龙山文化黑陶鼎", "新石器时代龙山文化", "约公元前3000—前1900年（区域差异）", "黄河中下游多处龙山时代遗址", "黑陶", "泥条盘筑或轮制，表面打磨并控制烧成气氛", "炊煮或盛放用途需结合器形、烟炱和残留物判断", "黑色表面与鼎形器足是比较研究线索", "chengziya", ["longshan-society"], ["typology", "use-wear", "context"]),
  record("erlitou-turquoise-dragon", "二里头绿松石龙形器", "青铜时代早期二里头文化", "约公元前二千纪前半叶", "河南偃师二里头遗址墓葬", "绿松石片、漆木等复合材料", "多块绿松石片镶嵌组合", "具体象征意义尚待讨论", "呈龙形组合，是二里头遗址重要镶嵌工艺遗物", "erlitou", ["erlitou"], ["inlay", "context", "hypothesis"]),
  record("erlitou-bronze-jue", "二里头青铜爵", "青铜时代早期二里头文化", "约公元前二千纪前半叶", "河南偃师二里头遗址", "铜合金", "陶范铸造", "可能用于温酒或礼仪活动，功能判断依器形与情境", "属于早期青铜容器材料，有助研究青铜铸造发展", "erlitou", ["erlitou", "shang-bronze"], ["bronze", "mold-casting", "typology"]),
  record("erlitou-turquoise-inlay", "二里头绿松石镶嵌饰件", "青铜时代早期二里头文化", "约公元前二千纪前半叶", "河南偃师二里头遗址", "绿松石、铜或漆木等复合材料", "切割、钻孔、拼嵌", "装饰或礼仪用途仍需具体出土信息支持", "反映复合材料加工和专业手工业", "erlitou", ["erlitou"], ["inlay", "craft-specialization", "context"]),
  record("duling-square-ding", "杜岭方鼎", "商代早期", "约公元前二千纪中期", "河南郑州商城遗址相关发现", "铜合金", "陶范分铸", "礼仪活动解释需结合出土背景和同类器物", "郑州商城出土的大型商代青铜器，体现早商铸造水平", "zhengzhou-shang", ["shang-bronze"], ["bronze", "mold-casting", "context"]),
  record("houmuwu-ding", "后母戊鼎", "商代晚期", "约公元前13世纪—前11世纪", "河南安阳殷墟武官村", "铜合金", "多块陶范组合铸造", "大型礼仪性青铜容器；具体使用史需结合铭文和背景讨论", "大型方鼎，内壁有“后母戊”铭文", "anying", ["shang-bronze", "oracle-bone"], ["bronze", "inscription", "mold-casting"], museumSource),
  record("siyang-fangzun", "四羊方尊", "商代晚期", "约公元前13世纪—前11世纪", "湖南宁乡黄材一带出土", "铜合金", "分铸、合范等复杂铸造工艺", "礼仪性容器解释常见，仍需与同类器物比较", "尊体四角饰羊，造型与铸造结合复杂", "ningxiang", ["shang-bronze"], ["bronze", "mold-casting", "iconography"], museumSource),
  record("oracle-bone-scapula", "殷墟牛肩胛骨刻辞", "商代晚期", "约公元前13世纪—前11世纪", "河南安阳殷墟遗址", "牛肩胛骨", "钻凿、灼烧与刻写", "记录王室占卜相关内容", "刻辞常涉及贞问和占卜记录，许多片段残缺", "anying", ["oracle-bone", "archaeology-method"], ["inscription", "epigraphy", "context"]),
  record("oracle-turtle-plastron", "殷墟龟甲刻辞", "商代晚期", "约公元前13世纪—前11世纪", "河南安阳殷墟遗址", "龟甲", "钻凿、灼烧与刻写", "记录王室占卜相关内容", "甲骨材料需依辞例、字形和出土关系释读", "anying", ["oracle-bone"], ["inscription", "epigraphy", "provenience"]),
  record("li-gui", "利簋", "西周早期", "约公元前11世纪", "陕西临潼零口镇出土", "青铜", "陶范铸造并铸铭", "盛食器，铭文记录周初相关事件", "铭文记载武王伐商相关内容，是研究周初历史的重要材料", "zhouyuan", ["zhou-ritual-bronze"], ["bronze-inscription", "chronology", "context"], museumSource),
  record("mao-gong-ding", "毛公鼎", "西周晚期", "约公元前9世纪", "清道光年间出土于陕西岐山一带（具体出土情形为历史记录）", "青铜", "陶范铸造并铸长篇铭文", "礼仪性器物；铭文记录册命内容", "长篇铭文是研究西周晚期政治和文字的重要材料", "zhouyuan", ["zhou-ritual-bronze"], ["bronze-inscription", "epigraphy", "ritual"], museumSource),
  record("marquis-yi-bells", "曾侯乙编钟", "战国早期", "公元前433年墓葬纪年", "湖北随州曾侯乙墓", "青铜", "分铸、合铸及调音加工", "礼乐演奏", "成套钟体及音列为研究先秦音乐和铸造技术提供资料", "marquis-yi", ["zhou-ritual-bronze"], ["bronze", "ritual", "burial-context"], museumSource),
  record("yue-goujian-sword", "越王勾践剑", "春秋晚期", "约公元前5世纪", "湖北江陵望山楚墓", "铜合金", "铸造、磨制和装饰", "兵器", "剑身铭文与墓葬出土背景是研究其归属和流传的重要证据", "wangshan", ["zhou-ritual-bronze"], ["inscription", "bronze", "burial-context"], museumSource),
  record("qin-standard-weight", "秦诏版铜权", "秦代", "公元前221年后", "传世与考古发现有多个实例，单件需以其馆藏记录为准", "铜", "铸造并刻/铸诏文", "度量衡器具，用于重量标准", "诏文可研究秦统一后的制度传播；出土地不应笼统套用到所有实例", "qin-shihuang-mausoleum", ["qin-unification"], ["measurement", "inscription", "provenience"], heritageSource),
  record("qin-terracotta-kneeling-archer", "秦始皇陵兵马俑跪射俑", "秦代", "公元前3世纪", "陕西临潼秦始皇陵兵马俑坑", "陶", "模制、塑制、分件组合并烧制", "陵园陪葬俑群的一部分", "跪姿和装备细节可用于研究俑群编组及制作流程", "qin-shihuang-mausoleum", ["qin-mausoleum"], ["mausoleum", "typology", "context"], heritageSource),
  record("qin-terracotta-general", "秦始皇陵兵马俑将军俑", "秦代", "公元前3世纪", "陕西临潼秦始皇陵兵马俑坑", "陶", "塑制、模制、分件组合并烧制", "陵园陪葬俑群的一部分", "俑的等级和身份判断依据服饰、冠饰、位置等组合特征", "qin-shihuang-mausoleum", ["qin-mausoleum"], ["mausoleum", "typology", "context"], heritageSource),
  record("qin-bronze-chariot", "秦始皇陵铜车马", "秦代", "公元前3世纪", "陕西临潼秦始皇陵封土西侧陪葬坑", "铜、金银等", "铸造、焊接和装配等复合工艺", "模拟车舆及出行场景", "出土时为破碎状态，经过科学清理和保护修复后展示", "qin-shihuang-mausoleum", ["qin-unification", "qin-mausoleum"], ["conservation", "craft", "context"], heritageSource),
  record("mawangdui-silk-painting", "马王堆一号汉墓T形帛画", "西汉早期", "墓葬下葬年代约公元前2世纪", "湖南长沙马王堆一号汉墓棺椁上方", "丝织物、颜料", "绘制于帛面", "丧葬仪式和墓葬观念研究材料，图像解释需标明假说", "保存状况特殊，画面分层和图像组合常用于讨论汉代宇宙观", "mawangdui", ["han-tombs-silkroad"], ["craft", "burial-context", "hypothesis"], heritageSource),
  record("changxin-lamp", "长信宫灯", "西汉", "约公元前2世纪", "河北满城中山靖王刘胜墓", "鎏金铜", "分铸、装配，灯体可拆卸清理", "照明；结构设计有助导烟", "宫女形象灯体兼具照明功能与精细结构", "mancheng", ["han-tombs-silkroad"], ["bronze", "conservation", "craft"], museumSource),
  record("gold-thread-jade-suit", "金缕玉衣", "西汉", "公元前2世纪", "河北满城中山靖王刘胜墓", "玉片、金丝", "玉片加工后以金丝编缀", "丧葬用品，体现汉代丧葬观念与身份表达", "玉片数量和编缀方式依个体而异，不能泛化所有玉衣", "mancheng", ["han-tombs-silkroad"], ["jade", "burial-context", "craft"], museumSource),
  {
    id: "zhang-rong-four-handle-vase",
    name: "张荣家族墓地出土四系瓶",
    period: "元代墓地相关出土器物",
    dateRange: "具体墓葬单位和年代未在报道摘要中列明",
    findspot: "山东济南章灵丘北墓地",
    material: "原报道图注称“四系瓶”；材质参数需查阅发掘报告",
    technique: "现有摘要未提供具体制作工艺信息",
    use: "用途需结合器物形制、材质和出土单位研究",
    features: ["报道图注记为张荣家族墓地出土四系瓶；不据此推断未提供的细节"],
    siteId: "zhang-rong-cemetery",
    image: missingImage(),
    source: {
      title: "十大考古参评项目 | 山东元代济南王张荣家族墓地",
      organization: "济南市考古研究院 / 中国文物报",
      url: "https://mp.weixin.qq.com/s/VELo788qDpHyPxfJnjpF8Q",
    },
    articleIds: ["zhang-rong-family-tombs"],
    terms: ["burial-context", "provenience"],
    quizIds: ["q-zhang-rong-context", "q-zhang-rong-statistics", "q-zhang-rong-evidence"],
  },
];

export const artifactSources = { archaeologySource, museumSource, heritageSource };
