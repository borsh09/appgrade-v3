import assert from 'node:assert/strict';
import { test } from 'node:test';
import { discountPrice } from '@/lib/discount-price';
void test('discount preserves the current regular price and stops when a new price is lower', () => {
  assert.deepEqual(discountPrice(2000, 1500), {price:1500, oldPrice:2000});
  assert.deepEqual(discountPrice(2500, 1500), {price:1500, oldPrice:2500});
  assert.deepEqual(discountPrice(1000, 1500), {price:1000, oldPrice:undefined});
  assert.deepEqual(discountPrice(null, 1500), {price:null, oldPrice:undefined});
  assert.deepEqual(discountPrice(2000, undefined), {price:2000, oldPrice:undefined});
});
