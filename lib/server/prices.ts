import { randomUUID, createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { basePrices, catalogById } from '../catalog-registry';
import { database, transaction } from './db';
import type { ImportReport } from './price-import';
import { OrderError } from './orders';

export type PriceSnapshot = {
  revision: string;
  prices: Record<string, number | null>;
  inventory?: Record<string,Record<string,number>>;
  cityPrices?: Record<string,Record<string,number>>;
  inventoryRevision?: string;
  discounts?: Record<string, Record<string, number>>;
};
export type CityPriceValue = { sku: string; city: string; price: number | null };

export async function snapshotCityPrices(client: PoolClient, keys: { sku: string; city: string }[]): Promise<CityPriceValue[]> {
  if (!keys.length) return [];
  const skus = [...new Set(keys.map((key) => key.sku))];
  const cities = [...new Set(keys.map((key) => key.city))];
  const { rows } = await client.query(
    'SELECT sku,city,price FROM appgrade_city_prices WHERE sku=ANY($1::text[]) AND city=ANY($2::text[])',
    [skus, cities],
  );
  const current = new Map(rows.map((row) => [`${row.sku}\u0000${row.city}`, row.price as number]));
  return keys.map(({ sku, city }) => ({ sku, city, price: current.get(`${sku}\u0000${city}`) ?? null }));
}

async function restoreCityPrices(client: PoolClient, values: CityPriceValue[]) {
  for (const { sku, city, price } of values) {
    if (price === null)
      await client.query('DELETE FROM appgrade_city_prices WHERE sku=$1 AND city=$2', [sku, city]);
    else
      await client.query('INSERT INTO appgrade_city_prices(sku,city,price) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET price=$3,updated_at=now()', [sku, city, price]);
  }
}
export async function getPrices(): Promise<PriceSnapshot> {
  if (!process.env.DATABASE_URL)
    return { revision: 'initial', prices: basePrices };
  const [priceState,stock,cityPriceRows,discountRows]=await Promise.all([
    database().query('SELECT revision, prices FROM appgrade_prices WHERE singleton = true'),
    database().query('SELECT sku,city,quantity FROM appgrade_inventory ORDER BY sku,city'),
    database().query('SELECT sku,city,price FROM appgrade_city_prices ORDER BY sku,city'),
    database().query('SELECT sku,city,price FROM appgrade_discounts ORDER BY sku,city'),
  ]);
  const { rows } = priceState;
  if (!rows[0]) throw new Error('Database migration is required');
  const inventory: Record<string,Record<string,number>>={};
  for(const row of stock.rows) if(catalogById.has(row.sku))(inventory[row.sku]??={})[row.city]=row.quantity;
  const cityPrices: Record<string,Record<string,number>>={};
  for(const row of cityPriceRows.rows) if(catalogById.has(row.sku))(cityPrices[row.sku]??={})[row.city]=row.price;
  const discounts: Record<string,Record<string,number>>={};
  for(const row of discountRows.rows) if(catalogById.has(row.sku))(discounts[row.sku]??={})[row.city]=row.price;
  return {
    revision: rows[0].revision,
    prices: {
      ...basePrices, ...Object.fromEntries(Object.entries(rows[0].prices as Record<string, number | null>).filter(([id]) => catalogById.has(id))),
    },
    inventory,
    cityPrices,
    discounts,
    inventoryRevision:createHash('sha256').update(JSON.stringify({inventory,cityPrices,discounts})).digest('hex'),
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
      throw new OrderError(
        'Загрузка не найдена или принадлежит другому пользователю.',
        404,
      );
    if (draft.status === 'applied') return 'Эта загрузка уже применена.';
    if (draft.status !== 'pending') throw new OrderError('Загрузка отменена.', 409);
    if (Date.now() - new Date(draft.created_at).getTime() > 24 * 60 * 60 * 1000)
      throw new OrderError('Загрузка устарела. Отправьте файл заново.', 409);
    if (draft.base_revision !== state[0].revision)
      throw new OrderError(
        'Цены уже изменились. Отправьте файл заново для свежего отчёта.',
        409,
      );
    const report = draft.report as ImportReport;
    if (report.errors.length)
      throw new OrderError('В прайс-листе есть ошибки. Исправьте файл и загрузите его заново.');
    const articleMappings = report.articleMappings ?? {};
    if (!report.changes.length && !Object.keys(articleMappings).length)
      throw new OrderError('Нет изменений, которые можно применить.');
    for (const [article, sku] of Object.entries(articleMappings)) {
      if (!catalogById.has(sku)) throw new OrderError(`Invalid SKU for article ${article}.`);
      await client.query(
        'INSERT INTO appgrade_product_articles(article,sku) VALUES($1,$2) ON CONFLICT(article) DO UPDATE SET sku=$2,updated_at=now()',
        [article, sku],
      );
    }
    if (!report.changes.length) {
      await client.query("UPDATE appgrade_imports SET status = 'applied' WHERE id = $1", [id]);
      return `Saved ${Object.keys(articleMappings).length} product article links. No prices changed.`;
    }
    const targetCities: string[] = Array.isArray(draft.target_cities) ? draft.target_cities.filter((city: unknown): city is string => typeof city === 'string') : [];
    if (targetCities.length) {
      const keys = report.changes.flatMap((change) => targetCities.map((city) => ({ sku: change.id, city })));
      const previousCityPrices = await snapshotCityPrices(client, keys);
      await client.query(
        'INSERT INTO appgrade_price_history(id,previous_prices,previous_city_prices,owner_id,source) VALUES($1,$2,$3,$4,$5)',
        [id, JSON.stringify(state[0].prices), JSON.stringify(previousCityPrices), owner, draft.filename],
      );
      for (const change of report.changes) {
        for (const city of targetCities) {
          await client.query('INSERT INTO appgrade_city_prices(sku,city,price) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET price=$3,updated_at=now()', [change.id, city, change.after]);
        }
      }
      await client.query('UPDATE appgrade_prices SET revision=$1,updated_at=now() WHERE singleton=true', [id]);
      await client.query("UPDATE appgrade_imports SET status = 'applied' WHERE id = $1", [id]);
      return `Обновлены цены для городов: ${targetCities.join(', ')}. Позиций: ${report.changes.length}.`;
    }
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
    return `Обновлено цен: ${report.changes.length}. Сайт получит их автоматически в течение нескольких секунд.`;
  });
}
export async function rollbackPrices(expectedRevision: string, owner: string) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM appgrade_prices WHERE singleton = true FOR UPDATE',
    );
    if (rows[0].revision !== expectedRevision)
      throw new OrderError('Версия уже изменилась. Обновите страницу и повторите откат.', 409);
    const history = await client.query(
      'SELECT * FROM appgrade_price_history WHERE id = $1',
      [expectedRevision],
    );
    if (!history.rows[0]) throw new OrderError('Нет обновления для отката.', 404);
    const revision = randomUUID();
    const previousCityPrices = history.rows[0].previous_city_prices as CityPriceValue[] | null;
    const reverseCityPrices = previousCityPrices
      ? await snapshotCityPrices(client, previousCityPrices)
      : null;
    await client.query(
      'INSERT INTO appgrade_price_history(id,previous_prices,previous_city_prices,owner_id,source) VALUES($1,$2,$3,$4,$5)',
      [revision, JSON.stringify(rows[0].prices), reverseCityPrices ? JSON.stringify(reverseCityPrices) : null, owner, 'Откат'],
    );
    if (previousCityPrices) await restoreCityPrices(client, previousCityPrices);
    await client.query(
      'UPDATE appgrade_prices SET revision = $1, prices = $2, updated_at = now() WHERE singleton = true',
      [revision, JSON.stringify(history.rows[0].previous_prices)],
    );
    return 'Предыдущие цены восстановлены. Сайт обновится в течение нескольких секунд.';
  });
}
