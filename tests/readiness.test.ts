import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ordersAvailable } from '@/lib/server/readiness';

void test('order readiness fails closed without configuration, migration or a working database', async () => {
  const names = ['DATABASE_URL', 'TELEGRAM_ORDERS_BOT_TOKEN', 'TELEGRAM_ORDERS_CHAT_ID'] as const;
  const previous = names.map(name => process.env[name]);
  const state = globalThis as unknown as { appgradePool?: unknown };
  const previousPool = state.appgradePool;
  try {
    for (const name of names) delete process.env[name];
    assert.equal(await ordersAvailable(), false);
    for (const name of names) process.env[name] = 'test-only';
    state.appgradePool = { query: async () => ({ rows: [] }) };
    assert.equal(await ordersAvailable(), false);
    state.appgradePool = { query: async () => { throw new Error('private connection details'); } };
    assert.equal(await ordersAvailable(), false);
    state.appgradePool = { query: async () => ({ rows: [{ singleton: true }] }) };
    assert.equal(await ordersAvailable(), true);
  } finally {
    names.forEach((name, index) => { if (previous[index] === undefined) delete process.env[name]; else process.env[name] = previous[index]; });
    state.appgradePool = previousPool;
  }
});
