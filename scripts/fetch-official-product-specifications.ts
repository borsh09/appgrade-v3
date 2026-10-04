import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { catalogItems } from '../lib/catalog-registry';
const huaweiPages: Record<string, string> = {
  pura90spro: 'https://consumer.huawei.com/en/phones/pura90s-pro/',
  nova15: 'https://consumer.huawei.com/en/phones/nova15/',
  watchgt6: 'https://consumer.huawei.com/en/wearables/watch-gt6/',
  watchgt7: 'https://consumer.huawei.com/uk/wearables/watch-gt7/',
  watchgt7pro: 'https://consumer.huawei.com/en/wearables/watch-gt7-pro/',
};

const sources: Record<string, string> = {
  'Яндекс Станция Мини 3': 'https://alice.yandex.ru/support/ru/station/meet/characteristics-mini3',
  'Яндекс Станция Мини 3 Про': 'https://alice.yandex.ru/support/ru/station/meet/characteristics-mini3-pro',
  'Яндекс Станция Стрит': 'https://alice.yandex.ru/support/ru/station/meet/characteristics-street',
  'Яндекс Станция 3': 'https://alice.yandex.ru/support/ru/station/meet/characteristics-station3',
  'Яндекс Дропс': 'https://alice.yandex.ru/support/ru/wearables/drops/characteristics',
};
mkdirSync('.tmp-qa/official-specs', { recursive: true });
const clean = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const file = 'data/current-product-details.json';
const saved = JSON.parse(readFileSync(file, 'utf8'));
for (const [model, url] of Object.entries(sources)) {
  const path = `.tmp-qa/official-specs/${model.replace(/[^\p{L}\p{N}]/gu, '-')}.html`;
  try {
    let html: string;
    if (existsSync(path)) html = readFileSync(path, 'utf8');
    else { const response = await fetch(url, { signal: AbortSignal.timeout(20_000) }); if (!response.ok || new URL(response.url).hostname !== 'alice.yandex.ru') continue; html = await response.text(); writeFileSync(path, html); }
    const specs: [string, string][] = [];
    for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells = [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(cell => clean(cell[1]));
      if (cells.length !== 2 || !/динамик|акустич|микрофон|диапазон|wi.?fi|bluetooth|zigbee|пылевлаг|шумоподав|тип.*наушник|разъ.м|масса|вес|стереопар|аудиофайл/i.test(cells[0]) || cells[1].length > 350) continue;
      if (!specs.some(([label]) => label === cells[0])) specs.push([cells[0], cells[1]]);
    }
    if (specs.length >= 3) for (const item of catalogItems.filter(item => item.model === model)) saved[item.id] = { source: url, name: model, specs, scope: 'model' };
    console.log(model, specs.length);
  } catch (error) { console.log(model, String(error)); }
}
writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
for (const key of ['pura90spro', 'nova15', 'watchgt6', 'watchgt7', 'watchgt7pro']) {
  const path = `.tmp-qa/huawei/${key}-specs.html`;
  if (existsSync(path)) continue;
  const url = (huaweiPages as Record<string, string>)[key] + 'specs/';
  try { const response = await fetch(url, { signal: AbortSignal.timeout(20_000) }); if (response.ok && new URL(response.url).hostname === 'consumer.huawei.com') writeFileSync(path, await response.text()); }
  catch (error) { console.log(key, String(error)); }
}
