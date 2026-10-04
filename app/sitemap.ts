import type { MetadataRoute } from 'next';
import { siteUrl, isPublicSite } from '@/config/site';
import { catalogCategories } from '@/data/catalog-navigation';
import { catalogItems } from '@/lib/catalog-registry';
import { getProductDetails } from '@/lib/product-details';
import { STORE_LIST } from '@/config/stores';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicSite) return [];
  const models = [...new Map(catalogItems.map(item => [item.modelSlug, item])).values()];
  const paths = new Set(['/', '/catalog', '/trade-in', '/stores',
    ...STORE_LIST.map(store => `/stores/${store.id}`),
    ...catalogCategories.map(item => item.href).filter(href => !href.includes('#')),
    ...models.filter(item => !getProductDetails(item).limitedSpecs).map(item => `/catalog/${item.modelSlug}`),
  ]);
  return [...paths].sort().map(path => ({ url: `${siteUrl}${path}` }));
}
