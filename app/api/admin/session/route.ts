import { ADMIN_COOKIE, createAdminSession, validAdminSession, verifyCredentials } from '@/lib/server/admin';
import { rateLimit, readJson, assertOrigin } from '@/lib/server/request-guard';
import { OrderError } from '@/lib/server/orders';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const response = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
function sessionFrom(request: Request) {
  const match = request.headers.get('cookie')?.match(/(?:^|;\s*)appgrade_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}
export async function GET(request: Request) {
  try { return response({ authenticated: validAdminSession(sessionFrom(request)) }); }
  catch { return response({ authenticated: false }); }
}
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    await rateLimit('admin-login', request.headers.get('x-real-ip') || 'local', 10, 15);
    const body = await readJson(request, 4096) as { user?: unknown; password?: unknown };
    if (!verifyCredentials(body.user, body.password)) throw new OrderError('Неверный логин или пароль.', 401);
    const session = createAdminSession();
    const headers = new Headers({ 'Cache-Control': 'no-store', 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', `${ADMIN_COOKIE}=${encodeURIComponent(session.value)}; Path=/; Max-Age=${session.maxAge}; HttpOnly; SameSite=Strict${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`);
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error) {
    return response({ error: error instanceof OrderError ? error.message : 'Не удалось выполнить вход.' }, error instanceof OrderError ? error.status : 503);
  }
}
export async function DELETE(request: Request) {
  try { assertOrigin(request); } catch { return response({ error: 'Недопустимый запрос.' }, 403); }
  const headers = new Headers({ 'Cache-Control': 'no-store', 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`);
  return new Response(JSON.stringify({ success: true }), { headers });
}
