import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogItems, type CatalogItem } from '@/lib/catalog-registry';
import { getProductDetails } from '@/lib/product-details';

const rows = (item: CatalogItem) => getProductDetails(item).groups.flatMap(group => group.rows);
void test('verified catalog coverage excludes only the supplier model awaiting identification', () => {
  const pending = catalogItems.filter(item => getProductDetails(item).limitedSpecs);
  assert.deepEqual(pending.map(item => item.id), ['P-34586308']);
  for (const item of catalogItems.filter(item => item.id !== 'P-34586308')) {
    assert.ok(getProductDetails(item).groups.some(group => group.title !== 'Выбранная комплектация' && group.rows.length), item.id);
  }
});
void test('manual manufacturer profiles override conflicting extracted values', () => {
  const sony = catalogItems.find(item => item.model === 'Sony WH-1000XM5')!;
  assert.ok(sony);
  assert.ok(rows(sony).some(([label, value]) => label === 'Вес' && value === 'Около 250 г'));
  assert.ok(!rows(sony).some(([, value]) => value.includes('11.82')));
  const mac = catalogItems.find(item => item.model === 'MacBook Pro 16 M5 Pro')!;
  assert.ok(mac);
  const variant = { ...mac, chip: 'Apple M5 Max' };
  assert.deepEqual(rows(variant).filter(([label]) => label === 'Процессор'), [['Процессор', 'Apple M5 Max']]);
});
void test('each current article has its own model and configuration in specifications', () => {
  for (const item of catalogItems) {
    const details = getProductDetails(item);
    const configuration = new Map(details.groups.find(group => group.title === 'Выбранная комплектация')!.rows);
    assert.equal(configuration.get('Модель'), item.model, item.id);
    assert.equal(configuration.get('Артикул'), item.article ?? item.id);
    if (item.color && item.color !== '—') assert.equal(configuration.get('Цвет'), item.color, item.id);
    for (const group of details.groups) for (const [label, value] of group.rows) {
      assert.ok(label.trim() && value.trim(), item.id);
      assert.ok(!/<\/?(?:script|div|span)\b/i.test(value), item.id);
    }
  }
});
void test('shared supplier data never changes selected memory, color or SIM', () => {
  const original = catalogItems.find(item => item.model === 'iPhone 14')!;
  const item = { ...original, id: 'spec-test', article: 'spec-test', storage: '512 ГБ', color: 'TEST COLOR', sim: 'TEST SIM' };
  const values = rows(item);
  assert.equal(values.find(([label]) => label === 'Встроенная память')?.[1], '512 ГБ');
  assert.equal(values.find(([label]) => label === 'Цвет')?.[1], 'TEST COLOR');
  assert.equal(values.find(([label]) => label === 'SIM')?.[1], 'TEST SIM');
  assert.ok(!values.some(([label, value]) => /цвет|sim|встроенная память/i.test(label) && !['TEST COLOR', 'TEST SIM', '512 ГБ'].includes(value)));
});
void test('a shared brand and generation cannot match another product family', () => {
  const item: CatalogItem = { id: 'unmatched-spec-test', model: 'JBL Invented 5', modelSlug: 'invented', color: '', price: null, image: '', category: 'audio' };
  assert.equal(getProductDetails(item).limitedSpecs, true);
  assert.equal(getProductDetails(item).groups.length, 1);
});
void test('iPhone Plus and Pro models use their exact manufacturer specifications', () => {
  for (const [model, chip, diagonal] of [['iPhone 14 Plus', 'Apple A15 Bionic', '6,7″'], ['iPhone 15 Plus', 'Apple A16 Bionic', '6,7″'], ['iPhone 15 Pro', 'Apple A17 Pro', '6,1″'], ['iPhone 15 Pro Max', 'Apple A17 Pro', '6,7″']]) {
    const item = catalogItems.find(item => item.model === model)!;
    assert.ok(item, model);
    const values = rows(item);
    assert.ok(values.some(([label, value]) => label === 'Процессор' && value === chip), model);
    assert.ok(values.some(([label, value]) => label === 'Диагональ экрана' && value === diagonal), model);
    assert.equal(getProductDetails(item).limitedSpecs, false);
  }
});
