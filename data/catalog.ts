import type { FeaturedProduct, ProductCategory, ProductModel, ProductSku } from '@/types/catalog';
import { catalogItems, type CatalogItem } from '@/lib/catalog-registry';

const choices: Array<{ model: string; category: ProductCategory; brand: string; match?: (item: CatalogItem) => boolean }> = [
  { model: 'iPhone 17 Pro', category: 'smartphones', brand: 'Apple', match: (item) => item.storage === '256' && item.color === 'Cosmic Orange' },
  { model: 'iPhone 17', category: 'smartphones', brand: 'Apple', match: (item) => item.storage === '256' && item.color === 'Black' },
  { model: 'MacBook Neo', category: 'laptops', brand: 'Apple' },
  { model: 'iPad Air 13 M4', category: 'tablets', brand: 'Apple' },
];

const selected = choices.flatMap((choice) => {
  const variants = catalogItems.filter((item) => item.model === choice.model && item.price !== null && item.price > 0);
  const item = variants.find(choice.match ?? (() => true)) ?? variants[0];
  return item ? [{ item, choice }] : [];
});
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const productModels: ProductModel[] = selected.map(({ item, choice }) => ({
  id: item.modelSlug, slug: item.modelSlug, name: item.model, brand: choice.brand, category: choice.category,
}));
export const productSkus: ProductSku[] = selected.map(({ item }) => ({
  id: item.id, modelId: item.modelSlug, storage: item.storage, color: item.color,
  colorSlug: slug(item.color), sim: item.sim, price: item.price!, image: item.image,
  availability: {},
}));
export const featuredProducts: FeaturedProduct[] = productSkus.map((sku, index) => ({
  sku, model: productModels[index],
}));

export const categories = ['iPhone', 'Samsung', 'MacBook', 'iPad', 'Apple Watch', 'AirPods', 'PlayStation', 'Dyson', 'Аксессуары'];
