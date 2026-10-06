import assert from 'node:assert/strict';
import { test } from 'node:test';
import rawCatalog from '@/data/new-price-catalog.json';
import { catalogItems, hiddenCatalogArticles, normalizeProductName, type CatalogItem } from '@/lib/catalog-registry';
import { groupCatalogModels } from '@/lib/catalog-model-groups';
import { modelVariants, optionHref, productHref, selectProduct, variantFields } from '@/lib/product-selection';

void test('model grouping preserves every supplier article and all pricing identifiers', () => {
  const source = rawCatalog.filter(item => !hiddenCatalogArticles.has(item.article));
  assert.equal(catalogItems.length, source.length);
  const rawById = new Map(source.map(item => [item.id, item]));
  for (const item of catalogItems) {
    const raw = rawById.get(item.id)!;
    for (const field of ['id', 'article', 'price', 'priceAlias', 'sourceTitle', 'sourceCategory'] as const) {
      assert.equal(item[field], raw[field], `${item.id}: ${field}`);
    }
    const variants = modelVariants(catalogItems, item.modelSlug).variants;
    assert.equal(selectProduct(variants, { sku: item.id })?.article, item.article);
    const old = modelVariants(catalogItems, raw.modelSlug);
    assert.ok(old.variants.some(variant => variant.id === item.id), raw.modelSlug);
    if (/^p-\d+$/i.test(raw.modelSlug) && raw.modelSlug !== item.modelSlug) assert.equal(old.legacy?.id, item.id);
  }
});

void test('every configuration of a displayed model shares one route and options select real SKUs', () => {
  const models = new Map<string, string>();
  for (const item of catalogItems) {
    if (item.sourceCategory !== 'Macbook') {
      const key = `${item.category}:${item.model.toLowerCase().replace(/ё/g, 'е')}`;
      assert.equal(models.get(key) ?? item.modelSlug, item.modelSlug, item.model);
      models.set(key, item.modelSlug);
    }
    const variants = modelVariants(catalogItems, item.modelSlug).variants;
    for (const field of variantFields) {
      for (const value of new Set(variants.map(variant => variant[field]).filter((value): value is string => Boolean(value)))) {
        const url = new URL(optionHref(variants, item, field, value)!, 'http://localhost');
        assert.equal(url.pathname, `/catalog/${item.modelSlug}`);
        const selected = selectProduct(variants, { sku: url.searchParams.get('sku')! });
        assert.ok(selected);
        assert.equal(normalizeProductName(selected[field]!), normalizeProductName(value));
        assert.equal(productHref(selected), `${url.pathname}${url.search}`);
      }
    }
  }
});

void test('same-named products in different categories and distinct generations remain separate', () => {
  const item = (id: string, model: string, category: string): CatalogItem => ({ id, model, category, modelSlug: `p-${id}`, article: id, price: 100, color: 'Black', image: '' });
  const input = [item('1', 'Example 2', 'audio'), item('2', 'Example 2', 'audio'), item('3', 'Example 2 Pro', 'audio'), item('4', 'Example 2', 'gadgets')];
  const result = groupCatalogModels(input);
  assert.equal(result[0].modelSlug, result[1].modelSlug);
  assert.equal(new Set(result.map(item => item.modelSlug)).size, 3);
  assert.equal(input[0].modelSlug, 'p-1');
});
