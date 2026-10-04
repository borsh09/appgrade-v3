import type { CatalogItem } from './catalog-registry';

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
