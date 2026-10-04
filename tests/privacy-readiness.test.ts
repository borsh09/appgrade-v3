import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { seller, isSellerConfigured } from '@/config/seller';
import { POST as order } from '@/app/api/orders/route';
import { POST as tradeIn } from '@/app/api/trade-in/route';

void test('both application APIs reject an incomplete operator before reading personal data or querying the database', async () => {
  const previousSeller = { ...seller };
  const state = globalThis as unknown as { appgradePool?: unknown };
  const previousPool = state.appgradePool;
  let queries = 0;
  try {
    Object.assign(seller, { name: 'Test operator', inn: '744602863119', address: '', privacyEmail: 'privacy@example.test' });
    state.appgradePool = { query: async () => { queries++; throw new Error('Database must not be used'); } };
    for (const handler of [order, tradeIn]) {
      const request = new NextRequest('http://localhost:3000/api/orders', { method: 'POST' });
      Object.defineProperty(request, 'body', { get() { throw new Error('Personal data must not be read'); } });
      const response = await handler(request);
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /Приём заявок пока недоступен/);
    }
    assert.equal(queries, 0);
    seller.address = 'Test address';
    assert.equal(isSellerConfigured(), true);
    seller.privacyEmail = 'not-an-email';
    assert.equal(isSellerConfigured(), false);
  } finally {
    Object.assign(seller, previousSeller);
    state.appgradePool = previousPool;
  }
});
