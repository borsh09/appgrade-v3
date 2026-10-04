import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { NextRequest } from 'next/server';
import { migrate } from '@/lib/server/db';
import { getPrices, applyImport, rollbackPrices } from '@/lib/server/prices';
import { POST } from '@/app/api/orders/route';
import { POST as submitTradeIn } from '@/app/api/trade-in/route';
import { GET as adminSnapshot } from '@/app/api/admin/route';
import { PATCH as adminChange } from '@/app/api/admin/route';
import { GET as olderAdminEntries } from '@/app/api/admin/entries/route';
import { PATCH as adminPriceAction } from '@/app/api/admin/prices/route';
import { POST as uploadAdminPrices, GET as downloadAdminTemplate } from '@/app/api/admin/prices/route';
import ExcelJS from 'exceljs';
import { ADMIN_COOKIE, createAdminSession } from '@/lib/server/admin';
import { basePrices, catalogItems } from '@/lib/catalog-registry';
import { seller } from '@/config/seller';

void test('PostgreSQL import, rollback, idempotent order persistence without Telegram bots', async () => {
  const previousSeller = { ...seller };
  Object.assign(seller, { name: 'Test operator', inn: '744602863119', address: 'Test address', privacyEmail: 'privacy@example.test' });
  const db = new PGlite();
  const query = (sql: string, values?: unknown[]) =>
    values
      ? db.query(sql, values)
      : db.exec(sql).then((results) => results.at(-1));
  const adapter = { query, connect: async () => ({ query, release() {} }) };
  (globalThis as unknown as { appgradePool: unknown }).appgradePool = adapter;
  process.env.DATABASE_URL = 'postgresql://test-only';
  const botEnv = ['TELEGRAM_ORDERS_BOT_TOKEN', 'TELEGRAM_ORDERS_CHAT_ID'] as const;
  const previousBots = botEnv.map(name => process.env[name]);
  for (const name of botEnv) delete process.env[name];
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
    const payload = {
      requestKey: randomUUID(),
      consent: true,
      customer: { name: 'Проверка', phone: '+7 999 123-45-67' },
      city: { id: 'sibay' },
      fulfillment: 'pickup',
      serviceIds: [],
      items: [{ id: item.id, price: basePrices[item.id], quantity: 1 }],
    };
    const request = (body: unknown) =>
      new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
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
      const adminCookie = `${ADMIN_COOKIE}=${encodeURIComponent(createAdminSession().value)}`;
      assert.equal((await downloadAdminTemplate(new Request('http://localhost:3000/api/admin/prices'))).status, 401);
      const template = await downloadAdminTemplate(new Request('http://localhost:3000/api/admin/prices', { headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' } }));
      assert.equal(template.status, 200);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(Buffer.from(await template.arrayBuffer()) as unknown as Parameters<typeof workbook.xlsx.load>[0]);
      const unpriced = catalogItems[1];
      await db.query("UPDATE appgrade_prices SET prices=jsonb_set(prices,ARRAY[$1::text],'null'::jsonb) WHERE singleton=true", [unpriced.id]);
      const row = workbook.worksheets[0].getColumn(3).values.findIndex(value => value === unpriced.article);
      assert.ok(row > 1);
      workbook.worksheets[0].getRow(row).getCell(4).value = 61001;
      const form = new FormData();
      form.append('file', new File([new Uint8Array(await workbook.xlsx.writeBuffer())], 'prices.xlsx'));
      const upload = await uploadAdminPrices(new Request('http://localhost:3000/api/admin/prices', { method: 'POST', headers: { cookie: adminCookie, origin: 'http://localhost:3000', }, body: form }));
      assert.equal(upload.status, 200);
      const preview = await upload.json();
      assert.deepEqual(preview.report.errors, []);
      assert.equal(preview.report.changes.length, 1);
      assert.equal(preview.report.changes[0].id, unpriced.id);
      assert.equal((await getPrices()).prices[unpriced.id], null);
      const applied = await adminPriceAction(new Request('http://localhost:3000/api/admin/prices', { method: 'PATCH', headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'apply', id: preview.id }) }));
      assert.equal(applied.status, 200);
      assert.equal((await getPrices()).prices[unpriced.id], 61001);
      await rollbackPrices(preview.id, 'admin');
      assert.equal((await getPrices()).prices[unpriced.id], null);
      const response = await adminSnapshot(new Request('http://localhost:3000/api/admin', {
        headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
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
        headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
      }));
      assert.equal(olderResponse.status, 200);
      assert.equal((await olderResponse.json()).entries[0].id, result.orderId);
      const changeStatus = (status: string) => adminChange(new Request('http://localhost:3000/api/admin', {
        method: 'PATCH', headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'order', id: result.orderId, status }),
      }));
      assert.equal((await changeStatus('issued')).status, 409);
      for (const status of ['confirmed', 'assembled', 'ready_for_pickup', 'issued']) {
        assert.equal((await changeStatus(status)).status, 200);
      }
      assert.equal((await changeStatus('cancelled')).status, 409);
      const finished = await (await adminSnapshot(new Request('http://localhost:3000/api/admin', { headers: { cookie: adminCookie } }))).json();
      assert.equal(finished.orderSummary.active, 0);
      await db.query("UPDATE appgrade_orders SET status='new',payload=jsonb_set(payload,'{fulfillment}','\"delivery\"') WHERE id=$1", [result.orderId]);
      for (const status of ['confirmed', 'assembled']) assert.equal((await changeStatus(status)).status, 200);
      assert.equal((await changeStatus('ready_for_pickup')).status, 409);
      for (const status of ['out_for_delivery', 'delivered']) assert.equal((await changeStatus(status)).status, 200);
      assert.equal((await changeStatus('cancelled')).status, 409);
      const discountChange = (price: number | null) => adminChange(new Request('http://localhost:3000/api/admin', {
        method: 'PATCH', headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'product-discount', id: item.id, city: 'sibay', price }),
      }));
      assert.equal((await discountChange(-1)).status, 400);
      assert.equal((await discountChange(10000000)).status, 400);
      assert.equal((await discountChange(1000)).status, 200);
      assert.equal((await getPrices()).discounts?.[item.id]?.sibay, 1000);
      assert.equal((await getPrices()).discounts?.[item.id]?.beloretsk, undefined);
      const staleDiscountOrder = await POST(request({ ...payload, requestKey: randomUUID() }));
      assert.equal(staleDiscountOrder.status, 409);
      const discountedOrder = await POST(request({ ...payload, requestKey: randomUUID(), items: [{ id: item.id, price: 1000, quantity: 1 }] }));
      assert.equal(discountedOrder.status, 200);
      const discountedId = (await discountedOrder.json()).orderId;
      const storedDiscountOrder = await db.query<{payload: {total:number}}>('SELECT payload FROM appgrade_orders WHERE id=$1', [discountedId]);
      assert.equal(storedDiscountOrder.rows[0].payload.total, 1000);
      await db.query('INSERT INTO appgrade_city_prices(sku,city,price) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET price=$3', [item.id, 'sibay', 2500]);
      assert.equal((await getPrices()).discounts?.[item.id]?.sibay, 1000);
      assert.equal((await discountChange(null)).status, 200);
      const afterDiscountRemoval = await getPrices();
      assert.equal(afterDiscountRemoval.discounts?.[item.id]?.sibay, undefined);
      assert.equal(afterDiscountRemoval.cityPrices?.[item.id]?.sibay, 2500);
      await db.query('DELETE FROM appgrade_city_prices WHERE sku=$1 AND city=$2', [item.id, 'sibay']);
      await db.query("UPDATE appgrade_imports SET owner_id='admin',chat_id='admin',base_revision=$2 WHERE id=$1", [invalidDraftId, (await getPrices()).revision]);
      const rejectedImport = await adminPriceAction(new Request('http://localhost:3000/api/admin/prices', {
        method: 'PATCH',
        headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', id: invalidDraftId }),
      }));
      assert.equal(rejectedImport.status, 400);
      const manualPrice = await adminChange(new Request('http://localhost:3000/api/admin', {
        method: 'PATCH',
        headers: { cookie: adminCookie, origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
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
    const leadPayload = { requestKey: randomUUID(), rowId: 75, batteryPercent: 85, functionState: 'working', bodyState: 'clean', estimate: 40000, name: 'Test', phone: '+7 999 222-33-44', city: 'sibay', consent: true };
    const leadRequest = () => new Request('http://localhost:3000/api/trade-in', { method: 'POST', headers: { origin: 'http://localhost:3000', 'Content-Type': 'application/json' }, body: JSON.stringify(leadPayload) });
    const lead = await submitTradeIn(leadRequest());
    assert.equal(lead.status, 200);
    const savedLead = await lead.json();
    const repeatedLead = await submitTradeIn(leadRequest());
    assert.equal((await repeatedLead.json()).id, savedLead.id);
    assert.equal((await db.query<{ count: number }>('SELECT count(*)::int AS count FROM appgrade_trade_ins')).rows[0].count, 1);
  } finally {
    botEnv.forEach((name, i) => { if (previousBots[i] === undefined) delete process.env[name]; else process.env[name] = previousBots[i]; });
    Object.assign(seller, previousSeller);
    await db.close();
  }
});
