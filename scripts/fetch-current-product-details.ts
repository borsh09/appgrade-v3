import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { catalogItems } from '../lib/catalog-registry';
import { getProductDetails } from '../lib/product-details';
import links from '../data/parser-store-links.json';
import photos from '../data/verified-product-media.json';

const additionalLinks: { title: string; url: string }[] = existsSync('.tmp-qa/supplier-inventory.json')
  ? JSON.parse(readFileSync('.tmp-qa/supplier-inventory.json', 'utf8')) : [];
const allLinks = [...links, ...additionalLinks];

type Detail = { source: string; name: string; specs: [string, string][]; scope: 'model' };
const file = 'data/current-product-details.json';
const saved: Record<string, Detail> = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
mkdirSync('.tmp-qa/specs', { recursive: true });
const decode = (text: string) => text.replace(/<[^>]*>/g, ' ').replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
  .replace(/&#x([a-f\d]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
const words = (text: string) => text.toLowerCase().replace(/ё/g, 'е').replace(/bowers\s*&\s*wilkins|b&w/g, 'bowers wilkins')
  .replace(/\biii\b/g, '3').replace(/\bii\b/g, '2').replace(/\biv\b/g, '4').replace(/\bv\b/g, '5')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter(Boolean);
const qualifiers = ['pro', 'max', 'ultra', 'plus', 'mini', 'air', 'fe', 'xl', 'lite', 'neo', 'pitch'];
function matches(model: string, title: string) {
  const target = words(model), source = new Set(words(title));
  if (/^Dyson /i.test(model)) {
    const codes = target.filter(token => /^(?:hs|hd|sv|tp|ph|cy|wr|hj)\d+[a-z]?$/i.test(token));
    if (codes.length) return source.has('dyson') && codes.every(code => source.has(code));
  }
  if (qualifiers.some(token => target.includes(token) !== source.has(token))) return false;
  const ignored = new Set(['apple', 'samsung', 'fujifilm', 'sony', 'bowers', 'wilkins', 'harman', 'kardon', 'as', 'is', 'body', 'device', 'only', 'standard', 'adventure', 'creator', 'combo', 'bundle', 'edition', 'essentials', 'essential', 'with', 'charging', 'case', 'pitch', 'neon']);
  return target.filter(token => !ignored.has(token)).every(token => source.has(token));
}
function readDetail(html: string, source: string): Detail | undefined {
  const name = decode(html.match(/<meta\s+itemprop="name"\s+content="([^"<>]+)"/)?.[1] ?? html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
  const specs: [string, string][] = [], seen = new Set<string>();
  for (const match of html.matchAll(/<tr\b[^>]*itemprop="additionalProperty"[^>]*>([\s\S]*?)<\/tr>/g)) {
    const label = decode(match[1].match(/<span\b[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
    const value = decode(match[1].match(/<span\b[^>]*itemprop="value"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
    if (!label || !value || value === '—' || value.length > 500 || seen.has(label)) continue;
    seen.add(label); specs.push([label, value]);
  }
  return name && specs.length ? { source, name, specs, scope: 'model' } : undefined;
}
const groups = new Map<string, typeof catalogItems>();
for (const item of catalogItems) {
  const key = `${item.category}|${item.model}`;
  const group = groups.get(key) ?? []; group.push(item); groups.set(key, group);
}
const targets = [...groups.values()].filter(group => group.some(item => getProductDetails(item).limitedSpecs));
const tasks = targets.map(group => {
  const reviewed = group.flatMap(item => {
    const photo = (photos as Record<string, { source?: string }>)[item.id];
    return photo?.source?.startsWith('https://mgg.stores-apple.com/') ? [photo.source] : [];
  });
  const matching = allLinks.filter(link => link.url.startsWith('https://mgg.stores-apple.com/') && matches(group[0].model, link.title)).map(link => link.url);
  return { group, urls: [...new Set([...reviewed, ...matching])].slice(0, 3) };
});
const cache = new Map<string, Promise<Detail | undefined>>();
function load(url: string) {
  const existing = cache.get(url); if (existing) return existing;
  const promise = (async () => {
    const cacheFile = `.tmp-qa/specs/${createHash('sha256').update(url).digest('hex').slice(0, 24)}.html`;
    let html: string;
    if (existsSync(cacheFile)) html = readFileSync(cacheFile, 'utf8');
    else {
      const response = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { 'User-Agent': 'Mozilla/5.0 APPGRADE catalog specifications' } });
      if (!response.ok || new URL(response.url).hostname !== 'mgg.stores-apple.com') return undefined;
      html = await response.text(); writeFileSync(cacheFile, html);
    }
    return readDetail(html, url);
  })().catch(() => undefined);
  cache.set(url, promise); return promise;
}
let cursor = 0, completed = 0, added = 0;
const failures: { model: string; ids: string[]; urls: string[] }[] = [];
async function worker() {
  while (cursor < tasks.length) {
    const { group, urls } = tasks[cursor++];
    let detail: Detail | undefined;
    for (const url of urls) { detail = await load(url); if (detail && detail.specs.length > 3) break; }
    if (detail) { for (const item of group) saved[item.id] = detail; added += group.length; }
    else failures.push({ model: group[0].model, ids: group.map(item => item.id), urls });
    completed++;
    if (completed % 20 === 0 || completed === tasks.length) {
      writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
      console.log(`${completed}/${tasks.length} models; saved ${added} articles; no source ${failures.length}`);
    }
  }
}
console.log(`${tasks.length} model groups, ${tasks.filter(task => task.urls.length).length} with supplier links`);
await Promise.all(Array.from({ length: 6 }, worker));
writeFileSync('.tmp-qa/specs/failures.json', JSON.stringify(failures, null, 2));
