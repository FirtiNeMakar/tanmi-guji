import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/i18n.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
const { readLanguage, translate } = await import(moduleUrl);

test('语言切换返回对应文案并保留未知文本', () => {
  assert.equal(translate('设置', 'zh'), '设置');
  assert.equal(translate('设置', 'ru'), 'Настройки');
  assert.equal(translate('未收录的内容', 'ru'), '未收录的内容');
});

test('语言偏好从浏览器存储读取，异常时安全回退到中文', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: () => 'ru' },
    });
    assert.equal(readLanguage(), 'ru');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: () => { throw new Error('storage unavailable'); } },
    });
    assert.equal(readLanguage(), 'zh');
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
