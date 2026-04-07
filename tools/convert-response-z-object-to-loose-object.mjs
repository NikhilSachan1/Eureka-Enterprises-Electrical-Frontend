/**
 * Converts z.object({ ... }).loose() -> z.looseObject({ ... }) from innermost outward.
 * Skips exports named *RequestSchema or *UpsertShapeSchema (request / form shapes).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src');

function findMatchingBrace(s, openIdx) {
  if (s[openIdx] !== '{') return -1;
  let depth = 1;
  let i = openIdx + 1;
  let inStr = false;
  let strChar = '';
  while (i < s.length && depth > 0) {
    const c = s[i];
    const prev = s[i - 1];
    if (!inStr) {
      if (c === '"' || c === "'" || c === '`') {
        inStr = true;
        strChar = c;
      } else if (c === '/' && s[i + 1] === '/') {
        i += 2;
        while (i < s.length && s[i] !== '\n') i++;
        continue;
      } else if (c === '/' && s[i + 1] === '*') {
        i += 2;
        while (i < s.length - 1 && !(s[i] === '*' && s[i + 1] === '/')) i++;
        i += 2;
        continue;
      } else if (c === '{') depth++;
      else if (c === '}') depth--;
    } else {
      if (c === strChar && prev !== '\\') inStr = false;
    }
    i++;
  }
  return depth === 0 ? i - 1 : -1;
}

function getLastExportNameBefore(content, pos) {
  const slice = content.slice(0, pos);
  const all = [...slice.matchAll(/export const (\w+)\s*=/g)];
  return all.length ? all[all.length - 1][1] : null;
}

function shouldSkipExport(name) {
  if (!name) return false;
  return (
    /RequestSchema$/.test(name) ||
    /UpsertShapeSchema$/.test(name) ||
    name === 'FilterSchema'
  );
}

function findZObjectLooseAt(content, startIdx) {
  const sub = content.slice(startIdx);
  const m = sub.match(/^z\s*\.\s*object\s*\(/);
  if (!m) return null;
  const pos = startIdx + m[0].length;
  if (content[pos] !== '{') return null;
  const closeBrace = findMatchingBrace(content, pos);
  if (closeBrace < 0) return null;
  if (content[closeBrace + 1] !== ')') return null;
  const afterParen = closeBrace + 2;
  const rest = content.slice(afterParen);
  const lm = rest.match(/^\s*\.loose\s*\(\s*\)/);
  if (!lm) return null;
  const end = afterParen + lm[0].length;
  return { start: startIdx, end, openBrace: pos, closeBrace };
}

function convertContent(content) {
  let total = 0;
  let changed = true;
  while (changed) {
    changed = false;
    let best = null;
    let bestLen = Infinity;
    for (let i = 0; i < content.length; i++) {
      const hit = findZObjectLooseAt(content, i);
      if (!hit) continue;
      const name = getLastExportNameBefore(content, hit.start);
      if (shouldSkipExport(name)) continue;
      const len = hit.end - hit.start;
      if (len < bestLen) {
        bestLen = len;
        best = hit;
      }
    }
    if (best) {
      const inner = content.slice(best.openBrace, best.closeBrace + 1);
      const replacement = `z.looseObject(${inner})`;
      content = content.slice(0, best.start) + replacement + content.slice(best.end);
      total++;
      changed = true;
    }
  }
  return { content, total };
}

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith('.schema.ts')) acc.push(p);
  }
  return acc;
}

let fileCount = 0;
let replaceCount = 0;
for (const file of walk(SRC)) {
  const raw = fs.readFileSync(file, 'utf8');
  const { content, total } = convertContent(raw);
  if (total > 0) {
    fs.writeFileSync(file, content);
    fileCount++;
    replaceCount += total;
    console.log(`${file}: ${total} replacement(s)`);
  }
}
console.log(`Done: ${fileCount} files, ${replaceCount} replacements.`);
