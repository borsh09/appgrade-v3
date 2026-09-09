import './env';
import { existsSync } from 'node:fs';
import { STORES } from '@/config/stores';

const failures: string[] = [];
for (const name of ['TELEGRAM_PRICE_BOT_TOKEN', 'TELEGRAM_PRICE_ADMIN_IDS', 'TELEGRAM_ORDERS_BOT_TOKEN', 'TELEGRAM_ORDERS_CHAT_ID']) {
  if (!process.env[name]?.trim()) failures.push(`Не заполнено ${name}`);
}
if (!process.env.DATABASE_URL && !process.env.POSTGRES_PASSWORD) failures.push('Настройте DATABASE_URL или POSTGRES_PASSWORD для Docker Compose');
if (process.env.TELEGRAM_PRICE_BOT_TOKEN && process.env.TELEGRAM_PRICE_BOT_TOKEN === process.env.TELEGRAM_ORDERS_BOT_TOKEN) failures.push('Для прайса и заказов нужны разные боты');
for (const name of ['APP_ORIGIN', 'NEXT_PUBLIC_SITE_URL']) {
  try {
    const url = new URL(process.env[name] || '');
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) failures.push(`${name}: нужен публичный адрес HTTPS`);
    if (url.pathname !== '/' || url.search || url.hash) failures.push(`${name}: укажите только адрес сайта без пути и параметров`);
  } catch { failures.push(`${name}: некорректный адрес`); }
}
if (process.env.APP_ORIGIN?.replace(/\/$/, '') !== process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) failures.push('APP_ORIGIN и NEXT_PUBLIC_SITE_URL должны совпадать');
for (const store of Object.values(STORES)) {
  if (!store.address || !store.phone || !store.schedule) failures.push(`${store.city}: заполните адрес, телефон и режим работы`);
}
if (!existsSync('app/privacy/page.tsx')) failures.push('Нужна политика обработки персональных данных с реквизитами продавца');
const target = process.argv.find(arg => arg.startsWith('--url='))?.slice(6);
if (target) {
  try {
    const response = await fetch(new URL('/api/health', target), { signal: AbortSignal.timeout(10000) });
    const result = await response.json();
    if (!response.ok || result.ordersAvailable !== true) failures.push('Работающий сайт пока не готов сохранять заказы');
  } catch { failures.push('Не удалось проверить доступность работающего сайта'); }
}
if (failures.length) {
  console.error('Запуск не подтверждён:\n' + failures.map(message => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Настройки заполнены. Проверьте реальный заказ, доставку уведомления и резервное восстановление базы перед открытием продаж.');
}
