import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { searchIndex } from '@/data/search-index';
import clientBasePrices from '@/data/client-base-prices.json';
import newPriceSource from '@/data/new-price-source.json';
import { catalogById, catalogItems } from '@/lib/catalog-registry';
import { getProductDetails } from '@/lib/product-details';

void test('catalog has exactly the articles and prices from Новый прайс', () => {
  assert.equal(newPriceSource.length, 1591);
  assert.equal(catalogItems.length, newPriceSource.length);
  const byArticle = new Map(catalogItems.map(item => [item.article, item]));
  assert.equal(byArticle.size, newPriceSource.length);
  for (const row of newPriceSource) {
    const item = byArticle.get(row.article);
    assert.ok(item, `Missing article ${row.article} in row ${row.row}`);
    assert.equal(item.price, row.cost <= 1 ? null : row.price, row.article);
  }
});

void test('all catalog IDs and article codes are unique', () => {
  assert.equal(new Set(catalogItems.map(item => item.id)).size, catalogItems.length);
  assert.equal(new Set(catalogItems.map(item => item.article)).size, catalogItems.length);
});

void test('supplier Active marking stays visible on every affected iPhone', () => {
  const activeRows = newPriceSource.filter(row => /\bActive\b/i.test(row.title));
  assert.equal(activeRows.length, 19);
  for (const row of activeRows) {
    const item = catalogItems.find(product => product.article === row.article);
    assert.ok(item && /\bActive\b/i.test(item.model), row.article);
  }
});

void test('every card has a local image, a route, and a browser price', () => {
  assert.equal(searchIndex.length, catalogItems.length);
  assert.equal(Object.keys(clientBasePrices).length, catalogItems.length);
  for (const item of searchIndex) {
    assert.ok(catalogById.has(item.id), item.id);
    assert.ok(existsSync(`public${item.image}`), `${item.id}: ${item.image}`);
    assert.equal((clientBasePrices as Record<string, number | null>)[item.id], item.price, item.id);
    const url = new URL(item.href, 'http://localhost');
    assert.equal(url.pathname, `/catalog/${item.modelSlug}`);
  }
});

void test('all price-list products have descriptions and specifications', () => {
  for (const item of catalogItems) {
    const details = getProductDetails(item);
    assert.ok(details.description.length > 20, item.id);
    assert.ok(details.groups.some(group => group.rows.length), item.id);
    assert.ok(!JSON.stringify(details).includes('undefined'), item.id);
  }
});
