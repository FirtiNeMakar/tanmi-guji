import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, ChevronRight, Search, Star } from "lucide-react";
import { articles, artifacts, glossary, lessons, quizzes, sites } from "../data/index";
import type { Article, ArtifactRecord, ContentSection, GlossaryTerm, Lesson, QuizQuestion } from "../types";
import {
  answerQuestion,
  completeLesson,
  markArticleRead,
  markArtifactStudied,
  toggleFavorite,
  type SavedState,
} from "../progress";

type Props = {
  saved: SavedState;
  updateSaved: (updater: (current: SavedState) => SavedState) => void;
};
type Route = { section: ContentSection | "home" | "article" | "artifact" | "lesson" | "term"; id?: string; quizTopic?: string };

function readRoute(): Route {
  const parts = location.hash.replace(/^#discover\/?/, "").split("/").filter(Boolean);
  if (parts.length === 0) return { section: "home" };
  if (parts[0] === "quiz" && parts[1]) return { section: "quiz", quizTopic: parts[1] };
  if (["article", "artifact", "lesson", "term"].includes(parts[0]) && parts[1]) {
    return { section: parts[0] as Route["section"], id: decodeURIComponent(parts[1]) };
  }
  if (["articles", "artifacts", "classroom", "glossary", "quiz"].includes(parts[0])) {
    return { section: parts[0] as ContentSection };
  }
  return { section: "home" };
}

export default function ContentHub({ saved, updateSaved }: Props) {
  const [route, setRoute] = useState<Route>(readRoute);
  const [articleSearch, setArticleSearch] = useState("");
  const [artifactSearch, setArtifactSearch] = useState("");
  const [artifactPeriod, setArtifactPeriod] = useState("");
  const [artifactMaterial, setArtifactMaterial] = useState("");
  const [artifactUse, setArtifactUse] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [termSearch, setTermSearch] = useState("");
  const [termCategory, setTermCategory] = useState("");

  const navigate = (path = "") => {
    const nextHash = path ? `#discover/${path}` : "#discover";
    if (location.hash === nextHash) setRoute(readRoute());
    else location.hash = nextHash;
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const sync = () => setRoute(readRoute());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const nav: { id: ContentSection; title: string }[] = [
    { id: "articles", title: "内容中心" },
    { id: "artifacts", title: "文物图鉴" },
    { id: "classroom", title: "考古课堂" },
    { id: "glossary", title: "考古词典" },
    { id: "quiz", title: "博古通今" },
  ];

  const renderArticleList = () => {
    const filtered = articles.filter((article) =>
      `${article.title} ${article.summary} ${article.keywords.join(" ")}`.includes(articleSearch),
    );
    return <>
      <HubTitle title="内容中心" description={`已整理 ${articles.length} 篇考古专题材料。摘要说明观点和证据边界，并附参考入口。`} />
      <label className="content-search"><Search size={17} /><input value={articleSearch} onChange={(event) => setArticleSearch(event.target.value)} placeholder="搜索文章标题、主题或关键词" /></label>
      <div className="content-card-list">
        {filtered.map((article) => <button className="content-card article-list-card" key={article.id} onClick={() => navigate(`article/${article.id}`)}>
          <span className="eyebrow">{article.period}</span><strong>{article.title}</strong><p>{article.summary}</p><small>{article.timeRange}</small><ChevronRight size={17} />
        </button>)}
        {filtered.length === 0 && <p className="empty-hint">没有找到匹配的文章，请尝试其他关键词。</p>}
      </div>
    </>;
  };

  const renderArticle = (article: Article) => {
    const relatedArtifacts = artifacts.filter((item) => article.artifactIds.includes(item.id));
    const relatedSites = sites.filter((site) => article.siteIds.includes(site.id));
    const relatedTerms = glossary.filter((term) => article.terms.includes(term.id));
    return <>
      <button className="text-button" onClick={() => navigate("articles")}><ArrowLeft size={15} /> 返回内容中心</button>
      <HubTitle eyebrow={article.period} title={article.title} description={article.summary} />
      <ImageNotice image={article.image.attribution} />
      <section className="learning-card article-meta"><strong>时代背景与时间范围</strong><p>{article.timeRange}</p></section>
      {article.body.map((paragraph, index) => <p className="article-paragraph" key={index}>{paragraph}</p>)}
      <section className="learning-card"><h3>关键知识点</h3><ul>{article.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></section>
      <section className="learning-card"><h3>关键词</h3><div className="tag-row">{article.keywords.map((keyword) => <span className="content-tag" key={keyword}>{keyword}</span>)}</div></section>
      {relatedSites.length > 0 && <section className="learning-card"><h3>相关遗址</h3>{relatedSites.map((site) => <div className="related-record" key={site.id}><strong>{site.name}</strong><p>{site.location} · {site.period}</p><small>{site.note}</small><a href={site.source.url} target="_blank" rel="noreferrer">{site.source.organization}资料入口</a></div>)}</section>}
      {relatedArtifacts.length > 0 && <section className="learning-card"><h3>相关文物</h3>{relatedArtifacts.map((artifact) => <button className="related-link" key={artifact.id} onClick={() => navigate(`artifact/${artifact.id}`)}>{artifact.name}<ChevronRight size={15} /></button>)}</section>}
      {relatedTerms.length > 0 && <section className="learning-card"><h3>相关术语</h3><div className="tag-row">{relatedTerms.map((term) => <button className="content-tag term-tag" key={term.id} onClick={() => navigate(`term/${term.id}`)}>{term.term}</button>)}</div></section>}
      <section className="learning-card"><h3>参考资料</h3>{article.sources.map((source) => <a className="source-link" key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.organization}：《{source.title}》</a>)}</section>
      <button className="primary-button full" onClick={() => navigate(`quiz/${article.id}`)}>开始关联练习 <ArrowRight size={16} /></button>
      <p className="storage-status">阅读记录保存在本地研学护照中。</p>
    </>;
  };

  const renderArtifactList = () => {
    const periods = [...new Set(artifacts.map((artifact) => artifact.period))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    const materials = [...new Set(artifacts.map((artifact) => artifact.material.split(/[、，,（(]/)[0]))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    const uses = [...new Set(artifacts.map((artifact) => artifact.use.split(/[；，。]/)[0]))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    const filtered = artifacts.filter((artifact) => {
      const text = `${artifact.name} ${artifact.otherName ?? ""} ${artifact.findspot} ${artifact.siteId}`;
      return text.includes(artifactSearch)
        && (!artifactPeriod || artifact.period === artifactPeriod)
        && (!artifactMaterial || artifact.material.includes(artifactMaterial))
        && (!artifactUse || artifact.use.includes(artifactUse))
        && (!favoritesOnly || saved.favoriteArtifactIds.includes(artifact.id));
    });
    return <>
      <HubTitle title="文物图鉴" description={`收录 ${artifacts.length} 件可查来源的文物与材料条目。未能核实图片授权的条目显示文字说明。`} />
      <label className="content-search"><Search size={17} /><input value={artifactSearch} onChange={(event) => setArtifactSearch(event.target.value)} placeholder="按名称、别名或地点搜索" /></label>
      <div className="filter-grid">
        <label>时代<select value={artifactPeriod} onChange={(event) => setArtifactPeriod(event.target.value)}><option value="">全部时代</option>{periods.map((period) => <option key={period}>{period}</option>)}</select></label>
        <label>材质<select value={artifactMaterial} onChange={(event) => setArtifactMaterial(event.target.value)}><option value="">全部材质</option>{materials.map((material) => <option key={material}>{material}</option>)}</select></label>
        <label>用途关键词<select value={artifactUse} onChange={(event) => setArtifactUse(event.target.value)}><option value="">全部用途</option>{uses.map((use) => <option key={use}>{use}</option>)}</select></label>
      </div>
      <button className={`secondary-button favorite-filter ${favoritesOnly ? "selected" : ""}`} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)}><Star size={16} />{favoritesOnly ? "查看全部文物" : "只看我的收藏"}</button>
      <p className="content-count">显示 {filtered.length} / {artifacts.length} 条</p>
      <div className="content-card-list artifact-card-list">
        {filtered.map((artifact) => <button className="content-card artifact-list-card" key={artifact.id} onClick={() => navigate(`artifact/${artifact.id}`)}>
          <span className="artifact-symbol">文</span><span className="artifact-list-copy"><strong>{artifact.name}</strong><small>{artifact.period} · {artifact.findspot}</small><em>{artifact.material}</em></span>{saved.favoriteArtifactIds.includes(artifact.id) && <Star size={15} className="favorite-star" fill="currentColor" />}<ChevronRight size={17} />
        </button>)}
        {filtered.length === 0 && <p className="empty-hint">当前筛选条件下没有条目。</p>}
      </div>
    </>;
  };

  const renderArtifact = (artifact: ArtifactRecord) => {
    const site = sites.find((item) => item.id === artifact.siteId);
    const relatedArticles = articles.filter((item) => artifact.articleIds.includes(item.id));
    const relatedTerms = glossary.filter((term) => artifact.terms.includes(term.id));
    const relatedArtifacts = artifacts.filter((item) => item.id !== artifact.id && item.siteId === artifact.siteId).slice(0, 4);
    const relatedQuizzes = quizzes.filter((question) => artifact.quizIds.includes(question.id));
    const favorite = saved.favoriteArtifactIds.includes(artifact.id);
    const studied = saved.studiedArtifactIds.includes(artifact.id);
    return <>
      <button className="text-button" onClick={() => navigate("artifacts")}><ArrowLeft size={15} /> 返回文物图鉴</button>
      <HubTitle eyebrow={artifact.period} title={artifact.name} description={artifact.otherName ?? ""} />
      <ImageNotice image={artifact.image.attribution} />
      <dl className="artifact-detail-facts">
        <div><dt>年代范围</dt><dd>{artifact.dateRange}</dd></div>
        <div><dt>出土地点或背景</dt><dd>{artifact.findspot}</dd></div>
        <div><dt>材质</dt><dd>{artifact.material}</dd></div>
        <div><dt>制作工艺</dt><dd>{artifact.technique}</dd></div>
        <div><dt>用途与背景</dt><dd>{artifact.use}</dd></div>
      </dl>
      <section className="learning-card"><h3>主要考古特征</h3><ul>{artifact.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>
      {site && <section className="learning-card"><h3>相关遗址</h3><strong>{site.name}</strong><p>{site.location} · {site.period}</p><p>{site.note}</p></section>}
      <section className="learning-card"><h3>图片与来源</h3><p>{artifact.image.attribution}。{artifact.image.license}。</p><a className="source-link" href={artifact.source.url} target="_blank" rel="noreferrer">{artifact.source.organization}：{artifact.source.title}</a></section>
      {relatedArticles.length > 0 && <section className="learning-card"><h3>相关文章</h3>{relatedArticles.map((article) => <button className="related-link" key={article.id} onClick={() => navigate(`article/${article.id}`)}>{article.title}<ChevronRight size={15} /></button>)}</section>}
      {relatedQuizzes.length > 0 && <section className="learning-card"><h3>关联练习</h3>{relatedQuizzes.slice(0, 5).map((question) => <button className="related-link" key={question.id} onClick={() => navigate(`quiz/${question.id}`)}>{question.question}<ChevronRight size={15} /></button>)}</section>}
      {relatedArtifacts.length > 0 && <section className="learning-card"><h3>同遗址其他条目</h3>{relatedArtifacts.map((item) => <button className="related-link" key={item.id} onClick={() => navigate(`artifact/${item.id}`)}>{item.name}<ChevronRight size={15} /></button>)}</section>}
      {relatedTerms.length > 0 && <section className="learning-card"><h3>相关术语</h3><div className="tag-row">{relatedTerms.map((term) => <button className="content-tag term-tag" key={term.id} onClick={() => navigate(`term/${term.id}`)}>{term.term}</button>)}</div></section>}
      <div className="content-action-row">
        <button className="secondary-button" aria-pressed={favorite} onClick={() => updateSaved((current) => toggleFavorite(current, artifact.id))}><Star size={16} fill={favorite ? "currentColor" : "none"} />{favorite ? "取消收藏" : "收藏文物"}</button>
        <button className="primary-button" disabled={studied} onClick={() => updateSaved((current) => markArtifactStudied(current, artifact.id))}>{studied ? <><Check size={16} /> 已加入研学护照</> : <><Bookmark size={16} /> 加入研学护照</>}</button>
      </div>
    </>;
  };

  const renderClassroom = () => <>
    <HubTitle title="考古课堂" description={`共 ${lessons.length} 个循序渐进的学习模块。完成前一课后解锁下一课。`} />
    <div className="learning-progress"><div><strong>{saved.completedLessonIds.length} / {lessons.length}</strong><span>已完成课程</span></div><div className="mini-track"><i style={{ width: `${saved.completedLessonIds.length / lessons.length * 100}%` }} /></div></div>
    <div className="content-card-list">
      {lessons.map((lesson, index) => {
        const complete = saved.completedLessonIds.includes(lesson.id);
        const locked = index > 0 && !saved.completedLessonIds.includes(lessons[index - 1].id);
        return <button className={`content-card lesson-list-card ${locked ? "locked-card" : ""}`} key={lesson.id} disabled={locked} onClick={() => navigate(`lesson/${lesson.id}`)}>
          <span className="lesson-number">{String(index + 1).padStart(2, "0")}</span><span className="lesson-list-copy"><strong>{lesson.title}</strong><small>{lesson.objective}</small><em>{complete ? "已完成" : locked ? "完成前一课后解锁" : "可开始学习"}</em></span>{complete ? <Check size={17} /> : <ChevronRight size={17} />}
        </button>;
      })}
    </div>
  </>;

  const renderLesson = (lesson: Lesson) => <>
    <button className="text-button" onClick={() => navigate("classroom")}><ArrowLeft size={15} /> 返回课程列表</button>
    <HubTitle eyebrow="考古课堂" title={lesson.title} description={lesson.objective} />
    {lesson.explanation.map((part, index) => <p className="article-paragraph" key={index}>{part}</p>)}
    <section className="learning-card"><h3>知识摘要</h3><p>{lesson.summary}</p></section>
    <section className="learning-card"><h3>本课术语</h3><div className="tag-row">{glossary.filter((term) => lesson.terms.includes(term.id)).map((term) => <button className="content-tag term-tag" key={term.id} onClick={() => navigate(`term/${term.id}`)}>{term.term}</button>)}</div></section>
    <section className="learning-card"><h3>关联文物</h3>{artifacts.filter((artifact) => lesson.artifactIds.includes(artifact.id)).map((artifact) => <button className="related-link" key={artifact.id} onClick={() => navigate(`artifact/${artifact.id}`)}>{artifact.name}<ChevronRight size={15} /></button>)}</section>
    <section className="learning-card"><h3>课后测试</h3><p>完成本课关联练习并全部答对，即可标记课程完成。答错可查看解析后重试。</p></section>
    <button className="primary-button full" onClick={() => navigate(`quiz/${lesson.id}`)}>开始课后测试 <ArrowRight size={16} /></button>
  </>;

  const categories = useMemo(() => [...new Set(glossary.map((term) => term.category))].sort((a, b) => a.localeCompare(b, "zh-CN")), []);
  const renderGlossary = () => {
    const sorted = [...glossary].sort((a, b) => a.pinyin.localeCompare(b.pinyin, "zh-CN"));
    const filtered = sorted.filter((term) => `${term.term} ${term.definition} ${term.example} ${term.english ?? ""}`.includes(termSearch)
      && (!termCategory || term.category === termCategory));
    return <>
      <HubTitle title="考古词典" description={`共 ${glossary.length} 个术语，按拼音排序。可按分类或关键词查找。`} />
      <label className="content-search"><Search size={17} /><input value={termSearch} onChange={(event) => setTermSearch(event.target.value)} placeholder="搜索术语、释义或示例" /></label>
      <label className="single-filter">分类<select value={termCategory} onChange={(event) => setTermCategory(event.target.value)}><option value="">全部分类</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <p className="content-count">显示 {filtered.length} / {glossary.length} 个术语</p>
      <div className="glossary-list">{filtered.map((term) => <button className="content-card glossary-card" key={term.id} onClick={() => navigate(`term/${term.id}`)}><span className="eyebrow">{term.category} · {term.pinyin}</span><strong>{term.term}</strong><p>{term.definition}</p><small>应用示例：{term.example}</small></button>)}</div>
      {filtered.length === 0 && <p className="empty-hint">没有找到匹配术语。</p>}
    </>;
  };

  const renderTerm = (term: GlossaryTerm) => <>
    <button className="text-button" onClick={() => navigate("glossary")}><ArrowLeft size={15} /> 返回考古词典</button>
    <HubTitle eyebrow={`${term.category} · ${term.pinyin}`} title={term.term} description={term.english ? `英文对应：${term.english}` : ""} />
    <section className="learning-card"><h3>简明解释</h3><p>{term.definition}</p></section>
    <section className="learning-card"><h3>应用示例</h3><p>{term.example}</p></section>
    <section className="learning-card"><h3>关联课程</h3>{lessons.filter((lesson) => term.lessonIds.includes(lesson.id)).map((lesson) => <button className="related-link" key={lesson.id} onClick={() => navigate(`lesson/${lesson.id}`)}>{lesson.title}<ChevronRight size={15} /></button>)}</section>
    <section className="learning-card"><h3>关联文物</h3>{artifacts.filter((artifact) => term.artifactIds.includes(artifact.id)).map((artifact) => <button className="related-link" key={artifact.id} onClick={() => navigate(`artifact/${artifact.id}`)}>{artifact.name}<ChevronRight size={15} /></button>)}</section>
  </>;

  const renderQuiz = () => {
    if (!route.quizTopic) return <>
      <HubTitle title="博古通今" description={`题库共 ${quizzes.length} 道题，覆盖考古方法、史前文化、青铜时代、秦汉和保护实践。`} />
      <section className="learning-card quiz-summary"><strong>学习统计</strong><p>已作答 {saved.answeredQuestionIds.length} 题 · 答对 {saved.correctQuestionIds.length} 题 · 答题 {saved.quizAttempts} 次</p><p>正确率：{saved.answeredQuestionIds.length ? Math.round(saved.correctQuestionIds.length / saved.answeredQuestionIds.length * 100) : 0}%</p></section>
      <div className="content-card-list">
        <button className="content-card" onClick={() => navigate("quiz/all")}><strong>开始综合练习</strong><p>从完整题库中顺序练习，并查看逐题解析。</p><ChevronRight size={17} /></button>
        {saved.wrongQuestionIds.length > 0 && <button className="content-card" onClick={() => navigate("quiz/wrong")}><strong>错题复习</strong><p>还有 {saved.wrongQuestionIds.length} 道待复习题目。</p><ChevronRight size={17} /></button>}
        <h3 className="hub-subheading">按文章练习</h3>
        {articles.map((article) => <button className="content-card" key={article.id} onClick={() => navigate(`quiz/${article.id}`)}><strong>{article.title}</strong><small>{article.quizIds.length} 道关联题</small><ChevronRight size={17} /></button>)}
        <h3 className="hub-subheading">按课程练习</h3>
        {lessons.map((lesson) => <button className="content-card" key={lesson.id} onClick={() => navigate(`quiz/${lesson.id}`)}><strong>{lesson.title}</strong><small>{lesson.quizIds.length} 道课后题</small><ChevronRight size={17} /></button>)}
      </div>
    </>;
    const ids = route.quizTopic === "all"
      ? quizzes.map((question) => question.id)
      : route.quizTopic === "wrong"
        ? saved.wrongQuestionIds
        : quizzes.some((question) => question.id === route.quizTopic)
          ? [route.quizTopic]
          : articles.find((article) => article.id === route.quizTopic)?.quizIds
          ?? lessons.find((lesson) => lesson.id === route.quizTopic)?.quizIds
          ?? [];
    const validIds = ids.filter((id) => quizzes.some((question) => question.id === id));
    if (validIds.length === 0) return <><HubTitle title="练习暂不可用" description="此主题暂无关联题目，或错题已经复习完成。" /><button className="secondary-button" onClick={() => navigate("quiz")}>返回题库</button></>;
    const title = articles.find((article) => article.id === route.quizTopic)?.title
      ?? lessons.find((lesson) => lesson.id === route.quizTopic)?.title
      ?? (route.quizTopic === "wrong" ? "错题复习" : "综合练习");
    return <QuizRun key={`${route.quizTopic}:${validIds.join(",")}`} title={title} questions={validIds.map((id) => quizzes.find((question) => question.id === id)!).filter(Boolean)} saved={saved} updateSaved={updateSaved} onBack={() => navigate("quiz")} onComplete={() => {
      if (lessons.some((lesson) => lesson.id === route.quizTopic)) updateSaved((current) => completeLesson(current, route.quizTopic!));
    }} />;
  };

  const currentArticle = route.section === "article" ? articles.find((article) => article.id === route.id) : undefined;
  const currentArtifact = route.section === "artifact" ? artifacts.find((artifact) => artifact.id === route.id) : undefined;
  const currentLesson = route.section === "lesson" ? lessons.find((lesson) => lesson.id === route.id) : undefined;
  const currentTerm = route.section === "term" ? glossary.find((term) => term.id === route.id) : undefined;
  useEffect(() => {
    if (currentArticle) updateSaved((current) => markArticleRead(current, currentArticle.id));
  }, [currentArticle?.id]);

  let content;
  if (route.section === "home") content = <HubHome onNavigate={navigate} />;
  else if (route.section === "articles") content = renderArticleList();
  else if (route.section === "article") content = currentArticle ? renderArticle(currentArticle) : <MissingContent onBack={() => navigate("articles")} />;
  else if (route.section === "artifacts") content = renderArtifactList();
  else if (route.section === "artifact") content = currentArtifact ? renderArtifact(currentArtifact) : <MissingContent onBack={() => navigate("artifacts")} />;
  else if (route.section === "classroom") content = renderClassroom();
  else if (route.section === "lesson") content = currentLesson ? renderLesson(currentLesson) : <MissingContent onBack={() => navigate("classroom")} />;
  else if (route.section === "glossary") content = renderGlossary();
  else if (route.section === "term") content = currentTerm ? renderTerm(currentTerm) : <MissingContent onBack={() => navigate("glossary")} />;
  else content = renderQuiz();

  const activeNav: ContentSection = ["article", "articles"].includes(route.section) ? "articles"
    : ["artifact", "artifacts"].includes(route.section) ? "artifacts"
      : ["lesson", "classroom"].includes(route.section) ? "classroom"
        : ["term", "glossary"].includes(route.section) ? "glossary" : "quiz";

  return <section className="content-hub">
    {route.section !== "home" && <nav className="hub-nav" aria-label="内容导航">{nav.map((item) => <button key={item.id} className={activeNav === item.id ? "active" : ""} onClick={() => navigate(item.id)}>{item.title}</button>)}</nav>}
    {content}
    {route.section === "home" && <nav className="hub-nav hub-home-nav" aria-label="内容导航">{nav.map((item) => <button key={item.id} onClick={() => navigate(item.id)}>{item.title}</button>)}</nav>}
  </section>;
}

function HubHome({ onNavigate }: { onNavigate: (path?: string) => void }) {
  const cards = [
    { id: "articles", title: "内容中心", count: `${articles.length} 篇专题文章`, description: "从史前农业到汉代物质交流，循证学习中国考古。", },
    { id: "artifacts", title: "文物图鉴", count: `${artifacts.length} 件文物与材料`, description: "按时代、材质和用途筛选，收藏并加入研学护照。", },
    { id: "classroom", title: "考古课堂", count: `${lessons.length} 个循序课程`, description: "从地层、调查到测年、保护，完成课程与练习。", },
    { id: "glossary", title: "考古词典", count: `${glossary.length} 个术语`, description: "按拼音和分类查询概念，并查看相关课程与文物。", },
    { id: "quiz", title: "博古通今", count: `${quizzes.length} 道题目`, description: "查看解析、统计成绩、复习错题。", },
  ];
  return <>
    <HubTitle title="考古学习中心" description="文章、文物、课程和练习共享稳定的数据关联，学习记录保存在当前浏览器。" />
    <div className="hub-dashboard">{cards.map((card) => <button className="content-card hub-dashboard-card" key={card.id} onClick={() => onNavigate(card.id)}><span className="eyebrow">{card.count}</span><strong>{card.title}</strong><p>{card.description}</p><ArrowRight size={17} /></button>)}</div>
    <section className="notice-card"><strong>内容说明</strong><small>教学场景与拼合游戏均明确标记为模拟。配图授权未确认的条目不显示第三方图片。本文内容不构成考古发掘报告。</small></section>
  </>;
}

function QuizRun({ title, questions, saved, updateSaved, onBack, onComplete }: {
  title: string;
  questions: QuizQuestion[];
  saved: SavedState;
  updateSaved: (updater: (current: SavedState) => SavedState) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  const allCorrect = questions.every((item) => results[item.id] === true);
  if (finished) {
    const correct = Object.values(results).filter(Boolean).length;
    return <section className="quiz-result">
      <button className="text-button" onClick={onBack}><ArrowLeft size={15} /> 返回练习目录</button>
      <HubTitle eyebrow="练习结果" title={allCorrect ? "本组练习全部答对" : "本组练习已完成"} description={`答对 ${correct} / ${questions.length} 题。正确答案会记录一次积分，重复练习不会重复计分。`} />
      {!allCorrect && <section className="learning-card"><h3>错题复习</h3>{questions.filter((item) => !results[item.id]).map((item) => <p key={item.id}><strong>{item.question}</strong><br />正确答案：{item.options[item.answer]}</p>)}</section>}
      {allCorrect && <section className="notice-card"><Check size={18} /><small>本组题目全部正确，可在研学护照查看学习进度。</small></section>}
      <button className="primary-button full" onClick={() => { if (allCorrect) onComplete(); onBack(); }}>完成并返回</button>
      {!allCorrect && <button className="secondary-button full" onClick={() => { setFinished(false); setIndex(0); setChoice(null); setResults({}); }}>重新练习本组</button>}
      <p className="quiz-stats">累计正确 {saved.correctQuestionIds.length} 题 · 累计答题 {saved.quizAttempts} 次</p>
    </section>;
  }
  return <section className="quiz-run">
    <button className="text-button" onClick={onBack}><ArrowLeft size={15} /> 返回练习目录</button>
    <HubTitle eyebrow={`${index + 1} / ${questions.length}`} title={title} description="每个选项都有解析。答错后可以重新作答，积分按题目唯一发放。" />
    <article className="learning-card question-card">
      <span className="eyebrow">{question.difficulty} · {question.knowledgePoint}</span>
      <h2>{question.question}</h2>
      {question.hint && <p className="question-hint">提示：{question.hint}</p>}
      <div className="quiz-options">
        {question.options.map((option, optionIndex) => <button key={`${question.id}-${optionIndex}`} className={`quiz-option ${choice === optionIndex ? "chosen" : ""} ${results[question.id] !== undefined && optionIndex === question.answer ? "correct" : ""} ${results[question.id] === false && choice === optionIndex ? "wrong" : ""}`} aria-pressed={choice === optionIndex} onClick={() => setChoice(optionIndex)} disabled={results[question.id] !== undefined}>
          <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
        </button>)}
      </div>
      {results[question.id] !== undefined && <div className={`quiz-feedback ${results[question.id] ? "success" : "try-again"}`}><strong>{results[question.id] ? "回答正确" : "回答不正确"}</strong>{question.explanations.map((explanation, optionIndex) => <p key={optionIndex}><b>{String.fromCharCode(65 + optionIndex)}.</b> {explanation}</p>)}</div>}
      {results[question.id] === undefined
        ? <button className="primary-button full" disabled={choice === null} onClick={() => {
          if (choice === null) return;
          const correct = choice === question.answer;
          setResults((current) => ({ ...current, [question.id]: correct }));
          updateSaved((current) => answerQuestion(current, question.id, correct));
        }}>提交答案</button>
        : <button className="primary-button full" onClick={() => {
          if (index + 1 === questions.length) setFinished(true);
          else { setIndex(index + 1); setChoice(null); }
        }}>{index + 1 === questions.length ? "查看练习结果" : "下一题"} <ArrowRight size={16} /></button>}
    </article>
    <p className="quiz-stats">本组进度：{index + (results[question.id] !== undefined ? 1 : 0)} / {questions.length} · 积分不重复发放</p>
  </section>;
}

function HubTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return <header className="hub-title">{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</header>;
}

function ImageNotice({ image }: { image: string }) {
  return <div className="image-placeholder" role="img" aria-label="暂无已核实授权的图片"><span>图片暂缺</span><small>{image}</small></div>;
}

function MissingContent({ onBack }: { onBack: () => void }) {
  return <section className="learning-card"><h2>没有找到这条内容</h2><p>链接可能已经失效，或者内容暂未收录。</p><button className="secondary-button" onClick={onBack}>返回列表</button></section>;
}
