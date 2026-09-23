import { catalogItems } from '@/lib/catalog-registry';
import type { FeaturedProduct, ProductCategory } from '@/types/catalog';
import { featuredProducts } from './catalog';

const picks: Array<[string, ProductCategory, string]> = [
  ['Samsung Galaxy S26 Ultra', 'smartphones', 'Samsung'],
  ['Marshall Major 5', 'audio', 'Marshall'],
  ['Instax Mini Evo', 'cameras', 'Fujifilm'],
  ['JBL Charge 6', 'audio', 'JBL'],
  ['iPad Air 13 M4', 'tablets', 'Apple'],
  ['Marshall Stanmore 3', 'audio', 'Marshall'],
  ['Samsung Galaxy Z Fold 8', 'smartphones', 'Samsung'],
  ['Apple Watch Series 11', 'watches', 'Apple'],
  ['PlayStation 5 Pro', 'gaming', 'Sony'],
  ['Dyson Airwrap Long HS09', 'dyson', 'Dyson'],
  ['Instax Mini 12', 'cameras', 'Fujifilm'],
  ['Google Pixel 10', 'smartphones', 'Google'],
];

const additions = picks.map(([name, category, brand]): FeaturedProduct => {
  const item = catalogItems.find(item => item.model === name && item.price !== null && item.price > 0);
  if (!item || item.price === null) throw new Error(`Missing popular product: ${name}`);
  return {
    model: { id: item.modelSlug, slug: item.modelSlug, name: item.model, brand, category },
    sku: {
      id: item.id, modelId: item.modelSlug, storage: item.storage, sim: item.sim,
      color: item.color, colorSlug: item.color.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: item.price, image: item.image, availability: {},
    },
  };
});

export const popularProducts: FeaturedProduct[] = [
  featuredProducts[0], ...additions.slice(0, 3),
  featuredProducts[1], additions[3], featuredProducts[2], additions[4],
  additions[5], additions[6], featuredProducts[3], additions[7],
  ...additions.slice(8),
];
