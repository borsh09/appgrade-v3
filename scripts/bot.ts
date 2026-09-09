import './env';
import { setTimeout as sleep } from 'node:timers/promises';
import { database } from '@/lib/server/db';
import { Telegram, type TelegramUpdate } from '@/lib/server/telegram';
import { handlePriceUpdate } from '@/bots/price-bot';
import { handleOrderUpdate, deliverOrders } from '@/bots/order-bot';

const role = process.argv[2];
if (role !== 'prices' && role !== 'orders')
  throw new Error('Use: bot.ts prices|orders');
const token =
  role === 'prices'
    ? process.env.TELEGRAM_PRICE_BOT_TOKEN
    : process.env.TELEGRAM_ORDERS_BOT_TOKEN;
if (!token || !process.env.DATABASE_URL)
  throw new Error('Configure bot token and DATABASE_URL in .env.local');
if (
  process.env.TELEGRAM_PRICE_BOT_TOKEN === process.env.TELEGRAM_ORDERS_BOT_TOKEN
)
  throw new Error('Use two different bot tokens');
if (role === 'prices' && !process.env.TELEGRAM_PRICE_ADMIN_IDS?.trim())
  console.log(
    'No price admins configured: uploads are disabled. /start can be used to learn your ID.',
  );
const bot = new Telegram(token);
const lock = await database().connect();
const lockId = role === 'prices' ? 731001 : 731002;
const acquired = await lock.query('SELECT pg_try_advisory_lock($1) AS locked', [
  lockId,
]);
if (!acquired.rows[0].locked) throw new Error('This bot is already running');
lock.on('error', () => {
  console.error('Bot database lock lost');
  process.exit(1);
});
const webhook = await bot.call<{ url: string }>('getWebhookInfo', {});
if (webhook.url)
  throw new Error('Remove the existing webhook before using polling');
let running = true;
process.on('SIGTERM', () => {
  running = false;
});
process.on('SIGINT', () => {
  running = false;
});
let delivering = false;
const deliver = async () => {
  if (delivering || !running) return;
  delivering = true;
  try {
    await deliverOrders(bot);
    await database().query("INSERT INTO appgrade_bot_health(role,heartbeat_at) VALUES('orders',now()) ON CONFLICT(role) DO UPDATE SET heartbeat_at=now()");
  } catch {
    console.error('Order delivery temporarily unavailable');
  } finally {
    delivering = false;
  }
};
const interval =
  role === 'orders' ? setInterval(() => void deliver(), 5000) : undefined;
if (role === 'orders') void deliver();
let offset = Number(
  (
    await database().query(
      'SELECT next_offset FROM appgrade_bot_offsets WHERE role=$1',
      [role],
    )
  ).rows[0]?.next_offset ?? 0,
);
console.log(`APPGRADE ${role} bot started`);
try {
  while (running) {
    try {
      const updates = await bot.call<TelegramUpdate[]>('getUpdates', {
        offset,
        timeout: 25,
        allowed_updates: ['message', 'callback_query'],
      });
      for (const update of updates) {
        if (role === 'prices') await handlePriceUpdate(bot, update);
        else await handleOrderUpdate(bot, update);
        offset = update.update_id + 1;
        await database().query(
          'INSERT INTO appgrade_bot_offsets(role,next_offset) VALUES($1,$2) ON CONFLICT(role) DO UPDATE SET next_offset=$2',
          [role, offset],
        );
      }
    } catch {
      console.error(`${role} bot will retry after a temporary error`);
      await sleep(5000);
    }
  }
} finally {
  if (interval) clearInterval(interval);
  if (role === 'orders') await database().query("DELETE FROM appgrade_bot_health WHERE role='orders'");
  while (delivering) await sleep(100);
  await lock.query('SELECT pg_advisory_unlock($1)', [lockId]);
  lock.release();
  await database().end();
}
