import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { NextRequest } from 'next/server';
import { migrate } from '@/lib/server/db';
import { getPrices, applyImport, rollbackPrices } from '@/lib/server/prices';
import { POST } from '@/app/api/orders/route';
import { GET as adminSnapshot } from '@/app/api/admin/route';
import { PATCH as adminChange } from '@/app/api/admin/route';
import { GET as olderAdminEntries } from '@/app/api/admin/entries/route';
import { PATCH as adminPriceAction } from '@/app/api/admin/prices/route';
import { basePrices, catalogItems } from '@/lib/catalog-registry';
import { deliverOrders } from '@/bots/order-bot';
import { handlePriceUpdate } from '@/bots/price-bot';
import type { Telegram } from '@/lib/server/telegram';

void test('PostgreSQL import, rollback, idempotent order persistence and notification retries', async () => {
  const db = new PGlite();
  const query = (sql: string, values?: unknown[]) =>
    values
      ? db.query(sql, values)
      : db.exec(sql).then((results) => results.at(-1));
  const adapter = { query, connect: async () => ({ query, release() {} }) };
  (globalThis as unknown as { appgradePool: unknown }).appgradePool = adapter;
  process.env.DATABASE_URL = 'postgresql://test-only';
  process.env.TELEGRAM_ORDERS_BOT_TOKEN = 'test-token';
  process.env.TELEGRAM_ORDERS_CHAT_ID = '123';
  process.env.TELEGRAM_PRICE_ADMIN_IDS = '123';
  try {
    await migrate();
    const item = catalogItems[0];
    const draftId = randomUUID();
    const report = {
      changes: [{ id: item.id, before: item.price, after: 60001 }],
      errors: [],
      warnings: [],
    };
    await db.query(
      `INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report) VALUES($1,1,'123','123','test.xlsx','hash','initial',$2)`,
      [draftId, JSON.stringify(report)],
    );
    await assert.rejects(applyImport(draftId, '456', '123'));
    assert.equal((await getPrices()).prices[item.id], item.price);
    await applyImport(draftId, '123', '123');
    assert.equal((await getPrices()).prices[item.id], 60001);
    assert.match(await applyImport(draftId, '123', '123'), /уже применена/);
    const staleId = randomUUID();
    await db.query(
      `INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report) VALUES($1,2,'123','123','test.xlsx','hash','initial',$2)`,
      [staleId, JSON.stringify(report)],
    );
    await assert.rejects(applyImport(staleId, '123', '123'), /уже изменились/);
    await rollbackPrices(draftId, '123');
    assert.equal((await getPrices()).prices[item.id], item.price);
    await assert.rejects(rollbackPrices(draftId, '123'));
    const invalidDraftId = randomUUID();
    await db.query(
      `INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report) VALUES($1,5,'123','123','invalid.xlsx','hash-invalid',$2,$3)`,
      [invalidDraftId, (await getPrices()).revision, JSON.stringify({ ...report, errors: ['Conflicting prices'] })],
    );
    await assert.rejects(applyImport(invalidDraftId, '123', '123'));
    assert.equal((await getPrices()).prices[item.id], item.price);
    const cityDraftId = randomUUID();
    const cityRevision = (await getPrices()).revision;
    const cityReport = { changes: [{ id: item.id, before: item.price, after: 60002 }], errors: [], warnings: [] };
    await db.query('INSERT INTO appgrade_city_prices(sku,city,price) VALUES($1,$2,$3)', [item.id, 'beloretsk', 52000]);
    await db.query(
      `INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report,target_cities) VALUES($1,3,'123','123','city.xlsx','hash-city',$2,$3,$4)`,
      [cityDraftId, cityRevision, JSON.stringify(cityReport), ['beloretsk', 'troitsk']],
    );
    await applyImport(cityDraftId, '123', '123');
    const cityPrices = (await getPrices()).cityPrices ?? {};
    assert.equal(cityPrices[item.id]?.beloretsk, 60002);
    assert.equal(cityPrices[item.id]?.troitsk, 60002);
    assert.equal((await getPrices()).revision, cityDraftId);
    const staleCityDraftId = randomUUID();
    await db.query(
      `INSERT INTO appgrade_imports(id,update_id,owner_id,chat_id,filename,file_hash,base_revision,report,target_cities) VALUES($1,4,'123','123','stale-city.xlsx','hash-stale',$2,$3,$4)`,
      [staleCityDraftId, cityRevision, JSON.stringify(cityReport), ['beloretsk']],
    );
    await assert.rejects(applyImport(staleCityDraftId, '123', '123'));
    await rollbackPrices(cityDraftId, '123');
    const restoredCityPrices = (await getPrices()).cityPrices ?? {};
    assert.equal(restoredCityPrices[item.id]?.beloretsk, 52000);
    assert.equal(restoredCityPrices[item.id]?.troitsk, undefined);
    const cityRollbackRevision = (await getPrices()).revision;
    await rollbackPrices(cityRollbackRevision, '123');
    assert.equal((await getPrices()).cityPrices?.[item.id]?.troitsk, 60002);
    let calls = 0;
    const blockedBot = {
      send: async () => {
        calls++;
      },
      call: async () => {
        calls++;
      },
    } as unknown as Telegram;
    await handlePriceUpdate(blockedBot, {
      update_id: 90,
      message: {
        from: { id: 456 },
        chat: { id: 456, type: 'private' },
        document: { file_id: 'no-download', file_name: 'prices.xlsx' },
      },
    });
    assert.equal(calls, 0);
    const payload = {
      requestKey: randomUUID(),
      customer: { name: 'Проверка', phone: '+7 999 123-45-67' },
      city: { id: 'sibay' },
      fulfillment: 'pickup',
      serviceIds: [],
      items: [{ id: item.id, price: basePrices[item.id], quantity: 1 }],
    };
    const request = (body: unknown) =>
      new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    const first = await POST(request(payload));
    assert.equal(first.status, 200);
    const result = await first.json();
    assert.ok(result.orderId);
    const second = await POST(request(payload));
    assert.equal((await second.json()).orderId, result.orderId);
    const conflict = await POST(
      request({
        ...payload,
        customer: { ...payload.customer, name: 'Другой' },
      }),
    );
    assert.equal(conflict.status, 409);
    assert.equal(
      (
        await db.query<{ count: number }>(
          'SELECT count(*)::int AS count FROM appgrade_orders',
        )
      ).rows[0].count,
      1,
    );
    const previousAdminPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'a-secure-password-for-tests';
    try {
      const response = await adminSnapshot(new Request('http://localhost:3000/api/admin', {
        headers: { authorization: `Basic ${Buffer.from('admin:a-secure-password-for-tests').toString('base64')}` },
      }));
      assert.equal(response.status, 200);
      const snapshot = await response.json();
      assert.equal(snapshot.orderSummary.total, 1);
      assert.equal(snapshot.orderSummary.new, 1);
      assert.ok(Number(snapshot.orderSummary.revenue) > 0);
      assert.equal(snapshot.tradeInSummary.total, 0);
      const olderUrl = 'http://localhost:3000/api/admin/entries?type=order&before=2099-01-01T00%3A00%3A00.000Z&beforeId=ffffffff-ffff-ffff-ffff-ffffffffffff';
      assert.equal((await olderAdminEntries(new Request(olderUrl))).status, 401);
      const olderResponse = await olderAdminEntries(new Request(olderUrl, {
        headers: { authorization: `Basic ${Buffer.from('admin:a-secure-password-for-tests').toString('base64')}` },
      }));
      assert.equal(olderResponse.status, 200);
      assert.equal((await olderResponse.json()).entries[0].id, result.orderId);
      await db.query("UPDATE appgrade_imports SET owner_id='admin',chat_id='admin',base_revision=$2 WHERE id=$1", [invalidDraftId, (await getPrices()).revision]);
      const rejectedImport = await adminPriceAction(new Request('http://localhost:3000/api/admin/prices', {
        method: 'PATCH',
        headers: { authorization: `Basic ${Buffer.from('admin:a-secure-password-for-tests').toString('base64')}` },
        body: JSON.stringify({ action: 'apply', id: invalidDraftId }),
      }));
      assert.equal(rejectedImport.status, 400);
      const manualPrice = await adminChange(new Request('http://localhost:3000/api/admin', {
        method: 'PATCH',
        headers: { authorization: `Basic ${Buffer.from('admin:a-secure-password-for-tests').toString('base64')}` },
        body: JSON.stringify({ action: 'city-product', id: item.id, city: 'beloretsk', price: 61000, quantity: null }),
      }));
      assert.equal(manualPrice.status, 200);
      assert.equal((await getPrices()).cityPrices?.[item.id]?.beloretsk, 61000);
      await rollbackPrices((await getPrices()).revision, 'admin');
      assert.equal((await getPrices()).cityPrices?.[item.id]?.beloretsk, 60002);
    } finally {
      if (previousAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
      else process.env.ADMIN_PASSWORD = previousAdminPassword;
    }
    const failBot = {
      send: async () => {
        throw new Error('Network unavailable');
      },
    } as unknown as Telegram;
    await deliverOrders(failBot);
    const pending = (
      await db.query<{ attempts: number; notified_at: unknown }>(
        'SELECT attempts,notified_at FROM appgrade_orders',
      )
    ).rows[0];
    assert.equal(pending.attempts, 1);
    assert.equal(pending.notified_at, null);
    await db.query('UPDATE appgrade_orders SET next_attempt_at=now()');
    const messages: string[] = [];
    const successBot = {
      send: async (_chat: string, text: string) => {
        messages.push(text);
      },
    } as unknown as Telegram;
    await deliverOrders(successBot);
    assert.ok(messages[0].includes('Сибай'));
    assert.ok(
      (
        await db.query<{ notified_at: unknown }>(
          'SELECT notified_at FROM appgrade_orders',
        )
      ).rows[0].notified_at,
    );
    await deliverOrders(successBot);
    assert.equal(messages.length, 1);
  } finally {
    await db.close();
  }
});
