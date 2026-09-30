import ExcelJS from 'exceljs';
import { readFileSync, writeFileSync } from 'node:fs';
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
import { additionalCatalog } from '../data/additional-catalog';

type OldItem = { id: string; model: string; modelSlug: string; color: string; image: string; gallery?: string[]; category?: string; price?: number | null };
type Source = { row: number; article: string; category: string; title: string; sim: string; cost: number; price: number };
const oldItems: OldItem[] = [
  ...iphoneCatalog.map(item => ({ ...item, category: 'iphones' })),
  ...samsungCatalog.map(item => ({ ...item, category: 'samsung' })),
  ...macbookCatalog.map(item => ({ ...item, category: 'macbooks' })),
  ...ipadCatalog.map(item => ({ ...item, category: 'ipads' })),
  ...watchCatalog.map(item => ({ ...item, category: 'watches' })),
  ...audioCatalog.map(item => ({ ...item, category: 'audio' })),
  ...playstationCatalog.map(item => ({ ...item, category: 'playstation' })),
  ...googleCatalog.map(item => ({ ...item, category: 'google' })),
  ...xiaomiCatalog.map(item => ({ ...item, category: 'xiaomi' })),
  ...cameraCatalog.map(item => ({ ...item, category: 'cameras' })),
  ...dysonCatalog.map(item => ({ ...item, category: 'dyson' })),
  ...additionalCatalog,
];
const byOldId = new Map(oldItems.map(item => [item.id, item]));
const mappings = JSON.parse(readFileSync(new URL('../data/new-price-matches.json', import.meta.url), 'utf8')) as {
  exact: Record<string, string>;
  photoHints: Record<string, string>;
};

function categoryFor(value: string): string {
  const v = value.toLowerCase();
  if (v.includes('iphone')) return 'iphones';
  if (v.includes('galaxy a') || v.includes('galaxy s') || v.includes('galaxy z') || v.includes('galaxy tab') || v.includes('samsung')) return 'samsung';
  if (v.includes('pixel') || v.includes('google')) return 'google';
  if (v.includes('xiaomi') || v.includes('redmi') || v.includes('poco') || v === 'mi') return 'xiaomi';
  if (v.includes('phone')) return 'smartphones';
  if (v.includes('macbook') || v.includes('imac') || v.includes('mac mini')) return 'macbooks';
  if (v.includes('ipad') || v.includes('pad')) return 'ipads';
  if (v.includes('watch') || v.includes('oura ring')) return 'watches';
  if (v.includes('airpods') || v.includes('headphones') || v.includes('buds') || v.includes('speakers') || v.includes('marshall') || v.includes('bang & olufsen') || v.includes('harmon') || v.includes('harman') || v.includes('яндекс станция')) return 'audio';
  if (v.includes('playstation') || v.includes('console') || v.includes('xbox') || v.includes('oculus')) return 'playstation';
  if (v.includes('dyson') || v.includes('vacuum') || v.includes('purifier')) return 'dyson';
  if (v.includes('camera') || v.includes('камер') || v.includes('fujifilm') || v.includes('photo') || v.includes('insta360') || v.includes('gopro') || v.includes('kodak')) return 'cameras';
  return 'gadgets';
}

function categoryImage(category: string): string {
  return ({
    iphones: '/images/category-iphone.webp', samsung: '/images/king-category-smartphones.webp',
    smartphones: '/images/king-category-smartphones.webp', xiaomi: '/images/king-category-smartphones.webp',
    google: '/images/king-category-smartphones.webp', macbooks: '/images/category-laptops.webp',
    ipads: '/images/category-tablets.webp', watches: '/images/king-category-watches.webp',
    audio: '/images/category-audio.webp', playstation: '/images/king-category-gaming.webp',
    dyson: '/images/category-dyson.webp', cameras: '/images/category-gadgets.webp',
    gadgets: '/images/category-accessories.webp',
  } as Record<string, string>)[category];
}

function displayTitle(row: Source): string {
  const title = row.title.trim();
  switch (row.category) {
    case 'iPhone': return /^iPhone\b/i.test(title) ? title : `iPhone ${title}`;
    case 'Macbook': return /^MB\s/i.test(title) ? title.replace(/^MB\s/i, 'MacBook ') : title;
    case 'Apple Watch': return /^S\d+\b/i.test(title) ? title.replace(/^S(\d+)\b/i, 'Apple Watch Series $1') : /^Apple Watch\b/i.test(title) ? title : `Apple Watch ${title}`;
    case 'Galaxy A':
    case 'Galaxy S':
    case 'Galaxy Z': return /^Samsung\b/i.test(title) ? title : `Samsung Galaxy ${title}`;
    case 'Pixel Phone': return /^Google\b/i.test(title) ? title : `Google ${title}`;
    case 'Dyson':
    case 'Пылесосы (Vacuum Cleaner)':
    case 'Очистители (Purifier)': return /^Dyson\b/i.test(title) ? title : `Dyson ${title}`;
    case 'iMac': return /^iMac\b/i.test(title) ? title : `iMac ${title}`;
    case 'Mac Mini': return /^Mac mini\b/i.test(title) ? title : `Mac mini ${title}`;
    default: return title;
  }
}

const input = process.argv[2] ?? 'C:/Users/borsh/Downloads/Парсер (1).xlsx';
const book = new ExcelJS.Workbook();
await book.xlsx.readFile(input);
const sheet = book.getWorksheet('Новый прайс');
if (!sheet) throw new Error('Missing sheet Новый прайс');
const source: Source[] = [];
sheet.eachRow((row, index) => {
  if (index === 1) return;
  const article = row.getCell(1).text.trim();
  if (!article) return;
  if (!/^P-\d+$/.test(article)) throw new Error(`Invalid article in row ${index}: ${article}`);
  const cellNumber = (column: number) => {
    const cell = row.getCell(column);
    const value = typeof cell.value === 'number' ? cell.value : cell.result;
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Invalid price in ${cell.address}`);
    return Math.round(value);
  };
  source.push({ row: index, article, category: row.getCell(2).text.trim(), title: row.getCell(3).text.trim(), sim: row.getCell(4).text.trim(), cost: cellNumber(5), price: cellNumber(6) });
});
if (source.length !== 1591 || new Set(source.map(row => row.article)).size !== source.length) throw new Error('Unexpected article count or duplicate articles');
const titleCount = new Map<string, number>();
for (const row of source) titleCount.set(row.title, (titleCount.get(row.title) ?? 0) + 1);
const items = source.map(row => {
  const old = byOldId.get(mappings.exact[row.article]);
  const hint = byOldId.get(mappings.photoHints[row.article]);
  const category = categoryFor(row.category);
  const name = displayTitle(row);
  const title = titleCount.get(row.title)! > 1 ? `${name} (${row.sim || row.article})` : name;
  if (old) return {
    ...old,
    ...(/\bActive\b/i.test(row.title) ? { model: title, priceAlias: title, configuration: 'Active' } : {}),
    article: row.article, price: row.cost <= 1 ? null : row.price,
    sourceTitle: row.title, sourceCategory: row.category,
  };
  const image = hint?.image ?? categoryImage(category);
  return {
    id: row.article, article: row.article, model: title, modelSlug: row.article.toLowerCase(),
    price: row.cost <= 1 ? null : row.price, color: '', category, image,
    ...(hint?.gallery ? { gallery: hint.gallery } : {}),
    photoApproximate: true, priceAlias: title,
    ...(/\bActive\b/i.test(row.title) ? { configuration: 'Active' } : {}),
    sourceTitle: row.title, sourceCategory: row.category,
  };
});
if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('Duplicate catalog ID');
writeFileSync(new URL('../data/new-price-source.json', import.meta.url), `${JSON.stringify(source, null, 2)}\n`);
writeFileSync(new URL('../data/new-price-catalog.json', import.meta.url), `${JSON.stringify(items, null, 2)}\n`);
console.log(`Imported ${items.length} articles; preserved ${items.filter(item => !item.id.startsWith('P-')).length} old SKUs`);
