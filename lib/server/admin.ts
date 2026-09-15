import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { OrderError } from './orders';

export const ADMIN_COOKIE = 'appgrade_admin';
const SESSION_SECONDS = 8 * 60 * 60;

function configured() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 20) throw new OrderError('Панель управления не настроена.', 503);
  return { user: process.env.ADMIN_USER || 'admin', password };
}
function equal(left: string, right: string) {
  const hash = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(left), hash(right));
}
function signature(payload: string, password: string) {
  return createHmac('sha256', password).update(`appgrade-admin:${payload}`).digest('base64url');
}
export function verifyCredentials(user: unknown, password: unknown) {
  const expected = configured();
  return typeof user === 'string' && typeof password === 'string' && equal(user, expected.user) && equal(password, expected.password);
}
export function createAdminSession() {
  const { user, password } = configured();
  const payload = Buffer.from(JSON.stringify({ user, expires: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url');
  return { value: `${payload}.${signature(payload, password)}`, maxAge: SESSION_SECONDS };
}
export function validAdminSession(value: string | undefined) {
  if (!value) return false;
  const { user, password } = configured();
  const [payload, supplied, extra] = value.split('.');
  if (!payload || !supplied || extra || !equal(supplied, signature(payload, password))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { user?: unknown; expires?: unknown };
    return decoded.user === user && typeof decoded.expires === 'number' && decoded.expires > Date.now();
  } catch { return false; }
}
function cookieValue(request: Request) {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === ADMIN_COOKIE) return decodeURIComponent(value.join('='));
  }
}
export function assertAdmin(request: Request) {
  configured();
  if (validAdminSession(cookieValue(request))) return;
  const provided = request.headers.get('authorization') || '';
  const expected = configured();
  const basic = `Basic ${Buffer.from(`${expected.user}:${expected.password}`).toString('base64')}`;
  if (!equal(provided, basic)) throw new OrderError('Требуется вход в панель управления.', 401);
}
