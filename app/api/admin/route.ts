import { randomUUID } from 'node:crypto';
import { assertAdmin } from '@/lib/server/admin';
import { database, transaction } from '@/lib/server/db';
import { assertOrigin, readJson } from '@/lib/server/request-guard';
import { catalogItems, catalogById, basePrices } from '@/lib/catalog-registry';
import { OrderError } from '@/lib/server/orders';
import { CITIES } from '@/config/cities';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const failure=(error:unknown)=>reply({error:error instanceof OrderError?error.message:'Не удалось выполнить операцию.'},error instanceof OrderError?error.status:503);
export async function GET(request:Request){try{
  assertAdmin(request);
  const [prices,inventory,orders,leads,metrics,health]=await Promise.all([
    database().query('SELECT prices FROM appgrade_prices WHERE singleton=true'),
    database().query('SELECT * FROM appgrade_inventory'),
    database().query('SELECT id,payload,status,created_at,notified_at,attempts FROM appgrade_orders ORDER BY created_at DESC LIMIT 100'),
    database().query('SELECT id,payload,status,created_at,notified_at FROM appgrade_trade_ins ORDER BY created_at DESC LIMIT 100'),
    database().query("SELECT * FROM appgrade_metrics WHERE day>=current_date-30 ORDER BY day DESC"),
    database().query('SELECT * FROM appgrade_bot_health')]);
  return reply({catalog:catalogItems,prices:{...basePrices,...prices.rows[0]?.prices},inventory:inventory.rows,orders:orders.rows,tradeIns:leads.rows,metrics:metrics.rows,health:health.rows});
}catch(error){return failure(error);}}
export async function PATCH(request:Request){try{
  assertAdmin(request);assertOrigin(request);
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
    }else if(body.action==='inventory'){
      if(typeof body.id!=='string'||!catalogById.has(body.id)||typeof body.city!=='string'||!Object.hasOwn(CITIES,body.city))throw new OrderError('Неизвестный товар или город.');
      if(body.quantity!==null && (!Number.isSafeInteger(body.quantity)||Number(body.quantity)<0||Number(body.quantity)>100000))throw new OrderError('Некорректный остаток.');
      if(body.quantity===null)await client.query('DELETE FROM appgrade_inventory WHERE sku=$1 AND city=$2',[body.id,body.city]);
      else await client.query('INSERT INTO appgrade_inventory(sku,city,quantity) VALUES($1,$2,$3) ON CONFLICT(sku,city) DO UPDATE SET quantity=$3',[body.id,body.city,body.quantity]);
    }else if(body.action==='order'||body.action==='trade-in'){
      if(typeof body.id!=='string'||typeof body.status!=='string'||!['new','confirmed','completed','cancelled'].includes(body.status))throw new OrderError('Некорректный статус.');
      const table=body.action==='order'?'appgrade_orders':'appgrade_trade_ins';
      const {rows}=await client.query(`SELECT payload,status FROM ${table} WHERE id=$1 FOR UPDATE`,[body.id]);
      if(!rows[0])throw new OrderError('Заявка не найдена.',404);
      const previous=rows[0].status;
      const transitions:Record<string,string[]>={new:['confirmed','cancelled'],confirmed:['completed','cancelled'],completed:[],cancelled:[]};
      if(previous!==body.status && !transitions[previous]?.includes(body.status))throw new OrderError('Этот переход статуса недоступен.',409);
      if(body.action==='order'&&body.status==='cancelled'&&previous!=='cancelled'){
        for(const item of rows[0].payload.reservedStock??[])await client.query('UPDATE appgrade_inventory SET quantity=quantity+$3 WHERE sku=$1 AND city=$2',[item.id,rows[0].payload.city.id,item.quantity]);
      }
      await client.query(`UPDATE ${table} SET status=$2 WHERE id=$1`,[body.id,body.status]);
    }else throw new OrderError('Неизвестная операция.');
  });return reply({success:true});
}catch(error){return failure(error);}}
