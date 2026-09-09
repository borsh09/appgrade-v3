import { randomUUID, createHash } from 'node:crypto';
import { basePrices } from '../catalog-registry';
import { database, transaction } from './db';
import type { ImportReport } from './price-import';

export type PriceSnapshot = {
  revision: string;
  prices: Record<string, number | null>;
  inventory?: Record<string,Record<string,number>>;
  inventoryRevision?: string;
};
export async function getPrices(): Promise<PriceSnapshot> {
  if (!process.env.DATABASE_URL)
    return { revision: 'initial', prices: basePrices };
  const { rows } = await database().query(
    'SELECT revision, prices FROM appgrade_prices WHERE singleton = true',
  );
  if (!rows[0]) throw new Error('Database migration is required');
  const stock=await database().query('SELECT sku,city,quantity FROM appgrade_inventory ORDER BY sku,city');
  const inventory: Record<string,Record<string,number>>={};
  for(const row of stock.rows)(inventory[row.sku]??={})[row.city]=row.quantity;
  return {
    revision: rows[0].revision,
    prices: { ...basePrices, ...rows[0].prices },
    inventory,
    inventoryRevision:createHash('sha256').update(JSON.stringify(inventory)).digest('hex'),
  };
}
export async function applyImport(id: string, owner: string, chat: string) {
  return transaction(async (client) => {
    const { rows: state } = await client.query(
      'SELECT * FROM appgrade_prices WHERE singleton = true FOR UPDATE',
    );
    const { rows } = await client.query(
      'SELECT * FROM appgrade_imports WHERE id = $1 AND owner_id = $2 AND chat_id = $3 FOR UPDATE',
      [id, owner, chat],
    );
    const draft = rows[0];
    if (!draft)
      throw new Error(
        'Загрузка не найдена или принадлежит другому пользователю.',
      );
    if (draft.status === 'applied') return 'Эта загрузка уже применена.';
    if (draft.status !== 'pending') throw new Error('Загрузка отменена.');
    if (Date.now() - new Date(draft.created_at).getTime() > 24 * 60 * 60 * 1000)
      throw new Error('Загрузка устарела. Отправьте файл заново.');
    if (draft.base_revision !== state[0].revision)
      throw new Error(
        'Цены уже изменились. Отправьте файл заново для свежего отчёта.',
      );
    const report = draft.report as ImportReport;
    if (report.errors.length || !report.changes.length)
      throw new Error('Нет изменений, которые можно применить.');
    const next = { ...state[0].prices };
    for (const change of report.changes) next[change.id] = change.after;
    await client.query(
      'INSERT INTO appgrade_price_history(id, previous_prices, owner_id, source) VALUES ($1,$2,$3,$4)',
      [id, JSON.stringify(state[0].prices), owner, draft.filename],
    );
    await client.query(
      'UPDATE appgrade_prices SET revision = $1, prices = $2, updated_at = now() WHERE singleton = true',
      [id, JSON.stringify(next)],
    );
    await client.query(
      "UPDATE appgrade_imports SET status = 'applied' WHERE id = $1",
      [id],
    );
    return `Обновлено цен: ${report.changes.length}. Сайт получит их автоматически в течение минуты.`;
  });
}
export async function rollbackPrices(expectedRevision: string, owner: string) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM appgrade_prices WHERE singleton = true FOR UPDATE',
    );
    if (rows[0].revision !== expectedRevision)
      throw new Error('Версия уже изменилась. Вызовите /rollback заново.');
    const history = await client.query(
      'SELECT * FROM appgrade_price_history WHERE id = $1',
      [expectedRevision],
    );
    if (!history.rows[0]) throw new Error('Нет обновления для отката.');
    const revision = randomUUID();
    await client.query(
      'INSERT INTO appgrade_price_history(id, previous_prices, owner_id, source) VALUES ($1,$2,$3,$4)',
      [revision, JSON.stringify(rows[0].prices), owner, 'Откат'],
    );
    await client.query(
      'UPDATE appgrade_prices SET revision = $1, prices = $2, updated_at = now() WHERE singleton = true',
      [revision, JSON.stringify(history.rows[0].previous_prices)],
    );
    return 'Предыдущие цены восстановлены. Сайт обновится в течение минуты.';
  });
}
