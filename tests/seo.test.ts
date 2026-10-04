import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogCategories } from '@/data/catalog-navigation';
import { seoCategories } from '@/data/seo-categories';
import { absoluteUrl, categoryMetadata, productMetadata, productStructuredData, serializeJsonLd, storeStructuredData } from '@/lib/seo';
import { catalogItems } from '@/lib/catalog-registry';
import { getProductDetails } from '@/lib/product-details';
import { STORE_LIST } from '@/config/stores';

void test('all navigable categories have unique canonical metadata', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const category of catalogCategories) {
    const id = category.href.split('/').at(-1)!;
    assert.ok(seoCategories[id], category.href);
    const metadata = categoryMetadata(id);
    const canonical = metadata.alternates?.canonical;
    assert.ok(typeof canonical === 'string');
    assert.equal(new URL(canonical).pathname, category.href);
    assert.ok(metadata.description && metadata.description.length >= 80);
    titles.add(metadata.title);
    descriptions.add(metadata.description);
  }
  assert.equal(titles.size, catalogCategories.length);
  assert.equal(descriptions.size, catalogCategories.length);
});
void test('variant selectors consolidate on model canonical while product data identifies the exact article', () => {
  const variants = catalogItems.filter(item => item.modelSlug === 'iphone-17');
  assert.ok(variants.length > 1);
  const canonicalUrls = new Set<string>();
  const origin = 'https://аппгрейд.рф';
  for (const item of variants.slice(0, 4)) {
    const details = getProductDetails(item);
    const metadata = productMetadata(item, details);
    const href = metadata.alternates?.canonical;
    assert.ok(typeof href === 'string');
    const canonical = new URL(href);
    assert.equal(canonical.search, '');
    assert.equal(canonical.pathname, `/catalog/${item.modelSlug}`);
    canonicalUrls.add(canonical.href);
    const [data] = productStructuredData(item, details, origin);
    assert.equal(data['@type'], 'Product');
    assert.equal('sku' in data && data.sku, item.article ?? item.id);
    assert.equal(new URL('url' in data ? data.url : '').searchParams.get('sku'), item.id);
    // An old workbook price must not be advertised as a current live offer.
    assert.equal('offers' in data, false);
  }
  assert.equal(canonicalUrls.size, 1);
});
void test('IDN URLs are absolute and structured data cannot escape its script element', () => {
  const href = absoluteUrl('/catalog/iphones', 'https://аппгрейд.рф');
  assert.equal(new URL(href).hostname, new URL('https://аппгрейд.рф').hostname);
  const malicious = { name: '</script><script>alert(1)</script>' };
  const encoded = serializeJsonLd(malicious);
  assert.ok(!encoded.includes('<'));
  assert.deepEqual(JSON.parse(encoded), malicious);
});
void test('store schema uses actual contacts and omits incomplete store details', () => {
  for (const store of STORE_LIST) {
    const data = storeStructuredData(store, 'https://аппгрейд.рф');
    if (!store.address || !store.phone) assert.equal(data, null);
    else {
      assert.equal(data?.address.streetAddress, store.address);
      assert.equal(data?.telephone, store.phone);
      assert.ok(data?.url.endsWith(`/stores/${store.id}`));
      assert.equal('aggregateRating' in data!, false);
    }
  }
});
void test('unidentified supplier model stays out of search until its specifications are corrected', () => {
  const item = catalogItems.find(product => product.article === 'P-34586308')!;
  const details = getProductDetails(item);
  assert.equal(details.limitedSpecs, true);
  assert.deepEqual(productMetadata(item, details).robots, { index: false, follow: true });
});
