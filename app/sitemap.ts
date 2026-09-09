import type { MetadataRoute } from 'next';
import { siteUrl, isPublicSite } from '@/config/site';
import { catalogCategories } from '@/data/catalog-navigation';
import { catalogItems } from '@/lib/catalog-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublicSite) return [];
  const paths = new Set(['/', '/catalog', '/trade-in',
    ...catalogCategories.map(item => item.href).filter(href => !href.includes('#')),
    ...catalogItems.map(item => `/catalog/${item.modelSlug}`),
  ]);
  return [...paths].map(path => ({ url: `${siteUrl}${path}` }));
}
