import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { catalogItems } from '../lib/catalog-registry';
import { getProductDetails } from '../lib/product-details';
import photos from '../data/verified-product-media.json';

type HtmlNode = { tag: string; attrs: Record<string, string>; children: HtmlNode[]; parent?: HtmlNode; value?: string };
const decode = (value: string) => value.replace(/&#(\d+);/g, (_, number: string) => String.fromCodePoint(Number(number))).replace(/&#x([a-f\d]+);/gi, (_, number: string) => String.fromCodePoint(parseInt(number, 16)))
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&reg;|&trade;/g, '').replace(/\s+/g, ' ').trim();
function parse(html: string) {
  const root: HtmlNode = { tag: 'root', attrs: {}, children: [] }, stack = [root];
  html = html.replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const voids = new Set(['img', 'input', 'link', 'meta', 'br', 'hr', 'source', 'area', 'wbr', 'embed', 'param']);
  for (const match of html.matchAll(/<\/?([a-z][\w:-]*)\b([^>]*)>|([^<]+)/gi)) {
    const parent = stack.at(-1)!;
    if (match[3]) { const value = decode(match[3]); if (value) parent.children.push({ tag: '#text', attrs: {}, children: [], value, parent }); continue; }
    const tag = match[1].toLowerCase();
    if (match[0].startsWith('</')) { const index = stack.findLastIndex(node => node.tag === tag); if (index > 0) stack.length = index; continue; }
    const attrs = Object.fromEntries([...match[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(attr => [attr[1].toLowerCase(), decode(attr[2] ?? attr[3])]));
    const node: HtmlNode = { tag, attrs, children: [], parent }; parent.children.push(node);
    if (!voids.has(tag) && !match[0].endsWith('/>')) stack.push(node);
  }
  return root;
}
const textCache = new WeakMap<HtmlNode, string>();
const text = (node: HtmlNode): string => {
  const cached = textCache.get(node);
  if (cached !== undefined) return cached;
  const value = node.value ?? node.children.map(text).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  textCache.set(node, value);
  return value;
};
const normalized = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/™|®|:$/g, '').replace(/\s+/g, ' ').trim();
const labels: Record<string, string> = {
  'battery life': 'Время работы', 'battery capacity': 'Ёмкость аккумулятора', 'battery type': 'Тип аккумулятора', 'battery': 'Аккумулятор',
  'charging time': 'Время зарядки', 'charge time': 'Время зарядки', 'charging': 'Зарядка', 'charging method': 'Способ зарядки',
  'bluetooth': 'Bluetooth', 'bluetooth version': 'Bluetooth', 'bluetooth® version': 'Bluetooth', 'connectivity': 'Подключение', 'connection': 'Подключение',
  'wireless connectivity': 'Беспроводная связь', 'wi-fi': 'Wi-Fi', 'wifi': 'Wi-Fi', 'nfc': 'NFC',
  'frequency response': 'Частотный диапазон', 'frequency range': 'Частотный диапазон', 'impedance': 'Импеданс', 'drivers': 'Динамики',
  'driver size': 'Размер динамика', 'driver type': 'Тип динамика', 'transducer': 'Излучатель', 'microphones': 'Микрофоны',
  'active noise cancellation': 'Активное шумоподавление', 'noise cancellation': 'Шумоподавление', 'noise cancelling': 'Шумоподавление',
  'audio codecs': 'Аудиокодеки', 'supported codecs': 'Аудиокодеки', 'codec': 'Аудиокодеки', 'power output': 'Выходная мощность', 'output power': 'Выходная мощность',
  'speaker': 'Динамик', 'speakers': 'Динамики', 'water resistance': 'Влагозащита', 'waterproof rating': 'Влагозащита', 'ip rating': 'Защита от воды и пыли',
  'weight': 'Вес', 'dimensions': 'Габариты', 'height': 'Высота', 'width': 'Ширина', 'depth': 'Толщина', 'material': 'Материал', 'materials': 'Материалы',
  'processor': 'Процессор', 'chipset': 'Процессор', 'cpu': 'CPU', 'gpu': 'GPU', 'operating system': 'Операционная система',
  'display': 'Экран', 'display size': 'Диагональ экрана', 'screen size': 'Диагональ экрана', 'display resolution': 'Разрешение экрана',
  'resolution': 'Разрешение', 'refresh rate': 'Частота обновления экрана', 'display type': 'Тип экрана', 'screen type': 'Тип экрана',
  'main camera': 'Основная камера', 'rear camera': 'Основные камеры', 'front camera': 'Фронтальная камера', 'camera': 'Камеры', 'sensors': 'Датчики',
  'sensor': 'Матрица', 'sensor size': 'Размер матрицы', 'image sensor': 'Матрица', 'image stabilization': 'Стабилизация изображения',
  'maximum video resolution': 'Максимальное разрешение видео', 'video resolution': 'Разрешение видео', 'lens': 'Объектив', 'aperture': 'Диафрагма',
  'connectors': 'Разъёмы', 'ports': 'Разъёмы', 'usb': 'USB', 'usb version': 'Версия USB', 'charging port': 'Разъём зарядки',
  'supported platforms': 'Поддерживаемые платформы', 'compatibility': 'Совместимость', 'compatible devices': 'Совместимость',
};
function label(value: string) {
  const key = normalized(value);
  if (labels[key]) return labels[key];
  const aliases: Record<string, string> = {
    'output power (w)': 'Выходная мощность', 'dynamic frequency response range (hz)': 'Частотный диапазон',
    'charging time (hrs)': 'Время зарядки', 'maximum music playing time (hrs)': 'Время воспроизведения',
    'net weight (kgs)': 'Вес, кг', 'dimensions (width x height x depth) (cm)': 'Габариты, см', 'ip code': 'Защита',
    'supports auracast': 'Auracast', 'powerbank': 'Зарядка других устройств', 'battery charge time': 'Время зарядки',
    'battery charge method': 'Зарядка', 'battery life (continuous music playback time)': 'Время прослушивания',
    'supported audio format(s)': 'Аудиокодеки', 'headphone type': 'Тип наушников', 'driver unit': 'Излучатель',
    'drive units': 'Излучатели', 'net weight': 'Вес', 'battery life & charging': 'Время работы и зарядка',
    'wearing style': 'Конструкция', 'bluetooth codecs': 'Аудиокодеки', 'wireless connectivity': 'Беспроводное подключение',
    'wired connectivity': 'Проводное подключение', 'frequency range': 'Частотный диапазон', 'power amplifiers': 'Усилители',
  };
  if (aliases[key]) return aliases[key];
  return /^[\p{Script=Cyrillic}]/u.test(value) && /экран|процессор|камер|заряд|аккумулятор|батаре|частот|шумоподав|разъ.м|совместим|влаг|защит|габарит|динам|микрофон|материал|чип|датчик|вес/i.test(value) && value.length < 65 ? value : '';
}
const translate = (value: string) => value.replace(/™|®/g, '').replace(/\bYes\b/g, 'Есть').replace(/\bNo\b/g, 'Нет').replace(/\bhrs?\b|hours/g, 'ч').replace(/\bmm\b/g, 'мм').replace(/\bg\b/g, 'г').replace(/\bW\b/g, 'Вт').replace(/mAh/g, ' мА·ч').replace(/Up to/g, 'До');
function readSpecs(html: string, model: string): [string, string][] {
  const root = parse(html), specs: [string, string][] = [];
  const add = (name: string, value: string) => {
    const title = label(name);
    if (!title || !value || value.length > 450 || /[\u3400-\u9fff\u0600-\u06ff]/.test(value) || /памят|storage|color|colour|комплект/i.test(name) || specs.some(([label]) => label === title)) return;
    specs.push([title, translate(value)]);
  };
  const identity = (value: string) => normalized(value).replace(/\+/g, ' plus ').replace(/\b5g\b/g, '').replace(/^(?:sony|samsung|apple)\s+/g, '').replace(/-/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  for (const block of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(block[1]);
      const products = Array.isArray(data) ? data : data['@graph'] ?? [data];
      for (const product of products) {
        if (product['@type'] !== 'Product' || typeof product.name !== 'string') continue;
        const sourceWords = new Set(identity(product.name));
        if (!identity(model).every(word => sourceWords.has(word))) continue;
        for (const property of product.additionalProperty ?? []) if (typeof property.name === 'string' && typeof property.value === 'string') add(property.name, property.value);
      }
    } catch { /* The page can contain non-JSON marketing snippets. */ }
  }
  const visit = (node: HtmlNode) => {
    if (['nav', 'header', 'footer'].includes(node.tag)) return;
    if (node.tag === 'tr') { const cells = node.children.filter(child => ['th', 'td'].includes(child.tag)); if (cells.length === 2) add(text(cells[0]), text(cells[1])); }
    if (node.tag === 'dt') { const siblings = node.parent?.children ?? [], index = siblings.indexOf(node); const dd = siblings.slice(index + 1).find(child => child.tag !== '#text'); if (dd?.tag === 'dd') add(text(node), text(dd)); }
    if (['h3', 'h4'].includes(node.tag) && label(text(node))) {
      const siblings = node.parent?.children ?? [], next = siblings.slice(siblings.indexOf(node) + 1).find(child => child.tag !== '#text');
      if (next && !/^h[1-6]$/.test(next.tag)) add(text(node), text(next));
    }
    if (['div', 'li', 'section'].includes(node.tag) && /spec|tech|param|attribute|property|detail/i.test(node.attrs.class ?? '')) {
      const children = node.children.filter(child => child.tag !== '#text' && text(child));
      if (children.length === 2 && text(children[0]).length < 65) add(text(children[0]), text(children[1]));
    }
    const name = text(node);
    if (name.length < 65 && label(name)) {
      let ancestor = node.parent, technical = false;
      for (let level = 0; ancestor && level < 7; level++, ancestor = ancestor.parent) if (/spec|tech|param|attribute|property/i.test(ancestor.attrs.class ?? '')) { technical = true; break; }
      if (technical) {
        let current = node;
        for (let level = 0; level < 3 && current.parent; level++) {
          const siblings = current.parent.children, next = siblings.slice(siblings.indexOf(current) + 1).find(child => text(child));
          if (next) { const value = text(next); if (!label(value)) add(name, value); break; }
          if (text(current.parent) !== name) break;
          current = current.parent;
        }
      }
    }
    for (const child of node.children) visit(child);
  };
  visit(root); return specs;
}
const urlKey = (url: string) => { const value = new URL(url); return value.origin + value.pathname.replace(/\/$/, ''); };
const cacheIndex = new Map<string, string>();
function indexCache(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { if (!/next|admin|security|preview/.test(entry.name)) indexCache(path); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = readFileSync(path, 'utf8');
    for (const tag of html.matchAll(/<(?:link|meta)\b[^>]*>/g)) {
      if (!/rel="canonical"|property="og:url"/.test(tag[0])) continue;
      const url = tag[0].match(/(?:href|content)="(https:[^"]+)"/)?.[1];
      if (url) try { cacheIndex.set(urlKey(decode(url)), path); } catch { /* Non-URL metadata. */ }
    }
  }
}
mkdirSync('.tmp-qa/manufacturer-specifications', { recursive: true });
indexCache('.tmp-qa');
const groups = new Map<string, typeof catalogItems>();
for (const item of catalogItems) { const group = groups.get(item.model) ?? []; group.push(item); groups.set(item.model, group); }
const tasks = [...groups].filter(([, group]) => group.some(item => getProductDetails(item).limitedSpecs)).map(([model, group]) => {
  const sources = group.flatMap(item => { const photo = (photos as Record<string, { source?: string; referenceModel?: string }>)[item.id]; return photo?.source?.startsWith('https://') && normalized(photo.referenceModel ?? '') === normalized(model) && !/mgg\.|stores-apple|marketinghub|news\./.test(new URL(photo.source).hostname) ? [photo.source] : []; });
  const sony = model.match(/^Sony ((?:WH|WF)-[A-Z0-9]+)$/);
  if (sony) sources.unshift(`https://www.sony.co.uk/electronics/support/wireless-headphones-bluetooth-headphones/${sony[1].toLowerCase()}/specifications`);
  const jbl: Record<string, string> = { 'JBL Xtreme 4': 'XTREME-4', 'JBL Xtreme 5': 'XTREME-5', 'JBL Boombox 4': 'BOOMBOX-4', 'JBL Flip 6': 'FLIP-6', 'JBL Flip 7': 'FLIP-7', 'JBL PartyBox Stage 320': 'PARTYBOX-STAGE-320', 'JBL PartyBox Stage 330': 'PARTYBOX-STAGE-330', 'JBL PartyBox 720': 'PARTYBOX-720', 'JBL PartyBox On-The-Go 2': 'PARTYBOX-ON-THE-GO-2' };
  if (jbl[model]) sources.unshift(`https://www.jbl.com/${jbl[model]}.html`);
  return { model, sources: [...new Set(sources)].slice(0, 2) };
}).filter(task => task.sources.length);
const file = 'data/structured-manufacturer-specifications.json', saved = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
let cursor = 0, done = 0;
async function worker() {
  while (cursor < tasks.length) {
    const { model, sources } = tasks[cursor++];
    let best: [string, string][] = [], source = '';
    for (const url of sources) try {
      const cache = cacheIndex.get(urlKey(url)) ?? `.tmp-qa/manufacturer-specifications/${createHash('sha256').update(url).digest('hex').slice(0, 20)}.html`;
      let html: string;
      if (existsSync(cache)) html = readFileSync(cache, 'utf8');
      else { const response = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { 'User-Agent': 'Mozilla/5.0' } }); if (!response.ok || new URL(response.url).hostname !== new URL(url).hostname) continue; html = await response.text(); writeFileSync(cache, html); }
      const specs = readSpecs(html, model);
      if (specs.length > best.length) { best = specs; source = url; }
      if (best.length >= 5) break;
    } catch { /* Keep the missing source in the audit. */ }
    if (best.length >= 3) saved[normalized(model)] = { source, name: model, specs: best, scope: 'model' };
    done++;
    console.log(`${done}/${tasks.length} ${model}: ${best.length}`);
    if (done % 20 === 0) writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
  }
}
console.log(`${tasks.length} manufacturer model pages; ${cacheIndex.size} cached URLs`);
await Promise.all(Array.from({ length: 4 }, worker));
writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
