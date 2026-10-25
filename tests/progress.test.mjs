import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const progress = await import(loadTypeScript("src/progress.ts"));
const data = await import(loadTypeScript("src/data/index.ts"));
const { initialState, parseSaved, readSaved, answerQuestion, markArticleRead, markArtifactStudied, placeRestorationPiece, resetRestorationTask, recordExcavationFind, resetExcavationScene, setExcavationProgress } = progress;

test("首次访问、无效结构和旧版本数据可安全解析", () => {
  for (const value of [null, [], "错误数据", 42]) assert.deepEqual(parseSaved(value), initialState);
  const result = parseSaved({ points: -8, foundIds: ["coin-01", "coin-01", {}, "bad"], stamps: ["site", "site", 7], completed: ["false", true], restored: ["rim", "rim"], digProgress: Infinity });
  assert.equal(result.points, 0);
  assert.deepEqual(result.foundIds, ["coin-01"]);
  assert.deepEqual(result.stamps, ["site"]);
  assert.deepEqual(result.completed, [false, true, false]);
  assert.deepEqual(result.restored, ["rim"]);
  assert.equal(result.digProgress, 0);
  assert.equal(parseSaved({ points: NaN }).points, 0);
  const task = data.restorationTasks[0];
  assert.deepEqual(parseSaved({ restorationPieces: { [task.id]: ["rim", "frame", "rim"] } }).restorationPieces[task.id], ["rim"]);
});

test("localStorage 缺失、无效 JSON 或读取异常时安全恢复", () => {
  const previous = globalThis.localStorage;
  try {
    globalThis.localStorage = { getItem: () => "{无效 JSON" };
    assert.deepEqual(readSaved(), initialState);
    globalThis.localStorage = { getItem: () => { throw new Error("storage unavailable"); } };
    assert.deepEqual(readSaved(), initialState);
    delete globalThis.localStorage;
    assert.deepEqual(readSaved(), initialState);
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});

test("旧数据的进度、积分、文物和印章保持兼容", () => {
  const old = { foundIds: ["coin-01"], completed: [true, false, true], stamps: ["restore"], points: 85 };
  const next = parseSaved(old);
  for (const key of Object.keys(old)) assert.deepEqual(next[key], old[key]);
  assert.equal(next.version, 2);
});

test("文章、文物和题目奖励只发放一次", () => {
  let state = markArticleRead(initialState, data.articles[0].id);
  state = markArticleRead(state, data.articles[0].id);
  assert.equal(state.points, 2);
  state = markArtifactStudied(state, data.artifacts[0].id);
  state = markArtifactStudied(state, data.artifacts[0].id);
  assert.equal(state.points, 5);
  const question = data.quizzes[0];
  state = answerQuestion(state, question.id, false);
  assert.equal(state.points, 5);
  state = answerQuestion(state, question.id, true);
  assert.equal(state.points, 10);
  state = answerQuestion(state, question.id, true);
  assert.equal(state.points, 10);
  assert.deepEqual(state.wrongQuestionIds, []);
  const loaded = parseSaved(JSON.parse(JSON.stringify(state)));
  assert.equal(answerQuestion(loaded, question.id, true).points, 10);
});

test("发掘奖励要求正确模拟层位且刷新、重置后不重复领取", () => {
  const scene = data.excavations.find(({ id }) => id === "dig-stratigraphy");
  const firstLayer = scene.layers.find(({ id }) => id === "occupation");
  const secondLayer = scene.layers.find(({ id }) => id === "earlier");
  let state = setExcavationProgress(initialState, scene.id, 100);
  assert.equal(state.completedExcavationIds.includes(scene.id), false);
  assert.equal(recordExcavationFind(state, scene.id, firstLayer.artifactIds[0], secondLayer.id), state);
  state = recordExcavationFind(state, scene.id, firstLayer.artifactIds[0], firstLayer.id);
  assert.equal(state.completedExcavationIds.includes(scene.id), false);
  state = recordExcavationFind(state, scene.id, secondLayer.artifactIds[0], secondLayer.id);
  assert.deepEqual(state.completedExcavationIds, [scene.id]);
  assert.equal(state.points, 20);
  state = parseSaved(JSON.parse(JSON.stringify(state)));
  assert.equal(state.rewardLedger.includes(`excavation-find:${scene.id}:${firstLayer.artifactIds[0]}`), true);
  state = resetExcavationScene(state, scene.id);
  assert.deepEqual(state.excavationFoundArtifactIds[scene.id], scene.artifactIds);
  state = setExcavationProgress(state, scene.id, 100);
  state = recordExcavationFind(state, scene.id, firstLayer.artifactIds[0], firstLayer.id);
  assert.equal(state.points, 20);
  assert.deepEqual(state.completedExcavationIds, [scene.id]);
});

test("五项修复任务的完成奖励重做后不重复", () => {
  const task = data.restorationTasks[0];
  let state = initialState;
  for (const fragment of task.fragments) {
    assert.equal(placeRestorationPiece(state, task.id, fragment.id, "wrong-position"), state);
    state = placeRestorationPiece(state, task.id, fragment.id, fragment.target);
  }
  assert.deepEqual(state.completedRestorationIds, [task.id]);
  assert.equal(state.points, 15);
  state = resetRestorationTask(parseSaved(JSON.parse(JSON.stringify(state))), task.id);
  for (const fragment of task.fragments) state = placeRestorationPiece(state, task.id, fragment.id, fragment.target);
  assert.equal(state.points, 15);
});
