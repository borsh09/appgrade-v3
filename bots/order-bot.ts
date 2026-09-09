import { database } from '@/lib/server/db';
import { Telegram, type TelegramUpdate } from '@/lib/server/telegram';

export async function handleOrderUpdate(bot: Telegram, update: TelegramUpdate) {
  const message = update.message;
  if (message?.text?.match(/^\/(start|id)(@\w+)?$/)) {
    await bot.send(
      message.chat.id,
      `Бот заказов APPGRADE. ID этого чата: ${message.chat.id}. Укажите его в TELEGRAM_ORDERS_CHAT_ID на сервере.`,
    );
  }
}
export async function deliverOrders(bot: Telegram) {
  const { rows } = await database().query(
    'SELECT * FROM appgrade_orders WHERE notified_at IS NULL AND next_attempt_at <= now() ORDER BY created_at LIMIT 10',
  );
  for (const order of rows) {
    try {
      const messages = order.messages as string[];
      for (let i = order.sent_parts; i < messages.length; i++) {
        await bot.send(order.notification_chat, messages[i]);
        await database().query(
          'UPDATE appgrade_orders SET sent_parts=$2 WHERE id=$1',
          [order.id, i + 1],
        );
      }
      await database().query(
        'UPDATE appgrade_orders SET notified_at=now() WHERE id=$1',
        [order.id],
      );
    } catch {
      const delay = Math.min(3600, 15 * 2 ** Math.min(order.attempts, 8));
      await database().query(
        "UPDATE appgrade_orders SET attempts=attempts+1, next_attempt_at=now()+$2 * interval '1 second' WHERE id=$1",
        [order.id, delay],
      );
      console.error(`Order notification pending: ${order.id}`);
    }
  }
}
