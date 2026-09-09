'use client';
import { useRef,useState } from 'react';
import Link from '@/components/shared/safe-link';
import { useCity } from '@/components/providers/city-provider';
export function TradeInForm({deviceType,condition}:{deviceType:string;condition:string}){
  const {city}=useCity();const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
  const identity=useRef({fingerprint:'',key:''});
  return <form onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage('');const form=new FormData(e.currentTarget);const body={deviceType,condition,city:city.id,name:form.get('name'),phone:form.get('phone'),model:form.get('model'),consent:form.get('consent')==='on'};const fingerprint=JSON.stringify(body);if(identity.current.fingerprint!==fingerprint)identity.current={fingerprint,key:crypto.randomUUID()};try{const response=await fetch('/api/trade-in',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,requestKey:identity.current.key}),signal:AbortSignal.timeout(15000)});const data=await response.json();if(!response.ok)throw new Error(data.error);setDone(true);setMessage(`Заявка сохранена. Номер: ${data.id}`);}catch(error){setMessage((error as Error).message);}finally{setBusy(false);}}}>
    {!done&&<><label>Модель устройства <input name="model" required maxLength={150} placeholder="Например, iPhone 15 128 ГБ"/></label><label>Ваше имя <input name="name" autoComplete="name" required maxLength={100}/></label><label>Телефон <input name="phone" type="tel" autoComplete="tel" required maxLength={30}/></label><label><input name="consent" type="checkbox" required/> Согласен на обработку данных для ответа по заявке. <Link href="/privacy">Политика обработки данных</Link></label><button className="appgrade-tradein-cta" disabled={busy}>{busy?'Отправляем…':'Отправить на оценку'}</button></>}{message&&<p role="status">{message}</p>}
  </form>;
}
