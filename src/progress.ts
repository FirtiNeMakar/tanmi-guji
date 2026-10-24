import { artifacts } from './data';
export const STORAGE_KEY = 'tanmi-guji-progress-v1';
export type SavedState = { foundIds: string[]; completed: boolean[]; stamps: string[]; points: number; restored: string[]; digProgress: number; quizRewarded: boolean };
export const initialState: SavedState = { foundIds: [], completed: [false, false, false], stamps: [], points: 0, restored: [], digProgress: 0, quizRewarded: false };
const uniqueStrings = (value: unknown, allowed: string[]) => Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && allowed.includes(id)))] : [];
export function parseSaved(value: unknown): SavedState {
  const p = value && typeof value === 'object' ? value as Partial<SavedState> : {};
  return {
    foundIds: uniqueStrings(p.foundIds, artifacts.map(a => a.id)),
    completed: [0, 1, 2].map(i => Array.isArray(p.completed) && p.completed[i] === true),
    stamps: uniqueStrings(p.stamps, ['site', 'artifact', 'restore', 'scholar']),
    points: typeof p.points === 'number' && Number.isFinite(p.points) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(p.points))) : 0,
    restored: uniqueStrings(p.restored, ['rim', 'body', 'base']),
    digProgress: typeof p.digProgress === 'number' && Number.isFinite(p.digProgress) ? Math.max(0, Math.min(100, p.digProgress)) : 0,
    // Old versions did not record whether a correct answer had earned points.
    quizRewarded: p.quizRewarded === true || (p.quizRewarded === undefined && Array.isArray(p.completed) && p.completed[2] === true),
  };
}
export function readSaved(): SavedState {
  try { return parseSaved(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
  catch { return { ...initialState }; }
}
export const revealThreshold = (id: string) => id === 'pottery-01' ? 28 : id === 'coin-01' ? 65 : 82;
export function rewardQuiz(current: SavedState, correct: boolean): SavedState {
  return { ...current, completed: [current.completed[0], current.completed[1], true], quizRewarded: current.quizRewarded || correct, points: current.points + (correct && !current.quizRewarded ? 10 : 0) };
}
export function placePiece(current: SavedState, id: string): SavedState {
  if (!['rim', 'body', 'base'].includes(id) || current.restored.includes(id)) return current;
  const restored = [...current.restored, id];
  const done = restored.length === 3;
  return { ...current, restored, completed: [current.completed[0] || done, current.completed[1], current.completed[2]], points: current.points + (done && !current.completed[0] ? 15 : 0) };
}
