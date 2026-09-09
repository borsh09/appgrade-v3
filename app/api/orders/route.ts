import { createHash, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { database, transaction } from '@/lib/server/db';
import { basePrices } from '@/lib/catalog-registry';
import { OrderError, orderMessages, validateOrder } from '@/lib/server/orders';

export const runtime = 'nodejs';
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(request: NextRequest) {
  try {
    const chat = process.env.TELEGRAM_ORDERS_CHAT_ID;
    if (
      !process.env.DATABASE_URL ||
      !process.env.TELEGRAM_ORDERS_BOT_TOKEN ||
      !chat
    )
      return NextResponse.json(
        { error: 'Приём заказов пока не настроен.' },
        { status: 503 },
      );
    const origin = request.headers.get('origin');
    if (origin && origin !== (process.env.APP_ORIGIN || request.nextUrl.origin))
      throw new OrderError('Недопустимый источник запроса.', 403);
    const reader = request.body?.getReader();
    if (!reader) throw new OrderError('Пустой заказ.');
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 32_768) {
        await reader.cancel();
        throw new OrderError('Слишком большой заказ.', 413);
      }
      chunks.push(value);
    }
    let payload;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      throw new OrderError('Некорректный заказ.');
    }
    if (
      !payload ||
      typeof payload.requestKey !== 'string' ||
      !uuid.test(payload.requestKey)
    )
      throw new OrderError('Обновите страницу оформления заказа.');
    const hash = createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
    const existing = await database().query(
      'SELECT id, request_hash FROM appgrade_orders WHERE request_key = $1',
      [payload.requestKey],
    );
    if (existing.rows[0]) {
      if (existing.rows[0].request_hash !== hash)
        throw new OrderError(
          'Данные заказа изменились. Повторите отправку.',
          409,
        );
      return NextResponse.json({ success: true, orderId: existing.rows[0].id });
    }
    const id = await transaction(async (client) => {
      const state = await client.query(
        'SELECT prices FROM appgrade_prices WHERE singleton=true FOR SHARE',
      );
      if (!state.rows[0]) throw new Error('Database migration is required');
      const order = validateOrder(payload, {
        ...basePrices,
        ...state.rows[0].prices,
      });
      const key = createHash('sha256')
        .update(order.customer.phone.replace(/\D/g, ''))
        .digest('hex');
      const { rows: limits } = await client.query(
        `INSERT INTO appgrade_rate_limits(key,count,expires_at) VALUES($1,1,now()+interval '10 minutes')
        ON CONFLICT(key) DO UPDATE SET count = CASE WHEN appgrade_rate_limits.expires_at < now() THEN 1 ELSE appgrade_rate_limits.count+1 END,
        expires_at = CASE WHEN appgrade_rate_limits.expires_at < now() THEN now()+interval '10 minutes' ELSE appgrade_rate_limits.expires_at END RETURNING count`,
        [key],
      );
      if (limits[0].count > 5)
        throw new OrderError(
          'Слишком много заявок. Попробуйте через 10 минут.',
          429,
        );
      const orderId = randomUUID();
      const { rows } = await client.query(
        `INSERT INTO appgrade_orders(id,request_key,request_hash,payload,notification_chat,messages)
        VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(request_key) DO NOTHING RETURNING id`,
        [
          orderId,
          payload.requestKey,
          hash,
          JSON.stringify(order),
          chat,
          JSON.stringify(orderMessages(orderId, order)),
        ],
      );
      if (rows[0]) return rows[0].id;
      const duplicate = await client.query(
        'SELECT id,request_hash FROM appgrade_orders WHERE request_key=$1',
        [payload.requestKey],
      );
      if (duplicate.rows[0].request_hash !== hash)
        throw new OrderError('Данные заказа изменились.', 409);
      return duplicate.rows[0].id;
    });
    return NextResponse.json({ success: true, orderId: id });
  } catch (error) {
    if (error instanceof OrderError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error('Order could not be saved');
    return NextResponse.json(
      { error: 'Не удалось сохранить заказ. Попробуйте ещё раз.' },
      { status: 503 },
    );
  }
}
