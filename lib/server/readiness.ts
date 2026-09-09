import { database } from './db';

/** Public readiness never exposes credentials or database error details. */
export async function ordersAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL || !process.env.TELEGRAM_ORDERS_BOT_TOKEN || !process.env.TELEGRAM_ORDERS_CHAT_ID) return false;
  try {
    const result = await database().query('SELECT singleton FROM appgrade_prices WHERE singleton=true');
    return result.rows.length === 1;
  } catch {
    return false;
  }
}
