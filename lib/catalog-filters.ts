import type { CatalogItem } from '@/lib/catalog-registry';

export const filterKeys = ['model', 'brand', 'kind', 'chip', 'ram', 'storage', 'size', 'connectivity', 'sim', 'color', 'configuration'] as const;
export type FilterKey = (typeof filterKeys)[number];
export type FilterSelection = Partial<Record<FilterKey, string[]>>;

const labels: Record<FilterKey, string> = {
  model: 'Модель', brand: 'Бренд', kind: 'Тип', chip: 'Процессор', ram: 'Оперативная память',
  storage: 'Память', size: 'Размер', connectivity: 'Версия', sim: 'SIM', color: 'Цвет', configuration: 'Комплектация',
};

const categoryOrder: Record<string, FilterKey[]> = {
  iphones: ['model', 'storage', 'color', 'sim'],
  macbooks: ['model', 'chip', 'ram', 'storage', 'color'],
  ipads: ['model', 'chip', 'storage', 'color', 'connectivity'],
  samsung: ['model', 'ram', 'storage', 'color', 'sim'],
  xiaomi: ['model', 'chip', 'ram', 'storage', 'color', 'connectivity'],
  watches: ['model', 'size', 'color', 'connectivity'],
  audio: ['model', 'brand', 'kind', 'color'],
  playstation: ['model', 'kind', 'color', 'configuration'],
  cameras: ['model', 'kind', 'color'],
  dyson: ['model', 'kind', 'color'],
};

export type FilterDefinition = { key: FilterKey; label: string };

export function getFilterDefinitions(items: CatalogItem[], category: string): FilterDefinition[] {
  const preferred = categoryOrder[category] ?? filterKeys;
  return preferred
    .filter(key => new Set(items.map(item => item[key]).filter(value => value && value !== '—')).size > 1)
    .map(key => ({ key, label: labels[key] }));
}

export function matchesSelection(item: CatalogItem, selection: FilterSelection, except?: FilterKey) {
  return Object.entries(selection).every(([rawKey, values]) => {
    const key = rawKey as FilterKey;
    if (key === except || !values?.length) return true;
    return values.includes(String(item[key] ?? ''));
  });
}

export function getFacetOptions(items: CatalogItem[], selection: FilterSelection, key: FilterKey) {
  const source = key === 'model' ? items : items.filter(item => matchesSelection(item, selection, key));
  return [...new Set(source.map(item => item[key]).filter((value): value is string => Boolean(value && value !== '—')))]
    .sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));
}

export function sanitizeSelection(items: CatalogItem[], selection: FilterSelection): FilterSelection {
  let next = { ...selection };
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of filterKeys) {
      const selected = next[key];
      if (!selected?.length) continue;
      const valid = new Set(getFacetOptions(items, next, key));
      const kept = selected.filter(value => valid.has(value));
      if (kept.length !== selected.length) {
        next = { ...next, [key]: kept };
        changed = true;
      }
    }
  }
  return next;
}

export function activeFilterCount(selection: FilterSelection, priceMin: string, priceMax: string) {
  return Object.values(selection).reduce((sum, values) => sum + (values?.length ?? 0), 0) + (priceMin ? 1 : 0) + (priceMax ? 1 : 0);
}
