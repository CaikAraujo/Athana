/**
 * Translation tooling (gettext-style: the French source string is the key).
 *   npm run i18n:check            → fails when a string lacks a pt-PT / pt-BR translation or client-keys.json is stale
 *   npm run i18n:check -- --write → refreshes src/i18n/generated/client-keys.json and writes the missing strings
 *                                   to src/i18n/generated/missing.<lang>.json for translators
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const GEN = path.join(SRC, 'i18n/generated');
const REQUIRED = ['pt-PT', 'pt-BR'];
const PATTERN = /(?<![\w.])(?:t|m)\(\s*(?:'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)")/g;
// Default messages that are not wrapped in a marker.
const EXTRA = ['Accès refusé.', 'Élément introuvable.'];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'generated' && name !== 'demos') walk(p, out); }
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}
const unescape = (s: string) => s.replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n');

const all = new Set<string>(EXTRA);
const client = new Set<string>();
for (const file of walk(SRC)) {
  const code = readFileSync(file, 'utf8');
  const isClient = /^\s*['"]use client['"]/.test(code);
  for (const m of code.matchAll(PATTERN)) {
    const key = unescape(m[1] ?? m[2]);
    if (!key.trim()) continue;
    all.add(key);
    if (isClient) client.add(key);
  }
}

const write = process.argv.includes('--write');
const clientFile = path.join(GEN, 'client-keys.json');
const clientKeys = [...client].sort();
const stale = JSON.stringify(JSON.parse(readFileSync(clientFile, 'utf8'))) !== JSON.stringify(clientKeys);
if (write) writeFileSync(clientFile, JSON.stringify(clientKeys, null, 0) + '\n');

let failed = false;
for (const lang of REQUIRED) {
  const dict = JSON.parse(readFileSync(path.join(SRC, `i18n/messages/${lang}.json`), 'utf8')) as Record<string, string>;
  const missing = [...all].filter((k) => !dict[k]).sort();
  const unused = Object.keys(dict).filter((k) => !all.has(k));
  const placeholders = [...all].filter((k) => dict[k] && JSON.stringify((k.match(/\{\w+\}/g) ?? []).sort()) !== JSON.stringify((dict[k].match(/\{\w+\}/g) ?? []).sort()));
  console.log(`${lang}: ${all.size - missing.length}/${all.size} translated, ${missing.length} missing, ${unused.length} unused, ${placeholders.length} placeholder mismatch`);
  if (write) writeFileSync(path.join(GEN, `missing.${lang}.json`), JSON.stringify(Object.fromEntries(missing.map((k) => [k, ''])), null, 2) + '\n');
  if (placeholders.length) console.log('  placeholder mismatch:', placeholders.slice(0, 10));
  if (missing.length || placeholders.length) failed = true;
}
if (stale && !write) { console.log('client-keys.json is stale: run "npm run i18n:check -- --write"'); failed = true; }
console.log(`${all.size} source strings, ${clientKeys.length} used by client components.`);
if (failed && !write) process.exit(1);
