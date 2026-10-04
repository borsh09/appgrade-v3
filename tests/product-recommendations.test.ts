import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogItems } from '@/lib/catalog-registry';
import { productRecommendations } from '@/lib/product-recommendations';

void test('recommendations exclude the current model and show distinct priced photographed products', () => {
  for (const category of new Set(catalogItems.map(item => item.category))) {
    const selected = catalogItems.find(item => item.category === category)!;
    const related = productRecommendations(selected);
    assert.equal(related.length, 8);
    assert.equal(new Set(related.map(item => item.model)).size, related.length);
    assert.ok(related.every(item => item.model !== selected.model && !item.photoMissing && item.price !== null && item.price > 0));
  }
});

void test('phone recommendations include alternatives and complementary audio and watches', () => {
  const selected = catalogItems.find(item => item.model === 'iPhone 18 Pro Max')!;
  const related = productRecommendations(selected);
  assert.equal(related[0].model, 'iPhone 18 Pro');
  assert.ok(related.slice(0, 4).every(item => item.category === 'iphones'));
  assert.ok(related.some(item => item.category === 'audio'));
  assert.ok(related.some(item => item.category === 'watches'));
});
