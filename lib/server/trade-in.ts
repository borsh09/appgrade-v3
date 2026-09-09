import { OrderError } from './orders';
import { CITIES } from '@/config/cities';
export function validateTradeIn(value:unknown){
  if(!value||typeof value!=='object')throw new OrderError('Некорректная анкета.');
  const body=value as Record<string,unknown>;
  const field=(name:string,max=100)=>{const v=body[name];if(typeof v!=='string'||!v.trim()||v.length>max)throw new OrderError('Заполните контактные данные и модель.');return v.trim();};
  const name=field('name'),phone=field('phone',30),model=field('model',150),deviceType=field('deviceType'),condition=field('condition'),city=field('city');
  if(!/^\+?[\d\s()-]+$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15)throw new OrderError('Проверьте телефон.');
  if(!['Смартфон','Планшет','Ноутбук','Смарт-часы'].includes(deviceType)||!['Работает исправно','Есть следы использования','Нужна диагностика'].includes(condition)||!Object.hasOwn(CITIES,city))throw new OrderError('Проверьте выбранные параметры.');
  if(body.consent!==true)throw new OrderError('Подтвердите согласие на обработку данных.');
  return {customer:{name,phone},model,deviceType,condition,city,consent:{version:'2026-09-09',acceptedAt:new Date().toISOString()}};
}
