import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronRight, Footprints, MapPin, Medal, Pickaxe, RotateCcw, Sparkles, Star } from "lucide-react";
import BottomNav from "./components/BottomNav";
import ArtifactModal from "./components/ArtifactModal";
import ExcavationCanvas from "./components/ExcavationCanvas";
import { artifacts, layers } from "./data";
import type { Artifact, TabId } from "./types";

import { STORAGE_KEY, readSaved, rewardQuiz, placePiece, revealThreshold } from './progress';
import type { SavedState } from './progress';
import { readLanguage, translate } from "./i18n";
import type { Language } from "./i18n";
const tabs = ['home', 'dig', 'restore', 'passport', 'discover', 'settings'];
function readTab(): TabId { const tab = location.hash.slice(1); return tabs.includes(tab) ? tab as TabId : 'home'; }
function readTheme(): 'light' | 'dark' { try { return localStorage.getItem('tanmi-guji-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } }

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(readTab);
  const [saved, setSaved] = useState<SavedState>(readSaved);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [activeLayer, setActiveLayer] = useState(1);
  const restored = saved.restored;
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [restoreFeedback, setRestoreFeedback] = useState('');
  const [theme, setTheme] = useState(readTheme);
  const [language, setLanguage] = useState<Language>(readLanguage);
  const [storageError, setStorageError] = useState('');
  const [artifactSource, setArtifactSource] = useState<'dig' | 'catalog'>('catalog');
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [showAllArtifacts, setShowAllArtifacts] = useState(false);
  const tr = (text: string) => translate(text, language);

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
    if (location.hash !== '#' + activeTab) location.hash = activeTab;
    window.scrollTo(0, 0);
    if (activeTab === 'dig') setSaved(c => c.completed[1] ? c : { ...c, completed: [c.completed[0], true, c.completed[2]] });
  }, [activeTab]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#242923' : '#fbf8f0');
    try { localStorage.setItem('tanmi-guji-theme', theme); }
    catch { setStorageError('无法保存设置，请允许浏览器存储；当前主题已生效。'); }
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = language === "ru" ? "ru" : "zh-CN";
    document.title = language === "ru" ? "Тайны древности · Археология" : "探秘古迹 · 考古研学";
    try { localStorage.setItem('tanmi-guji-language', language); }
    catch { setStorageError('无法保存设置，请允许浏览器存储；当前语言已生效。'); }
  }, [language]);

  const updateSaved = (updater: (current: SavedState) => SavedState) => setSaved(updater);
  const collectArtifact = (artifact: Artifact) => {
    updateSaved((current) => artifactSource !== "dig" || current.digProgress < revealThreshold(artifact.id) || current.foundIds.includes(artifact.id) ? current : ({
      ...current,
      foundIds: [...current.foundIds, artifact.id],
      points: current.points + 10,
    }));
    setSelectedArtifact(null);
  };

  const claimStamp = (id: string) => {
    updateSaved((current) => current.stamps.includes(id) ? current : ({
      ...current, stamps: [...current.stamps, id], points: current.points + 20,
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
        <div><span className="stat-icon"><Pickaxe size={17} /></span><strong>{saved.foundIds.length}</strong><small>{tr("发现线索")}</small></div>
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

  const renderDig = () => (
    <>
      <PageTitle eyebrow={tr("模拟考古现场")} title={tr("云探方")} subtitle={tr("指尖发掘历史")} description={tr("用考古学家的方法寻找线索。记录位置、地层和证据，不急于下结论。")} />
      <div className="notice-card"><Sparkles size={17} /><span><strong>{tr("考古提示")}</strong><small>{tr("先观察出土背景，再作判断。留意器物所在的地层。")}</small></span></div>
      <div className="layer-selector">
        {layers.map((layer) => <button key={layer.id} className={`layer-chip ${activeLayer === layer.id ? "selected" : ""}`} onClick={() => setActiveLayer(layer.id)}><i style={{ background: layer.color }} /><span>{tr(layer.chineseTitle)}</span></button>)}
      </div>
      <div className="selected-layer-info"><div><strong>{tr(layers[activeLayer - 1]?.title ?? "")}</strong><small>{tr(layers[activeLayer - 1]?.description ?? "")}</small></div><span>{tr(layers[activeLayer - 1]?.depth ?? "")}</span></div>
      <ExcavationCanvas language={language} layers={layers} artifacts={artifacts} foundIds={saved.foundIds} progress={saved.digProgress} onProgress={(digProgress) => updateSaved(c => ({ ...c, digProgress }))} onFound={(artifact) => { setArtifactSource('dig'); setSelectedArtifact(artifact); }} onLayerChange={setActiveLayer} />
      <div className="method-card"><div className="method-icon"><BookOpen size={19} /></div><div><strong>{tr("证据链")}</strong><p>{tr("不能仅凭外观判断年代，还需结合层位、共存器物和土层扰动情况。")}</p></div></div>
    </>
  );

  const renderRestore = () => {
    const pieces = [
      { id: "rim", name: "口沿", ru: "容器顶部", symbol: "⌒" },
      { id: "body", name: "器身", ru: "容器中部", symbol: "◖" },
      { id: "base", name: "底座", ru: "容器底部", symbol: "⌣" },
    ];
    const complete = pieces.every((piece) => restored.includes(piece.id));
    return <>
      <PageTitle eyebrow={tr("器物修复室")} title={tr("文物修复")} subtitle={tr("让残片重现器形")} description={tr("先选择陶片，再点击对应的器物位置，完成教学模型的拼合。")} />
      <div className="restoration-board">
        <div className="board-label"><span>{tr("修复台")}</span><span>{tr("教学标本 001")}</span></div>
        <div className={`vessel-display ${complete ? "complete" : ""}`}>
          {pieces.map(piece => <button key={piece.id} className={`vessel-piece piece-${piece.id} ${restored.includes(piece.id) ? 'placed' : ''}`} disabled={restored.includes(piece.id)} aria-label={`${tr("放置到")}${tr(piece.name)}`} onClick={() => {
            if (!selectedPiece) { setRestoreFeedback(tr('请先选择下方陶片。')); return; }
            if (selectedPiece !== piece.id) { setRestoreFeedback(tr('位置不匹配，请观察器形后再试一次。')); return; }
            updateSaved(c => placePiece(c, piece.id)); setSelectedPiece(null); setRestoreFeedback(tr('放置正确！完成修复可获一次 15 积分奖励。'));
          }}>{piece.symbol}</button>)}
          {complete && <div className="complete-stamp"><Check size={20} /><span>{tr("修复完成")}</span><small>{tr("器物已拼合")}</small></div>}
        </div>
        <p className="restoration-tip">{complete ? tr("做得好！你已完成器物拼合。") : tr("选择下方陶片，将它们放回正确的位置。")}</p>
        <p className="restoration-tip" role="status">{restoreFeedback}</p><div className="piece-tray">
          {pieces.map((piece) => <button key={piece.id} className={`piece-card ${restored.includes(piece.id) ? "piece-done" : ""}`} onClick={() => { setSelectedPiece(piece.id); setRestoreFeedback(`${tr("已选择")}${tr(piece.name)}，${tr("请点击器物上的对应位置。")}`); }} aria-pressed={selectedPiece === piece.id} disabled={restored.includes(piece.id)}>
            <span className={`piece-shape ${piece.id}`}>{restored.includes(piece.id) ? <Check size={20} /> : piece.symbol}</span><strong>{tr(piece.name)}</strong><small>{tr(piece.ru)}</small>{restored.includes(piece.id) && <span className="piece-check"><Check size={13} /></span>}
          </button>)}
        </div>
        <button className="secondary-button full" onClick={() => { updateSaved(c => ({ ...c, restored: [] })); setSelectedPiece(null); setRestoreFeedback(tr("已重置修复台，请重新选择陶片。")); }}><RotateCcw size={16} /> {tr("重新开始")}</button>
      </div>
      <div className="learning-card"><h3>{tr("修复原则")}</h3><ul><li>{tr("先观察每块残片的形状与材质。")}</li><li>{tr("检查断口是否吻合，不要强行拼接。")}</li><li>{tr("修复应保留历史痕迹，而非掩盖它们。")}</li></ul></div>
    </>;
  };

  const renderPassport = () => {
    const stampOptions = [
      { id: "site", title: "初探遗址", ru: "迈出探索第一步", symbol: "探", condition: "进入云探方", unlocked: saved.completed[1] },
      { id: "artifact", title: "识别器物", ru: "认识第一件器物", symbol: "器", condition: "收集第一件文物", unlocked: saved.foundIds.length >= 1 },
      { id: "restore", title: "修复新手", ru: "完成一次器物修复", symbol: "修", condition: "完成器物修复", unlocked: saved.completed[0] },
      { id: "scholar", title: "博学探索者", ru: "学习考古基础知识", symbol: "知", condition: "完成一次答题", unlocked: saved.completed[2] },
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
      <div className="passport-stats"><div><strong>{saved.stamps.length}</strong><small>{tr("已获印章")}</small></div><div><strong>{saved.foundIds.length}</strong><small>{tr("文物线索")}</small></div><div><strong>{saved.points}</strong><small>{tr("研学积分")}</small></div></div>
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

  const renderDiscover = () => {
    const options = ["因为这一层的文物总是最漂亮", "因为层位有助于理解文物的出土背景", "因为深度可以直接确定具体年份"];
    const correct = quizChoice === 1;
    return <>
      <PageTitle eyebrow={tr("考古小课堂")} title={tr("博古通今")} subtitle={tr("以问题串联古今")} description={tr("每一次发现，都从一个好问题开始。每日一题，积累考古知识。")} />
      <div className="daily-label"><span><Star size={15} /> {tr("每日鉴宝题")}</span><span>{tr("第一题")}</span></div>
      <div className="quiz-card">
        <div className="quiz-illustration"><div className="quiz-pot">◒</div><span>{tr("现场思考")}</span></div>
        <div className="quiz-body">
          <div className="eyebrow">{tr("考古学基础")}</div>
          <h2>{tr("为什么考古学家要记录文物的出土层位？")}</h2>
          <p>{tr("请选择最符合考古方法的解释。")}</p>
          <div className="quiz-options">
            {options.map((option, index) => <button key={option} className={`quiz-option ${quizChoice === index ? "chosen" : ""} ${quizDone && index === 1 ? "correct" : ""} ${quizDone && quizChoice === index && index !== 1 ? "wrong" : ""}`} onClick={() => { if (!quizDone) setQuizChoice(index); }} disabled={quizDone}>
              <span>{String.fromCharCode(65 + index)}</span>{tr(option)}
            </button>)}
          </div>
          {quizDone && <div className={`quiz-feedback ${correct ? "success" : "try-again"}`}><strong>{correct ? tr("回答正确！本题奖励仅在首次答对时发放。") : tr("回答有误，查看正确答案后可再试一次。")}</strong><p>{tr("正确答案：层位有助于理解出土背景。它能帮助对比发现、检验推断，但深度本身无法确定准确年代。")}</p></div>}
          <button className="primary-button full" disabled={quizChoice === null || quizDone} onClick={() => {
            setQuizDone(true);
            if (quizChoice === null || quizDone) return;
            updateSaved((current) => rewardQuiz(current, quizChoice === 1));
          }}>{tr("确认答案")}<ArrowRight size={17} /></button>
          {quizDone && <button className="text-button" onClick={() => { setQuizChoice(null); setQuizDone(false); }}>{tr("再答一次")}</button>}
        </div>
      </div>
      <div className="learning-card"><h3>{tr("今日知识卡")}</h3><p>{tr("地层学研究地层的先后关系。未经扰动时，下层通常早于上层；翻耕和土方搬运等情况可能改变这一关系。")}</p></div>
      <section className="case-study">
        <div className="eyebrow">{tr("考古专题材料")}</div>
        <h2>{tr("山东元代济南王张荣家族墓地")}</h2>
        <p className="case-study-intro">{tr("依据济南市考古研究院2023年2月20日发布的报道整理，内容为教学摘要，不替代原始报告。")}</p>
        <div className="case-study-stats">
          <div><small>{tr("发掘时间")}</small><strong>{tr("2021年10月—2022年9月")}</strong></div>
          <div><small>{tr("墓葬总数")}</small><strong>{tr("102座")}</strong></div>
          <div><small>{tr("张氏家族墓")}</small><strong>{tr("至少32座")}</strong></div>
          <div><small>{tr("出土器物")}</small><strong>{tr("500余件（组）")}</strong></div>
        </div>
        <h3>{tr("核心发现")}</h3>
        <ul>
          <li>{tr("此次发掘发现西汉至清代墓葬102座，其中元代张荣家族墓地最为重要。")}</li>
          <li>{tr("墓园延续整个元代，现有证据至少覆盖至张荣玄孙一代。")}</li>
          <li>{tr("M83（张荣墓）规模最大：墓葬通长34.2米、最宽15.1米、深6.3米，设前后门楼及八个墓室，壁画保存了宴享、仪仗、花鸟等图像。")}</li>
          <li>{tr("出土瓷器涉及钧窑、龙泉、磁州、景德镇等窑系；官窑和青花瓷器共40余件，报道指出济南首次发掘出土元青花。")}</li>
          <li>{tr("神道碑、子孙谱碑等石刻提供近4000字文字材料，可与历史文献互证。")}</li>
        </ul>
        <div className="case-study-note"><strong>{tr("学习重点")}</strong><p>{tr("器物组合、墓葬结构和碑刻需要结合位置与关系分析，单件遗物不能单独支撑完整结论。")}</p></div>
        <a href="https://mp.weixin.qq.com/s/VELo788qDpHyPxfJnjpF8Q" target="_blank" rel="noreferrer">{tr("查看原文（微信公众号）")} <ArrowRight size={15} /></a>
      </section>
      <div className="section-heading compact"><div><h2>{tr("器物图鉴")}</h2><p>{tr("浏览教学标本，领取需要先在云探方发现。")}</p></div><button className="text-button" onClick={() => setShowAllArtifacts(!showAllArtifacts)}>{showAllArtifacts ? tr("收起") : tr("查看全部")} <ChevronRight size={14} /></button></div>
      <div className="catalog-list">
        {(showAllArtifacts ? artifacts : artifacts.slice(0, 2)).map((artifact) => <button key={artifact.id} className="catalog-item" onClick={() => { setArtifactSource("catalog"); setSelectedArtifact(artifact); }}>
          <span className="catalog-symbol">{artifact.symbol}</span><span className="catalog-copy"><strong>{tr(artifact.chineseName)}</strong><small>{tr(artifact.name)}</small><em>{tr(artifact.material)}</em></span><ChevronRight size={17} />
        </button>)}
      </div>
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
          <section className="learning-card"><h3>{tr("选择语言")}</h3><div className="theme-options language-options" role="group" aria-label={tr("选择语言")}>
            {([{ value: "zh", label: "简体中文" }, { value: "ru", label: "Русский" }] as const).map(option => <button key={option.value} className="secondary-button" aria-pressed={language === option.value} onClick={() => setLanguage(option.value)}>{option.label}{language === option.value && <Check size={16} />}</button>)}
          </div><p>{tr("语言与主题设置保存在当前浏览器中。")}</p></section>
        </>}
        {activeTab === "home" && renderHome()}
        {activeTab === "dig" && renderDig()}
        {activeTab === "restore" && renderRestore()}
        {activeTab === "passport" && renderPassport()}
        {activeTab === "discover" && renderDiscover()}
      </main>
      <BottomNav language={language} active={activeTab} onChange={setActiveTab} />
      {selectedArtifact && <ArtifactModal language={language} artifact={selectedArtifact} collected={saved.foundIds.includes(selectedArtifact.id)} onClose={() => setSelectedArtifact(null)} canCollect={artifactSource === "dig"} onCollect={() => collectArtifact(selectedArtifact)} />}
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