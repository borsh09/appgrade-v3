import { database } from '@/lib/server/db';
import { assertOrigin,readJson,rateLimit } from '@/lib/server/request-guard';
export async function POST(request:Request){try{
  assertOrigin(request);
  if(!process.env.DATABASE_URL)return new Response(null,{status:204});
  const body=await readJson(request,1024) as {event?:unknown};
  if(!['page_view','add_to_cart','client_error','checkout_started'].includes(String(body?.event)))return new Response(null,{status:400});
  await rateLimit('metrics','all',3000,1);
  await database().query('INSERT INTO appgrade_metrics(event,count) VALUES($1,1) ON CONFLICT(day,event) DO UPDATE SET count=appgrade_metrics.count+1',[body.event]);
  return new Response(null,{status:204});
}catch{return new Response(null,{status:204});}}
