import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { assertSafeWorkbookArchive } from '@/lib/server/xlsx-guard';
import { assertOrigin, readJson, readFormData } from '@/lib/server/request-guard';
import { ADMIN_COOKIE, createAdminSession } from '@/lib/server/admin';
import { GET as adminSnapshot, PATCH as adminMutation } from '@/app/api/admin/route';
import { GET as adminEntries } from '@/app/api/admin/entries/route';
import { GET as adminTemplate, POST as adminUpload, PATCH as adminPrices } from '@/app/api/admin/prices/route';

void test('forged ZIP sizes cannot bypass bounded decompression before Excel parsing', async () => {
  const zip = new JSZip();
  zip.file('xl/worksheets/sheet1.xml', 'A'.repeat(2 * 1024 * 1024), { createFolders: false });
  const bytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  assert.doesNotThrow(() => assertSafeWorkbookArchive(bytes));
  const central = bytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  assert.ok(central >= 0);
  // Both sizes are attacker-controlled; the actual deflate data still expands to 2 MB.
  bytes.writeUInt32LE(1, central + 24);
  bytes.writeUInt32LE(1, 22);
  assert.throws(() => assertSafeWorkbookArchive(bytes), /файл Excel/);
});

void test('mutations require a verified browser origin or same-origin Referer', () => {
  const saved = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = 'https://shop.example';
  try {
    const request = (headers: Record<string, string>) => new Request('https://shop.example/api/admin', { method: 'PATCH', headers });
    assert.throws(() => assertOrigin(request({})), { status: 403 });
    assert.throws(() => assertOrigin(request({ referer: 'https://attacker.example/form' })), { status: 403 });
    assert.throws(() => assertOrigin(request({ origin: 'null', referer: 'https://shop.example/admin' })), { status: 403 });
    assert.throws(() => assertOrigin(request({ origin: 'https://shop.example.attacker.example' })), { status: 403 });
    assert.doesNotThrow(() => assertOrigin(request({ referer: 'https://shop.example/admin' })));
    assert.doesNotThrow(() => assertOrigin(request({ origin: 'https://shop.example' })));
  } finally {
    if (saved === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = saved;
  }
});

void test('JSON APIs reject simple form content types before reading the body', async () => {
  await assert.rejects(readJson(new Request('http://localhost/api', {
    method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{"user":"admin"}',
  })), { status: 415 });
  assert.deepEqual(await readJson(new Request('http://localhost/api', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: '{"ok":true}',
  })), { ok: true });
});

void test('oversized multipart streams are cancelled as soon as the byte limit is reached', async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(2048)); },
    cancel() { cancelled = true; },
  });
  const request = new Request('http://localhost/api', {
    method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=test' },
    body, duplex: 'half',
  } as RequestInit);
  await assert.rejects(readFormData(request, 1024), { status: 413 });
  assert.equal(cancelled, true);
});

void test('a stalled request is cancelled after the body deadline', async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
  const request = new Request('http://localhost/api', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body, duplex: 'half',
  } as RequestInit);
  await assert.rejects(readJson(request, 1024, 20), { status: 408 });
  assert.equal(cancelled, true);
});

void test('private APIs reject forged sessions and CSRF before any database operation', async () => {
  const saved = { password: process.env.ADMIN_PASSWORD, origin: process.env.APP_ORIGIN, database: process.env.DATABASE_URL };
  process.env.ADMIN_PASSWORD = 'isolated-security-test-password';
  process.env.APP_ORIGIN = 'http://localhost:3000';
  delete process.env.DATABASE_URL;
  try {
    for (const [path, method, handler] of [
      ['/api/admin', 'GET', adminSnapshot], ['/api/admin', 'PATCH', adminMutation],
      ['/api/admin/entries', 'GET', adminEntries], ['/api/admin/prices', 'GET', adminTemplate],
      ['/api/admin/prices', 'POST', adminUpload], ['/api/admin/prices', 'PATCH', adminPrices],
    ] as const) {
      const result = await handler(new Request(`http://localhost:3000${path}`, {
        method, headers: { origin: 'http://localhost:3000', cookie: `${ADMIN_COOKIE}=forged` },
      }));
      assert.equal(result.status, 401, `${method} ${path}`);
      assert.ok(!JSON.stringify(await result.json()).includes('payload'));
    }
    const cookie = `${ADMIN_COOKIE}=${createAdminSession().value}`;
    const rejectedHeaders: Record<string, string>[] = [{ cookie }, { cookie, origin: 'https://attacker.example' }];
    for (const headers of rejectedHeaders) {
      assert.equal((await adminMutation(new Request('http://localhost:3000/api/admin', { method: 'PATCH', headers }))).status, 403);
      assert.equal((await adminUpload(new Request('http://localhost:3000/api/admin/prices', { method: 'POST', headers }))).status, 403);
    }
    assert.equal((await adminEntries(new Request('http://localhost:3000/api/admin/entries?type=order%3BDROP%20TABLE%20appgrade_orders', { headers: { cookie } }))).status, 400);
  } finally {
    for (const [key, value] of [['ADMIN_PASSWORD', saved.password], ['APP_ORIGIN', saved.origin], ['DATABASE_URL', saved.database]]) {
      if (value === undefined) delete process.env[key!]; else process.env[key!] = value;
    }
  }
});
