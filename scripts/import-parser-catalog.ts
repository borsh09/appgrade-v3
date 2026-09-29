import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { iphoneCatalog } from '../data/iphone-catalog';
import { samsungCatalog } from '../data/samsung-catalog';
import { macbookCatalog } from '../data/macbook-catalog';
import { ipadCatalog } from '../data/ipad-catalog';
import { watchCatalog } from '../data/watch-catalog';
import { audioCatalog } from '../data/audio-catalog';
import { playstationCatalog } from '../data/playstation-catalog';
import { googleCatalog } from '../data/google-catalog';
import { xiaomiCatalog } from '../data/xiaomi-catalog';
import { cameraCatalog } from '../data/camera-catalog';
import { dysonCatalog } from '../data/dyson-catalog';
import existingAdditional from '../data/additional-catalog.json';

type Existing = { id: string; model: string; storage?: string; ram?: string; color?: string; sim?: string; size?: string; connectivity?: string; priceAlias?: string };
const supplements: Existing[] = existingAdditional.map((row) => {
  const item: Existing = { ...row };
  const phone = row.model.match(/^(iPhone .+?) (\d+|\d+TB) (eSim|Sim\/eSim) (.+)$/);
  const memory = row.model.match(/^(.*?) (\d+)\/(\d+TB|\d+)(.*)$/);
  if (phone) {
    [, item.model, item.storage, item.sim, item.color] = phone;
  } else if (memory) {
    item.model = memory[1].replace(/^Samsung /, 'Samsung Galaxy ');
    item.ram = memory[2];
    item.storage = memory[3];
    item.color = memory[4].replace(/\(RUSSIAN\)|Wi-Fi/g, '').trim();
  }
  return item;
});
const existing: Existing[] = [
  ...iphoneCatalog, ...samsungCatalog, ...macbookCatalog, ...ipadCatalog,
  ...watchCatalog, ...audioCatalog, ...playstationCatalog, ...googleCatalog,
  ...xiaomiCatalog, ...cameraCatalog, ...dysonCatalog, ...supplements,
];

const book = new ExcelJS.Workbook();
await book.xlsx.readFile('Парсер.xlsx');
const sheet = book.getWorksheet('Лист1');
if (!sheet) throw new Error('В Парсер.xlsx нет листа «Лист1».');
const text = (cell: ExcelJS.Cell): string => {
  const value = cell.value;
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object') {
    if ('text' in value) {
      const label: unknown = value.text;
      if (typeof label === 'string') return label.trim();
      if (label && typeof label === 'object' && 'richText' in label)
        return (label as { richText: { text: string }[] }).richText.map((run) => run.text).join('').trim();
    }
    if ('richText' in value) return value.richText.map((run) => run.text).join('').trim();
  }
  return '';
};
const number = (cell: ExcelJS.Cell): number | null => {
  const raw = cell.value;
  const value = raw && typeof raw === 'object' && 'result' in raw ? raw.result : raw;
  return typeof value === 'number' && Number.isFinite(value) && value > 1 ? Math.round(value) : null;
};
const isUnavailable = (cell: ExcelJS.Cell): boolean => {
  const raw = cell.value;
  return (raw && typeof raw === 'object' && 'result' in raw ? raw.result : raw) === 1;
};
const norm = (value: string) => value.normalize('NFKC').toLowerCase().replace(/ё/g, 'е').replace(/[‑–—−]/g, '-').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
const storage = (value: string): number[] => {
  const matches = [...value.matchAll(/(\d+)\s*(?:гб|gb|тб|tb)(?=\s|[,.]|$)/gi)];
  if (matches.length) return matches.map((match) => /тб|tb/i.test(match[0]) ? Number(match[1]) * 1024 : Number(match[1]));
  const pair = value.match(/\b(?:\d{1,2})\s*\/\s*(\d{2,4})\b/);
  if (pair) return [Number(pair[1])];
  const phone = value.match(/\biphone\s+\w+(?:\s+pro(?:\s+max)?)?\s+(\d{2,4})\b/i);
  return phone ? [Number(phone[1])] : [];
};
const capacity = (value?: string): number | null => {
  if (!value) return null;
  const match = value.match(/(\d+)\s*(tb|тб|gb|гб)?/i);
  return match ? Number(match[1]) * (/tb|тб/i.test(match[2] ?? '') ? 1024 : 1) : null;
};
const colors: Record<string, string[]> = {
  black: ['черный', 'чёрный'], white: ['белый'], blue: ['синий'], green: ['зеленый', 'зелёный'],
  pink: ['розовый'], silver: ['серебристый', 'серебро', 'серебряный'], gray: ['серый'],
  yellow: ['желтый', 'жёлтый'], purple: ['фиолетовый'], red: ['красный'], gold: ['золотой'],
  midnight: ['темная ночь', 'тёмная ночь', 'ночное небо'], starlight: ['сияющая звезда', 'cияющая звезда'],
  'product red': ['красный'], ultramarine: ['ультрамарин'], teal: ['бирюзовый'],
  'cosmic orange': ['оранжевый'], 'deep blue': ['синий'], 'sky blue': ['голубой', 'небесно голубой', 'синий'],
  burgundy: ['бургунди'], glacier: ['небесно голубой', 'ледяной'], lavender: ['лавандовый'],
  sage: ['зеленый'], 'mist blue': ['синий'], 'light gold': ['золотой'],
  'space black': ['черный'], 'cloud white': ['белый'], 'star white': ['белый'],
  'black titanium': ['черный титан'], 'white titanium': ['белый титан'],
  'natural titanium': ['натуральный титан'], 'desert titanium': ['пустынный титан'],
};
const contains = (haystack: string, needle: string) => ` ${haystack} `.includes(` ${needle} `);
const modelMatches = (title: string, model: string): boolean => {
  const name = norm(title), target = norm(model);
  if (contains(name, target)) {
    const suffix = name.slice(name.indexOf(target) + target.length).trim();
    if (/^(?:pro|max|plus|ultra|edge|fe|5g|mini)\b/.test(suffix)) return false;
    return true;
  }
  if (model === 'iPad 11 A16') return /ipad 11.*2025/.test(name);
  const air = model.match(/^iPad Air (11|13) M4$/);
  if (air) return new RegExp(`ipad air.*2026.*m4.*${air[1]}|ipad air.*m4.*${air[1]}`).test(name);
  const mac = model.match(/^MacBook Air (13|15) M([145])$/);
  if (mac) return new RegExp(`macbook air ${mac[1]}.*m${mac[2]}`).test(name);
  if (model === 'MacBook Neo') return /macbook neo/.test(name);
  return false;
};
const colorMatches = (title: string, color?: string): boolean => {
  if (!color) return false;
  const n = norm(title), key = norm(color);
  const aliases = [key, ...(colors[key] ?? []).map(norm)];
  return aliases.some((alias) => contains(n, alias));
};
function matchExisting(title: string): Existing | undefined {
  const candidates = existing.filter((item) => {
    if (item.priceAlias && norm(item.priceAlias) === norm(title)) return true;
    if (!modelMatches(title, item.model)) return false;
    const needed = capacity(item.storage);
    if (needed !== null && !storage(title).includes(needed)) return false;
    const ram = capacity(item.ram);
    if (ram !== null && !new RegExp(`\\b${ram}\\s*(?:/|гб оперативной|гб озу)`, 'i').test(title)) return false;
    if (item.size && !contains(norm(title), norm(item.size))) return false;
    if (item.sim && item.sim !== '—') {
      const sim = norm(title).includes('sim esim') ? 'sim esim' : /\besim\b/i.test(title) ? 'esim' : /\bsim\b/i.test(title) ? 'sim' : '';
      if (sim !== norm(item.sim) && !(sim === 'sim' && norm(item.sim) === 'sim esim')) return false;
    }
    if (item.model.startsWith('iPhone') && (!item.sim || item.sim === '—') && /\besim\b/i.test(title)) return false;
    if (item.connectivity && /ipad/i.test(item.model)) {
      const cell = /\blte\b|cellular/i.test(title);
      if (cell !== /cellular|lte/i.test(item.connectivity)) return false;
    }
    return colorMatches(title, item.color);
  });
  return candidates.length === 1 ? candidates[0] : undefined;
}

const headingNames = new Set([
  'SAMSUNG', 'NOTHING PHONE', 'SONY PS', 'NINTENDO', 'VALVE', 'LABUBU',
  'GOOGLE PIXEL', 'CANON', 'OnePlus', 'HONOR', 'XIOMI', 'Планшеты IPAD',
  'ПЛАНШЕТЫ SAMSUNG', 'ПЛАНШЕТЫ XIOMI', 'АКСЫ К IPAD', 'APPLE WATCH',
  'ЧАСЫ SAMSUNG', 'WHOOP', 'Фитнесс браслеты', 'MACBOOK', 'DYSON',
  'НАУШНИКИ И КОЛОНКИ', 'APPLE TV', 'VR и микрофоны',
].map(norm));
function category(title: string): string {
  const n = norm(title);
  if (/чехол|защитное стекло|пленка|кабель|зарядное устройство/.test(n)) return 'gadgets';
  if (/iphone/.test(n)) return 'iphones';
  if (/ipad|планшет/.test(n)) return /xiaomi|redmi|poco/.test(n) ? 'xiaomi' : /samsung/.test(n) ? 'samsung' : 'ipads';
  if (/macbook|imac|макбук|мак про|mac mini/.test(n)) return 'macbooks';
  if (/смарт часы|спортивные часы|фитнес браслет|watch|whoop|garmin/.test(n)) return 'watches';
  if (/samsung/.test(n)) return 'samsung';
  if (/google pixel/.test(n)) return 'google';
  if (/xiaomi|redmi|poco/.test(n)) return 'xiaomi';
  if (/смартфон|nothing phone|oneplus|honor/.test(n)) return 'smartphones';
  if (/dyson/.test(n)) return 'dyson';
  if (/playstation|sony ps|nintendo|steam deck|valve|dualsense|геймпад|игровая приставка|vr/.test(n)) return 'playstation';
  if (/наушники|airpods|marshall|jbl|колонка|яндекс станция|акустика|микрофон/.test(n)) return 'audio';
  if (/canon|fujifilm|instax|фотоаппарат|камера|ray ban|ray-ban/.test(n)) return 'cameras';
  return 'gadgets';
}
function presentation(title: string, section: string) {
  let model = title.replace(/\s+1$/, '').trim();
  const memory = [...title.matchAll(/(\d+)\s*(ГБ|GB|ТБ|TB)(?=\s|[,.]|$)/gi)];
  const pair = title.match(/\b(\d{1,2})\s*\/\s*(\d{2,4})(?:\s*ГБ|\s*GB)?/i);
  const storageValue = memory.at(-1);
  const iphoneBareStorage = section === 'iphones' ? title.match(/iPhone\s+(?:17e|Duo|17)\s+(\d{2,4})(?=\s|$)/i) : null;
  const storage = storageValue ? `${storageValue[1]} ${/ТБ|TB/i.test(storageValue[2]) ? 'ТБ' : 'ГБ'}` : pair ? `${pair[2]} ГБ` : iphoneBareStorage ? `${iphoneBareStorage[1]} ГБ` : undefined;
  const ram = pair ? `${pair[1]} ГБ` : section === 'macbooks' && memory.length > 1 ? `${memory[0][1]} ${/ТБ|TB/i.test(memory[0][2]) ? 'ТБ' : 'ГБ'}` : undefined;
  const sizeMatch = section === 'watches' ? title.match(/\b(\d{2})\s*(?:мм|mm)\b/i) : null;
  const size = sizeMatch ? `${sizeMatch[1]} мм` : undefined;
  const sim = /sim\s*\/\s*esim/i.test(title) ? 'Sim/eSim' : /\besim\b/i.test(title) ? 'eSim' : /\bsim\b/i.test(title) ? 'Sim' : undefined;
  const connectivity = /wi[\s‑-]*fi\s*\+\s*cellular|\blte\b/i.test(title) ? 'LTE' : /wi[\s‑-]*fi/i.test(title) ? 'Wi-Fi' : undefined;
  let color = storageValue ? title.slice(storageValue.index! + storageValue[0].length).replace(/\b(?:eSim|Sim)\b/gi, '').replace(/^[,\s]+/, '').trim() : '';
  let configuration: string | undefined;
  if (iphoneBareStorage && !color) color = title.slice(iphoneBareStorage.index! + iphoneBareStorage[0].length).replace(/\b(?:eSim|Sim)\b/gi, '').trim();
  if (section === 'iphones') {
    model = title.match(/iPhone\s+(?:17e|Duo|17)(?!\w)/i)?.[0] ?? model;
    if (!color) color = title.match(/iPhone\s+\S+\s+\d+\s+(.+?)(?:\s+(?:eSim|Sim))?$/i)?.[1] ?? '';
  } else if (section === 'samsung' || section === 'google' || section === 'xiaomi' || section === 'smartphones') {
    const before = title.match(/(?:Смартфон\s+)?(.+?)\s+(?:\d{1,2}\s*\/\s*\d{2,4}|\d{2,4}\s*(?:ГБ|GB|ТБ|TB))/i)?.[1];
    if (before) model = before.replace(/^Смартфон\s+/, '').trim();
  } else if (section === 'ipads') {
    const ipad = title.match(/iPad\s+(Pro|Air|mini)?\s*\(?\s*(\d{4})?[,\s]*[МM](\d)\s*\)?\s*(\d{2})/i);
    if (ipad) model = `iPad ${ipad[1] ?? ''} ${ipad[4]} M${ipad[3]}`.replace(/\s+/g, ' ').trim();
    else model = title.match(/iPad\s+\d+(?:\s*["”])?(?:\s*\d{4})?/i)?.[0]?.replace(/["”]/g, '').trim() ?? model;
  } else if (section === 'macbooks') {
    const mac = title.match(/MacBook\s+(Air|Pro)\s+(\d{2})["”]?[\s,]*(?:\([^)]*?([МM]\d)[^)]*\)|([МM]\d))/i);
    if (mac) model = `MacBook ${mac[1]} ${mac[2]} ${(mac[3] ?? mac[4]).replace('М', 'M')}`;
    else model = title.match(/MacBook\s+Neo/i)?.[0] ?? model;
  } else if (section === 'watches') {
    model = title.match(/(?:Apple|Samsung)\s+(?:Watch|Galaxy Watch)\s+(?:Series\s+\d+|SE\s+\d+|Ultra\s+\d+|\d+(?:\s+Ultra)?)/i)?.[0] ?? model;
    const caseBand = title.match(/(?:\d{2}\s*(?:mm|мм))\s+(.+?)\s+Case\s+with\s+(.+)$/i);
    if (caseBand) { color = caseBand[1]; configuration = caseBand[2]; }
    else color = title.match(/,\s*цвет\s+(.+?)\s+\d{2}\s*(?:mm|мм)/i)?.[1] ?? color;
  } else if (section === 'dyson') {
    model = title.match(/Dyson\s+.*?\b(?:HT|HS|HD|SV|DS)\d+/i)?.[0] ?? model;
  } else if (section === 'audio') {
    model = title.match(/(?:JBL|Marshall)\s+[A-Za-z]+\s*(?:\d+|V|IV)?/i)?.[0]
      ?? title.match(/AirPods\s+(?:Pro\s+\d+|Max(?:\s+USB-C)?|\d+)/i)?.[0]
      ?? model;
    if (model === 'AirPods 5') configuration = /шумоподавлен/i.test(title)
      ? /беспроводной зарядки|зарядный кейс/i.test(title) ? 'Шумоподавление · беспроводная зарядка' : 'Шумоподавление'
      : 'Стандартный футляр';
  }
  if (color) color = color.replace(/^SSD[,\s]*/i, '').replace(/\s+\d+$/, '').trim();
  if (section === 'gadgets' || color.length > 70) color = '';
  const ascii = norm(model).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55);
  const hash = createHash('sha1').update(norm(model)).digest('hex').slice(0, 8);
  return { model, modelSlug: `parser-${section}-${ascii || 'model'}-${hash}`, storage, ram, color, sim, size, connectivity, configuration };
}

const added: Record<string, unknown>[] = [];
const coverage: Record<string, unknown>[] = [];
const seen = new Map<string, string>();
const matchedIds = new Set<string>();
for (let row = 2; row <= sheet.rowCount; row++) {
  const title = text(sheet.getRow(row).getCell(1));
  if (!title || headingNames.has(norm(title))) continue;
  const key = norm(title);
  const previous = seen.get(key);
  if (previous) { coverage.push({ row, title, sku: previous, result: 'duplicate-sheet-row' }); continue; }
  const found = matchExisting(title);
  if (found && !matchedIds.has(found.id)) { seen.set(key, found.id); matchedIds.add(found.id); coverage.push({ row, title, sku: found.id, result: 'existing', price: number(sheet.getRow(row).getCell(12)), unavailable: isUnavailable(sheet.getRow(row).getCell(12)) }); continue; }
  const id = `parser-sheet1-${row}`;
  seen.set(key, id);
  const section = category(title);
  added.push({
    id, ...presentation(title, section), legacySlug: id,
    price: number(sheet.getRow(row).getCell(12)),
    category: section, image: '/images/product-photo-pending.svg',
    source: `Парсер.xlsx!Лист1!A${row}`, priceAlias: title,
  });
  coverage.push({ row, title, sku: id, result: 'imported', price: number(sheet.getRow(row).getCell(12)), unavailable: isUnavailable(sheet.getRow(row).getCell(12)) });
}
const variantGroups = new Map<string, Record<string, unknown>[]>();
for (const item of added) {
  const key = ['modelSlug', 'storage', 'ram', 'color', 'sim', 'size', 'connectivity', 'configuration']
    .map((field) => typeof item[field] === 'string' ? item[field] : '').join('|');
  const group = variantGroups.get(key) ?? [];
  group.push(item);
  variantGroups.set(key, group);
}
for (const group of variantGroups.values()) {
  if (group.length > 1)
    for (const item of group) item.configuration = item.priceAlias;
}
await writeFile('data/parser-catalog.json', JSON.stringify(added, null, 2) + '\n');
await writeFile('data/parser-active-ids.json', JSON.stringify([...new Set(coverage.map((entry) => entry.sku))], null, 2) + '\n');
await writeFile('data/parser-prices.json', JSON.stringify(Object.fromEntries(
  coverage.filter((entry) => entry.result === 'existing').map((entry) => [entry.sku, entry.price]),
), null, 2) + '\n');
const labels: Record<string, string> = {
  iphones: 'iPhone', samsung: 'Samsung', smartphones: 'Другие смартфоны',
  google: 'Google Pixel', xiaomi: 'Xiaomi, Redmi, Poco', ipads: 'Планшеты',
  watches: 'Часы', macbooks: 'Компьютеры', audio: 'Аудио',
  playstation: 'Игровые устройства', dyson: 'Dyson', cameras: 'Камеры',
  gadgets: 'Гаджеты и аксессуары',
};
const csv = (values: Array<string | number | null | undefined>) => values.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';');
await writeFile('Добавленные товары из Парсер Лист1.csv', '\ufeff' + [
  csv(['Категория', 'Название', 'Цена, ₽', 'Строка Лист1', 'SKU']),
  ...added.map((item) => csv([
    labels[item.category as string], item.priceAlias as string,
    item.price === null ? 'Уточняется' : item.price as number,
    String(item.source).match(/A(\d+)$/)?.[1], item.id as string,
  ])),
].join('\r\n'));
await writeFile('data/parser-unavailable.json', JSON.stringify([...new Set(coverage.filter((entry) => entry.result === 'existing' && entry.unavailable === true).map((entry) => entry.sku))], null, 2) + '\n');
await writeFile('data/parser-import-report.json', JSON.stringify({
  source: 'Парсер.xlsx!Лист1',
  products: coverage.length,
  imported: added.length,
  matchedExisting: coverage.filter((entry) => entry.result === 'existing').length,
  duplicateRows: coverage.filter((entry) => entry.result === 'duplicate-sheet-row').length,
  rows: coverage,
}, null, 2) + '\n');
console.log(`Лист1: ${coverage.length} товарных строк; новых ${added.length}; уже в каталоге ${coverage.filter((entry) => entry.result === 'existing').length}; повторов листа ${coverage.filter((entry) => entry.result === 'duplicate-sheet-row').length}.`);
