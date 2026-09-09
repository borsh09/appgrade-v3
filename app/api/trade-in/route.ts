import { randomUUID,createHash } from 'node:crypto';
import { database } from '@/lib/server/db';
import { readJson, protectSubmission, rateLimit } from '@/lib/server/request-guard';
import { validateTradeIn } from '@/lib/server/trade-in';
import { OrderError } from '@/lib/server/orders';
import { CITIES } from '@/config/cities';
export const runtime='nodejs';
export async function POST(request:Request){try{
  const chat=process.env.TELEGRAM_ORDERS_CHAT_ID;
  if(!process.env.DATABASE_URL||!chat||!process.env.TELEGRAM_ORDERS_BOT_TOKEN)throw new OrderError('Приём заявок пока недоступен.',503);
  await protectSubmission(request,'trade-in');
  const raw=await readJson(request) as Record<string,unknown>;
  if(typeof raw?.requestKey!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw.requestKey))throw new OrderError('Обновите страницу.');
  const payload=validateTradeIn(raw);
  const hash=createHash('sha256').update(JSON.stringify(raw)).digest('hex');
  const previous=await database().query('SELECT id,request_hash FROM appgrade_trade_ins WHERE request_key=$1',[raw.requestKey]);
  if(previous.rows[0]){if(previous.rows[0].request_hash!==hash)throw new OrderError('Данные заявки изменились.',409);return Response.json({success:true,id:previous.rows[0].id});}
  await rateLimit('trade-in:phone',payload.customer.phone.replace(/\D/g,''),5);
  const id=randomUUID();
  const messages=[`Trade-In ${id}\n${payload.customer.name}\n${payload.customer.phone}\n${CITIES[payload.city as keyof typeof CITIES].name}\n${payload.deviceType}: ${payload.model}\n${payload.condition}`];
  const inserted=await database().query('INSERT INTO appgrade_trade_ins(id,request_key,request_hash,payload,messages,notification_chat) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(request_key) DO NOTHING RETURNING id',[id,raw.requestKey,hash,JSON.stringify(payload),JSON.stringify(messages),chat]);
  if(!inserted.rows[0]){const retry=await database().query('SELECT id,request_hash FROM appgrade_trade_ins WHERE request_key=$1',[raw.requestKey]);if(retry.rows[0].request_hash!==hash)throw new OrderError('Данные заявки изменились.',409);return Response.json({success:true,id:retry.rows[0].id});}
  return Response.json({success:true,id});
}catch(error){return Response.json({error:error instanceof OrderError?error.message:'Не удалось сохранить заявку.'},{status:error instanceof OrderError?error.status:503});}}
