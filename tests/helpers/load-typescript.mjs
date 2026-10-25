import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cache = new Map();
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;

export function loadTypeScript(relativePath) {
  const fullPath = path.resolve(root, relativePath);
  if (cache.has(fullPath)) return cache.get(fullPath);
  const source = ts.transpileModule(readFileSync(fullPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const rewritten = source.replace(/(from\s+)(["'])([^"']+)\2/g, (match, prefix, quote, specifier) => {
    if (!specifier.startsWith(".")) return match;
    const target = path.resolve(path.dirname(fullPath), `${specifier.split("/").join(path.sep)}.ts`);
    const relativeTarget = path.relative(root, target);
    return `${prefix}${quote}${loadTypeScript(relativeTarget)}${quote}`;
  });
  const url = moduleUrl(rewritten);
  cache.set(fullPath, url);
  return url;
}
