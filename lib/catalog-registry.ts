import { iphoneCatalog } from '@/data/iphone-catalog';
import { samsungCatalog } from '@/data/samsung-catalog';
import { macbookCatalog } from '@/data/macbook-catalog';
import { ipadCatalog } from '@/data/ipad-catalog';
import { watchCatalog } from '@/data/watch-catalog';
import { audioCatalog } from '@/data/audio-catalog';
import { playstationCatalog } from '@/data/playstation-catalog';
import { googleCatalog } from '@/data/google-catalog';
import { xiaomiCatalog } from '@/data/xiaomi-catalog';
import { cameraCatalog } from '@/data/camera-catalog';
import { dysonCatalog } from '@/data/dyson-catalog';

export type CatalogItem = {
  id: string;
  model: string;
  modelSlug: string;
  price: number | null;
  color: string;
  storage?: string;
  ram?: string;
  sim?: string;
  size?: string;
  connectivity?: string;
  configuration?: string;
};
export const catalogItems: CatalogItem[] = [
  ...iphoneCatalog,
  ...samsungCatalog,
  ...macbookCatalog,
  ...ipadCatalog,
  ...watchCatalog,
  ...audioCatalog,
  ...playstationCatalog,
  ...googleCatalog,
  ...xiaomiCatalog,
  ...cameraCatalog,
  ...dysonCatalog,
];
export const catalogById = new Map(catalogItems.map((item) => [item.id, item]));
export const basePrices = Object.fromEntries(
  catalogItems.map((item) => [item.id, item.price]),
);

export function normalizeProductName(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\b(galaxy|google|series)\b/g, '')
    .replace(/\+/g, ' plus ')
    .replace(/(\d)\s*(tb|тб)(?=\s|$|\/)/g, '$1tb')
    .replace(/(\d)\s*(gb|гб|мм|mm)(?=\s|$|\/)/g, '$1')
    .replace(/wi[\s‐‑-]*fi/g, 'wifi')
    .replace(/[\s/·‑–—-]+/g, ' ')
    .trim();
}

// Exact aliases only. A row without a color applies to all colors of that
// configuration; an explicit color is never dropped to force a match.
export function priceAliases(item: CatalogItem): string[] {
  let name = item.model;
  if (name.startsWith('Samsung')) {
    name += ` ${item.ram}/${item.storage}`;
  } else if (name.startsWith('MacBook')) {
    name += ` ${item.ram}/${item.storage}`;
  } else if (name.startsWith('iPad')) {
    name += ` ${item.storage} ${item.connectivity}`;
  } else if (name.startsWith('Apple Watch')) {
    name += ` ${item.size}`;
  } else if (name.startsWith('PlayStation')) {
    name = name.includes('Pro')
      ? 'PlayStation 5 Pro 2TB'
      : name.includes('Digital')
        ? 'PlayStation 5 Slim 1TB Digital'
        : 'PlayStation 5 Slim 1TB';
  } else if (item.ram && item.storage) {
    name += ` ${item.ram}/${item.storage}`;
  } else if (item.storage) {
    name += ` ${item.storage}`;
  }
  if (item.model.startsWith('iPhone') && item.sim && item.sim !== '—')
    name += ` ${item.sim}`;
  const names = [name, `${name} ${item.color}`];
  if (
    item.model.startsWith('Samsung Galaxy A') ||
    item.model.startsWith('Samsung Galaxy Z')
  ) {
    names.push(...names.map((alias) => alias.replace('Samsung Galaxy ', '')));
  }
  return [...new Set(names.map(normalizeProductName))];
}

export function itemConfiguration(item: CatalogItem) {
  return [
    item.ram,
    item.storage,
    item.size,
    item.color,
    item.sim,
    item.configuration,
  ]
    .filter((value) => value && value !== '—')
    .join(' · ');
}
