import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { database } from './db';
import { OrderError } from './orders';

export function assertOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  const source = origin ?? request.headers.get('referer');
  let allowed = false;
  try {
    if (source) {
      const actual = new URL(source), configured = new URL(expected);
      const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
      allowed = actual.origin === configured.origin
        || (loopback.has(actual.hostname) && loopback.has(configured.hostname) && actual.protocol === configured.protocol && actual.port === configured.port);
    }
  } catch { allowed = false; }
  if (!allowed || request.headers.get('sec-fetch-site') === 'cross-site') throw new OrderError('Недопустимый источник запроса.', 403);
}
async function readBody(request: Request, maximum: number, timeoutMs: number): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) throw new OrderError('Пустой запрос.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new OrderError('Время отправки запроса истекло.', 408));
      void reader.cancel().catch(() => {});
    }, timeoutMs);
  });
  const read = async () => {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maximum) throw new OrderError('Слишком большой запрос.', 413);
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  };
  try {
    return await Promise.race([read(), deadline]);
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}
export async function readJson(request: Request, maximum = 32768, timeoutMs = 30_000): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')?.trim() ?? ''))
    throw new OrderError('Ожидается запрос в формате JSON.', 415);
  const bytes = await readBody(request, maximum, timeoutMs);
  try { return JSON.parse(bytes.toString('utf8')); }
  catch { throw new OrderError('Некорректный запрос.'); }
}
export async function readFormData(request: Request, maximum: number, timeoutMs = 30_000): Promise<FormData> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data;'))
    throw new OrderError('Ожидается форма с файлом.');
  const declaredLength = Number(request.headers.get('content-length'));
  if (declaredLength > maximum) {
    void request.body?.cancel().catch(() => {});
    throw new OrderError('Слишком большой файл.', 413);
  }
  const bytes = await readBody(request, maximum, timeoutMs);
  try {
    return await new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body: new Uint8Array(bytes),
    }).formData();
  } catch {
    throw new OrderError('Некорректная форма загрузки.');
  }
}
export async function rateLimit(scope: string, key: string, limit: number, minutes = 10) {
  const hash = createHash('sha256').update(`${scope}:${key}`).digest('hex');
  const { rows } = await database().query(`INSERT INTO appgrade_rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 minute')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN appgrade_rate_limits.expires_at<now() THEN 1 ELSE appgrade_rate_limits.count+1 END,
    expires_at=CASE WHEN appgrade_rate_limits.expires_at<now() THEN now()+$2*interval '1 minute' ELSE appgrade_rate_limits.expires_at END RETURNING count`, [hash, minutes]);
  if (rows[0].count > limit) throw new OrderError('Слишком много запросов. Попробуйте позже.', 429);
}
export async function protectAdminLogin(request: Request) {
  const ip = process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') : null;
  if (ip && isIP(ip)) await rateLimit('admin-login:ip', ip, 10, 15);
  await rateLimit('admin-login:global', 'all', 60, 15);
}
export async function protectSubmission(request: Request, scope: string) {
  assertOrigin(request);
  const ip = process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') : null;
  if (ip && isIP(ip)) await rateLimit(`${scope}:ip`, ip, 20);
  await rateLimit(`${scope}:global`, 'all', 120);
}
