import type { CatalogItem } from './catalog-registry';

const cyrillic = ['a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ts', 'ch', 'sh', 'sch', '', 'y', '', 'e', 'yu', 'ya'];
function familySlug(value: string) {
  return value.toLowerCase().replace(/ё/g, 'e').replace(/[а-я]/g, letter => cyrillic[letter.charCodeAt(0) - 1072])
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Group display routes only. Supplier IDs, articles and price aliases stay intact. */
export function groupCatalogModels(items: CatalogItem[]): CatalogItem[] {
  const prepared = items.map(groupCatalogModel);
  const families = new Map<string, CatalogItem[]>();
  const key = (item: CatalogItem) => `${item.category}:${item.sourceCategory === 'Macbook' ? item.modelSlug : item.model.normalize('NFKC').toLowerCase().replace(/ё/g, 'е')}`;
  for (const item of prepared) {
    const family = families.get(key(item)) ?? [];
    family.push(item);
    families.set(key(item), family);
  }
  const slugs = new Map<string, string>();
  for (const [identity, family] of families) {
    // Retain established model URLs when available; article/parser URLs become aliases.
    const established = family.find(item => !/^(?:p-\d+|parser-)/i.test(item.modelSlug));
    slugs.set(identity, established?.modelSlug ?? `${family[0].category ?? 'product'}-${familySlug(family[0].model) || family[0].modelSlug}`);
  }
  return prepared.map(item => ({
    ...item,
    modelSlug: slugs.get(key(item))!,
    originalModelSlug: item.originalModelSlug ?? item.modelSlug,
  }));
}

/** MacBook variants share a product page; the SKU still selects the exact article. */
export function groupCatalogModel(item: CatalogItem): CatalogItem {
  if (item.sourceCategory !== 'Macbook' || !/^MacBook (Air|Pro|Neo)\b/.test(item.model)) return item;
  const family = item.model.replace(/(MacBook Pro \d+ M\d) (?:Pro|Max)$/, '$1');
  const modelSlug = family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const parts = (item.configuration ?? '').split(' · ');
  const manufacturerPart = parts.find(part => /^[A-Z0-9]{5}$/.test(part));
  const chip = item.model.match(/\b(M\d(?: Pro| Max)?)\b/)?.[1] ?? (item.model.includes('Neo') ? 'A18 Pro' : item.chip);
  return {
    ...item,
    modelSlug,
    originalModelSlug: item.originalModelSlug ?? item.modelSlug,
    manufacturerPart,
    chip,
    configuration: parts.filter(part => part !== manufacturerPart && part).join(' · ') || undefined,
  };
}

/** Keep every SKU while showing the available model families throughout the grid. */
export function interleaveCatalogModels<T extends CatalogItem>(items: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.modelSlug) ?? [];
    group.push(item);
    groups.set(item.modelSlug, group);
  }
  const queues = [...groups.values()].map(group => group.slice().sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)));
  const result: T[] = [];
  for (let index = 0; result.length < items.length; index++) {
    for (const queue of queues) if (queue[index]) result.push(queue[index]);
  }
  return result;
}
