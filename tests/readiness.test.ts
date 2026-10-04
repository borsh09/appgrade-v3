import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ordersAvailable } from '@/lib/server/readiness';
import { seller } from '@/config/seller';

void test('order readiness works without bots and fails closed without configuration, migration or a working database', async () => {
  const names = ['DATABASE_URL'] as const;
  const previous = names.map(name => process.env[name]);
  const state = globalThis as unknown as { appgradePool?: unknown };
  const previousPool = state.appgradePool;
  const previousSeller = { ...seller };
  try {
    Object.assign(seller, { name: 'Test operator', inn: '744602863119', address: 'Test address', privacyEmail: 'privacy@example.test' });
    for (const name of names) delete process.env[name];
    assert.equal(await ordersAvailable(), false);
    for (const name of names) process.env[name] = 'test-only';
    state.appgradePool = { query: async () => ({ rows: [] }) };
    assert.equal(await ordersAvailable(), false);
    state.appgradePool = { query: async () => { throw new Error('private connection details'); } };
    assert.equal(await ordersAvailable(), false);
    state.appgradePool = { query: async () => ({ rows: [{ singleton: true }] }) };
    assert.equal(await ordersAvailable(), true);
    seller.address = '';
    assert.equal(await ordersAvailable(), false);
  } finally {
    Object.assign(seller, previousSeller);
    names.forEach((name, index) => { if (previous[index] === undefined) delete process.env[name]; else process.env[name] = previous[index]; });
    state.appgradePool = previousPool;
  }
});
