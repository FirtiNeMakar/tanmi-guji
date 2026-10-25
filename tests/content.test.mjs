import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./helpers/load-typescript.mjs";

const { articles, artifacts, excavations, glossary, lessons, quizzes, restorationTasks, sites } = await import(loadTypeScript("src/data/index.ts"));
const ids = (records) => new Set(records.map(({ id }) => id));
const articleIds = ids(articles);
const artifactIds = ids(artifacts);
const lessonIds = ids(lessons);
const termIds = ids(glossary);
const quizIds = ids(quizzes);
const siteIds = ids(sites);

function assertUnique(records, name) {
  const values = records.map(({ id }) => id);
  assert.equal(new Set(values).size, values.length, `${name} 的 ID 必须唯一`);
}
function assertReferences(records, field, allowedIds, name) {
  const missing = [];
  for (const record of records) {
    const value = record[field];
    const references = Array.isArray(value) ? value : value ? [value] : [];
    for (const reference of references) {
      if (!allowedIds.has(reference)) missing.push(`${name}/${record.id} 引用了不存在的 ${field}: ${reference}`);
    }
  }
  assert.deepEqual(missing, []);
}

test("内容数量达到升级目标且各实体 ID 稳定唯一", () => {
  assert.ok(articles.length >= 12);
  assert.ok(artifacts.length >= 30);
  assert.ok(lessons.length >= 8);
  assert.ok(glossary.length >= 40);
  assert.ok(quizzes.length >= 40);
  assert.ok(excavations.length >= 3);
  assert.ok(restorationTasks.length >= 5);
  for (const [records, name] of [[articles, "文章"], [artifacts, "文物"], [lessons, "课程"], [glossary, "术语"], [quizzes, "题目"], [excavations, "发掘场景"], [restorationTasks, "修复任务"], [sites, "遗址"]]) {
    assertUnique(records, name);
  }
});

test("内容关联 ID 均指向已存在的实体", () => {
  assertReferences(articles, "siteIds", siteIds, "文章");
  assertReferences(articles, "artifactIds", artifactIds, "文章");
  assertReferences(articles, "terms", termIds, "文章");
  assertReferences(articles, "quizIds", quizIds, "文章");
  assertReferences(artifacts, "siteId", siteIds, "文物");
  assertReferences(artifacts, "articleIds", articleIds, "文物");
  assertReferences(artifacts, "terms", termIds, "文物");
  assertReferences(artifacts, "quizIds", quizIds, "文物");
  assertReferences(lessons, "terms", termIds, "课程");
  assertReferences(lessons, "artifactIds", artifactIds, "课程");
  assertReferences(lessons, "quizIds", quizIds, "课程");
  assertReferences(glossary, "lessonIds", lessonIds, "术语");
  assertReferences(glossary, "artifactIds", artifactIds, "术语");
  for (const question of quizzes) {
    if (question.articleId) assert.equal(articleIds.has(question.articleId), true, `题目 ${question.id} 的文章关联无效`);
    if (question.lessonId) assert.equal(lessonIds.has(question.lessonId), true, `题目 ${question.id} 的课程关联无效`);
    if (question.artifactId) assert.equal(artifactIds.has(question.artifactId), true, `题目 ${question.id} 的文物关联无效`);
  }
  for (const scene of excavations) {
    assert.equal(lessonIds.has(scene.relatedLessonId), true, `发掘场景 ${scene.id} 的课程关联无效`);
    assertReferences([scene], "artifactIds", artifactIds, "发掘场景");
  }
  assertReferences(restorationTasks, "artifactId", artifactIds, "修复任务");
});

test("每道题的正确选项和解析一致，答案位置不固定", () => {
  const answerPositions = new Set(quizzes.map(({ answer }) => answer));
  assert.deepEqual(answerPositions, new Set([0, 1, 2]));
  for (const question of quizzes) {
    assert.equal(question.options.length, 3);
    assert.equal(question.explanations.length, question.options.length);
    assert.ok(question.explanations[question.answer].length > 0);
  }
  assert.ok(artifacts.every((artifact) => artifact.quizIds.length > 0), "每条文物记录均应有可进入的关联练习");
});
