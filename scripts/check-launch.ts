import './env';
import { existsSync } from 'node:fs';
import { STORES } from '@/config/stores';
import { sellerConfigured } from '@/config/seller';

const failures: string[] = [];
if(!sellerConfigured)failures.push('Заполните SELLER_NAME, SELLER_INN, SELLER_ADDRESS и SELLER_PRIVACY_EMAIL');
if(!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length<20)failures.push('Для панели управления задайте ADMIN_PASSWORD длиной не менее 20 символов');
if (!process.env.DATABASE_URL && !process.env.POSTGRES_PASSWORD) failures.push('Настройте DATABASE_URL или POSTGRES_PASSWORD для Docker Compose');
if (process.env.DATABASE_URL) {
  try {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol) || !databaseUrl.hostname || databaseUrl.pathname === '/' || /CHANGE_ME|YOUR_/i.test(databaseUrl.password)) failures.push('DATABASE_URL: укажите реальное подключение PostgreSQL без шаблонного пароля');
  } catch { failures.push('DATABASE_URL: некорректная строка подключения'); }
}
if (process.env.POSTGRES_PASSWORD && (process.env.POSTGRES_PASSWORD.length < 20 || !/^[a-zA-Z0-9]+$/.test(process.env.POSTGRES_PASSWORD))) failures.push('POSTGRES_PASSWORD: нужен случайный буквенно-цифровой пароль не менее 20 символов для DATABASE_URL в Compose');
for (const name of ['APP_ORIGIN', 'NEXT_PUBLIC_SITE_URL']) {
  try {
    const url = new URL(process.env[name] || '');
    if (url.username || url.password || /YOUR_DOMAIN|example\.(?:com|test)|CHANGE_ME/i.test(url.hostname) || !url.hostname.includes('.')) failures.push(`${name}: замените шаблон на ваш настоящий домен`);
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) failures.push(`${name}: нужен публичный адрес HTTPS`);
    if (url.pathname !== '/' || url.search || url.hash) failures.push(`${name}: укажите только адрес сайта без пути и параметров`);
  } catch { failures.push(`${name}: некорректный адрес`); }
}
if (process.env.APP_ORIGIN?.replace(/\/$/, '') !== process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) failures.push('APP_ORIGIN и NEXT_PUBLIC_SITE_URL должны совпадать');
for (const store of Object.values(STORES)) {
  if (!store.address || !store.phone || !store.schedule) failures.push(`${store.city}: заполните адрес, телефон и режим работы`);
}
if (!existsSync('app/privacy/page.tsx')) failures.push('Нужна политика обработки персональных данных с реквизитами продавца');
if (!existsSync('app/consent/page.tsx')) failures.push('Нужен отдельный текст согласия на обработку персональных данных');
const target = process.argv.find(arg => arg.startsWith('--url='))?.slice(6);
if (target) {
  try {
    if (new URL(target).origin !== new URL(process.env.APP_ORIGIN || '').origin) failures.push('Адрес проверяемого сайта не совпадает с APP_ORIGIN');
    const response = await fetch(new URL('/api/health', target), { signal: AbortSignal.timeout(10000) });
    const result = await response.json();
    if (!response.ok || result.ordersAvailable !== true) failures.push('Работающий сайт пока не готов сохранять заказы');
    for (const path of ['/privacy', '/consent', '/catalog', '/trade-in']) {
      const page = await fetch(new URL(path, target), { signal: AbortSignal.timeout(10000) });
      if (!page.ok) failures.push(`Работающий сайт: ${path} недоступна`);
    }
  } catch { failures.push('Не удалось проверить доступность работающего сайта'); }
}
if (failures.length) {
  console.error('Запуск не подтверждён:\n' + failures.map(message => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Настройки заполнены. Проверьте реальный заказ, просмотр заказа в админке и резервное восстановление базы перед открытием продаж.');
}
