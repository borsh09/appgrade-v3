import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdminSession, validAdminSession, verifyCredentials, assertAdmin, ADMIN_COOKIE } from '../lib/server/admin';

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
  } finally {
    if (previousUser === undefined) delete process.env.ADMIN_USER; else process.env.ADMIN_USER = previousUser;
    if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = previousPassword;
  }
});
