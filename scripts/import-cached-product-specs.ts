import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { catalogItems } from '../lib/catalog-registry';
import { getProductDetails } from '../lib/product-details';

const decode = (html: string) => html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const saved = JSON.parse(readFileSync('data/current-product-details.json', 'utf8'));
const tokens = (text: string) => text.toLowerCase().replace(/ё/g, 'е').replace(/\biii\b/g, '3').replace(/\bii\b/g, '2')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter(Boolean);
const ignored = new Set(['apple', 'samsung', 'fujifilm', 'sony', 'bowers', 'wilkins', 'harman', 'kardon', 'as', 'is', 'body', 'device', 'only', 'standard', 'adventure', 'creator', 'combo', 'bundle', 'edition', 'essentials', 'essential', 'with', 'charging', 'case', 'pitch', 'neon']);
const qualifiers = ['pro', 'max', 'ultra', 'plus', 'mini', 'air', 'fe', 'xl', 'lite', 'neo'];
function matches(model: string, title: string) {
  const target = tokens(model), source = new Set(tokens(title));
  if (/^Dyson /i.test(model)) {
    const codes = target.filter(token => /^(?:hs|hd|sv|tp|ph|cy|wr|hj)\d+[a-z]?$/i.test(token));
    if (codes.length) return source.has('dyson') && codes.every(code => source.has(code));
  }
  if (qualifiers.some(token => target.includes(token) !== source.has(token))) return false;
  return target.filter(token => !ignored.has(token)).every(token => source.has(token));
}
const groups = new Map<string, typeof catalogItems>();
for (const item of catalogItems) { const group = groups.get(item.model) ?? []; group.push(item); groups.set(item.model, group); }
const targets = [...groups.values()].filter(group => group.some(item => getProductDetails(item).limitedSpecs));
let added = 0;
function scan(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { scan(path); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = readFileSync(path, 'utf8');
    const source = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)?.[1];
    if (!source?.startsWith('https://mgg.stores-apple.com/')) continue;
    const name = decode(html.match(/<meta\s+itemprop="name"\s+content="([^"<>]+)"/)?.[1] ?? html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
    const specs: [string, string][] = [];
    for (const match of html.matchAll(/<tr\b[^>]*itemprop="additionalProperty"[^>]*>([\s\S]*?)<\/tr>/g)) {
      const label = decode(match[1].match(/<span\b[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
      const value = decode(match[1].match(/<span\b[^>]*itemprop="value"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
      if (label && value && value !== '—' && value.length < 500) specs.push([label, value]);
    }
    if (specs.length < 3) continue;
    for (const group of targets) if (matches(group[0].model, name) && (!saved[group[0].id] || saved[group[0].id].specs.length < specs.length)) {
      for (const item of group) saved[item.id] = { source, name, specs, scope: 'model' };
      added += group.length;
    }
  }
}
scan('.tmp-qa');
writeFileSync('data/current-product-details.json', JSON.stringify(saved, null, 2) + '\n');
console.log(`Imported cached specifications: ${added} article assignments`);
