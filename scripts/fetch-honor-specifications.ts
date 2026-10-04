import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { catalogItems } from '../lib/catalog-registry';
import { getProductDetails } from '../lib/product-details';
import photos from '../data/verified-product-media.json';

const clean = (value: string) => value.replace(/&quot;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code))).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const fields: Record<string, string> = {
  Height: 'Высота', Width: 'Ширина', Depth: 'Толщина', Weight: 'Вес', 'CPU Model': 'Процессор', 'CPU Type': 'Тип CPU', GPU: 'GPU',
  'Operating System': 'Операционная система', 'User Interface': 'Оболочка', 'Rear Camera': 'Основные камеры', 'Front Camera': 'Фронтальная камера',
  'Wired Charging': 'Проводная зарядка', 'Wireless Charging': 'Беспроводная зарядка', Bluetooth: 'Bluetooth', 'Wi-Fi': 'Wi-Fi', NFC: 'NFC', Stereo: 'Стереодинамики',
  'Water and Dust Resistance': 'Защита от воды и пыли', 'Battery Capacity': 'Ёмкость аккумулятора', Resolution: 'Разрешение экрана', Size: 'Диагональ экрана',
};
const translate = (value: string) => value.replace(/inches|inch/g, 'дюйма').replace(/\bmm\b/g, 'мм').replace(/\bg\b/g, 'г').replace(/mAh/g, ' мА·ч').replace(/\bW\b/g, 'Вт')
  .replace(/\bYes\b/g, 'Есть').replace(/\bNo\b/g, 'Нет').replace(/Octa-core/g, 'Восьмиядерный').replace(/based on/g, 'на базе').replace(/Approx\./g, 'Около');
const groups = new Map<string, typeof catalogItems>();
for (const item of catalogItems.filter(item => /^Honor /i.test(item.model) && getProductDetails(item).limitedSpecs)) { const group = groups.get(item.model) ?? []; group.push(item); groups.set(item.model, group); }
const file = 'data/official-model-specifications.json', saved = JSON.parse(readFileSync(file, 'utf8'));
mkdirSync('.tmp-qa/honor-specifications', { recursive: true });
for (const [model, group] of groups) {
  const references = group.flatMap(item => { const photo = (photos as Record<string, { source?: string }>)[item.id]; return photo?.source ? [photo.source] : []; });
  const urls = [...new Set(references.flatMap(url => { const base = url.match(/^https:\/\/www\.honor\.com\/[^/]+\/(?:phones|tablets)\/[^/]+\//)?.[0]; return base ? [base + 'spec/', base.replace(/\/ae\//, '/global/') + 'spec/'] : []; }))];
  if (model === 'Honor Turbo') urls.unshift('https://www.honor.com/az/phones/honor-turbo/spec/');
  if (model === 'Honor 400 Smart') urls.unshift('https://www.honor.com/global/phones/honor-400-smart/spec/');
  let best: [string, string][] = [], source = '';
  for (const url of urls.slice(0, 4)) {
    try {
      const path = `.tmp-qa/honor-specifications/${createHash('sha256').update(url).digest('hex').slice(0, 20)}.html`;
      let html: string;
      if (existsSync(path)) html = readFileSync(path, 'utf8');
      else { const response = await fetch(url, { signal: AbortSignal.timeout(20_000) }); if (!response.ok || new URL(response.url).hostname !== 'www.honor.com') continue; html = await response.text(); writeFileSync(path, html); }
      const name = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
      if (name.toLowerCase().replace(/\s+/g, '') !== model.toLowerCase().replace(/\s+/g, '')) continue;
      const specs: [string, string][] = [];
      let groupTitle = '';
      for (const section of html.split(/(?=<h[23]\b)/)) {
        const heading = section.match(/^<h([23])\b[^>]*>([\s\S]*?)<\/h[23]>/);
        if (!heading) continue;
        const title = clean(heading[2]);
        if (heading[1] === '2') groupTitle = title;
        let label = fields[title];
        if (groupTitle === 'Display' && title === 'Type') label = 'Тип экрана';
        if (groupTitle === 'Battery' && title === 'Capacity') label = 'Ёмкость аккумулятора';
        if (groupTitle === 'Battery' && title === 'Type') label = 'Тип аккумулятора';
        if (!label) continue;
        const values = [...section.matchAll(/<div\b([^>]*class="cc-product-content-container"[^>]*|[^>]*data-value="[^>]+)[^>]*>/g)]
          .map(match => match[0]).filter(tag => /data-class="p2"/.test(tag)).map(tag => clean(tag.match(/data-value="([^"]*)"/)?.[1] ?? '')).filter(value => value && !value.startsWith('*'));
        const value = translate([...new Set(values)].join('; '));
        if (value && value.length < 500 && !specs.some(([name]) => name === label)) specs.push([label, value]);
      }
      if (specs.length > best.length) { best = specs; source = url; }
      if (best.length >= 8) break;
    } catch (error) { console.log(model, String(error)); }
  }
  if (best.length >= 3) saved[model.toLowerCase()] = { source, name: model, specs: best, scope: 'model' };
  console.log(model, best.length);
}
writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
