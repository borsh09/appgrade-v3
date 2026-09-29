import { assertAdmin } from '@/lib/server/admin';
import { database } from '@/lib/server/db';
import { OrderError } from '@/lib/server/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    assertAdmin(request);
    const params = new URL(request.url).searchParams;
    const type = params.get('type');
    const before = params.get('before');
    const beforeId = params.get('beforeId');
    if (type !== 'order' && type !== 'trade-in')
      throw new OrderError('Некорректный тип заявки.');
    if (!before || !Number.isFinite(Date.parse(before)) || !beforeId || !/^[0-9a-f-]{36}$/i.test(beforeId))
      throw new OrderError('Некорректная страница заявок.');
    const table = type === 'order' ? 'appgrade_orders' : 'appgrade_trade_ins';
    const { rows } = await database().query(
      `SELECT id,payload,status,created_at,notified_at,attempts FROM ${table}
       WHERE (created_at,id) < ($1::timestamptz,$2::uuid)
       ORDER BY created_at DESC,id DESC LIMIT 100`,
      [before, beforeId],
    );
    return Response.json({ entries: rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json(
      { error: error instanceof OrderError ? error.message : 'Не удалось загрузить заявки.' },
      { status: error instanceof OrderError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
