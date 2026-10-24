import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const transpile = file => ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const data = moduleUrl(transpile('../src/data.ts'));
const { parseSaved, initialState, rewardQuiz, placePiece } = await import(moduleUrl(transpile('../src/progress.ts').replace('"./data"', JSON.stringify(data)).replace("'./data'", JSON.stringify(data))));
test('首次访问及非法结构安全恢复', () => {
  for (const value of [null, [], '错误数据', 42]) assert.deepEqual(parseSaved(value), initialState);
  const result = parseSaved({ points: -8, foundIds: ['pottery-01', 'pottery-01', {}, 'bad'], stamps: ['site', 'site', 7], completed: ['false', true], restored: ['rim', 'rim'], digProgress: Infinity });
  assert.equal(result.points, 0); assert.deepEqual(result.foundIds, ['pottery-01']); assert.deepEqual(result.stamps, ['site']); assert.deepEqual(result.completed, [false, true, false]); assert.deepEqual(result.restored, ['rim']); assert.equal(result.digProgress, 0);
  assert.equal(parseSaved({points: NaN}).points, 0);
});
test('旧数据保留积分、文物、印章及完成状态', () => {
  const old = { foundIds: ['coin-01'], completed: [true, false, true], stamps: ['restore'], points: 85 };
  const next = parseSaved(old);
  for (const key of Object.keys(old)) assert.deepEqual(next[key], old[key]);
  assert.equal(rewardQuiz(next, true).points, 85);
});
test('答错不加分，答对奖励只发放一次，刷新后仍然如此', () => {
  let state = rewardQuiz(parseSaved(null), false); assert.equal(state.points, 0);
  state = rewardQuiz(state, true); assert.equal(state.points, 10);
  state = rewardQuiz(parseSaved(JSON.parse(JSON.stringify(state))), true); assert.equal(state.points, 10);
});
test('重复放置、重置重做和刷新不重复领取修复奖励', () => {
  let state = placePiece(parseSaved(null), 'rim');
  assert.equal(placePiece(state, 'rim'), state);
  assert.equal(placePiece(state, 'invalid'), state);
  state = placePiece(state, 'body'); assert.equal(state.points, 0);
  state = placePiece(state, 'base'); assert.equal(state.points, 15);
  state = parseSaved({ ...state, restored: [] });
  for (const id of ['rim','body','base']) state = placePiece(state, id);
  assert.equal(state.points, 15); assert.equal(state.completed[0], true);
});
