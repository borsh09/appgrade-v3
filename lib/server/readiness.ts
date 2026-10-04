import { database } from './db';
import { isSellerConfigured } from '@/config/seller';

/** Public readiness never exposes credentials or database error details. */
export async function ordersAvailable(): Promise<boolean> {
  if (!isSellerConfigured() || !process.env.DATABASE_URL) return false;
  try {
    const result = await database().query(`SELECT singleton FROM appgrade_prices WHERE singleton=true`);
    return result.rows.length === 1;
  } catch {
    return false;
  }
}
