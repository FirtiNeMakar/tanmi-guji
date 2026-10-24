import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronRight, Footprints, MapPin, Medal, Pickaxe, RotateCcw, Sparkles, Star } from "lucide-react";
import BottomNav from "./components/BottomNav";
import ArtifactModal from "./components/ArtifactModal";
import ExcavationCanvas from "./components/ExcavationCanvas";
import { artifacts, layers } from "./data";
import type { Artifact, TabId } from "./types";

import { STORAGE_KEY, readSaved, rewardQuiz, placePiece, revealThreshold } from './progress';
import type { SavedState } from './progress';
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
  const [storageError, setStorageError] = useState('');
  const [artifactSource, setArtifactSource] = useState<'dig' | 'catalog'>('catalog');
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [showAllArtifacts, setShowAllArtifacts] = useState(false);

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
        <div className="hero-topline"><span className="hero-mark">探</span><span>时空探险家 · 探索历史</span></div>
        <div className="hero-copy">
          <div className="eyebrow light">沉浸式考古研学平台</div>
          <h1>探秘古迹</h1>
          <p className="slogan">指尖上的考古，<br />行走的历史课。</p>
          <p className="hero-ru">轻触泥土，寻找文明的线索。<br />在探索中读懂历史。</p>
          <button className="hero-button" onClick={() => setActiveTab("dig")}>开始探索 <ArrowRight size={17} /><small>云探方</small></button>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="sun-disc" /><div className="hero-mountain mountain-a" /><div className="hero-mountain mountain-b" />
          <div className="hero-grid"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="hero-pot">◒</div>
          <div className="hero-stamp">考<br /><small>古</small></div>
        </div>
        <div className="hero-footer"><span><MapPin size={13} /> 云端考古现场</span><span>一号探方</span></div>
      </section>

      <section className="stats-strip">
        <div><span className="stat-icon"><Pickaxe size={17} /></span><strong>{saved.foundIds.length}</strong><small>发现线索</small></div>
        <div><span className="stat-icon"><Star size={17} /></span><strong>{saved.points}</strong><small>研学积分</small></div>
        <div><span className="stat-icon"><StampIcon /></span><strong>{saved.stamps.length}</strong><small>探索印章</small></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="eyebrow">探索日志</div><h2>今日研学任务</h2><p>完成任务，记录今天的发现</p></div><span className="date-pill">第一天</span></div>
        <button className="mission-feature" onClick={() => setActiveTab("dig")}>
          <div className="mission-art"><div className="mini-pot">◒</div><span>任务 01</span></div>
          <div className="mission-text"><span className="mission-kicker">核心体验</span><h3>消失的古代村落</h3><p>从地层线索重现聚落生活</p><div className="mission-bottom"><span><Layers3Icon /> 3 个地层</span><strong>开始 <ChevronRight size={15} /></strong></div></div>
        </button>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="eyebrow">探索与学习</div><h2>探索工具</h2><p>发掘线索，修复器物，学习历史</p></div></div>
        <div className="feature-grid">
          <button className="feature-card feature-dig" onClick={() => setActiveTab("dig")}><span className="feature-icon"><Pickaxe size={22} /></span><strong>云探方</strong><small>指尖发掘历史</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-restore" onClick={() => setActiveTab("restore")}><span className="feature-icon"><RotateCcw size={22} /></span><strong>文物修复</strong><small>让残片重现器形</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-passport" onClick={() => setActiveTab("passport")}><span className="feature-icon"><StampIcon /></span><strong>研学护照</strong><small>收藏探索足迹</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-quiz" onClick={() => setActiveTab("discover")}><span className="feature-icon"><BookOpen size={22} /></span><strong>博古通今</strong><small>学习器物知识</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
        </div>
      </section>

      <section className="quote-card"><div className="quote-mark">“</div><p>每一件文物，都是一段等待被发现的历史。</p><small>循着线索，聆听历史的回响。</small></section>
    </>
  );

  const renderDig = () => (
    <>
      <PageTitle eyebrow="模拟考古现场" title="云探方" subtitle="指尖发掘历史" description="用考古学家的方法寻找线索。记录位置、地层和证据，不急于下结论。" />
      <div className="notice-card"><Sparkles size={17} /><span><strong>考古提示</strong><small>先观察出土背景，再作判断。留意器物所在的地层。</small></span></div>
      <div className="layer-selector">
        {layers.map((layer) => <button key={layer.id} className={`layer-chip ${activeLayer === layer.id ? "selected" : ""}`} onClick={() => setActiveLayer(layer.id)}><i style={{ background: layer.color }} /><span>{layer.chineseTitle}</span></button>)}
      </div>
      <div className="selected-layer-info"><div><strong>{layers[activeLayer - 1]?.title}</strong><small>{layers[activeLayer - 1]?.description}</small></div><span>{layers[activeLayer - 1]?.depth}</span></div>
      <ExcavationCanvas layers={layers} artifacts={artifacts} foundIds={saved.foundIds} progress={saved.digProgress} onProgress={(digProgress) => updateSaved(c => ({ ...c, digProgress }))} onFound={(artifact) => { setArtifactSource('dig'); setSelectedArtifact(artifact); }} onLayerChange={setActiveLayer} />
      <div className="method-card"><div className="method-icon"><BookOpen size={19} /></div><div><strong>证据链</strong><p>不能仅凭外观判断年代，还需结合层位、共存器物和土层扰动情况。</p></div></div>
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
      <PageTitle eyebrow="器物修复室" title="文物修复" subtitle="让残片重现器形" description="先选择陶片，再点击对应的器物位置，完成教学模型的拼合。" />
      <div className="restoration-board">
        <div className="board-label"><span>修复台</span><span>教学标本 001</span></div>
        <div className={`vessel-display ${complete ? "complete" : ""}`}>
          {pieces.map(piece => <button key={piece.id} className={`vessel-piece piece-${piece.id} ${restored.includes(piece.id) ? 'placed' : ''}`} disabled={restored.includes(piece.id)} aria-label={`放置到${piece.name}`} onClick={() => {
            if (!selectedPiece) { setRestoreFeedback('请先选择下方陶片。'); return; }
            if (selectedPiece !== piece.id) { setRestoreFeedback('位置不匹配，请观察器形后再试一次。'); return; }
            updateSaved(c => placePiece(c, piece.id)); setSelectedPiece(null); setRestoreFeedback('放置正确！完成修复可获一次 15 积分奖励。');
          }}>{piece.symbol}</button>)}
          {complete && <div className="complete-stamp"><Check size={20} /><span>修复完成</span><small>器物已拼合</small></div>}
        </div>
        <p className="restoration-tip">{complete ? "做得好！你已完成器物拼合。" : "选择下方陶片，将它们放回正确的位置。"}</p>
        <p className="restoration-tip" role="status">{restoreFeedback}</p><div className="piece-tray">
          {pieces.map((piece) => <button key={piece.id} className={`piece-card ${restored.includes(piece.id) ? "piece-done" : ""}`} onClick={() => { setSelectedPiece(piece.id); setRestoreFeedback(`已选择${piece.name}，请点击器物上的对应位置。`); }} aria-pressed={selectedPiece === piece.id} disabled={restored.includes(piece.id)}>
            <span className={`piece-shape ${piece.id}`}>{restored.includes(piece.id) ? <Check size={20} /> : piece.symbol}</span><strong>{piece.name}</strong><small>{piece.ru}</small>{restored.includes(piece.id) && <span className="piece-check"><Check size={13} /></span>}
          </button>)}
        </div>
        <button className="secondary-button full" onClick={() => { updateSaved(c => ({ ...c, restored: [] })); setSelectedPiece(null); setRestoreFeedback("已重置修复台，请重新选择陶片。"); }}><RotateCcw size={16} /> 重新开始</button>
      </div>
      <div className="learning-card"><h3>修复原则</h3><ul><li>先观察每块残片的形状与材质。</li><li>检查断口是否吻合，不要强行拼接。</li><li>修复应保留历史痕迹，而非掩盖它们。</li></ul></div>
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
      <PageTitle eyebrow="探索足迹" title="研学护照" subtitle="收藏探索足迹" description="记录你的探索足迹，收集研学印章，逐步成为时空探险家。" />
      <div className="passport-cover">
        <div className="passport-top"><span>文化遗产探索计划</span><span>文化遗产</span></div>
        <div className="passport-emblem">考<br /><small>古</small></div>
        <div className="passport-name">时空探险家</div>
        <div className="passport-ru">研学护照</div>
        <div className="passport-bottom"><span>探索等级</span><strong>{saved.points} 积分</strong></div>
      </div>
      <div className="passport-stats"><div><strong>{saved.stamps.length}</strong><small>已获印章</small></div><div><strong>{saved.foundIds.length}</strong><small>文物线索</small></div><div><strong>{saved.points}</strong><small>研学积分</small></div></div>
      <div className="section-heading compact"><div><h2>我的探索印章</h2><p>完成任务后点击领取印章</p></div><span className="collection-count">{stampOptions.filter((s) => s.unlocked || saved.stamps.includes(s.id)).length}/4</span></div>
      <div className="stamp-grid">
        {stampOptions.map((stamp) => {
          const earned = saved.stamps.includes(stamp.id) || stamp.unlocked;
          return <button key={stamp.id} className={`stamp-card ${earned ? "earned" : "locked"}`} onClick={() => earned && claimStamp(stamp.id)} disabled={!earned}>
            <div className="stamp-art"><span>{stamp.symbol}</span>{earned && <div className="stamp-ring">考古研学</div>}</div>
            <strong>{stamp.title}</strong><small>{stamp.ru}</small><em>{earned ? (saved.stamps.includes(stamp.id) ? "已领取" : "点击领取 · 20 积分") : stamp.condition}</em>
          </button>;
        })}
      </div>
      <div className="notice-card"><Footprints size={18} /><span><strong>线下打卡</strong><small>实地定位打卡与博物馆印章尚未开放，目前可收集教学虚拟印章。</small></span></div>
    </>;
  };

  const renderDiscover = () => {
    const options = ["因为这一层的文物总是最漂亮", "因为层位有助于理解文物的出土背景", "因为深度可以直接确定具体年份"];
    const correct = quizChoice === 1;
    return <>
      <PageTitle eyebrow="考古小课堂" title="博古通今" subtitle="以问题串联古今" description="每一次发现，都从一个好问题开始。每日一题，积累考古知识。" />
      <div className="daily-label"><span><Star size={15} /> 每日鉴宝题</span><span>第一题</span></div>
      <div className="quiz-card">
        <div className="quiz-illustration"><div className="quiz-pot">◒</div><span>现场思考</span></div>
        <div className="quiz-body">
          <div className="eyebrow">考古学基础</div>
          <h2>为什么考古学家要记录文物的出土层位？</h2>
          <p>请选择最符合考古方法的解释。</p>
          <div className="quiz-options">
            {options.map((option, index) => <button key={option} className={`quiz-option ${quizChoice === index ? "chosen" : ""} ${quizDone && index === 1 ? "correct" : ""} ${quizDone && quizChoice === index && index !== 1 ? "wrong" : ""}`} onClick={() => { if (!quizDone) setQuizChoice(index); }} disabled={quizDone}>
              <span>{String.fromCharCode(65 + index)}</span>{option}
            </button>)}
          </div>
          {quizDone && <div className={`quiz-feedback ${correct ? "success" : "try-again"}`}><strong>{correct ? "回答正确！本题奖励仅在首次答对时发放。" : "回答有误，查看正确答案后可再试一次。"}</strong><p>正确答案：层位有助于理解出土背景。它能帮助对比发现、检验推断，但深度本身无法确定准确年代。</p></div>}
          <button className="primary-button full" disabled={quizChoice === null || quizDone} onClick={() => {
            setQuizDone(true);
            if (quizChoice === null || quizDone) return;
            updateSaved((current) => rewardQuiz(current, quizChoice === 1));
          }}>确认答案<ArrowRight size={17} /></button>
          {quizDone && <button className="text-button" onClick={() => { setQuizChoice(null); setQuizDone(false); }}>再答一次</button>}
        </div>
      </div>
      <div className="learning-card"><h3>今日知识卡</h3><p>地层学研究地层的先后关系。未经扰动时，下层通常早于上层；翻耕和土方搬运等情况可能改变这一关系。</p></div>
      <div className="section-heading compact"><div><h2>器物图鉴</h2><p>浏览教学标本，领取需要先在云探方发现。</p></div><button className="text-button" onClick={() => setShowAllArtifacts(!showAllArtifacts)}>{showAllArtifacts ? "收起" : "查看全部"} <ChevronRight size={14} /></button></div>
      <div className="catalog-list">
        {(showAllArtifacts ? artifacts : artifacts.slice(0, 2)).map((artifact) => <button key={artifact.id} className="catalog-item" onClick={() => { setArtifactSource("catalog"); setSelectedArtifact(artifact); }}>
          <span className="catalog-symbol">{artifact.symbol}</span><span className="catalog-copy"><strong>{artifact.chineseName}</strong><small>{artifact.name}</small><em>{artifact.material}</em></span><ChevronRight size={17} />
        </button>)}
      </div>
    </>;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand-lockup" onClick={() => setActiveTab("home")} aria-label="返回首页">
          <span className="brand-seal">探</span><span><strong>探秘古迹</strong><small>考古研学 · 探索历史</small></span>
        </button>
        <button className="settings-entry" onClick={() => setActiveTab("settings")}>设置</button>
        <button className="profile-button" onClick={() => setActiveTab("passport")} aria-label="研学护照"><span>研</span></button>
      </header>
      {storageError && <p className="storage-status" role="status">{storageError}</p>}
      <main className="page-content" key={activeTab}>
        {activeTab !== 'home' && <button className="text-button" onClick={() => { if (history.length > 1) history.back(); else setActiveTab('home'); }}>返回上一页</button>}
        {activeTab === 'settings' && <>
          <PageTitle eyebrow="个性化偏好" title="设置" subtitle="选择适合你的阅读方式" description="首次访问默认使用浅色模式，主题切换即时生效。" />
          <section className="learning-card"><h3>外观主题</h3><div className="theme-options" role="group" aria-label="外观主题">
            {(['light', 'dark'] as const).map(value => <button key={value} className="secondary-button" aria-pressed={theme === value} onClick={() => setTheme(value)}>{value === 'light' ? '浅色模式' : '深色模式'}{theme === value && <Check size={16} />}</button>)}
          </div><p>主题与研学进度保存在当前浏览器中。</p></section>
        </>}
        {activeTab === "home" && renderHome()}
        {activeTab === "dig" && renderDig()}
        {activeTab === "restore" && renderRestore()}
        {activeTab === "passport" && renderPassport()}
        {activeTab === "discover" && renderDiscover()}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
      {selectedArtifact && <ArtifactModal artifact={selectedArtifact} collected={saved.foundIds.includes(selectedArtifact.id)} onClose={() => setSelectedArtifact(null)} canCollect={artifactSource === "dig"} onCollect={() => collectArtifact(selectedArtifact)} />}
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