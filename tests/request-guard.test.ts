import test from 'node:test';
import assert from 'node:assert/strict';
import { assertOrigin } from '../lib/server/request-guard';

void test('origin guard accepts equivalent local hosts but rejects external origins', () => {
  const previous = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = 'http://localhost:3000';
  try {
    assert.doesNotThrow(() => assertOrigin(new Request('http://127.0.0.1:3000/api/admin', { headers: { origin: 'http://127.0.0.1:3000', 'sec-fetch-site': 'same-origin' } })));
    assert.throws(() => assertOrigin(new Request('http://localhost:3000/api/admin', { headers: { origin: 'https://example.com', 'sec-fetch-site': 'cross-site' } })));
    assert.throws(() => assertOrigin(new Request('http://localhost:3000/api/admin', { headers: { origin: 'http://127.0.0.1:3001' } })));
  } finally {
    if (previous === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = previous;
  }
});
