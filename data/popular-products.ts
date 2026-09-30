import { catalogItems, type CatalogItem } from '@/lib/catalog-registry';
import type { FeaturedProduct, ProductCategory } from '@/types/catalog';
import { featuredProducts } from './catalog';

const categoryNames: Record<string, [ProductCategory, string]> = {
  iphones: ['smartphones', 'Apple'], samsung: ['smartphones', 'Samsung'],
  smartphones: ['smartphones', ''], google: ['smartphones', 'Google'],
  xiaomi: ['smartphones', 'Xiaomi'], macbooks: ['laptops', 'Apple'],
  ipads: ['tablets', 'Apple'], watches: ['watches', 'Apple'],
  audio: ['audio', ''], playstation: ['gaming', ''], dyson: ['dyson', 'Dyson'],
  cameras: ['cameras', ''], gadgets: ['accessories', ''],
};
function card(item: CatalogItem): FeaturedProduct {
  const [category, brand] = categoryNames[item.category ?? 'gadgets'];
  return {
    model: { id: item.modelSlug, slug: item.modelSlug, name: item.model, brand, category },
    sku: {
      id: item.id, modelId: item.modelSlug, storage: item.storage, sim: item.sim,
      color: item.color, colorSlug: item.color.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: item.price!, image: item.image, availability: {},
    },
  };
}
const priced = catalogItems.filter((item) => item.price !== null && item.price > 0);
const preorderModels = new Set([
  'iPhone 18 Pro Max', 'iPhone Duo', 'iPhone 18 Pro', 'Apple Watch Series 12',
  'Apple Watch Ultra 4', 'AirPods 5 with Wireless Charging Case',
]);
const selectedModels = new Set<string>();
const selectedIds = new Set<string>();
const curated: CatalogItem[] = [];

// Give the first rows a mix of premium categories and top configurations.
const categoryOrder = [
  'samsung', 'macbooks', 'xiaomi', 'ipads', 'google', 'playstation',
  'dyson', 'watches', 'cameras', 'audio', 'smartphones', 'gadgets', 'iphones',
];
for (const category of categoryOrder) {
  const candidates = priced
    .filter(item => item.category === category && !selectedIds.has(item.id) && !selectedModels.has(item.model) && !preorderModels.has(item.model))
    .sort((a, b) => b.price! - a.price!);
  const item = candidates.find(entry => !entry.image.includes('product-photo-pending')) ?? candidates[0];
  if (!item) continue;
  curated.push(item);
  selectedIds.add(item.id);
  selectedModels.add(item.model);
}

for (const entry of [...featuredProducts].sort((a, b) => b.sku.price - a.sku.price)) {
  if (curated.length >= 16) break;
  const item = catalogItems.find(candidate => candidate.id === entry.sku.id);
  if (!item || selectedIds.has(item.id) || selectedModels.has(item.model) || preorderModels.has(item.model)) continue;
  curated.push(item);
  selectedIds.add(item.id);
  selectedModels.add(item.model);
}

for (const item of [...priced].sort((a, b) => b.price! - a.price!)) {
  if (curated.length >= 16) break;
  if (selectedIds.has(item.id) || selectedModels.has(item.model) || preorderModels.has(item.model)) continue;
  curated.push(item);
  selectedIds.add(item.id);
  selectedModels.add(item.model);
}

export const popularProducts: FeaturedProduct[] = curated.slice(0, 16).map(card);
