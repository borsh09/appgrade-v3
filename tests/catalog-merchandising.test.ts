import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogItems, type CatalogItem } from '@/lib/catalog-registry';
import { merchandiseCatalog, preorderModels, promotedModels } from '@/lib/catalog-order';
import { popularProducts } from '@/data/popular-products';
import { catalogCategories, catalogCategoryGroups } from '@/data/catalog-navigation';

void test('launch ordering retains every article and puts missing photos after photographed items', () => {
  for (const category of new Set(catalogItems.map(item => item.category))) {
    const input = catalogItems.filter(item => item.category === category);
    const snapshot = input.slice();
    const result = merchandiseCatalog(input);
    assert.deepEqual(input, snapshot);
    assert.deepEqual(result.map(item => item.id).sort(), input.map(item => item.id).sort());
    const firstMissing = result.findIndex(item => item.photoMissing);
    if (firstMissing >= 0) assert.ok(result.slice(firstMissing).every(item => item.photoMissing));
  }
});

void test('launch ordering introduces model choice before repeating configurations and demotes preorder and unpriced products', () => {
  const item = (id: string, model: string, price: number | null, photoMissing = false): CatalogItem => ({
    id, model, modelSlug: model, category: 'iphones', price, photoMissing, image: '/test.png', color: 'Black',
  });
  const result = merchandiseCatalog([
    item('unpriced', 'iPhone 17', null), item('large', 'iPhone 17', 100),
    item('preorder', 'iPhone 18 Pro', 50), item('pro', 'iPhone 17 Pro', 120),
    item('entry', 'iPhone 17', 80), item('missing', 'iPhone 17', 60, true),
  ]);
  assert.deepEqual(result.map(item => item.id), ['preorder', 'entry', 'pro', 'large', 'unpriced', 'missing']);
});

void test('homepage selection has distinct photographed priced models and navigation exposes every category once', () => {
  assert.equal(popularProducts.length, 16);
  assert.equal(new Set(popularProducts.map(product => `${product.model.name}:${product.sku.color}`)).size, 16);
  for (const product of popularProducts) {
    const item = catalogItems.find(item => item.id === product.sku.id)!;
    assert.ok(item.price !== null && item.price > 0 && !item.photoMissing);
    assert.ok(!preorderModels.has(item.model) || promotedModels.has(item.model));
  }
  assert.ok(popularProducts.slice(0, 2).every(product => product.model.category === 'smartphones' && product.model.brand === 'Apple'));
  assert.deepEqual(popularProducts.slice(0, 2).map(product => product.model.name), ['iPhone 18 Pro Max', 'iPhone 18 Pro']);
  assert.deepEqual(popularProducts.slice(0, 4).map(product => product.sku.color), ['Burgundy', 'Burgundy', 'Black', 'Black']);
  assert.deepEqual(popularProducts.slice(0, 8).map(product => product.sku.color), ['Burgundy', 'Burgundy', 'Black', 'Black', 'Silver', 'Silver', 'Glacier', 'Glacier']);
  assert.deepEqual(merchandiseCatalog(catalogItems.filter(item => item.category === 'iphones')).slice(0, 2).map(item => item.model), ['iPhone 18 Pro Max', 'iPhone 18 Pro']);
  assert.deepEqual(merchandiseCatalog(catalogItems.filter(item => item.category === 'iphones')).slice(0, 4).map(item => item.color), ['Burgundy', 'Burgundy', 'Black', 'Black']);
  const ids = catalogCategoryGroups.flatMap(group => group.categories.map(category => category.id));
  assert.equal(new Set(ids).size, catalogCategories.length);
  assert.deepEqual(ids.slice(0, 5), ['iphone', 'samsung', 'xiaomi', 'google', 'smartphones']);
});
