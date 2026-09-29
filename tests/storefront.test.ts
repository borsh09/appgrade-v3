import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { searchIndex } from '@/data/search-index';
import clientBasePrices from '@/data/client-base-prices.json';
import { featuredProducts } from '@/data/catalog';
import { catalogById, catalogItems } from '@/lib/catalog-registry';
import { catalogCategories } from '@/data/catalog-navigation';
import { additionalCatalog } from '@/data/additional-catalog';
import parserReport from '@/data/parser-import-report.json';
import { getProductDetails } from '@/lib/product-details';

void test('every active catalog card has a real local product image', () => {
  for (const item of catalogItems) {
    assert.ok(!item.image.includes('product-photo-pending'), `Missing photo: ${item.id}`);
    for (const image of [item.image, ...(item.gallery ?? [])]) {
      assert.ok(existsSync(`public${image}`), `${item.id}: ${image}`);
    }
  }
});

void test('catalog IDs are unique so filtering cannot retain unrelated cards', () => {
  const ids = new Set<string>();
  for (const item of catalogItems) {
    assert.ok(!ids.has(item.id), `Duplicate SKU: ${item.id}`);
    ids.add(item.id);
  }
});

void test('featured cards match the real SKU model and SIM configuration', () => {
  for (const { model, sku } of featuredProducts) {
    const actual = catalogById.get(sku.id);
    assert.ok(actual, sku.id);
    assert.equal(model.name, actual.model);
    assert.equal(model.slug, actual.modelSlug);
    if (sku.sim) assert.equal(sku.sim, actual.sim);
  }
});

void test('every search result has an existing image and resolves to its exact SKU', () => {
  assert.equal(searchIndex.length, catalogItems.length);
  assert.equal(Object.keys(clientBasePrices).length, catalogItems.length);
  for (const item of searchIndex) {
    assert.ok(existsSync(`public${item.image}`), item.image);
    const sku = catalogById.get(item.id);
    assert.ok(sku, item.id);
    assert.equal(item.price, sku.price, `Stale browser price for ${item.id}`);
    assert.equal((clientBasePrices as Record<string, number | null>)[item.id], sku.price, `Stale initial price for ${item.id}`);
    assert.equal(item.model, sku.model, `Stale browser model for ${item.id}`);
    const url = new URL(item.href, 'http://localhost');
    assert.equal(url.pathname, `/catalog/${sku.modelSlug}`);
    for (const [key, value] of url.searchParams) {
      assert.equal(key === 'sku' ? sku.id : sku[key as keyof typeof sku], value, `${item.id}: ${key}`);
    }
  }
});

void test('category links point to implemented routes or store contacts', () => {
  for (const category of catalogCategories) {
    assert.ok(category.href === '/#контакты' || existsSync(`app${category.href}/page.tsx`), category.href);
  }
});

void test('new configurations are searchable, linked to categories and preserve missing prices', () => {
  const original = additionalCatalog.filter(item => !item.source.startsWith('Парсер.xlsx!'));
  assert.equal(original.length, 60);
  assert.equal(original.filter(item => item.price === null).length, 4);
  for (const item of additionalCatalog.filter((entry) => catalogById.has(entry.id))) {
    assert.ok(searchIndex.some(result => result.id === item.id));
    assert.ok(existsSync(`app/catalog/${item.category}/page.tsx`));
    assert.ok(item.price === null || item.price > 0);
  }
});

void test('every product row from parser Sheet1 resolves to a unique catalog SKU', () => {
  assert.equal(parserReport.products, 1424);
  assert.equal(parserReport.rows.length, parserReport.products);
  assert.equal(parserReport.imported + parserReport.matchedExisting + parserReport.duplicateRows, parserReport.products);
  assert.equal(catalogById.size, parserReport.products - parserReport.duplicateRows);
  for (const row of parserReport.rows) {
    assert.ok(catalogById.has(row.sku), `Missing Sheet1 row ${row.row}: ${row.title}`);
    if (row.result !== 'duplicate-sheet-row')
      assert.equal(catalogById.get(row.sku)?.price, row.price, `Wrong Sheet1 price in row ${row.row}`);
  }
  assert.deepEqual(
    [...catalogById.keys()].sort(),
    [...new Set(parserReport.rows.map((row) => row.sku))].sort(),
    'Only Sheet1 products may appear in the storefront catalog',
  );
  for (const id of ['iphone-18-pro-max-2tb-esim-burgundy', 'jbl-charge-6-black']) {
    assert.equal(catalogById.get(id)?.price, null, `${id} has price 1 in Sheet1`);
  }
});

void test('every imported card has a description and specifications for its selected variant', () => {
  const imported = catalogItems.filter(item => item.id.startsWith('parser-sheet1-'));
  assert.equal(imported.length, parserReport.imported);
  for (const item of imported) {
    const details = getProductDetails(item);
    assert.ok(details.description.length > 50, item.id);
    assert.ok(details.groups.some(group => group.rows.length), item.id);
    assert.ok(!/undefined|мм мм/.test(JSON.stringify(details)), item.id);
    const selected = details.groups.find(group => group.title === 'Выбранная комплектация');
    assert.ok(selected?.rows.some(([label, value]) => label === 'Модель' && value === item.model), item.id);
  }
  const iphone = getProductDetails(catalogById.get('parser-sheet1-48')!);
  assert.ok(iphone.groups.some(group => group.rows.some(([label, value]) => label === 'Встроенная память' && value === '256 ГБ')));
  const watch = getProductDetails(catalogById.get('parser-sheet1-1103')!);
  assert.ok(watch.groups.some(group => group.rows.some(([label, value]) => label === 'Размер корпуса' && value === '42 мм')));
});
