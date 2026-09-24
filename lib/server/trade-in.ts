import { CITIES } from '@/config/cities';
import { getTradeInAssessment, parseTradeInSelection } from '@/lib/trade-in-estimate';
import { OrderError } from './orders';

export function validateTradeIn(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new OrderError('Некорректная анкета.');
  const body = value as Record<string, unknown>;
  const field = (key: string, max = 100) => {
    const raw = body[key];
    if (typeof raw !== 'string' || !raw.trim() || raw.length > max) throw new OrderError('Заполните контактные данные.');
    return raw.trim();
  };
  const name = field('name');
  const phone = field('phone', 30);
  const city = field('city');
  const selection = parseTradeInSelection(body);
  const assessment = selection ? getTradeInAssessment(selection) : null;
  if (!assessment || body.estimate !== assessment.estimate) throw new OrderError('Оценка Trade-In изменилась. Заполните анкету заново.');
  if (!/^\+?[\d\s()-]+$/.test(phone) || phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15) throw new OrderError('Проверьте телефон.');
  if (!Object.hasOwn(CITIES, city)) throw new OrderError('Проверьте выбранный город.');
  if (body.consent !== true) throw new OrderError('Подтвердите согласие на обработку данных.');
  const { row } = assessment;
  const condition = selection!.functionState === 'working' && selection!.bodyState === 'clean'
    ? 'Работает исправно' : selection!.functionState === 'broken' || selection!.bodyState === 'damaged'
      ? 'Нужна диагностика' : 'Есть следы использования';
  const details = `${row.storage}${row.sim ? ` · ${row.sim}` : ''}; аккумулятор ${selection!.batteryPercent}%; таблица: ${row.priceLabel}`;
  return {
    customer: { name, phone }, model: row.model, deviceType: 'Смартфон', condition,
    details, estimate: assessment.estimate, city,
    consent: { version: '2026-09-09', acceptedAt: new Date().toISOString() },
  };
}
