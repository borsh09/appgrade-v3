import { randomUUID } from 'node:crypto';
import { assertAdmin } from '@/lib/server/admin';
import { database, transaction } from '@/lib/server/db';
import { assertOrigin, readJson } from '@/lib/server/request-guard';
import { catalogItems, catalogById, basePrices } from '@/lib/catalog-registry';
import { OrderError } from '@/lib/server/orders';
import { CITIES } from '@/config/cities';
import { snapshotCityPrices } from '@/lib/server/prices';
import { nextEntryStatuses, orderStatuses, tradeInStatuses } from '@/lib/order-status';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const failure=(error:unknown)=>{
  if (!(error instanceof OrderError)) console.error(`Admin operation failed: ${error instanceof Error ? error.name : 'unknown'} / ${(error as { code?: string })?.code ?? 'unknown'}`);
  return reply({error:error instanceof OrderError?error.message:'Не удалось выполнить операцию.'},error instanceof OrderError?error.status:503);
};
export async function GET(request:Request){try{
  assertAdmin(request);
  if(!process.env.DATABASE_URL)throw new OrderError('Админка недоступна: база PostgreSQL не подключена (DATABASE_URL).',503);
  const [prices,inventory,cityPrices,orders,leads,orderSummary,tradeInSummary,metrics,history,imports,audit,discounts]=await Promise.all([
    database().query('SELECT revision,prices,updated_at FROM appgrade_prices WHERE singleton=true'),
    database().query('SELECT * FROM appgrade_inventory'),
    database().query('SELECT sku,city,price,updated_at FROM appgrade_city_prices'),
    database().query('SELECT id,payload,status,created_at,notified_at,attempts FROM appgrade_orders ORDER BY created_at DESC,id DESC LIMIT 100'),
    database().query('SELECT id,payload,status,created_at,notified_at,attempts FROM appgrade_trade_ins ORDER BY created_at DESC,id DESC LIMIT 100'),
    database().query("SELECT count(*)::int AS total, count(*) FILTER (WHERE status='new')::int AS new, count(*) FILTER (WHERE status NOT IN ('issued','delivered','completed','cancelled'))::int AS active, coalesce(sum((payload->>'total')::numeric) FILTER (WHERE status<>'cancelled'),0) AS revenue FROM appgrade_orders"),
    database().query("SELECT count(*)::int AS total, count(*) FILTER (WHERE status='new')::int AS new FROM appgrade_trade_ins"),
    database().query("SELECT * FROM appgrade_metrics WHERE day>=current_date-30 ORDER BY day DESC"),
    database().query('SELECT id,owner_id,source,created_at FROM appgrade_price_history ORDER BY created_at DESC LIMIT 20'),
    database().query('SELECT id,filename,status,report,target_cities,created_at FROM appgrade_imports ORDER BY created_at DESC LIMIT 20'),
    database().query('SELECT id,owner_id,action,details,created_at FROM appgrade_admin_audit ORDER BY created_at DESC LIMIT 50'),
    database().query('SELECT sku,city,price FROM appgrade_discounts')]);
  return reply({catalog:catalogItems,prices:{...basePrices,...Object.fromEntries(Object.entries((prices.rows[0]?.prices ?? {}) as Record<string, number | null>).filter(([id]) => catalogById.has(id)))},priceRevision:prices.rows[0]?.revision,priceUpdatedAt:prices.rows[0]?.updated_at,inventory:inventory.rows.filter((row) => catalogById.has(row.sku)),cityPrices:cityPrices.rows.filter((row) => catalogById.has(row.sku)),discounts:discounts.rows.filter((row) => catalogById.has(row.sku)),orders:orders.rows,tradeIns:leads.rows,orderSummary:orderSummary.rows[0],tradeInSummary:tradeInSummary.rows[0],metrics:metrics.rows,history:history.rows,imports:imports.rows,audit:audit.rows});
}catch(error){return failure(error);}}
export async function PATCH(request:Request){try{
  assertAdmin(request);assertOrigin(request);
  if(!process.env.DATABASE_URL)throw new OrderError('Админка недоступна: база PostgreSQL не подключена (DATABASE_URL).',503);
  const body=await readJson(request) as Record<string,unknown>;
  if(!body || typeof body!=='object') throw new OrderError('Некорректные данные.');
  await transaction(async client=>{
    if(body.action==='product'){
      if(typeof body.id!=='string'||!catalogById.has(body.id))throw new OrderError('Товар не найден.');
      if(body.price===null && catalogById.get(body.id)!.price!==null)throw new OrderError('Укажите цену. Для снятия с продажи установите остаток 0.');
      if(body.price!==null && (!Number.isSafeInteger(body.price)||Number(body.price)<=0||Number(body.price)>10000000))throw new OrderError('Некорректная цена.');
      const {rows}=await client.query('SELECT revision,prices FROM appgrade_prices WHERE singleton=true FOR UPDATE');
      if(!rows[0])throw new Error('Migration required');
      const id=randomUUID();
      await client.query('INSERT INTO appgrade_price_history(id,previous_prices,owner_id,source) VALUES($1,$2,$3,$4)',[id,JSON.stringify(rows[0].prices),'admin','Панель управления']);
      await client.query('UPDATE appgrade_prices SET revision=$1,prices=$2,updated_at=now() WHERE singleton=true',[id,JSON.stringify({...rows[0].prices,[body.id]:body.price})]);
    }else if(body.action==='city-product'){
      if(typeof body.id!=='string'||!catalogById.has(body.id)||typeof body.city!=='string'||!Object.hasOwn(CITIES,body.city))throw new OrderError('Неизвестный товар или город.');
      if(body.price!==null&&(!Number.isSafeInteger(body.price)||Number(body.price)<=0||Number(body.price)>10000000))throw new OrderError('Некорректная цена.');
      if(body.quantity!==null&&(!Number.isSafeInteger(body.quantity)||Number(body.quantity)<0||Number(body.quantity)>100000))throw new OrderError('Некорректный остаток.');
      const {rows:priceState}=await client.query('SELECT revision,prices FROM appgrade_prices WHERE singleton=true FOR UPDATE');
      if(!priceState[0])throw new Error('Migration required');
      const previousCityPrice=(await snapshotCityPrices(client,[{sku:body.id,city:body.city}]))[0];
      if(previousCityPrice.price!==body.price){
        const revision=randomUUID();
        await client.query('INSERT INTO appgrade_price_history(id,previous_prices,previous_city_prices,owner_id,source) VALUES($1,$2,$3,$4,$5)',[revision,JSON.stringify(priceState[0].prices),JSON.stringify([previousCityPrice]),'admin','Панель управления: городская цена']);
        await client.query('UPDATE appgrade_prices SET revision=$1,updated_at=now() WHERE singleton=true',[revision]);
      }
      if(body.price===null)await client.query('DELETE FROM appgrade_city_prices WHERE sku=$1 AND city=$2',[body.id,body.city]);
      else await client.query('INSERT INTO appgrade_city_prices(sku,city,price) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET price=$3,updated_at=now()',[body.id,body.city,body.price]);
      if(body.quantity===null)await client.query('DELETE FROM appgrade_inventory WHERE sku=$1 AND city=$2',[body.id,body.city]);
      else await client.query('INSERT INTO appgrade_inventory(sku,city,quantity) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET quantity=$3',[body.id,body.city,body.quantity]);
    }else if(body.action==='inventory'){
      if(typeof body.id!=='string'||!catalogById.has(body.id)||typeof body.city!=='string'||!Object.hasOwn(CITIES,body.city))throw new OrderError('Неизвестный товар или город.');
      if(body.quantity!==null && (!Number.isSafeInteger(body.quantity)||Number(body.quantity)<0||Number(body.quantity)>100000))throw new OrderError('Некорректный остаток.');
      if(body.quantity===null)await client.query('DELETE FROM appgrade_inventory WHERE sku=$1 AND city=$2',[body.id,body.city]);
      else await client.query('INSERT INTO appgrade_inventory(sku,city,quantity) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET quantity=$3',[body.id,body.city,body.quantity]);
    }else if(body.action==='product-discount'){
      if(typeof body.id!=='string'||!catalogById.has(body.id)||typeof body.city!=='string'||!Object.hasOwn(CITIES,body.city))throw new OrderError('Неизвестный товар или город.');
      const {rows:priceState}=await client.query('SELECT prices FROM appgrade_prices WHERE singleton=true FOR UPDATE');
      if(!priceState[0])throw new Error('Migration required');
      const {rows:cityPrice}=await client.query('SELECT price FROM appgrade_city_prices WHERE sku=$1 AND city=$2',[body.id,body.city]);
      const base=cityPrice[0]?.price ?? (Object.hasOwn(priceState[0].prices,body.id)?priceState[0].prices[body.id]:basePrices[body.id]);
      if(body.price!==null&&(!Number.isSafeInteger(body.price)||Number(body.price)<=0||typeof base!=='number'||Number(body.price)>=base))throw new OrderError('Цена со скидкой должна быть положительным целым числом и ниже обычной цены.');
      const {rows:previous}=await client.query('SELECT price FROM appgrade_discounts WHERE sku=$1 AND city=$2',[body.id,body.city]);
      body.previousDiscountPrice=previous[0]?.price ?? null;
      if(body.price===null)await client.query('DELETE FROM appgrade_discounts WHERE sku=$1 AND city=$2',[body.id,body.city]);
      else await client.query('INSERT INTO appgrade_discounts(sku,city,price) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET price=$3,updated_at=now()',[body.id,body.city,body.price]);
      await client.query('UPDATE appgrade_prices SET revision=$1,updated_at=now() WHERE singleton=true',[randomUUID()]);
    }else if(body.action==='order'||body.action==='trade-in'){
      if(typeof body.id!=='string'||typeof body.status!=='string'||!Object.hasOwn(body.action==='order'?orderStatuses:tradeInStatuses,body.status))throw new OrderError('Некорректный статус.');
      const table=body.action==='order'?'appgrade_orders':'appgrade_trade_ins';
      const {rows}=await client.query(`SELECT payload,status FROM ${table} WHERE id=$1 FOR UPDATE`,[body.id]);
      if(!rows[0])throw new OrderError('Заявка не найдена.',404);
      const previous=rows[0].status;
      if(previous!==body.status && !nextEntryStatuses(body.action,previous,rows[0].payload.fulfillment).includes(body.status))throw new OrderError('Этот переход статуса недоступен.',409);
      if(body.action==='order'&&body.status==='cancelled'&&previous!=='cancelled'){
        for(const item of rows[0].payload.reservedStock??[])await client.query('UPDATE appgrade_inventory SET quantity=quantity+$3 WHERE sku=$1 AND city=$2',[item.id,rows[0].payload.city.id,item.quantity]);
      }
      await client.query(`UPDATE ${table} SET status=$2 WHERE id=$1`,[body.id,body.status]);
    }else throw new OrderError('Неизвестная операция.');
    await client.query('INSERT INTO appgrade_admin_audit(id,owner_id,action,details) VALUES($1,$2,$3,$4)',[randomUUID(),'admin',String(body.action),JSON.stringify(body)]);
  });return reply({success:true});
}catch(error){return failure(error);}}
