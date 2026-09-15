import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { database } from './db';
import { OrderError } from './orders';

export function assertOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin;
  let allowed = !origin || origin === expected;
  if (origin && !allowed) {
    try {
      const actual = new URL(origin), configured = new URL(expected);
      const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
      allowed = loopback.has(actual.hostname) && loopback.has(configured.hostname) && actual.protocol === configured.protocol && actual.port === configured.port;
    } catch { allowed = false; }
  }
  if (!allowed || request.headers.get('sec-fetch-site') === 'cross-site') throw new OrderError('Недопустимый источник запроса.', 403);
}
export async function readJson(request: Request, maximum = 32768): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new OrderError('Пустой запрос.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maximum) { await reader.cancel(); throw new OrderError('Слишком большой запрос.', 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new OrderError('Некорректный запрос.'); }
}
export async function rateLimit(scope: string, key: string, limit: number, minutes = 10) {
  const hash = createHash('sha256').update(`${scope}:${key}`).digest('hex');
  const { rows } = await database().query(`INSERT INTO appgrade_rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 minute')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN appgrade_rate_limits.expires_at<now() THEN 1 ELSE appgrade_rate_limits.count+1 END,
    expires_at=CASE WHEN appgrade_rate_limits.expires_at<now() THEN now()+$2*interval '1 minute' ELSE appgrade_rate_limits.expires_at END RETURNING count`, [hash, minutes]);
  if (rows[0].count > limit) throw new OrderError('Слишком много запросов. Попробуйте позже.', 429);
}
export async function protectSubmission(request: Request, scope: string) {
  assertOrigin(request);
  const ip = process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') : null;
  if (ip && isIP(ip)) await rateLimit(`${scope}:ip`, ip, 20);
  await rateLimit(`${scope}:global`, 'all', 120);
}
