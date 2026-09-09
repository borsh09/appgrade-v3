import { createHash, timingSafeEqual } from 'node:crypto';
import { OrderError } from './orders';
export function assertAdmin(request: Request){
  const password=process.env.ADMIN_PASSWORD;
  if(!password || password.length<20) throw new OrderError('Панель управления не настроена.',503);
  const provided=request.headers.get('authorization') || '';
  const expected=`Basic ${Buffer.from(`${process.env.ADMIN_USER||'admin'}:${password}`).toString('base64')}`;
  const hash=(text:string)=>createHash('sha256').update(text).digest();
  if(!timingSafeEqual(hash(provided),hash(expected))) throw new OrderError('Неверные данные входа.',401);
}
