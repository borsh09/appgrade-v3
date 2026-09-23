import { catalogItems, itemConfiguration } from '@/lib/catalog-registry';
import { productHref } from '@/lib/product-selection';

export const searchIndex = catalogItems.map(item => ({
  ...item,
  name: item.model,
  detail: itemConfiguration(item) || 'Стандартная комплектация',
  price: item.price ?? 0,
  href: productHref(item),
}));
