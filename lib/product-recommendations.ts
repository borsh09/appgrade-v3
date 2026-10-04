import { catalogItems, type CatalogItem } from './catalog-registry';
import { merchandiseCatalog } from './catalog-order';

const complements: Record<string, string[]> = {
  iphones: ['audio', 'watches'], samsung: ['audio', 'watches'], google: ['audio', 'watches'],
  smartphones: ['audio', 'watches'], xiaomi: ['audio', 'watches'],
  macbooks: ['audio', 'ipads'], ipads: ['audio', 'macbooks'],
  audio: ['iphones', 'watches'], watches: ['iphones', 'audio'],
  playstation: ['audio', 'gadgets'], cameras: ['gadgets', 'audio'],
  dyson: ['dyson'], gadgets: ['audio', 'iphones'],
};

export function productRecommendations(selected: CatalogItem, catalog: readonly CatalogItem[] = catalogItems): CatalogItem[] {
  const eligible = merchandiseCatalog(catalog.filter(item => item.model !== selected.model && item.price !== null && item.price > 0 && !item.photoMissing));
  const seen = new Set<string>();
  const result: CatalogItem[] = [];
  const add = (items: CatalogItem[], limit: number) => {
    for (const item of items) {
      if (result.length >= limit) break;
      if (seen.has(item.model)) continue;
      seen.add(item.model);
      result.push(item);
    }
  };
  add(eligible.filter(item => item.category === selected.category), 4);
  for (const category of complements[selected.category ?? 'gadgets'] ?? []) {
    add(eligible.filter(item => item.category === category), Math.min(result.length + 2, 8));
  }
  add(eligible, 8);
  return result;
}
