import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { searchIndex } from '@/data/search-index';
import { featuredProducts } from '@/data/catalog';
import { catalogById } from '@/lib/catalog-registry';
import { catalogCategories } from '@/data/catalog-navigation';

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
  for (const item of searchIndex) {
    assert.ok(existsSync(`public${item.image}`), item.image);
    const sku = catalogById.get(item.id);
    assert.ok(sku, item.id);
    const url = new URL(item.href, 'http://localhost');
    assert.equal(url.pathname, `/catalog/${sku.modelSlug}`);
    for (const [key, value] of url.searchParams) {
      assert.equal(sku[key as keyof typeof sku], value, `${item.id}: ${key}`);
    }
  }
});

void test('category links point to implemented routes or store contacts', () => {
  for (const category of catalogCategories) {
    assert.ok(category.href === '/#контакты' || existsSync(`app${category.href}/page.tsx`), category.href);
  }
});
