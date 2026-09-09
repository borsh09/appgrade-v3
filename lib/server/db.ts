import { Pool, type PoolClient } from 'pg';

const globalDb = globalThis as unknown as { appgradePool?: Pool };
export function database() {
  if (!process.env.DATABASE_URL)
    throw new Error('DATABASE_URL is not configured');
  if (!globalDb.appgradePool) {
    globalDb.appgradePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
    });
    globalDb.appgradePool.on('error', () =>
      console.error('PostgreSQL connection error'),
    );
  }
  return globalDb.appgradePool;
}
export async function transaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await database().connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
export async function migrate() {
  await database().query(`
    CREATE TABLE IF NOT EXISTS appgrade_prices (
      singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
      revision text NOT NULL DEFAULT 'initial', prices jsonb NOT NULL DEFAULT '{}',
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    INSERT INTO appgrade_prices(singleton) VALUES (true) ON CONFLICT DO NOTHING;
    CREATE TABLE IF NOT EXISTS appgrade_imports (
      id uuid PRIMARY KEY, update_id bigint UNIQUE NOT NULL, owner_id text NOT NULL,
      chat_id text NOT NULL, filename text NOT NULL, file_hash text NOT NULL,
      base_revision text NOT NULL, report jsonb NOT NULL, status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS appgrade_price_history (
      id uuid PRIMARY KEY, previous_prices jsonb NOT NULL, owner_id text NOT NULL,
      source text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS appgrade_orders (
      id uuid PRIMARY KEY, request_key uuid UNIQUE NOT NULL, request_hash text NOT NULL,
      payload jsonb NOT NULL, notification_chat text NOT NULL,
      messages jsonb NOT NULL, sent_parts integer NOT NULL DEFAULT 0,
      attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
      notified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS appgrade_bot_offsets (role text PRIMARY KEY, next_offset bigint NOT NULL);
    CREATE TABLE IF NOT EXISTS appgrade_rate_limits (key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
    CREATE TABLE IF NOT EXISTS appgrade_bot_health (role text PRIMARY KEY, heartbeat_at timestamptz NOT NULL);
    ALTER TABLE appgrade_orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
    CREATE TABLE IF NOT EXISTS appgrade_inventory (sku text NOT NULL, city text NOT NULL, quantity integer NOT NULL CHECK(quantity>=0), PRIMARY KEY(sku,city));
    CREATE TABLE IF NOT EXISTS appgrade_trade_ins (id uuid PRIMARY KEY, request_key uuid UNIQUE NOT NULL, request_hash text NOT NULL, payload jsonb NOT NULL, messages jsonb NOT NULL, notification_chat text NOT NULL, sent_parts integer NOT NULL DEFAULT 0, attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), notified_at timestamptz, status text NOT NULL DEFAULT 'new', created_at timestamptz NOT NULL DEFAULT now());
    CREATE INDEX IF NOT EXISTS appgrade_orders_pending_idx ON appgrade_orders(next_attempt_at) WHERE notified_at IS NULL;
    CREATE TABLE IF NOT EXISTS appgrade_metrics (day date NOT NULL DEFAULT current_date, event text NOT NULL, count integer NOT NULL DEFAULT 0, PRIMARY KEY(day,event));
  `);
}
