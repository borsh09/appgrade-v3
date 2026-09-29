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
const selected = new Set(featuredProducts.map((entry) => entry.sku.id));
const additions: CatalogItem[] = [];
for (const category of ['samsung', 'audio', 'cameras', 'watches', 'playstation', 'dyson', 'google', 'xiaomi', 'smartphones', 'gadgets']) {
  const item = priced.find((entry) => entry.category === category && !selected.has(entry.id) && !entry.image.includes('product-photo-pending'))
    ?? priced.find((entry) => entry.category === category && !selected.has(entry.id));
  if (item) { selected.add(item.id); additions.push(item); }
}
for (const item of priced) {
  if (featuredProducts.length + additions.length >= 16) break;
  if (selected.has(item.id) || additions.some((entry) => entry.model === item.model)) continue;
  selected.add(item.id); additions.push(item);
}
export const popularProducts: FeaturedProduct[] = [
  ...featuredProducts, ...additions.map(card),
].slice(0, 16);
