import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronRight, Footprints, MapPin, Medal, Pickaxe, RotateCcw, Sparkles, Star } from "lucide-react";
import BottomNav from "./components/BottomNav";
import ArtifactModal from "./components/ArtifactModal";
import ExcavationCanvas from "./components/ExcavationCanvas";
import ContentHub from "./components/ContentHub";
import RestorationWorkshop from "./components/RestorationWorkshop";
import { articles, artifacts, excavations, lessons, quizzes, restorationTasks } from "./data/index";
import type { ArtifactRecord, TabId } from "./types";

import { STORAGE_KEY, initialState, readSaved, markArtifactStudied, recordExcavationFind, resetExcavationScene, setExcavationProgress } from './progress';
import type { SavedState } from './progress';
const tabs: TabId[] = ['home', 'dig', 'restore', 'passport', 'discover', 'settings'];
function readTab(): TabId { const tab = location.hash.slice(1).split("/")[0]; return tabs.includes(tab as TabId) ? tab as TabId : 'home'; }
function readTheme(): 'light' | 'dark' { try { return localStorage.getItem('tanmi-guji-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } }

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(readTab);
  const [saved, setSaved] = useState<SavedState>(readSaved);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactRecord | null>(null);
  const [activeLayer, setActiveLayer] = useState(1);
  const [activeSceneId, setActiveSceneId] = useState(excavations[0].id);
  const [theme, setTheme] = useState(readTheme);
  const [storageError, setStorageError] = useState('');
  const tr = (text: string) => text;
  const activeScene = excavations.find(({ id }) => id === activeSceneId) ?? excavations[0];
  const discoveredArtifactIds = [...new Set([...saved.foundIds, ...Object.values(saved.excavationFoundArtifactIds).flat()])];

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); setStorageError(''); }
    catch { setStorageError('无法保存进度，请允许浏览器存储；本次探索仍可继续。'); }
  }, [saved]);
  useEffect(() => {
    const sync = () => { setActiveTab(readTab()); setSelectedArtifact(null); };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useEffect(() => {
    if (readTab() !== activeTab) location.hash = activeTab;
    window.scrollTo(0, 0);
  }, [activeTab]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#242923' : '#fbf8f0');
    try { localStorage.setItem('tanmi-guji-theme', theme); }
    catch { setStorageError('无法保存设置，请允许浏览器存储；当前主题已生效。'); }
  }, [theme]);
  useEffect(() => { document.documentElement.lang = "zh-CN"; document.title = "探秘古迹 · 考古研学"; }, []);

  const updateSaved = (updater: (current: SavedState) => SavedState) => setSaved(updater);
  const claimStamp = (id: string) => {
    updateSaved((current) => current.stamps.includes(id) ? current : ({
      ...current, stamps: [...current.stamps, id], points: Math.min(Number.MAX_SAFE_INTEGER, current.points + 20),
    }));
  };

  const renderHome = () => (
    <>
      <section className="hero-card">
        <div className="hero-topline"><span className="hero-mark">探</span><span>{tr("时空探险家 · 探索历史")}</span></div>
        <div className="hero-copy">
          <div className="eyebrow light">{tr("沉浸式考古研学平台")}</div>
          <h1>{tr("探秘古迹")}</h1>
          <p className="slogan">{tr("指尖上的考古，")}<br />{tr("行走的历史课。")}</p>
          <p className="hero-ru">{tr("轻触泥土，寻找文明的线索。")}<br />{tr("在探索中读懂历史。")}</p>
          <button className="hero-button" onClick={() => setActiveTab("dig")}>{tr("开始探索")} <ArrowRight size={17} /><small>{tr("云探方")}</small></button>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="sun-disc" /><div className="hero-mountain mountain-a" /><div className="hero-mountain mountain-b" />
          <div className="hero-grid"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="hero-pot">◒</div>
          <div className="hero-stamp">考<br /><small>古</small></div>
        </div>
        <div className="hero-footer"><span><MapPin size={13} /> {tr("云端考古现场")}</span><span>{tr("一号探方")}</span></div>
      </section>

      <section className="stats-strip">
        <div><span className="stat-icon"><Pickaxe size={17} /></span><strong>{discoveredArtifactIds.length}</strong><small>{tr("发现线索")}</small></div>
        <div><span className="stat-icon"><Star size={17} /></span><strong>{saved.points}</strong><small>{tr("研学积分")}</small></div>
        <div><span className="stat-icon"><StampIcon /></span><strong>{saved.stamps.length}</strong><small>{tr("探索印章")}</small></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="eyebrow">{tr("探索日志")}</div><h2>{tr("今日研学任务")}</h2><p>{tr("完成任务，记录今天的发现")}</p></div><span className="date-pill">{tr("第一天")}</span></div>
        <button className="mission-feature" onClick={() => setActiveTab("dig")}>
          <div className="mission-art"><div className="mini-pot">◒</div><span>{tr("任务 01")}</span></div>
          <div className="mission-text"><span className="mission-kicker">{tr("核心体验")}</span><h3>{tr("消失的古代村落")}</h3><p>{tr("从地层线索重现聚落生活")}</p><div className="mission-bottom"><span><Layers3Icon /> {tr("3 个地层")}</span><strong>{tr("开始")} <ChevronRight size={15} /></strong></div></div>
        </button>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="eyebrow">{tr("探索与学习")}</div><h2>{tr("探索工具")}</h2><p>{tr("发掘线索，修复器物，学习历史")}</p></div></div>
        <div className="feature-grid">
          <button className="feature-card feature-dig" onClick={() => setActiveTab("dig")}><span className="feature-icon"><Pickaxe size={22} /></span><strong>{tr("云探方")}</strong><small>{tr("指尖发掘历史")}</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-restore" onClick={() => setActiveTab("restore")}><span className="feature-icon"><RotateCcw size={22} /></span><strong>{tr("文物修复")}</strong><small>{tr("让残片重现器形")}</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-passport" onClick={() => setActiveTab("passport")}><span className="feature-icon"><StampIcon /></span><strong>{tr("研学护照")}</strong><small>{tr("收藏探索足迹")}</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-quiz" onClick={() => setActiveTab("discover")}><span className="feature-icon"><BookOpen size={22} /></span><strong>{tr("博古通今")}</strong><small>{tr("学习器物知识")}</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
        </div>
      </section>

      <section className="quote-card"><div className="quote-mark">“</div><p>{tr("每一件文物，都是一段等待被发现的历史。")}</p><small>{tr("循着线索，聆听历史的回响。")}</small></section>
    </>
  );

  const renderDig = () => {
    const foundIds = saved.excavationFoundArtifactIds[activeScene.id] ?? [];
    const layer = activeScene.layers[Math.min(activeLayer - 1, activeScene.layers.length - 1)];
    return <>
      <PageTitle eyebrow="教学模拟场景" title="云探方" subtitle="指尖发掘历史" description="练习记录教学场景中的发现物、层位和证据；所有场景均为模拟，不是实际遗址或发掘记录。" />
      <div className="notice-card"><Sparkles size={17} /><span><strong>考古提示</strong><small>地层先后关系有助于解释发现背景，但土层可能受扰动；深度不能直接等同于绝对年代。</small></span></div>
      <div className="hub-nav excavation-scene-nav" aria-label="选择教学模拟场景">
        {excavations.map((scene, index) => <button key={scene.id} className={scene.id === activeScene.id ? "active" : ""} onClick={() => { setActiveSceneId(scene.id); setActiveLayer(1); }}>{index + 1}. {scene.title}</button>)}
      </div>
      <section className="learning-card scene-goal"><strong>学习目标</strong><p>{activeScene.objective}</p><p>{activeScene.task}</p><small>完成条件：{activeScene.endCondition}</small></section>
      <div className="layer-selector">
        {activeScene.layers.map((item, index) => <button key={item.id} className={`layer-chip ${activeLayer === index + 1 ? "selected" : ""}`} onClick={() => setActiveLayer(index + 1)}><i /><span>{item.name}</span></button>)}
      </div>
      <div className="selected-layer-info"><div><strong>{layer.name}</strong><small>{layer.description}</small></div><span>{layer.depth}</span></div>
      <ExcavationCanvas
        scene={activeScene}
        foundIds={foundIds}
        progress={saved.excavationProgress[activeScene.id] ?? 0}
        onProgress={(progress) => updateSaved((current) => setExcavationProgress(current, activeScene.id, progress))}
        onFound={(artifact, layerId) => {
          updateSaved((current) => recordExcavationFind(current, activeScene.id, artifact.id, layerId));
          setSelectedArtifact(artifact);
        }}
        onLayerChange={setActiveLayer}
        onReset={() => updateSaved((current) => resetExcavationScene(current, activeScene.id))}
      />
      <div className="method-card"><div className="method-icon"><BookOpen size={19} /></div><div><strong>证据链</strong><p>同一物品出现在不同层位，解释可能不同。要结合层位关系、共存材料、扰动情况和测年证据，区分观察与推断。</p></div></div>
    </>;
  };

  const renderRestore = () => <>
    <PageTitle eyebrow="教学修复工作台" title="文物修复" subtitle="让构件重现结构" description="通过选择构件并放置到正确位置，完成五项教学拼合练习。拼片均为教学示意，不是真实出土碎片或保护方案。" />
    <RestorationWorkshop saved={saved} updateSaved={updateSaved} />
    <div className="learning-card"><h3>修复原则</h3><ul><li>先观察每块残片的形状与材质。</li><li>检查断口和结构关系，不要强行拼接。</li><li>真实文物修复须由专业人员依据记录开展，教学操作不代表实际修复方案。</li></ul></div>
  </>;

  const renderPassport = () => {
    const overallTotal = articles.length + lessons.length + excavations.length + restorationTasks.length + quizzes.length;
    const overallDone = saved.readArticleIds.length + saved.completedLessonIds.length + saved.completedExcavationIds.length + saved.completedRestorationIds.length + saved.correctQuestionIds.length;
    const stampOptions = [
      { id: "site", title: "初探遗址", ru: "完成一个模拟发掘场景", symbol: "探", condition: "完成教学模拟发掘", unlocked: saved.completedExcavationIds.length > 0 || saved.completed[1] },
      { id: "artifact", title: "识别器物", ru: "认识第一件器物", symbol: "器", condition: "记录第一件文物", unlocked: discoveredArtifactIds.length >= 1 },
      { id: "restore", title: "修复新手", ru: "完成一次器物修复", symbol: "修", condition: "完成器物修复", unlocked: saved.completedRestorationIds.length > 0 || saved.completed[0] },
      { id: "scholar", title: "博学探索者", ru: "完成课程或答题", symbol: "知", condition: "完成课程或答题", unlocked: saved.completedLessonIds.length > 0 || saved.correctQuestionIds.length > 0 || saved.completed[2] },
    ];
    return <>
      <PageTitle eyebrow={tr("探索足迹")} title={tr("研学护照")} subtitle={tr("收藏探索足迹")} description={tr("记录你的探索足迹，收集研学印章，逐步成为时空探险家。")} />
      <div className="passport-cover">
        <div className="passport-top"><span>{tr("文化遗产探索计划")}</span><span>{tr("文化遗产")}</span></div>
        <div className="passport-emblem">考<br /><small>古</small></div>
        <div className="passport-name">{tr("时空探险家")}</div>
        <div className="passport-ru">{tr("研学护照")}</div>
        <div className="passport-bottom"><span>{tr("探索等级")}</span><strong>{saved.points} {tr("积分")}</strong></div>
      </div>
      <div className="passport-stats"><div><strong>{saved.stamps.length}</strong><small>{tr("已获印章")}</small></div><div><strong>{discoveredArtifactIds.length}</strong><small>{tr("已发现材料")}</small></div><div><strong>{saved.points}</strong><small>{tr("研学积分")}</small></div></div>
      <section className="learning-progress passport-progress">
        <div><span>总体学习进度</span><strong>{overallDone} / {overallTotal} 项</strong></div>
        <span className="mini-track"><i style={{ width: `${overallTotal ? Math.min(100, (overallDone / overallTotal) * 100) : 0}%` }} /></span>
      </section>
      <section className="passport-records">
        <h2>学习记录</h2>
        <p>已读文章：{saved.readArticleIds.length} 篇 · 已完成课程：{saved.completedLessonIds.length} 节</p>
        <p>已完成模拟发掘：{saved.completedExcavationIds.length} 项 · 已完成修复：{saved.completedRestorationIds.length} 项</p>
        <p>答题：{saved.answeredQuestionIds.length} 道 · 答对：{saved.correctQuestionIds.length} 道 · 待复习错题：{saved.wrongQuestionIds.length} 道</p>
        <p>收藏文物：{saved.favoriteArtifactIds.length} 件 · 已学习文物：{saved.studiedArtifactIds.length} 件</p>
        {discoveredArtifactIds.length > 0 && <div><strong>已发现材料及模拟层位</strong>{discoveredArtifactIds.map((id) => {
          const artifact = artifacts.find((item) => item.id === id);
          const sceneEntry = Object.entries(saved.excavationFindLayers).flatMap(([sceneId, entries]) => entries[id] ? [{ sceneId, layerId: entries[id] }] : [])[0];
          const scene = excavations.find(({ id: sceneId }) => sceneId === sceneEntry?.sceneId);
          const layerName = scene?.layers.find(({ id: layerId }) => layerId === sceneEntry?.layerId)?.name;
          return <p className="passport-record-item" key={id}>{artifact?.name ?? id}{layerName ? ` · 模拟层位：${layerName}` : ""}</p>;
        })}</div>}
      </section>
      <div className="section-heading compact"><div><h2>{tr("我的探索印章")}</h2><p>{tr("完成任务后点击领取印章")}</p></div><span className="collection-count">{stampOptions.filter((s) => s.unlocked || saved.stamps.includes(s.id)).length}/4</span></div>
      <div className="stamp-grid">
        {stampOptions.map((stamp) => {
          const earned = saved.stamps.includes(stamp.id) || stamp.unlocked;
          return <button key={stamp.id} className={`stamp-card ${earned ? "earned" : "locked"}`} onClick={() => earned && claimStamp(stamp.id)} disabled={!earned}>
            <div className="stamp-art"><span>{stamp.symbol}</span>{earned && <div className="stamp-ring">{tr("考古研学")}</div>}</div>
            <strong>{tr(stamp.title)}</strong><small>{tr(stamp.ru)}</small><em>{earned ? (saved.stamps.includes(stamp.id) ? tr("已领取") : tr("点击领取 · 20 积分")) : tr(stamp.condition)}</em>
          </button>;
        })}
      </div>
      <div className="notice-card"><Footprints size={18} /><span><strong>{tr("线下打卡")}</strong><small>{tr("实地定位打卡与博物馆印章尚未开放，目前可收集教学虚拟印章。")}</small></span></div>
    </>;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand-lockup" onClick={() => setActiveTab("home")} aria-label={tr("返回首页")}>
          <span className="brand-seal">探</span><span><strong>{tr("探秘古迹")}</strong><small>{tr("考古研学 · 探索历史")}</small></span>
        </button>
        <button className="settings-entry" onClick={() => setActiveTab("settings")}>{tr("设置")}</button>
        <button className="profile-button" onClick={() => setActiveTab("passport")} aria-label={tr("研学护照")}><span>研</span></button>
      </header>
      {storageError && <p className="storage-status" role="status">{tr(storageError)}</p>}
      <main className="page-content" key={activeTab}>
        {activeTab !== 'home' && <button className="text-button" onClick={() => { if (history.length > 1) history.back(); else setActiveTab('home'); }}>{tr("返回上一页")}</button>}
        {activeTab === 'settings' && <>
          <PageTitle eyebrow={tr("个性化偏好")} title={tr("设置")} subtitle={tr("选择适合你的阅读方式")} description={tr("首次访问默认使用浅色模式，主题切换即时生效。")} />
          <section className="learning-card"><h3>{tr("外观主题")}</h3><div className="theme-options" role="group" aria-label={tr("外观主题")}>
            {(['light', 'dark'] as const).map(value => <button key={value} className="secondary-button" aria-pressed={theme === value} onClick={() => setTheme(value)}>{value === 'light' ? tr('浅色模式') : tr('深色模式')}{theme === value && <Check size={16} />}</button>)}
          </div><p>{tr("主题与研学进度保存在当前浏览器中。")}</p></section>
          <section className="learning-card"><h3>恢复默认设置</h3><p>将外观主题恢复为首次访问时的浅色模式，不会更改研学进度。</p><button className="secondary-button" onClick={() => setTheme("light")}>恢复浅色主题</button></section>
          <section className="learning-card"><h3>本地学习数据</h3><p>进度仅保存在此浏览器，不会跨设备同步。清除操作只删除本应用的学习记录，不影响主题或其他网站数据。</p><button className="secondary-button" onClick={() => {
            if (!window.confirm("确定清除本应用保存在此浏览器中的学习进度、收藏和成绩吗？此操作无法撤销。")) return;
            try {
              localStorage.removeItem(STORAGE_KEY);
              setSaved({ ...initialState });
              setStorageError("");
            } catch {
              setStorageError("清除失败，请检查浏览器存储权限。");
            }
          }}>清除本地学习数据</button></section>
          <section className="learning-card"><h3>关于探秘古迹</h3><p>版本 1.2.0 · 面向中国大陆用户的考古教育应用。文物图像如未确认开放授权，将显示文字说明而非未经许可的图片。</p></section>
        </>}
        {activeTab === "home" && renderHome()}
        {activeTab === "dig" && renderDig()}
        {activeTab === "restore" && renderRestore()}
        {activeTab === "passport" && renderPassport()}
        {activeTab === "discover" && <ContentHub saved={saved} updateSaved={updateSaved} />}
      </main>
      <BottomNav active={activeTab} onChange={(tab) => { if (tab === activeTab && tab === "discover") location.hash = "#discover"; else setActiveTab(tab); }} />
      {selectedArtifact && <ArtifactModal
        artifact={selectedArtifact}
        layerName={activeScene.layers.find(({ id }) => id === saved.excavationFindLayers[activeScene.id]?.[selectedArtifact.id])?.name ?? "尚未记录"}
        collected={saved.studiedArtifactIds.includes(selectedArtifact.id)}
        onClose={() => setSelectedArtifact(null)}
        canCollect={(saved.excavationFoundArtifactIds[activeScene.id] ?? []).includes(selectedArtifact.id)}
        onCollect={() => updateSaved((current) => markArtifactStudied(current, selectedArtifact.id))}
      />}
    </div>
  );
}

function PageTitle({ eyebrow, title, subtitle, description }: { eyebrow: string; title: string; subtitle: string; description: string }) {
  return <section className="page-title"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><div className="page-title-ru">{subtitle}</div><p>{description}</p></section>;
}

function StampIcon() { return <StampGlyph />; }
function StampGlyph() { return <Medal size={17} />; }
function Layers3Icon() { return <Layers3Glyph />; }
function Layers3Glyph() { return <Pickaxe size={13} />; }