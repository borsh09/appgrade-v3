import type { CatalogItem } from '@/lib/catalog-registry';
import parserRows from '@/data/parser-catalog.json';
import supplierDetails from '@/data/parser-details.json';
import { parserCuratedDetails } from '@/data/parser-curated-details';

export type ProductDetailContent = {
  lead: string;
  description: string;
  groups: { title: string; rows: [string, string][] }[];
  limitedSpecs: boolean;
};
type SourceDetail = { source: string; name: string; specs: [string, string][] };
const sourceById = supplierDetails as unknown as Record<string, SourceDetail>;
const parserById = new Map(parserRows.map(row => [row.id, row]));
const sourceByModel = new Map<string, SourceDetail>();
for (const row of parserRows) {
  const detail = sourceById[row.id];
  if (detail && !sourceByModel.has(row.modelSlug)) sourceByModel.set(row.modelSlug, detail);
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
  return categoryTexts[item.category ?? ''] ?? 'Характеристики выбранной версии приведены ниже.';
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
  if (item.model === 'Dyson V15 SV47' && detail.name.includes('Dyson V15 SV47')) return true;
  if (item.model === 'MacBook Pro 16 M5' && item.priceAlias?.includes('M5 Max') && detail.name.includes('M5 Max')) return true;
  if (item.id === 'parser-sheet1-1282' && detail.name.includes('MacBook Pro 14') && detail.name.includes('M5') && detail.name.includes('24 ГБ')) return true;
  const normalize = (text: string) => text.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е')
    .replace(/\b(\d+)(?:nd|rd|st|th)\b/g, '$1').replace(/(\d+)-го\s+поколения/g, '$1')
    .replace(/(\d+)\s*(?:gb|гб)/g, '$1гб').replace(/[^\p{L}\p{N}]+/gu, ' ');
  const stop = new Set(['смартфон', 'смартфоны', 'планшет', 'ноутбук', 'наушники', 'беспроводные', 'беспроводной', 'умная', 'колонка', 'компактный', 'фотоаппарат', 'очки', 'виртуальной', 'реальности', 'система', 'медиаплеер', 'геймпад', 'стилус', 'для', 'с', 'алисой', 'на', 'поколения', 'серый', 'белый', 'черный', 'черная', 'серебристый']);
  const tokens = (text: string) => normalize(text).split(/\s+/).filter(token => token && !stop.has(token));
  const model = tokens(item.model);
  const source = new Set(tokens(detail.name));
  if (!model.length) return false;
  for (const qualifier of ['duo', 'complete', 'mini', 'pro', 'max', 'ultra', 'air']) {
    if (model.includes(qualifier) !== source.has(qualifier)) return false;
  }
  if (source.has('mini') && !model.includes('mini')) return false;
  const core = normalize(item.model).split(/\s+/).filter(token => token.length > 2 && !['смартфон', 'планшет', 'ноутбук', 'наушники', 'беспроводные', 'часы', 'apple', 'samsung'].includes(token));
  if (core.length && core.slice(0, 3).every(token => normalize(detail.name).includes(token))) return true;
  const identifiers = model.filter(token => /\d/.test(token) && !/^\d+гб$/.test(token));
  if (identifiers.some(token => !source.has(token))) return false;
  const overlap = model.filter(token => source.has(token)).length;
  return overlap >= Math.min(2, model.length) && overlap / model.length >= 0.55;
}
function variantRows(item: CatalogItem): [string, string][] {
  const gigabytes = (value: string) => /^\d+$/.test(value) ? `${value} ГБ` : value.replace(/(\d+)\s*TB\b/i, '$1 ТБ');
  return [
    ['Модель', item.model],
    ['Оперативная память', item.ram ? gigabytes(item.ram) : ''],
    ['Встроенная память', item.storage ? gigabytes(item.storage) : ''],
    ['Размер корпуса', item.size ? (/мм|mm/i.test(item.size) ? item.size : `${item.size} мм`) : ''],
    ['Цвет', item.color ?? ''],
    ['SIM', item.sim ?? ''],
    ['Подключение', item.connectivity ?? ''],
    ['Процессор', item.chip ?? ''],
    ['Конфигурация', item.configuration && item.configuration !== item.priceAlias ? item.configuration : ''],
  ].filter((row): row is [string, string] => Boolean(row[1] && row[1] !== '—'));
}
function isVariantSpecific(label: string, item: CatalogItem, shared = false): boolean {
  if (/^модель$|^тип$|^производитель$/i.test(label)) return true;
  if (shared && /памят|накопител|цвет|размер|диагонал|экран|ремеш|корпус|sim|сим|сотов|lte|wi.?fi|подключен|комплектац/i.test(label)) return true;
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
  const source = sourceById[item.id] ?? (parserById.has(item.id) ? sourceByModel.get(item.modelSlug) : undefined);
  const verified = source && sourceIsCompatible(item, source) ? source : undefined;
  const curated = parserCuratedDetails[item.id];
  const shared = Boolean(verified && sourceById[item.id] !== verified);
  const title = item.priceAlias ?? item.model;
  const type = categoryNames[item.category ?? ''] ?? 'Товар';
  const configuration = variantRows(item).filter(([label]) => label !== 'Модель').map(([, value]) => value);
  const lead = configuration.length ? configuration.join(' · ') : title;
  const name = /^[\p{Script=Cyrillic}]/u.test(item.priceAlias ?? '')
    ? item.priceAlias! : /^[\p{Script=Cyrillic}]/u.test(item.model) ? item.model : `${type} ${item.model}`;
  const highlights = verified?.specs.filter(([label]) => !isVariantSpecific(label, item, shared) && /процессор|диагональ экрана|тип экрана|технология изготовления экрана|время работы|ёмкость батареи|емкость батареи|шумоподавлен|конфигурация камер/i.test(label)).slice(0, 3) ?? curated?.specs.slice(0, 2) ?? [];
  const facts = highlights.length ? `Ключевые параметры: ${highlights.map(([label, value]) => `${label.toLocaleLowerCase('ru-RU')} — ${value}`).join('; ')}.` : '';
  const description = `${name}. ${purposeFor(item)} ${configuration.length ? `Выбранная версия: ${configuration.join(', ')}.` : ''} ${facts}`.replace(/\s+/g, ' ').trim();
  const groups = new Map<string, [string, string][]>();
  groups.set('Выбранная комплектация', variantRows(item));
  if (verified) {
    for (const [label, value] of verified.specs) {
      if (isVariantSpecific(label, item, shared)) continue;
      const group = groupFor(label);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push([label, value]);
    }
  }
  if (curated?.specs.length) groups.set('Особенности и возможности', curated.specs);
  const sourced = [...groups].some(([title, rows]) => title !== 'Выбранная комплектация' && title !== 'Особенности и возможности' && rows.length > 0);
  const result = {
    lead,
    description,
    groups: [...groups].filter(([, rows]) => rows.length).map(([title, rows]) => ({ title, rows })),
  };
  return { ...result, limitedSpecs: !sourced && (curated?.specs.length ?? 0) < 3 };
}
