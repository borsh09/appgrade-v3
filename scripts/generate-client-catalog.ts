import { writeFileSync } from 'node:fs';
import { catalogItems, itemConfiguration } from '../lib/catalog-registry';
import { productHref } from '../lib/product-selection';

// Keep the browser search index small: galleries and supplier metadata stay on the server.
const searchIndex = catalogItems.map(item => ({
  id: item.id,
  model: item.model,
  name: item.model,
  modelSlug: item.modelSlug,
  price: item.price,
  color: item.color,
  image: item.image,
  category: item.category,
  brand: item.brand,
  kind: item.kind,
  chip: item.chip,
  priceAlias: item.priceAlias,
  ram: item.ram,
  storage: item.storage,
  size: item.size,
  sim: item.sim,
  connectivity: item.connectivity,
  configuration: item.configuration,
  href: productHref(item),
  detail: itemConfiguration(item) || 'Стандартная комплектация',
}));

writeFileSync(new URL('../data/client-search-index.json', import.meta.url), `${JSON.stringify(searchIndex)}\n`);
writeFileSync(new URL('../data/client-base-prices.json', import.meta.url), `${JSON.stringify(Object.fromEntries(catalogItems.map(item => [item.id, item.price])))}\n`);
