import { catalogItems } from '@/lib/catalog-registry';
import type { FeaturedProduct } from '@/types/catalog';

const models = ['iPhone 18 Pro Max', 'iPhone Duo', 'iPhone 18 Pro'];
const selections = models.flatMap((model) => {
  const item = catalogItems.find((sku) => sku.model === model && sku.price !== null && sku.price > 0);
  return item ? [item] : [];
});

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const apple2027Products: FeaturedProduct[] = selections.map((item) => ({
  model: {
    id: item.modelSlug,
    slug: item.modelSlug,
    name: item.model,
    brand: 'Apple',
    category: 'smartphones',
  },
  sku: {
    id: item.id,
    modelId: item.modelSlug,
    storage: item.storage,
    color: item.color,
    colorSlug: slugify(item.color),
    sim: item.sim,
    price: item.price!,
    image: item.image,
    availability: {},
  },
}));
