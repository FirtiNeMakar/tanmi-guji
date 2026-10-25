export type TabId = "home" | "dig" | "restore" | "passport" | "discover" | "settings";
export type ContentSection = "quiz" | "articles" | "artifacts" | "classroom" | "glossary";
export type ContentSource = { title: string; url: string; organization: string };
export type TeachingImage = { url: string | null; alt: string; attribution: string; license: string; sourceUrl: string | null };
export type SiteRecord = { id: string; name: string; location: string; period: string; note: string; source: ContentSource };

export type Article = {
  id: string;
  title: string;
  summary: string;
  period: string;
  timeRange: string;
  body: string[];
  keyPoints: string[];
  siteIds: string[];
  artifactIds: string[];
  image: TeachingImage;
  keywords: string[];
  terms: string[];
  quizIds: string[];
  sources: ContentSource[];
};

export type ArtifactRecord = {
  id: string;
  name: string;
  otherName?: string;
  period: string;
  dateRange: string;
  findspot: string;
  material: string;
  technique: string;
  use: string;
  features: string[];
  siteId: string;
  image: TeachingImage;
  source: ContentSource;
  articleIds: string[];
  terms: string[];
  quizIds: string[];
};

export type Lesson = {
  id: string;
  title: string;
  objective: string;
  explanation: string[];
  summary: string;
  terms: string[];
  artifactIds: string[];
  quizIds: string[];
};

export type GlossaryTerm = {
  id: string;
  term: string;
  pinyin: string;
  definition: string;
  example: string;
  category: string;
  lessonIds: string[];
  artifactIds: string[];
  english?: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanations: string[];
  difficulty: "基础" | "进阶";
  knowledgePoint: string;
  hint?: string;
  articleId?: string;
  lessonId?: string;
  artifactId?: string;
};

export type ExcavationScene = {
  id: string;
  title: string;
  description: string;
  objective: string;
  simulated: true;
  layers: { id: string; name: string; depth: string; description: string; artifactIds: string[] }[];
  artifactIds: string[];
  task: string;
  endCondition: string;
  relatedLessonId: string;
};

export type RestorationTask = {
  id: string;
  title: string;
  background: string;
  artifactId: string;
  fragments: { id: string; name: string; target: string; symbol: string }[];
  rule: string;
  explanation: string;
};

export type Artifact = {
  id: string;
  name: string;
  chineseName: string;
  period: string;
  material: string;
  purpose: string;
  layer: number;
  description: string;
  symbol: string;
};

export type Layer = {
  id: number;
  title: string;
  chineseTitle: string;
  depth: string;
  description: string;
  color: string;
  artifactId?: string;
};