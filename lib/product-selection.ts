import { normalizeProductName, type CatalogItem } from './catalog-registry';

export const variantFields = ['storage', 'ram', 'color', 'sim', 'size', 'connectivity', 'configuration'] as const;
export type Selection = Partial<Record<(typeof variantFields)[number] | 'sku', string>>;
export function productHref(item: CatalogItem) {
  return `/catalog/${item.modelSlug}?sku=${encodeURIComponent(item.id)}`;
}
export function selectProduct<T extends CatalogItem>(variants: T[], query: Selection): T | undefined {
  return variants.find(item => (!query.sku || item.id === query.sku) && variantFields.every(key =>
    !query[key] || normalizeProductName(item[key] ?? '') === normalizeProductName(query[key]!)));
}
// Changing one option must resolve to an existing SKU. Preserve other choices
// where possible, but never produce an impossible combination of query fields.
export function optionHref<T extends CatalogItem>(variants: T[], selected: T, key: (typeof variantFields)[number], value: string) {
  const candidates = variants.filter(item => normalizeProductName(item[key] ?? '') === normalizeProductName(value));
  const score = (item: T) => variantFields.filter(field => field !== key && normalizeProductName(item[field] ?? '') === normalizeProductName(selected[field] ?? '')).length;
  const best = candidates.sort((a,b) => score(b) - score(a))[0];
  return best ? productHref(best) : undefined;
}
