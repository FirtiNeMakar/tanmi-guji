import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronRight, Footprints, MapPin, Medal, Pickaxe, RotateCcw, Sparkles, Star } from "lucide-react";
import BottomNav from "./components/BottomNav";
import ArtifactModal from "./components/ArtifactModal";
import ExcavationCanvas from "./components/ExcavationCanvas";
import { artifacts, layers } from "./data";
import type { Artifact, TabId } from "./types";

const STORAGE_KEY = "tanmi-guji-progress-v1";

type SavedState = { foundIds: string[]; completed: boolean[]; stamps: string[]; points: number };

const initialState: SavedState = { foundIds: [], completed: [false, false, false], stamps: [], points: 0 };

function readSaved(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    return {
      foundIds: Array.isArray(parsed.foundIds) ? parsed.foundIds : [],
      completed: Array.isArray(parsed.completed) ? [!!parsed.completed[0], !!parsed.completed[1], !!parsed.completed[2]] : [false, false, false],
      stamps: Array.isArray(parsed.stamps) ? parsed.stamps : [],
      points: typeof parsed.points === "number" ? parsed.points : 0,
    };
  } catch {
    return initialState;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [saved, setSaved] = useState<SavedState>(readSaved);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [activeLayer, setActiveLayer] = useState(1);
  const [restored, setRestored] = useState<string[]>([]);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [showAllArtifacts, setShowAllArtifacts] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }, [saved]);

  const updateSaved = (updater: (current: SavedState) => SavedState) => setSaved(updater);
  const collectArtifact = (artifact: Artifact) => {
    updateSaved((current) => current.foundIds.includes(artifact.id) ? current : ({
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
        <div className="hero-topline"><span className="hero-mark">探</span><span>时空探险家 · TIME EXPLORER</span></div>
        <div className="hero-copy">
          <div className="eyebrow light">沉浸式考古研学平台</div>
          <h1>探秘古迹</h1>
          <p className="slogan">指尖上的考古，<br />行走的历史课。</p>
          <p className="hero-ru">Археология на кончиках пальцев.<br />Урок истории в движении.</p>
          <button className="hero-button" onClick={() => setActiveTab("dig")}>开启云探方 <ArrowRight size={17} /><small>Начать раскопки</small></button>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="sun-disc" /><div className="hero-mountain mountain-a" /><div className="hero-mountain mountain-b" />
          <div className="hero-grid"><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="hero-pot">◒</div>
          <div className="hero-stamp">考<br /><small>古</small></div>
        </div>
        <div className="hero-footer"><span><MapPin size={13} /> 云端考古现场</span><span>FIELD SITE 01</span></div>
      </section>

      <section className="stats-strip">
        <div><span className="stat-icon"><Pickaxe size={17} /></span><strong>{saved.foundIds.length}</strong><small>发现线索 / Улики</small></div>
        <div><span className="stat-icon"><Star size={17} /></span><strong>{saved.points}</strong><small>研学积分 / Баллы</small></div>
        <div><span className="stat-icon"><StampIcon /></span><strong>{saved.stamps.length}</strong><small>探索印章 / Печати</small></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="eyebrow">YOUR FIELD JOURNAL</div><h2>今日研学任务</h2><p>Задания исследователя на сегодня</p></div><span className="date-pill">DAY 01</span></div>
        <button className="mission-feature" onClick={() => setActiveTab("dig")}>
          <div className="mission-art"><div className="mini-pot">◒</div><span>任务 01</span></div>
          <div className="mission-text"><span className="mission-kicker">核心体验 · ГЛАВНАЯ МИССИЯ</span><h3>消失的古代村落</h3><p>Исчезнувшее древнее поселение</p><div className="mission-bottom"><span><Layers3Icon /> 3 个地层 / 3 слоя</span><strong>开始 <ChevronRight size={15} /></strong></div></div>
        </button>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="eyebrow">EXPLORE & LEARN</div><h2>探索工具</h2><p>Исследуй, восстанавливай, узнавай</p></div></div>
        <div className="feature-grid">
          <button className="feature-card feature-dig" onClick={() => setActiveTab("dig")}><span className="feature-icon"><Pickaxe size={22} /></span><strong>云探方</strong><small>Виртуальные раскопки</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-restore" onClick={() => setActiveTab("restore")}><span className="feature-icon"><RotateCcw size={22} /></span><strong>文物修复师</strong><small>Мастер реставрации</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-passport" onClick={() => setActiveTab("passport")}><span className="feature-icon"><StampIcon /></span><strong>研学护照</strong><small>Паспорт исследователя</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
          <button className="feature-card feature-quiz" onClick={() => setActiveTab("discover")}><span className="feature-icon"><BookOpen size={22} /></span><strong>博古通今</strong><small>Знания об артефактах</small><span className="feature-arrow"><ArrowRight size={16} /></span></button>
        </div>
      </section>

      <section className="quote-card"><div className="quote-mark">“</div><p>每一件文物，都是一段等待被发现的历史。</p><small>Каждый артефакт — история, ожидающая открытия.</small></section>
    </>
  );

  const renderDig = () => (
    <>
      <PageTitle eyebrow="VIRTUAL EXCAVATION" title="云探方" subtitle="Виртуальные раскопки" description="用考古学家的方法寻找线索。记录位置、地层和证据，不急于下结论。" />
      <div className="notice-card"><Sparkles size={17} /><span><strong>考古提示</strong><small>Сначала контекст, потом вывод. Изучай слой, в котором обнаружен предмет.</small></span></div>
      <div className="layer-selector">
        {layers.map((layer) => <button key={layer.id} className={`layer-chip ${activeLayer === layer.id ? "selected" : ""}`} onClick={() => setActiveLayer(layer.id)}><i style={{ background: layer.color }} /><span>{layer.chineseTitle}</span></button>)}
      </div>
      <div className="selected-layer-info"><div><strong>{layers[activeLayer - 1]?.title}</strong><small>{layers[activeLayer - 1]?.description}</small></div><span>{layers[activeLayer - 1]?.depth}</span></div>
      <ExcavationCanvas layers={layers} artifacts={artifacts} foundIds={saved.foundIds} onFound={setSelectedArtifact} onLayerChange={setActiveLayer} />
      <div className="method-card"><div className="method-icon"><BookOpen size={19} /></div><div><strong>证据链 · Цепочка доказательств</strong><p>Предмет нельзя датировать только по внешнему виду. Учитывай слой, соседние находки и возможное нарушение грунта.</p></div></div>
    </>
  );

  const renderRestore = () => {
    const pieces = [
      { id: "rim", name: "口沿", ru: "Верхний край", symbol: "⌒" },
      { id: "body", name: "器身", ru: "Корпус", symbol: "◖" },
      { id: "base", name: "底座", ru: "Основание", symbol: "⌣" },
    ];
    const complete = pieces.every((piece) => restored.includes(piece.id));
    return <>
      <PageTitle eyebrow="CONSERVATION LAB" title="文物修复师" subtitle="Мастер реставрации" description="Попробуй собрать учебную модель сосуда. Нажимай на фрагменты, чтобы поочерёдно восстановить форму." />
      <div className="restoration-board">
        <div className="board-label"><span>修复台 / Реставрационный стол</span><span>REPLICA 001</span></div>
        <div className={`vessel-display ${complete ? "complete" : ""}`}>
          <div className={`vessel-piece piece-rim ${restored.includes("rim") ? "placed" : ""}`}>{restored.includes("rim") ? "" : "⌒"}</div>
          <div className={`vessel-piece piece-body ${restored.includes("body") ? "placed" : ""}`}>{restored.includes("body") ? "" : "◖"}</div>
          <div className={`vessel-piece piece-base ${restored.includes("base") ? "placed" : ""}`}>{restored.includes("base") ? "" : "⌣"}</div>
          {complete && <div className="complete-stamp"><Check size={20} /><span>修复完成</span><small>Восстановлено</small></div>}
        </div>
        <p className="restoration-tip">{complete ? "做得好！你已完成器物拼合。" : "选择下方陶片，将它们放回正确的位置。"}</p>
        <div className="piece-tray">
          {pieces.map((piece) => <button key={piece.id} className={`piece-card ${restored.includes(piece.id) ? "piece-done" : ""}`} onClick={() => {
            if (!restored.includes(piece.id)) {
              setRestored((current) => [...current, piece.id]);
              if (restored.length === 2) updateSaved((current) => ({ ...current, completed: [true, current.completed[1], current.completed[2]], points: current.points + 15 }));
            }
          }} disabled={restored.includes(piece.id)}>
            <span className={`piece-shape ${piece.id}`}>{restored.includes(piece.id) ? <Check size={20} /> : piece.symbol}</span><strong>{piece.name}</strong><small>{piece.ru}</small>{restored.includes(piece.id) && <span className="piece-check"><Check size={13} /></span>}
          </button>)}
        </div>
        <button className="secondary-button full" onClick={() => setRestored([])}><RotateCcw size={16} /> 重新开始 · Начать заново</button>
      </div>
      <div className="learning-card"><h3>修复原则 · Принципы реставрации</h3><ul><li>Сначала изучи форму и материал каждого фрагмента.</li><li>Не пытайся соединять детали силой — проверяй линии излома.</li><li>Реставрация должна сохранять следы истории, а не скрывать их.</li></ul></div>
    </>;
  };

  const renderPassport = () => {
    const stampOptions = [
      { id: "site", title: "初探遗址", ru: "Первое исследование", symbol: "探", condition: "Открой экран раскопок", unlocked: saved.foundIds.length > 0 },
      { id: "artifact", title: "识别器物", ru: "Исследователь находок", symbol: "器", condition: "Изучи первую находку", unlocked: saved.foundIds.length >= 1 },
      { id: "restore", title: "修复新手", ru: "Начинающий реставратор", symbol: "修", condition: "Собери учебный сосуд", unlocked: saved.completed[0] },
      { id: "scholar", title: "博学探索者", ru: "Знаток истории", symbol: "知", condition: "Ответь на вопрос викторины", unlocked: saved.completed[2] },
    ];
    return <>
      <PageTitle eyebrow="EXPLORER PASSPORT" title="研学护照" subtitle="Паспорт исследователя" description="记录你的探索足迹，收集研学印章，逐步成为时空探险家。" />
      <div className="passport-cover">
        <div className="passport-top"><span>文化遗产探索计划</span><span>CULTURAL HERITAGE</span></div>
        <div className="passport-emblem">考<br /><small>古</small></div>
        <div className="passport-name">时空探险家</div>
        <div className="passport-ru">ПАСПОРТ ИССЛЕДОВАТЕЛЯ</div>
        <div className="passport-bottom"><span>探索等级 · Уровень 01</span><strong>{saved.points} XP</strong></div>
      </div>
      <div className="passport-stats"><div><strong>{saved.stamps.length}</strong><small>已获印章 / Печати</small></div><div><strong>{saved.foundIds.length}</strong><small>文物线索 / Находки</small></div><div><strong>{saved.points}</strong><small>研学积分 / Баллы</small></div></div>
      <div className="section-heading compact"><div><h2>我的探索印章</h2><p>Моя коллекция печатей</p></div><span className="collection-count">{stampOptions.filter((s) => s.unlocked || saved.stamps.includes(s.id)).length}/4</span></div>
      <div className="stamp-grid">
        {stampOptions.map((stamp) => {
          const earned = saved.stamps.includes(stamp.id) || stamp.unlocked;
          return <button key={stamp.id} className={`stamp-card ${earned ? "earned" : "locked"}`} onClick={() => earned && claimStamp(stamp.id)} disabled={!earned}>
            <div className="stamp-art"><span>{stamp.symbol}</span>{earned && <div className="stamp-ring">考古研学</div>}</div>
            <strong>{stamp.title}</strong><small>{stamp.ru}</small><em>{earned ? "已解锁 · Открыто" : stamp.condition}</em>
          </button>;
        })}
      </div>
      <div className="notice-card"><Footprints size={18} /><span><strong>线下打卡 · Посещение музеев</strong><small>GPS-проверка и реальные музейные печати будут подключены в следующей версии. Сейчас доступны учебные виртуальные награды.</small></span></div>
    </>;
  };

  const renderDiscover = () => {
    const options = ["Потому что он всегда самый красивый", "Потому что слой помогает понять контекст находки", "Потому что глубина точно показывает год"];
    const correct = quizChoice === 1;
    return <>
      <PageTitle eyebrow="DISCOVER & LEARN" title="博古通今" subtitle="От древности к современности" description="每一次发现，都从一个好问题开始。每日一题，积累考古知识。" />
      <div className="daily-label"><span><Star size={15} /> 每日鉴宝题</span><span>DAILY QUIZ · 01</span></div>
      <div className="quiz-card">
        <div className="quiz-illustration"><div className="quiz-pot">◒</div><span>FIELD QUESTION</span></div>
        <div className="quiz-body">
          <div className="eyebrow">考古学基础 · ОСНОВЫ АРХЕОЛОГИИ</div>
          <h2>为什么考古学家要记录文物的出土层位？</h2>
          <p>Почему археологи фиксируют слой, в котором найден предмет?</p>
          <div className="quiz-options">
            {options.map((option, index) => <button key={option} className={`quiz-option ${quizChoice === index ? "chosen" : ""} ${quizDone && index === 1 ? "correct" : ""} ${quizDone && quizChoice === index && index !== 1 ? "wrong" : ""}`} onClick={() => { if (!quizDone) setQuizChoice(index); }} disabled={quizDone}>
              <span>{String.fromCharCode(65 + index)}</span>{option}
            </button>)}
          </div>
          {quizDone && <div className={`quiz-feedback ${correct ? "success" : "try-again"}`}><strong>{correct ? "回答正确！ +10 积分" : "再想一想 · Попробуй ещё раз"}</strong><p>Слой — часть археологического контекста. Он помогает сопоставлять находки и проверять гипотезы; глубина сама по себе не даёт точной даты.</p></div>}
          <button className="primary-button full" disabled={quizChoice === null || quizDone} onClick={() => {
            setQuizDone(true);
            updateSaved((current) => ({ ...current, completed: [current.completed[0], current.completed[1], true], points: current.points + (quizChoice === 1 ? 10 : 0) }));
          }}>确认答案 · Проверить ответ <ArrowRight size={17} /></button>
          {quizDone && <button className="text-button" onClick={() => { setQuizChoice(null); setQuizDone(false); }}>再答一次 · Попробовать снова</button>}
        </div>
      </div>
      <div className="learning-card"><h3>今日知识卡 · Карточка дня</h3><p>Стратиграфия изучает последовательность слоёв. В непотревоженном контексте нижние слои обычно старше верхних, но исключения возможны: например, при перекопке или перемещении грунта.</p></div>
      <div className="section-heading compact"><div><h2>器物图鉴</h2><p>Каталог учебных находок</p></div><button className="text-button" onClick={() => setShowAllArtifacts(!showAllArtifacts)}>{showAllArtifacts ? "收起" : "查看全部"} <ChevronRight size={14} /></button></div>
      <div className="catalog-list">
        {(showAllArtifacts ? artifacts : artifacts.slice(0, 2)).map((artifact) => <button key={artifact.id} className="catalog-item" onClick={() => setSelectedArtifact(artifact)}>
          <span className="catalog-symbol">{artifact.symbol}</span><span className="catalog-copy"><strong>{artifact.chineseName}</strong><small>{artifact.name}</small><em>{artifact.material}</em></span><ChevronRight size={17} />
        </button>)}
      </div>
    </>;
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand-lockup" onClick={() => setActiveTab("home")} aria-label="返回首页">
          <span className="brand-seal">探</span><span><strong>探秘古迹</strong><small>考古研学 · ARCHAEOLOGY</small></span>
        </button>
        <button className="profile-button" onClick={() => setActiveTab("passport")} aria-label="研学护照"><span>研</span></button>
      </header>
      <main className="page-content" key={activeTab}>
        {activeTab === "home" && renderHome()}
        {activeTab === "dig" && renderDig()}
        {activeTab === "restore" && renderRestore()}
        {activeTab === "passport" && renderPassport()}
        {activeTab === "discover" && renderDiscover()}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
      {selectedArtifact && <ArtifactModal artifact={selectedArtifact} collected={saved.foundIds.includes(selectedArtifact.id)} onClose={() => setSelectedArtifact(null)} onCollect={() => collectArtifact(selectedArtifact)} />}
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