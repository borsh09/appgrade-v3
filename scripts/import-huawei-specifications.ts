import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { catalogItems } from '../lib/catalog-registry';

const models: Record<string, string> = {
  pura90sproMax: 'Huawei Pura 90s Pro Max', pura90spro: 'Huawei Pura 90s Pro', matext: 'Huawei Mate XT Ultimate Design',
  nova15: 'Huawei Nova 15', nova15max: 'Huawei Nova 15 Max', novay74: 'Huawei Nova Y74',
  mate80pro: 'Huawei Mate 80 Pro', matex7: 'Huawei Mate X7', pura80: 'Huawei Pura 80',
  watchgt6: 'Huawei Watch GT 6', watchgt6pro: 'Huawei Watch GT 6 Pro', watchgt7: 'Huawei Watch GT 7', watchgt7pro: 'Huawei Watch GT 7 Pro',
};
const titles: Record<string, string> = {
  Dimensions: 'Габариты и вес', Display: 'Экран', Processor: 'Процессор', 'Operating System': 'Операционная система',
  'Rear Camera': 'Основные камеры', 'Front Camera': 'Фронтальная камера', Battery: 'Аккумулятор',
  Charging: 'Зарядка', 'Splash, Water, and Dust Resistant': 'Защита от воды и пыли', Connectivity: 'Интерфейсы',
};
const clean = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const translate = (text: string) => text.replace(/Screen Size|Size/g, 'Диагональ').replace(/Resolution/g, 'Разрешение').replace(/Type/g, 'Тип')
  .replace(/Height/g, 'Высота').replace(/Width/g, 'Ширина').replace(/Depth/g, 'Толщина').replace(/Weight/g, 'Вес')
  .replace(/Typical Capacity/g, 'Типичная ёмкость').replace(/Rated Capacity/g, 'Номинальная ёмкость').replace(/Colour/g, 'Цветовой охват')
  .replace(/Non-EU/g, 'вне ЕС').replace(/\bEU\b/g, 'ЕС').replace(/Approx\./g, 'Около').replace(/including the battery/g, 'с аккумулятором')
  .replace(/inches/g, 'дюйма').replace(/\bmm\b/g, 'мм').replace(/\bg\b/g, 'г').replace(/Pixels/g, 'пикселей')
  .replace(/\bmAh\b/g, 'мА·ч').replace(/\bMP\b/g, 'Мп').replace(/\bW\b/g, 'Вт').replace(/Max /g, 'до ');
const file = 'data/current-product-details.json';
const saved = JSON.parse(readFileSync(file, 'utf8'));
let count = 0;
for (const [key, model] of Object.entries(models)) {
  const path = `.tmp-qa/huawei/${key}-specs.html`;
  if (!existsSync(path)) continue;
  const html = readFileSync(path, 'utf8');
  const specs: [string, string][] = [];
  for (const section of html.split(/<li class="large-accordion__item">/).slice(1)) {
    const title = clean(section.match(/<span class="large-accordion__title[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
    const label = titles[title];
    if (!label) continue;
    const paragraphs = [...section.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)].filter(match => !/subtext/.test(match[1]))
      .map(match => {
        const subtitle = [...section.slice(0, match.index).matchAll(/<div class="large-accordion-subtitle[^>]*>([\s\S]*?)<\/div>/g)].at(-1)?.[1];
        return translate(`${subtitle ? clean(subtitle) + ': ' : ''}${clean(match[2])}`);
      }).filter(value => value && !/^\*|^©/.test(value));
    // Battery and charging can vary by market; keep the exact regional source context.
    const value = paragraphs.slice(0, title === 'Charging' ? 1 : title === 'Connectivity' ? 4 : 5).join('; ');
    if (value && value.length <= 650) specs.push([label, value]);
  }
  console.log(model, specs.length);
  if (specs.length < 3) continue;
  specs.push(['Версия технических данных', 'Глобальная версия; параметры региональной поставки уточняются']);
  for (const item of catalogItems.filter(item => item.model === model)) {
    const source = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    if (!source?.startsWith('https://consumer.huawei.com/')) continue;
    saved[item.id] = { source, name: model, scope: 'model', specs };
    count++;
  }
}
writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
console.log(`Huawei specifications: ${count} articles`);
