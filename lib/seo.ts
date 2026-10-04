import type { Metadata } from 'next';
import { isPublicSite, siteUrl } from '@/config/site';
import { seoCategories } from '@/data/seo-categories';
import { catalogCategories } from '@/data/catalog-navigation';
import { itemConfiguration, type CatalogItem } from '@/lib/catalog-registry';
import type { ProductDetailContent } from '@/lib/product-details';
import { STORES, type Store } from '@/config/stores';

export const siteName = 'APPGRADE';
export const homeTitle = 'APPGRADE — смартфоны, компьютеры и другая техника';
export const homeDescription = 'Смартфоны, компьютеры, планшеты и аксессуары в APPGRADE: Магнитогорск, Белорецк, Троицк и Сибай. Каталог с характеристиками и обмен смартфона по Trade-In.';
export function absoluteUrl(path: string, origin = siteUrl) { return new URL(path, `${origin}/`).href; }
export function pageMetadata(title: string, description: string, path: string, image = '/og.png'): Metadata {
  return {
    title: `${title} — APPGRADE`, description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title: `${title} — APPGRADE`, description, url: absoluteUrl(path), siteName, locale: 'ru_RU', type: 'website', images: [{ url: absoluteUrl(image), alt: title }] },
    twitter: { card: 'summary_large_image', title: `${title} — APPGRADE`, description, images: [absoluteUrl(image)] },
  };
}
export function categoryMetadata(category: string): Metadata {
  const content = seoCategories[category];
  return pageMetadata(content.title, content.description, `/catalog/${category}`);
}
export function productMetadata(item: CatalogItem, details: ProductDetailContent): Metadata {
  const name = [item.model, itemConfiguration(item)].filter(Boolean).join(' · ');
  const description = `${name}. ${details.description}`.replace(/\s+/g, ' ').slice(0, 220);
  // One model page owns all its selectable variants; tracking and selection URLs consolidate here.
  const metadata = pageMetadata(name, description, `/catalog/${item.modelSlug}`, item.photoMissing ? '/og.png' : item.image);
  if (details.limitedSpecs) metadata.robots = { index: false, follow: true };
  return metadata;
}
export function serializeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
export function breadcrumbs(items: { name: string; path: string }[], origin = siteUrl) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path, origin) })) };
}
export function categoryBreadcrumb(category: string) {
  const entry = catalogCategories.find(item => item.href === `/catalog/${category}`);
  return breadcrumbs([{ name: 'Главная', path: '/' }, { name: 'Каталог', path: '/catalog' }, { name: entry?.title ?? category, path: `/catalog/${category}` }]);
}
export function storeStructuredData(store: Store, origin = siteUrl) {
  if (!store.address || !store.phone) return null;
  return {
    '@context': 'https://schema.org', '@type': 'ElectronicsStore', '@id': absoluteUrl(`/stores/${store.id}#store`, origin),
    name: `APPGRADE — ${store.city}`, url: absoluteUrl(`/stores/${store.id}`, origin),
    image: absoluteUrl('/images/appgrade-logo-hq.png', origin), telephone: store.phone,
    address: { '@type': 'PostalAddress', streetAddress: store.address, addressLocality: store.city, addressCountry: 'RU' },
    ...(store.latitude !== undefined && store.longitude !== undefined ? { geo: { '@type': 'GeoCoordinates', latitude: store.latitude, longitude: store.longitude } } : {}),
    sameAs: [store.twoGisUrl, store.vk, store.telegram].filter(Boolean),
    parentOrganization: { '@id': absoluteUrl('/#organization', origin) },
  };
}
export function siteStructuredData(origin = siteUrl) {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': absoluteUrl('/#organization', origin), name: siteName, alternateName: 'Аппгрейд', url: absoluteUrl('/', origin), logo: absoluteUrl('/images/appgrade-logo-hq.png', origin), sameAs: [STORES.magnitogorsk.vk, STORES.magnitogorsk.telegram].filter(Boolean) },
    { '@type': 'WebSite', '@id': absoluteUrl('/#website', origin), url: absoluteUrl('/', origin), name: siteName, alternateName: 'Аппгрейд', inLanguage: 'ru-RU', publisher: { '@id': absoluteUrl('/#organization', origin) } },
  ] };
}
export function productStructuredData(item: CatalogItem, details: ProductDetailContent, origin = siteUrl) {
  // Prices and stock change by city. Emit factual product information; do not advertise
  // a static workbook price as a current offer or infer availability from it.
  const category = catalogCategories.find(entry => entry.href === `/catalog/${item.category}`);
  return [
    { '@context': 'https://schema.org', '@type': 'Product', '@id': absoluteUrl(`/catalog/${item.modelSlug}?sku=${encodeURIComponent(item.id)}#product`, origin),
      name: [item.model, itemConfiguration(item)].filter(Boolean).join(' · '), description: details.description,
      sku: item.article ?? item.id, url: absoluteUrl(`/catalog/${item.modelSlug}?sku=${encodeURIComponent(item.id)}`, origin),
      ...(item.brand ? { brand: { '@type': 'Brand', name: item.brand } } : {}),
      ...(item.color && item.color !== '—' ? { color: item.color } : {}),
      ...(!item.photoMissing ? { image: [...new Set([item.image, ...(item.gallery ?? [])])].map(path => absoluteUrl(path, origin)) } : {}),
      additionalProperty: details.groups.flatMap(group => group.rows).map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
      isVariantOf: { '@type': 'ProductGroup', '@id': absoluteUrl(`/catalog/${item.modelSlug}#group`, origin), name: item.model, productGroupID: item.modelSlug, url: absoluteUrl(`/catalog/${item.modelSlug}`, origin) },
    },
    breadcrumbs([{ name: 'Главная', path: '/' }, { name: 'Каталог', path: '/catalog' }, ...(category ? [{ name: category.title, path: category.href }] : []), { name: item.model, path: `/catalog/${item.modelSlug}` }], origin),
  ];
}
export { isPublicSite };
