import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { catalogItems } from '../lib/catalog-registry';
import { getProductDetails } from '../lib/product-details';
import photos from '../data/verified-product-media.json';

const labels: Record<string, string> = {
  Performance: 'Производительность', Processor: 'Процессор', Chipset: 'Процессор', Display: 'Экран',
  'Rear camera': 'Основные камеры', 'Rear Camera': 'Основные камеры', 'Front camera': 'Фронтальная камера', 'Front Camera': 'Фронтальная камера',
  'Battery & charging': 'Аккумулятор и зарядка', 'Battery and charging': 'Аккумулятор и зарядка',
  'Operating system': 'Операционная система', 'Operating System': 'Операционная система',
  'Dust and water resistance': 'Защита от воды и пыли', Audio: 'Звук', Dimensions: 'Габариты', Security: 'Аутентификация',
  'Wireless connectivity': 'Беспроводная связь', Bluetooth: 'Bluetooth',
};
const decode = (text: string) => text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ').trim();
const translate = (text: string) => text.replace(/Supports? /g, '').replace(/\(typ\)/g, '(типичная ёмкость)').replace(/mAh/g, ' мА·ч')
  .replace(/\bHz\b/g, 'Гц').replace(/\bMP\b/g, 'Мп').replace(/\bmm\b/g, 'мм').replace(/\bg\b/g, 'г').replace(/\bW\b/g, 'Вт')
  .replace(/Height:/g, 'Высота:').replace(/Width:/g, 'Ширина:').replace(/Thickness:/g, 'Толщина:').replace(/Weight:/g, 'Вес:')
  .replace(/Rear video recording/g, 'Запись видео').replace(/Fingerprint sensor/g, 'Сканер отпечатков').replace(/AI face unlock/g, 'Разблокировка по лицу')
  .replace(/Max CPU frequency:/g, 'Частота CPU до:').replace(/Refresh rate:/g, 'Частота обновления:').replace(/Resolution:/g, 'Разрешение:')
  .replace(/turbo charging/g, 'быстрая зарядка').replace(/wired reverse-charging/g, 'обратная проводная зарядка');
const saved = JSON.parse(readFileSync('data/current-product-details.json', 'utf8'));
const tasks = new Map<string, typeof catalogItems>();
for (const item of catalogItems.filter(item => getProductDetails(item).limitedSpecs || saved[item.id]?.source?.startsWith('https://www.mi.com/'))) {
  const photo = (photos as Record<string, { source?: string; referenceModel?: string }>)[item.id];
  if (photo?.referenceModel?.toLowerCase() !== item.model.toLowerCase()) continue;
  let source = photo?.source?.match(/^https:\/\/www\.mi\.com\/[^/]+\/product\/[^/]+\//)?.[0];
  const overrides: Record<string, string> = {
    'Redmi Note 17': 'https://www.mi.com/global/product/redmi-note-17/',
    'Poco C81 Pro': 'https://www.mi.com/my/product/poco-c81-pro/',
    'Poco Pad X1': 'https://www.mi.com/global/product/poco-pad-x1/',
    'Poco Pad M1': 'https://www.mi.com/global/product/poco-pad-m1/',
    'Poco Pad C1': 'https://www.mi.com/global/product/poco-pad-c1/',
  };
  source = overrides[item.model] ?? source;
  if (source && item.model === 'Redmi 17') source = 'https://www.mi.com/global/product/redmi-17/';
  if (!source) continue;
  const group = tasks.get(source) ?? []; group.push(item); tasks.set(source, group);
}
mkdirSync('.tmp-qa/xiaomi-specifications', { recursive: true });
let cursor = 0, articles = 0;
const entries = [...tasks];
async function worker() {
  while (cursor < entries.length) {
    const [source, items] = entries[cursor++], url = source + 'specs/';
    try {
      const path = `.tmp-qa/xiaomi-specifications/${createHash('sha256').update(url).digest('hex').slice(0, 20)}.html`;
      let html: string;
      if (existsSync(path)) html = readFileSync(path, 'utf8');
      else { const response = await fetch(url, { signal: AbortSignal.timeout(20_000) }); if (!response.ok || new URL(response.url).hostname !== 'www.mi.com') continue; html = await response.text(); writeFileSync(path, html); }
      const names = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => {
        try { const value = JSON.parse(match[1]); return value['@type'] === 'Product' && typeof value.name === 'string' ? [value.name] : []; } catch { return []; }
      });
      const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/\+/g, ' plus ').replace(/\b5g\b/g, '').replace(/[^\p{L}\p{N}]/gu, '');
      const pageTitle = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '');
      const sameTitle = normalize(pageTitle).includes(normalize(items[0].model)) && ['pro', 'max', 'ultra', 'plus'].every(token => new RegExp(`\\b${token}\\b`, 'i').test(pageTitle.replace(/\+/g, ' plus ')) === new RegExp(`\\b${token}\\b`, 'i').test(items[0].model));
      if (!names.some(name => normalize(name) === normalize(items[0].model)) && !sameTitle) {
        for (const item of items) if (saved[item.id]?.source === url) delete saved[item.id];
        console.log(items[0].model, 'source model mismatch'); continue;
      }
      const specs: [string, string][] = [];
      let label = '', values: string[] = [];
      const flush = () => { if (label && values.length && !specs.some(([key]) => key === label)) specs.push([label, values.slice(0, 5).join('; ')]); };
      for (const match of html.matchAll(/<span\b([^>]*data-key="spec_[^>]+)>([\s\S]*?)<\/span>/g)) {
        const value = decode(match[2]);
        if (/f-bold/.test(match[1])) { flush(); label = labels[value] ?? ''; values = []; }
        else if (label && value && !value.startsWith('*') && value.length < 180) values.push(translate(value));
      }
      flush();
      if (specs.length >= 3) for (const item of catalogItems.filter(item => item.model === items[0].model)) { saved[item.id] = { source: url, name: item.model, specs, scope: 'model' }; articles++; }
      console.log(items[0].model, specs.length);
    } catch (error) { console.log(items[0].model, String(error)); }
  }
}
console.log(`${entries.length} Xiaomi specification sources`);
await Promise.all(Array.from({ length: 5 }, worker));
writeFileSync('data/current-product-details.json', JSON.stringify(saved, null, 2) + '\n');
console.log(`Xiaomi: ${articles} articles`);
