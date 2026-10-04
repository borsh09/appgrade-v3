import { catalogItems, itemConfiguration, type CatalogItem } from '@/lib/catalog-registry';
import type { FeaturedProduct, ProductCategory } from '@/types/catalog';
import { merchandiseCatalog, preorderModels, promotedModels } from '@/lib/catalog-order';

const categoryNames: Record<string, [ProductCategory, string]> = {
  iphones: ['smartphones', 'Apple'], samsung: ['smartphones', 'Samsung'],
  smartphones: ['smartphones', ''], google: ['smartphones', 'Google'],
  xiaomi: ['smartphones', 'Xiaomi'], macbooks: ['laptops', 'Apple'],
  ipads: ['tablets', 'Apple'], watches: ['watches', 'Apple'],
  audio: ['audio', ''], playstation: ['gaming', ''], dyson: ['dyson', 'Dyson'],
  cameras: ['cameras', ''], gadgets: ['accessories', ''],
};
export function catalogProductCard(item: CatalogItem): FeaturedProduct {
  const [category, brand] = categoryNames[item.category ?? 'gadgets'];
  return {
    model: { id: item.modelSlug, slug: item.modelSlug, name: item.model, brand, category },
    sku: {
      id: item.id, modelId: item.modelSlug, storage: item.storage, sim: item.sim,
      color: item.color, colorSlug: item.color.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      configuration: itemConfiguration(item),
      price: item.price!, image: item.image, availability: {},
    },
  };
}
const priced = merchandiseCatalog(catalogItems.filter(item =>
  item.price !== null && item.price > 0 && !item.photoMissing && (!preorderModels.has(item.model) || promotedModels.has(item.model)),
));
const selectedModels = new Set<string>();
const selectedIds = new Set<string>();
const curated: CatalogItem[] = [];
for (const color of ['Burgundy', 'Black', 'Silver', 'Glacier']) {
  for (const model of promotedModels) {
    const item = priced.find(item => item.model === model && item.color === color);
    if (!item) continue;
    curated.push(item);
    selectedIds.add(item.id);
    selectedModels.add(item.model);
  }
}

// Start with core purchases, then complements; never label this editorial selection as sales data.
const categoryOrder = [
  'samsung', 'xiaomi',
  'macbooks', 'ipads', 'audio', 'watches',
  'dyson', 'playstation', 'google', 'smartphones',
  'audio', 'dyson', 'cameras', 'gadgets',
];
for (const category of categoryOrder) {
  const item = priced.find(item => item.category === category && !selectedIds.has(item.id) && !selectedModels.has(item.model));
  if (!item) continue;
  curated.push(item);
  selectedIds.add(item.id);
  selectedModels.add(item.model);
}

for (const item of priced) {
  if (curated.length >= 16) break;
  if (selectedIds.has(item.id) || selectedModels.has(item.model)) continue;
  curated.push(item);
  selectedIds.add(item.id);
  selectedModels.add(item.model);
}

export const popularProducts: FeaturedProduct[] = curated.slice(0, 16).map(catalogProductCard);
