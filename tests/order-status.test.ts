import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextEntryStatuses } from '@/lib/order-status';

void test('pickup and delivery have separate completion paths', () => {
  assert.deepEqual(nextEntryStatuses('order', 'assembled', 'pickup'), ['ready_for_pickup', 'cancelled']);
  assert.deepEqual(nextEntryStatuses('order', 'assembled', 'delivery'), ['out_for_delivery', 'cancelled']);
  assert.deepEqual(nextEntryStatuses('order', 'ready_for_pickup', 'delivery'), []);
  assert.deepEqual(nextEntryStatuses('order', 'out_for_delivery', 'pickup'), []);
  for (const status of ['issued', 'delivered', 'completed', 'cancelled']) {
    assert.deepEqual(nextEntryStatuses('order', status, 'pickup'), []);
    assert.deepEqual(nextEntryStatuses('order', status, 'delivery'), []);
  }
});

void test('old in-progress orders can continue through assembly; trade-in keeps its workflow', () => {
  for (const status of ['contacted', 'awaiting_payment']) {
    assert.deepEqual(nextEntryStatuses('order', status, 'pickup'), ['assembled', 'cancelled']);
  }
  assert.deepEqual(nextEntryStatuses('trade-in', 'confirmed'), ['contacted', 'completed', 'cancelled']);
});
