import { articles } from "./data/articles";
import { artifacts as catalogArtifacts } from "./data/artifacts";
import { excavations } from "./data/excavations";
import { lessons } from "./data/lessons";
import { quizzes } from "./data/quizzes";
import { artifacts as legacyArtifacts } from "./data";
import { restorationTasks } from "./data/restoration";

export const STORAGE_KEY = "tanmi-guji-progress-v1";
export type SavedState = {
  version: 2;
  foundIds: string[];
  completed: boolean[];
  stamps: string[];
  points: number;
  restored: string[];
  digProgress: number;
  quizRewarded: boolean;
  readArticleIds: string[];
  completedLessonIds: string[];
  favoriteArtifactIds: string[];
  studiedArtifactIds: string[];
  excavationProgress: Record<string, number>;
  excavationFoundArtifactIds: Record<string, string[]>;
  excavationFindLayers: Record<string, Record<string, string>>;
  completedExcavationIds: string[];
  completedRestorationIds: string[];
  restorationPieces: Record<string, string[]>;
  answeredQuestionIds: string[];
  correctQuestionIds: string[];
  wrongQuestionIds: string[];
  rewardLedger: string[];
  quizAttempts: number;
};

export const initialState: SavedState = {
  version: 2,
  foundIds: [],
  completed: [false, false, false],
  stamps: [],
  points: 0,
  restored: [],
  digProgress: 0,
  quizRewarded: false,
  readArticleIds: [],
  completedLessonIds: [],
  favoriteArtifactIds: [],
  studiedArtifactIds: [],
  excavationProgress: {},
  excavationFoundArtifactIds: {},
  excavationFindLayers: {},
  completedExcavationIds: [],
  completedRestorationIds: [],
  restorationPieces: {},
  answeredQuestionIds: [],
  correctQuestionIds: [],
  wrongQuestionIds: [],
  rewardLedger: [],
  quizAttempts: 0,
};

const artifactIds = new Set(catalogArtifacts.map((artifact) => artifact.id));
const articleIds = new Set(articles.map((article) => article.id));
const lessonIds = new Set(lessons.map((lesson) => lesson.id));
const questionIds = new Set(quizzes.map((question) => question.id));
const excavationIds = new Set(excavations.map((scene) => scene.id));
const restorationIds = new Set(restorationTasks.map((task) => task.id));
const legacyArtifactIds = new Set(legacyArtifacts.map((artifact) => artifact.id));
const stampIds = new Set(["site", "artifact", "restore", "scholar"]);

function strings(value: unknown, allowed: Set<string>): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string" && allowed.has(entry)))]
    : [];
}

function recordOfArrays(value: unknown, keys: Set<string>, itemIds: Set<string>): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => keys.has(key))
    .map(([key, items]) => [key, strings(items, itemIds)]));
}

function recordOfProgress(value: unknown, allowed: Set<string>): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => allowed.has(key))
    .map(([key, progress]) => [key, typeof progress === "number" && Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0]));
}

function recordOfFindLayers(value: unknown): Record<string, Record<string, string>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const records: Record<string, Record<string, string>> = {};
  for (const [sceneId, valueForScene] of Object.entries(value)) {
    const scene = excavations.find(({ id }) => id === sceneId);
    if (!scene || !valueForScene || typeof valueForScene !== "object" || Array.isArray(valueForScene)) continue;
    const layerIds = new Set(scene.layers.map(({ id }) => id));
    const entries: [string, string][] = [];
    for (const [artifactId, layerId] of Object.entries(valueForScene)) {
      if (scene.artifactIds.includes(artifactId) && typeof layerId === "string" && layerIds.has(layerId)) {
        entries.push([artifactId, layerId]);
      }
    }
    records[sceneId] = Object.fromEntries(entries);
  }
  return records;
}

function recordOfRestorationPieces(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const records: Record<string, string[]> = {};
  for (const [taskId, valueForTask] of Object.entries(value)) {
    const task = restorationTasks.find(({ id }) => id === taskId);
    if (!task || !Array.isArray(valueForTask)) continue;
    const pieceIds = new Set(task.fragments.map(({ id }) => id));
    records[taskId] = strings(valueForTask, pieceIds);
  }
  return records;
}

export function parseSaved(value: unknown): SavedState {
  const p = value && typeof value === "object" && !Array.isArray(value) ? value as Partial<SavedState> : {};
  const completed = [0, 1, 2].map((index) => Array.isArray(p.completed) && p.completed[index] === true);
  const oldRestoreComplete = Array.isArray(p.restored) && ["rim", "body", "base"].every((id) => p.restored?.includes(id));
  const rewardLedger = strings(p.rewardLedger, new Set([
    ...articles.map(({ id }) => `article:${id}`),
    ...lessons.map(({ id }) => `lesson:${id}`),
    ...catalogArtifacts.map(({ id }) => `artifact:${id}`),
    ...excavations.map(({ id }) => `excavation:${id}`),
    ...excavations.flatMap((scene) => scene.artifactIds.map((artifactId) => `excavation-find:${scene.id}:${artifactId}`)),
    ...restorationTasks.map(({ id }) => `restoration:${id}`),
    ...quizzes.map(({ id }) => `quiz:${id}`),
    "legacy:quiz", "legacy:restore",
  ]));
  if (p.quizRewarded) rewardLedger.push("legacy:quiz");
  if (oldRestoreComplete || completed[0]) rewardLedger.push("legacy:restore");

  return {
    ...initialState,
    foundIds: strings(p.foundIds, legacyArtifactIds),
    completed,
    stamps: strings(p.stamps, stampIds),
    points: typeof p.points === "number" && Number.isFinite(p.points) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(p.points))) : 0,
    restored: strings(p.restored, new Set(["rim", "body", "base"])),
    digProgress: typeof p.digProgress === "number" && Number.isFinite(p.digProgress) ? Math.max(0, Math.min(100, p.digProgress)) : 0,
    quizRewarded: p.quizRewarded === true || (p.quizRewarded === undefined && completed[2]),
    readArticleIds: strings(p.readArticleIds, articleIds),
    completedLessonIds: strings(p.completedLessonIds, lessonIds),
    favoriteArtifactIds: strings(p.favoriteArtifactIds, artifactIds),
    studiedArtifactIds: strings(p.studiedArtifactIds, artifactIds),
    excavationProgress: recordOfProgress(p.excavationProgress, excavationIds),
    excavationFoundArtifactIds: recordOfArrays(p.excavationFoundArtifactIds, excavationIds, artifactIds),
    excavationFindLayers: recordOfFindLayers(p.excavationFindLayers),
    completedExcavationIds: strings(p.completedExcavationIds, excavationIds),
    completedRestorationIds: strings(p.completedRestorationIds, restorationIds),
    restorationPieces: recordOfRestorationPieces(p.restorationPieces),
    answeredQuestionIds: strings(p.answeredQuestionIds, questionIds),
    correctQuestionIds: strings(p.correctQuestionIds, questionIds),
    wrongQuestionIds: strings(p.wrongQuestionIds, questionIds),
    rewardLedger: [...new Set(rewardLedger)],
    quizAttempts: typeof p.quizAttempts === "number" && Number.isFinite(p.quizAttempts) ? Math.max(0, Math.floor(p.quizAttempts)) : 0,
  };
}

export function readSaved(): SavedState {
  try {
    return parseSaved(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
  } catch {
    return { ...initialState };
  }
}

export const revealThreshold = (id: string) => id === "pottery-01" ? 28 : id === "coin-01" ? 65 : 82;

function awardOnce(current: SavedState, id: string, amount: number): SavedState {
  if (current.rewardLedger.includes(id)) return current;
  return { ...current, points: Math.min(Number.MAX_SAFE_INTEGER, current.points + amount), rewardLedger: [...current.rewardLedger, id] };
}

export function markArticleRead(current: SavedState, id: string): SavedState {
  if (!articleIds.has(id) || current.readArticleIds.includes(id)) return current;
  return { ...awardOnce(current, `article:${id}`, 2), readArticleIds: [...current.readArticleIds, id] };
}

export function toggleFavorite(current: SavedState, id: string): SavedState {
  if (!artifactIds.has(id)) return current;
  return {
    ...current,
    favoriteArtifactIds: current.favoriteArtifactIds.includes(id)
      ? current.favoriteArtifactIds.filter((artifactId) => artifactId !== id)
      : [...current.favoriteArtifactIds, id],
  };
}

export function markArtifactStudied(current: SavedState, id: string): SavedState {
  if (!artifactIds.has(id) || current.studiedArtifactIds.includes(id)) return current;
  return { ...awardOnce(current, `artifact:${id}`, 3), studiedArtifactIds: [...current.studiedArtifactIds, id] };
}

function completeSceneIfReady(current: SavedState, sceneId: string): SavedState {
  const scene = excavations.find(({ id }) => id === sceneId);
  if (!scene || current.completedExcavationIds.includes(sceneId)) return current;
  const found = current.excavationFoundArtifactIds[sceneId] ?? [];
  if ((current.excavationProgress[sceneId] ?? 0) < 100 || !scene.artifactIds.every((id) => found.includes(id))) return current;
  return {
    ...awardOnce(current, `excavation:${sceneId}`, 10),
    completedExcavationIds: [...current.completedExcavationIds, sceneId],
    completed: [current.completed[0], true, current.completed[2]],
  };
}

export function setExcavationProgress(current: SavedState, sceneId: string, progress: number): SavedState {
  if (!excavationIds.has(sceneId) || !Number.isFinite(progress)) return current;
  const next = Math.max(0, Math.min(100, progress));
  return completeSceneIfReady({ ...current, excavationProgress: { ...current.excavationProgress, [sceneId]: next } }, sceneId);
}

export function recordExcavationFind(current: SavedState, sceneId: string, artifactId: string, layerId: string): SavedState {
  const scene = excavations.find(({ id }) => id === sceneId);
  if (!scene || !scene.artifactIds.includes(artifactId) ||
      !scene.layers.some((layer) => layer.id === layerId && layer.artifactIds.includes(artifactId))) return current;
  const found = current.excavationFoundArtifactIds[sceneId] ?? [];
  if (found.includes(artifactId)) return current;
  const next = {
    ...awardOnce(current, `excavation-find:${sceneId}:${artifactId}`, 5),
    excavationFoundArtifactIds: { ...current.excavationFoundArtifactIds, [sceneId]: [...found, artifactId] },
    excavationFindLayers: { ...current.excavationFindLayers, [sceneId]: { ...current.excavationFindLayers[sceneId], [artifactId]: layerId } },
  };
  return completeSceneIfReady(next, sceneId);
}

export function completeExcavation(current: SavedState, sceneId: string): SavedState {
  return completeSceneIfReady(current, sceneId);
}

export function resetExcavationScene(current: SavedState, sceneId: string): SavedState {
  if (!excavationIds.has(sceneId)) return current;
  return {
    ...current,
    excavationProgress: { ...current.excavationProgress, [sceneId]: 0 },
  };
}

export function completeLesson(current: SavedState, id: string): SavedState {
  if (!lessonIds.has(id) || current.completedLessonIds.includes(id)) return current;
  return {
    ...awardOnce(current, `lesson:${id}`, 5),
    completedLessonIds: [...current.completedLessonIds, id],
  };
}

export function placeRestorationPiece(current: SavedState, taskId: string, pieceId: string, targetId: string): SavedState {
  const task = restorationTasks.find(({ id }) => id === taskId);
  if (!task || !task.fragments.some((fragment) => fragment.id === pieceId && fragment.target === targetId)) return current;
  const placed = current.restorationPieces[taskId] ?? [];
  if (placed.includes(pieceId)) return current;
  const nextPlaced = [...placed, pieceId];
  const completedRestorationIds = nextPlaced.length === task.fragments.length && !current.completedRestorationIds.includes(taskId)
    ? [...current.completedRestorationIds, taskId]
    : current.completedRestorationIds;
  const next = {
    ...current,
    restorationPieces: { ...current.restorationPieces, [taskId]: nextPlaced },
    completedRestorationIds,
  };
  return completedRestorationIds.includes(taskId) && !current.completedRestorationIds.includes(taskId)
    ? awardOnce({ ...next, completed: [true, current.completed[1], current.completed[2]] }, `restoration:${taskId}`, 15)
    : next;
}

export function resetRestorationTask(current: SavedState, taskId: string): SavedState {
  if (!restorationIds.has(taskId)) return current;
  return {
    ...current,
    restorationPieces: { ...current.restorationPieces, [taskId]: [] },
  };
}

export function answerQuestion(current: SavedState, questionId: string, correct: boolean): SavedState {
  if (!questionIds.has(questionId)) return current;
  const answeredQuestionIds = current.answeredQuestionIds.includes(questionId)
    ? current.answeredQuestionIds
    : [...current.answeredQuestionIds, questionId];
  const correctQuestionIds = correct && !current.correctQuestionIds.includes(questionId)
    ? [...current.correctQuestionIds, questionId]
    : current.correctQuestionIds;
  const wrongQuestionIds = correct
    ? current.wrongQuestionIds.filter((id) => id !== questionId)
    : current.correctQuestionIds.includes(questionId) || current.wrongQuestionIds.includes(questionId)
      ? current.wrongQuestionIds
      : [...current.wrongQuestionIds, questionId];
  let next = {
    ...current,
    answeredQuestionIds,
    correctQuestionIds,
    wrongQuestionIds,
    quizAttempts: current.quizAttempts + 1,
    completed: correct ? [current.completed[0], current.completed[1], true] : current.completed,
    quizRewarded: current.quizRewarded || correct,
  };
  if (correct) next = awardOnce(next, `quiz:${questionId}`, 5);
  return next;
}

export function rewardQuiz(current: SavedState, correct: boolean): SavedState {
  const next = {
    ...current,
    completed: correct ? [current.completed[0], current.completed[1], true] : current.completed,
    quizRewarded: current.quizRewarded || correct,
  };
  return correct ? awardOnce(next, "legacy:quiz", 10) : next;
}

export function placePiece(current: SavedState, id: string): SavedState {
  if (!["rim", "body", "base"].includes(id) || current.restored.includes(id)) return current;
  const restored = [...current.restored, id];
  const done = restored.length === 3;
  const next = {
    ...current,
    restored,
    completed: [current.completed[0] || done, current.completed[1], current.completed[2]],
  };
  return done ? awardOnce(next, "legacy:restore", 15) : next;
}
