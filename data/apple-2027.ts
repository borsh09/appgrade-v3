import { audioCatalog } from './audio-catalog';
import { iphoneCatalog } from './iphone-catalog';
import { watchCatalog } from './watch-catalog';
import type { FeaturedProduct, ProductCategory } from '@/types/catalog';

const selections = [
  { item: iphoneCatalog.find((sku) => sku.model === 'iPhone 18 Pro Max')!, category: 'smartphones', oldPrice: 257990 },
  { item: iphoneCatalog.find((sku) => sku.model === 'iPhone Duo')!, category: 'smartphones', oldPrice: 257990 },
  { item: iphoneCatalog.find((sku) => sku.model === 'iPhone 18 Pro')!, category: 'smartphones', oldPrice: 173990 },
  { item: watchCatalog.find((sku) => sku.model === 'Apple Watch Series 12')!, category: 'watches' },
  { item: watchCatalog.find((sku) => sku.model === 'Apple Watch Ultra 4')!, category: 'watches' },
  { item: audioCatalog.find((sku) => sku.model === 'AirPods 5 with Wireless Charging Case')!, category: 'audio' },
] satisfies Array<{ item: (typeof iphoneCatalog)[number] | (typeof watchCatalog)[number] | (typeof audioCatalog)[number]; category: ProductCategory; oldPrice?: number }>;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const apple2027Products: FeaturedProduct[] = selections.map(({ item, category, oldPrice }) => ({
  model: {
    id: item.modelSlug,
    slug: item.modelSlug,
    name: item.model,
    brand: 'Apple',
    category,
  },
  sku: {
    id: item.id,
    modelId: item.modelSlug,
    storage: 'storage' in item ? item.storage : undefined,
    color: item.color,
    colorSlug: slugify(item.color),
    sim: 'sim' in item ? item.sim : undefined,
    price: item.price ?? 0,
    oldPrice,
    image: item.image,
    availability: {},
  },
}));
