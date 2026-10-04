import type { CatalogItem } from '@/lib/catalog-registry';
import parserRows from '@/data/parser-catalog.json';
import supplierDetails from '@/data/parser-details.json';
import { parserCuratedDetails } from '@/data/parser-curated-details';
import { presentCatalogItem } from './catalog-presentation';
import matches from '@/data/new-price-matches.json';
import currentDetails from '@/data/current-product-details.json';
import { verifiedModelSpecifications } from '@/data/verified-model-specifications';
import detailsReview from '@/data/parser-details-review.json';
import officialModels from '@/data/official-model-specifications.json';
import structuredModels from '@/data/structured-manufacturer-specifications.json';

export type ProductDetailContent = {
  lead: string;
  description: string;
  groups: { title: string; rows: [string, string][] }[];
  limitedSpecs: boolean;
};
type SourceDetail = { source: string; name: string; specs: [string, string][]; scope?: 'model' };
const sourceById = supplierDetails as unknown as Record<string, SourceDetail>;
const disputedSources = new Set(detailsReview.review.map(entry => entry.source));
const sourcePool = Object.values(sourceById);
const compatibleSources = new Map<string, SourceDetail[]>();
const parserById = new Map(parserRows.map(row => [row.id, row]));
const modelKey = (model: string) => model.normalize('NFKC').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
const sourceByModel = new Map<string, SourceDetail[]>();
const curatedByModel = new Map<string, (typeof parserCuratedDetails)[string]>();
for (const row of parserRows) {
  const model = presentCatalogItem(row as CatalogItem).model;
  const detail = sourceById[row.id];
  if (detail) {
    const key = modelKey(model), sources = sourceByModel.get(key) ?? [];
    if (!sources.includes(detail)) sources.push(detail);
    sourceByModel.set(key, sources);
  }
  const curated = parserCuratedDetails[row.id];
  if (curated) curatedByModel.set(modelKey(model), curated);
}
for (const detail of Object.values(sourceById)) {
  const model = detail.specs.find(([label]) => /^модель$/i.test(label))?.[1];
  if (!model) continue;
  const key = modelKey(model), sources = sourceByModel.get(key) ?? [];
  if (!sources.includes(detail)) sources.push(detail);
  sourceByModel.set(key, sources);
}

const categoryNames: Record<string, string> = {
  iphones: 'Смартфон Apple', samsung: 'Смартфон Samsung', smartphones: 'Смартфон',
  google: 'Смартфон Google', xiaomi: 'Смартфон', ipads: 'Планшет',
  macbooks: 'Ноутбук', watches: 'Умные часы', audio: 'Аудиоустройство',
  playstation: 'Игровое устройство', cameras: 'Устройство для съёмки',
  dyson: 'Техника Dyson', gadgets: 'Устройство',
};
const categoryTexts: Record<string, string> = {
  iphones: 'Подходит для связи, съёмки, работы с приложениями и повседневных задач.',
  samsung: 'Подходит для связи, съёмки, работы с приложениями и повседневных задач.',
  smartphones: 'Подходит для связи, съёмки, работы с приложениями и повседневных задач.',
  google: 'Подходит для связи, съёмки, работы с приложениями и повседневных задач.',
  xiaomi: 'Подходит для связи, съёмки, работы с приложениями и повседневных задач.',
  ipads: 'Подходит для просмотра контента, работы с приложениями и общения.',
  macbooks: 'Подходит для работы, учёбы и повседневных задач.',
  watches: 'Помогают следить за уведомлениями и использовать функции часов каждый день.',
  audio: 'Подходит для прослушивания музыки и другого аудио.',
  playstation: 'Предназначено для игр и совместимых развлечений.',
  cameras: 'Предназначено для фото, видео и связанных задач.',
  dyson: 'Предназначено для повседневного использования дома.',
  gadgets: 'Подробности выбранной версии указаны в характеристиках.',
};
function detailCategoryFor(item: CatalogItem): string {
  return /^(?:iPad|Honor Pad|Poco Pad|Xiaomi Pad|Redmi Pad|OnePlus Pad|Galaxy Tab)$/.test(item.sourceCategory ?? '')
    ? 'ipads' : item.category ?? '';
}
function purposeFor(item: CatalogItem): string {
  const name = item.priceAlias ?? item.model;
  if (/клавиатур/i.test(name)) return 'Для набора текста и управления совместимым устройством.';
  if (/трекпад/i.test(name)) return 'Для управления курсором и жестами на совместимом устройстве.';
  if (/pencil|стилус/i.test(name)) return 'Для заметок, рисунков и работы с совместимым планшетом.';
  if (/чехол|конверт/i.test(name)) return 'Для хранения и защиты совместимого устройства.';
  if (/геймпад|контроллер/i.test(name)) return 'Для управления в совместимых играх.';
  if (/зарядная станция/i.test(name)) return 'Для зарядки совместимых устройств.';
  if (/микрофон/i.test(name)) return 'Для записи звука.';
  if (/колонка|станция мини|станция миди|станция макс/i.test(name)) return 'Для воспроизведения звука и голосового управления.';
  if (/пылесос/i.test(name)) return 'Для уборки дома.';
  if (/стайлер|фен/i.test(name)) return 'Для укладки и ухода за волосами.';
  if (/фигурка|labubu/i.test(name)) return 'Коллекционный товар; особенности серии указаны в названии.';
  if (/фитнес-трекер/i.test(name)) return 'Для отслеживания активности.';
  if (/apple tv|медиаплеер/i.test(name)) return 'Для просмотра контента на совместимом телевизоре.';
  return categoryTexts[detailCategoryFor(item)] ?? 'Характеристики выбранной версии приведены ниже.';
}
function groupFor(label: string): string {
  if (/камер|фото|видео|объектив|сенсор/i.test(label)) return 'Камеры и съёмка';
  if (/экран|дисплей|диагонал|разрешение экрана|яркост|частота обновлен/i.test(label)) return 'Экран';
  if (/процессор|чип|памят|операционн|видеокарт|графич|яд[рео]/i.test(label)) return 'Производительность и память';
  if (/аккумулятор|батаре|зарядк|автоном|воспроизведен/i.test(label)) return 'Питание';
  if (/wi.?fi|bluetooth|связ|сет[ьи]|sim|lte|5g|nfc|разъ.м|интерфейс/i.test(label)) return 'Связь и подключение';
  if (/цвет|материал|размер|вес|габарит|корпус|влаг|защит|комплект|ремеш/i.test(label)) return 'Корпус и комплектация';
  return 'Общие характеристики';
}
function sourceIsCompatible(item: CatalogItem, detail: SourceDetail): boolean {
  if (disputedSources.has(detail.source)) return false;
  if (item.model === 'Dyson V15 SV47' && detail.name.includes('Dyson V15 SV47')) return true;
  if (item.model === 'MacBook Pro 16 M5' && item.priceAlias?.includes('M5 Max') && detail.name.includes('M5 Max')) return true;
  if (item.id === 'parser-sheet1-1282' && detail.name.includes('MacBook Pro 14') && detail.name.includes('M5') && detail.name.includes('24 ГБ')) return true;
  const normalize = (text: string) => text.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/bowers\s*&\s*wilkins|b&w/g, 'bowers wilkins')
    .replace(/\b(\d+)(?:nd|rd|st|th)\b/g, '$1').replace(/(\d+)-го\s+поколения/g, '$1')
    .replace(/(\d+)\s*(?:gb|гб)/g, '$1гб').replace(/[^\p{L}\p{N}]+/gu, ' ');
  const stop = new Set(['смартфон', 'смартфоны', 'планшет', 'ноутбук', 'наушники', 'беспроводные', 'беспроводной', 'умная', 'колонка', 'компактный', 'фотоаппарат', 'очки', 'виртуальной', 'реальности', 'система', 'медиаплеер', 'геймпад', 'стилус', 'для', 'с', 'алисой', 'на', 'поколения', 'серый', 'белый', 'черный', 'черная', 'серебристый']);
  const tokens = (text: string) => normalize(text).split(/\s+/).filter(token => token && !stop.has(token));
  const model = tokens(item.model);
  const source = new Set(tokens(detail.name));
  if (!model.length) return false;
  if (item.category === 'dyson') {
    const codes = item.model.match(/\b(?:HS|HD|SV|TP|PH|CY|WR|HJ)\d+[A-Z]?\b/gi) ?? [];
    const vacuum = item.model.match(/\bV\d+S?\b/i)?.[0];
    if (vacuum && !new RegExp(`\\b${vacuum}\\b`, 'i').test(detail.name)) return false;
    if (/submarine/i.test(item.model) !== /submarine/i.test(detail.name)) return false;
    if (codes.length && codes.every(code => new RegExp(`\\b${code}\\b`, 'i').test(detail.name))) return true;
  }
  for (const qualifier of ['duo', 'mini', 'pro', 'max', 'ultra', 'air', 'plus', 'fe', 'xl', 'lite', 'neo']) {
    if (model.includes(qualifier) !== source.has(qualifier)) return false;
  }
  if (source.has('mini') && !model.includes('mini')) return false;
  const identifiers = model.filter(token => /\d/.test(token) && !/^\d+гб$/.test(token));
  if (identifiers.some(token => !source.has(token))) return false;
  const optional = new Set(['apple', 'samsung', 'fujifilm', 'complete', 'long', 'origin', 'body', 'adventure', 'standard', 'creator', 'combo', 'bundle', 'edition', 'essentials', 'essential', 'accessory', 'with', 'charging', 'case', 'device', 'only', 'as', 'is', 'pitch', 'neon']);
  const required = model.filter(token => !optional.has(token));
  return required.length > 0 && required.every(token => source.has(token));
}
function variantRows(item: CatalogItem): [string, string][] {
  const gigabytes = (value: string) => /^\d+$/.test(value) ? `${value} ГБ` : value.replace(/(\d+)\s*TB\b/i, '$1 ТБ');
  return [
    ['Модель', item.model],
    ['Артикул', item.article ?? item.id],
    ['Бренд', item.brand ?? ''],
    ['Тип устройства', item.kind ?? ''],
    ['Оперативная память', item.ram ? gigabytes(item.ram) : ''],
    ['Встроенная память', item.storage ? gigabytes(item.storage) : ''],
    ['Размер корпуса', item.size ? (/мм|mm/i.test(item.size) ? item.size : `${item.size} мм`) : ''],
    ['Цвет', item.color ?? ''],
    ['SIM', item.sim ?? ''],
    ['Подключение', item.connectivity ?? ''],
    ['Процессор', item.chip ?? ''],
    ['Код производителя', item.manufacturerPart ?? ''],
    ['Конфигурация', item.configuration && item.configuration !== item.priceAlias ? item.configuration : ''],
  ].filter((row): row is [string, string] => Boolean(row[1] && row[1] !== '—'));
}
function isVariantSpecific(label: string, item: CatalogItem, shared = false): boolean {
  if (/^модель$|^тип$|^производитель$/i.test(label)) return true;
  if (shared && /памят|накопител|цвет|ремеш|sim|сим|сотов|lte|комплектац/i.test(label)) return true;
  if (shared && item.category === 'macbooks' && /яд[рео]|gpu|cpu|графич|видеокарт/i.test(label)) return true;
  if (shared && item.category === 'watches' && /размер|диагонал|экран|дисплей|корпус|габарит|вес|высота|ширина|толщина|ремеш/i.test(label)) return true;
  if (shared && item.category === 'dyson' && /вес|габарит|размер|насадк|щетк|щётк|комплект/i.test(label)) return true;
  if (item.storage && /^(?:встроенная )?память$|накопитель|объ.м памяти/i.test(label)) return true;
  if (item.ram && /оперативная память|объ.м озу/i.test(label)) return true;
  if (item.color && /цвет|расцветк/i.test(label)) return true;
  if (item.size && /размер|диагонал/i.test(label)) return true;
  if (item.sim && /sim|сим/i.test(label)) return true;
  if (item.connectivity && /подключен|сотов|lte|wi.?fi/i.test(label)) return true;
  // The source is one configuration of a model. These fields may differ between variants.
  if (item.category === 'watches' && /ремеш|корпус|экран/i.test(label)) return true;
  return false;
}

export function getProductDetails(item: CatalogItem): ProductDetailContent {
  const legacyId = (matches.exact as Record<string, string>)[item.article ?? item.id];
  const current = (currentDetails as unknown as Record<string, SourceDetail>)[item.id];
  const official = (officialModels as unknown as Record<string, SourceDetail>)[modelKey(item.model)]
    ?? (structuredModels as unknown as Record<string, SourceDetail>)[modelKey(item.model)];
  const compatibilityKey = `${item.category}|${item.model}|${item.id === 'parser-sheet1-1282' ? item.id : ''}|${item.priceAlias?.includes('M5 Max') ?? false}`;
  let compatible = compatibleSources.get(compatibilityKey);
  if (!compatible) {
    compatible = sourcePool.filter(detail => sourceIsCompatible(item, detail));
    compatibleSources.set(compatibilityKey, compatible);
  }
  const candidates = [official, current, sourceById[item.id], legacyId ? sourceById[legacyId] : undefined, ...(sourceByModel.get(modelKey(item.model)) ?? []), ...compatible]
    .filter((detail): detail is SourceDetail => Boolean(detail));
  const verified = candidates.find(detail => sourceIsCompatible(item, detail));
  const legacyModel = legacyId && parserById.get(legacyId);
  const manual = verifiedModelSpecifications[item.model];
  const curated = manual ?? parserCuratedDetails[item.id]
    ?? (legacyModel && modelKey(presentCatalogItem(legacyModel as CatalogItem).model) === modelKey(item.model) ? parserCuratedDetails[legacyId!] : undefined)
    ?? curatedByModel.get(modelKey(item.model));
  const shared = Boolean(verified && (verified.scope === 'model' || (sourceById[item.id] !== verified && (!legacyId || sourceById[legacyId] !== verified))));
  const title = item.model;
  const type = categoryNames[detailCategoryFor(item)] ?? 'Товар';
  const configuration = variantRows(item).filter(([label]) => label !== 'Модель').map(([, value]) => value);
  const lead = configuration.length ? configuration.join(' · ') : title;
  const name = /^[\p{Script=Cyrillic}]/u.test(item.model) ? item.model : `${type} ${item.model}`;
  const highlights = manual ? manual.specs.filter(([label]) => !(item.chip && label === 'Процессор')).slice(0, 3) : verified?.specs.filter(([label]) => !isVariantSpecific(label, item, shared) && /процессор|диагональ экрана|тип экрана|технология изготовления экрана|время работы|ёмкость батареи|емкость батареи|шумоподавлен|конфигурация камер/i.test(label)).slice(0, 3) ?? curated?.specs.slice(0, 2) ?? [];
  const facts = highlights.length ? `Ключевые параметры: ${highlights.map(([label, value]) => `${label.toLocaleLowerCase('ru-RU')} — ${value}`).join('; ')}.` : '';
  const description = `${name}. ${purposeFor(item)} ${configuration.length ? `Выбранная версия: ${configuration.join(', ')}.` : ''} ${facts}`.replace(/\s+/g, ' ').trim();
  const groups = new Map<string, [string, string][]>();
  groups.set('Выбранная комплектация', variantRows(item));
  if (verified && !manual) {
    for (const [label, value] of verified.specs) {
      if (isVariantSpecific(label, item, shared)) continue;
      const group = groupFor(label);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push([label, value]);
    }
  }
  if (curated?.specs.length) groups.set(manual ? 'Технические характеристики' : 'Особенности и возможности', curated.specs.filter(([label]) => !(item.chip && label === 'Процессор')));
  const sourced = [...groups].some(([title, rows]) => title !== 'Выбранная комплектация' && title !== 'Особенности и возможности' && rows.length > 0);
  const result = {
    lead,
    description,
    groups: [...groups].filter(([, rows]) => rows.length).map(([title, rows]) => ({ title, rows })),
  };
  return { ...result, limitedSpecs: !sourced && (curated?.specs.length ?? 0) < 3 };
}
