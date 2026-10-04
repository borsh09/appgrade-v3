import { readFileSync, writeFileSync } from 'node:fs';
const targets = [
  ['camon50specs', 'Tecno Camon 50', 'https://www.tecno-mobile.com/phones/tech-specs/techspecs/camon-50/'],
  ['ultraspecs', 'Tecno Camon 50 Ultra', 'https://www.tecno-mobile.com/phones/tech-specs/techspecs/camon-50-ultra-5g/'],
  ['spark50specs', 'Tecno Spark 50', 'https://www.tecno-mobile.com/ph/phones/tech-specs/techspecs/spark-50/'],
  ['go3specs', 'Tecno Spark Go 3', 'https://www.tecno-mobile.com/phones/tech-specs/techspecs/spark-go-3/'],
];
const labels: Record<string, string> = { Processor: 'Процессор', Display: 'Экран', 'Operating System': 'Операционная система',
  'Battery Capacity': 'Аккумулятор и зарядка', Camera: 'Камеры', Connectivity: 'Связь', Network: 'Сети', 'Network Connectivity': 'Сети', 'Dimension': 'Габариты', 'Dimensions': 'Габариты', Sensors: 'Датчики' };
const clean = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const translate = (value: string) => clean(value).replace(/Processor/g, '').replace(/Front:/g, 'Фронтальная:').replace(/Rear:/g, 'Основная:')
  .replace(/Ultra-wide/g, 'сверхширокоугольная').replace(/mAh/g, ' мА·ч').replace(/MP/g, ' Мп').replace(/Hz/g, ' Гц').replace(/Super Charge/g, 'быстрая зарядка')
  .replace(/5-Year Durability Battery/g, '').replace(/\bW\b/g, 'Вт').replace(/\s+/g, ' ').trim();
const file = 'data/official-model-specifications.json', saved = JSON.parse(readFileSync(file, 'utf8'));
for (const [cache, model, source] of targets) {
  const html = readFileSync(`.tmp-qa/tecno-infinix/${cache}.html`, 'utf8');
  const specs: [string, string][] = [];
  for (const section of html.matchAll(/<section class="container cs-product-tech-spec parameter-section">([\s\S]*?)<\/section>/g)) {
    const heading = clean(section[1].match(/<h3 class="tech-spec-title">([\s\S]*?)<\/h3>/)?.[1] ?? '');
    const label = labels[heading];
    if (!label) continue;
    const value = [...section[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(match => translate(match[1])).filter(Boolean).join('; ');
    if (value && value.length < 550) specs.push([label, value]);
  }
  if (specs.length < 3) throw Error(`Incomplete TECNO specs: ${model}`);
  saved[model.toLowerCase()] = { source, name: model, specs, scope: 'model' };
  console.log(model, specs.length);
}
writeFileSync(file, JSON.stringify(saved, null, 2) + '\n');
