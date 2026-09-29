import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminSession, validAdminSession, verifyCredentials, assertAdmin, ADMIN_COOKIE } from '../lib/server/admin';
import { PGlite } from '@electric-sql/pglite';
import { migrate } from '../lib/server/db';
import { protectAdminLogin } from '../lib/server/request-guard';

void test('admin session is signed, expires and authenticates API requests', () => {
  const previousUser = process.env.ADMIN_USER;
  const previousPassword = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_USER = 'owner';
  process.env.ADMIN_PASSWORD = 'a-secure-password-for-tests';
  try {
    assert.equal(verifyCredentials('owner', 'a-secure-password-for-tests'), true);
    assert.equal(verifyCredentials('owner', 'wrong-password'), false);
    const session = createAdminSession();
    assert.equal(validAdminSession(session.value), true);
    assert.equal(validAdminSession(`${session.value}changed`), false);
    assert.doesNotThrow(() => assertAdmin(new Request('http://localhost/api/admin', { headers: { cookie: `${ADMIN_COOKIE}=${encodeURIComponent(session.value)}` } })));
    assert.throws(() => assertAdmin(new Request('http://localhost/api/admin', { headers: { cookie: `${ADMIN_COOKIE}=%invalid` } })), { status: 401 });
  } finally {
    if (previousUser === undefined) delete process.env.ADMIN_USER; else process.env.ADMIN_USER = previousUser;
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = previousPassword;
  }
});

void test('spoofed client IP cannot bypass the admin login limit', async () => {
  const db = new PGlite();
  const query = (sql: string, values?: unknown[]) => values
    ? db.query(sql, values)
    : db.exec(sql).then((results) => results.at(-1));
  const previousPool = (globalThis as unknown as { appgradePool?: unknown }).appgradePool;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousTrustProxy = process.env.TRUST_PROXY;
  (globalThis as unknown as { appgradePool?: unknown }).appgradePool = { query };
  process.env.DATABASE_URL = 'postgresql://test-only';
  delete process.env.TRUST_PROXY;
  try {
    await migrate();
    for (let attempt = 0; attempt < 60; attempt++) {
      await protectAdminLogin(new Request('http://localhost/api/admin/session', {
        headers: { 'x-real-ip': `192.0.2.${attempt + 1}` },
      }));
    }
    await assert.rejects(
      protectAdminLogin(new Request('http://localhost/api/admin/session', {
        headers: { 'x-real-ip': '198.51.100.1' },
      })),
      { status: 429 },
    );
  } finally {
    if (previousPool === undefined) delete (globalThis as unknown as { appgradePool?: unknown }).appgradePool;
    else (globalThis as unknown as { appgradePool?: unknown }).appgradePool = previousPool;
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
    if (previousTrustProxy === undefined) delete process.env.TRUST_PROXY;
    else process.env.TRUST_PROXY = previousTrustProxy;
    await db.close();
  }
});
