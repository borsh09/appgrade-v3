import test from 'node:test';
import assert from 'node:assert/strict';
import { assertOrigin, readFormData } from '../lib/server/request-guard';

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

void test('multipart uploads are rejected before an oversized body is parsed', async () => {
  const form = new FormData();
  form.set('file', new File([new Uint8Array(4096)], 'prices.xlsx'));
  // Serialize FormData first: Node's synthetic multipart producer can enqueue
  // after cancellation; real HTTP request bodies are network streams.
  const multipart = new Request('http://localhost:3000/api/admin/prices', { method: 'POST', body: form });
  const request = new Request(multipart.url, { method: 'POST', headers: multipart.headers, body: await multipart.arrayBuffer() });
  await assert.rejects(() => readFormData(request, 1024), { status: 413 });

  const small = new FormData();
  small.set('file', new File(['test'], 'prices.xlsx'));
  const parsed = await readFormData(new Request('http://localhost:3000/api/admin/prices', { method: 'POST', body: small }), 1024);
  assert.equal((parsed.get('file') as File).name, 'prices.xlsx');
});
