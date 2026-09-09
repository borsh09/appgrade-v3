import { catalogById, itemConfiguration } from '../catalog-registry';
import { CITIES, type CityId } from '@/config/cities';
import { STORES } from '@/config/stores';
import { ORDER_SERVICES } from '@/config/order-services';

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new OrderError('Некорректные данные заказа.');
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, required = true) {
  if (!required && (value === undefined || value === '')) return '';
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new OrderError('Проверьте заполнение полей заказа.');
  return value.trim();
}
export function validateOrder(
  input: unknown,
  prices: Record<string, number | null>,
) {
  const payload = object(input),
    customer = object(payload.customer);
  const name = text(customer.name, 100),
    phone = text(customer.phone, 30);
  if (
    !/^\+?[\d\s()-]+$/.test(phone) ||
    phone.replace(/\D/g, '').length < 10 ||
    phone.replace(/\D/g, '').length > 15
  )
    throw new OrderError('Проверьте номер телефона.');
  const cityId = text(object(payload.city).id, 30) as CityId;
  if (!Object.hasOwn(CITIES, cityId)) throw new OrderError('Выберите город.');
  if (payload.fulfillment !== 'pickup' && payload.fulfillment !== 'delivery')
    throw new OrderError('Выберите способ получения.');
  const deliveryAddress = text(
    payload.deliveryAddress,
    400,
    payload.fulfillment === 'delivery',
  );
  const contactMethod =
    payload.contactMethod === 'telegram' ? 'telegram' : 'call';
  const telegramUsername = text(
    payload.telegramUsername,
    40,
    contactMethod === 'telegram',
  );
  if (
    telegramUsername &&
    !/^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(telegramUsername)
  )
    throw new OrderError('Укажите Telegram в формате @username.');
  if (
    !Array.isArray(payload.items) ||
    !payload.items.length ||
    payload.items.length > 30
  )
    throw new OrderError('В заказе должно быть от 1 до 30 позиций.');
  const ids = new Set<string>();
  const items = payload.items.map((raw) => {
    const line = object(raw),
      id = text(line.id, 250),
      item = catalogById.get(id);
    if (!item || ids.has(id))
      throw new OrderError(
        'Товар не найден или повторяется. Обновите корзину.',
      );
    ids.add(id);
    const quantity = line.quantity;
    if (
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    )
      throw new OrderError('Некорректное количество товара.');
    const price = prices[id];
    if (typeof price !== 'number' || price <= 0)
      throw new OrderError('Цена товара уточняется. Удалите его из заказа.');
    if (line.price !== price)
      throw new OrderError(
        'Цены обновились. Проверьте новую сумму и отправьте заказ ещё раз.',
        409,
      );
    return {
      id,
      name: item.model,
      configuration: itemConfiguration(item),
      price,
      quantity,
    };
  });
  if (!Array.isArray(payload.serviceIds) || payload.serviceIds.length > 6)
    throw new OrderError('Некорректный список услуг.');
  const services = [...new Set(payload.serviceIds)].map((id) => {
    if (typeof id !== 'string' || !Object.hasOwn(ORDER_SERVICES, id))
      throw new OrderError('Неизвестная услуга.');
    const service = ORDER_SERVICES[id as keyof typeof ORDER_SERVICES];
    if (
      !items.some((item) =>
        service.appliesTo.some((category) =>
          item.name.toLowerCase().startsWith(category),
        ),
      )
    )
      throw new OrderError('Услуга недоступна для выбранных товаров.');
    return { id, title: service.title, price: service.price };
  });
  const productsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const servicesTotal = services.reduce(
    (sum, service) => sum + service.price,
    0,
  );
  return {
    customer: {
      name,
      phone,
      comment: text(customer.comment, 1000, false),
      contactMethod,
      telegramUsername,
    },
    city: {
      id: cityId,
      name: CITIES[cityId].name,
      address: STORES[cityId].address ?? 'Адрес уточняется',
    },
    fulfillment: payload.fulfillment,
    deliveryAddress: payload.fulfillment === 'delivery' ? deliveryAddress : '',
    items,
    services,
    productsTotal,
    servicesTotal,
    total: productsTotal + servicesTotal,
  };
}
export type ValidOrder = ReturnType<typeof validateOrder>;
export function orderMessages(id: string, order: ValidOrder): string[] {
  const money = (n: number) => `${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
  const blocks = [
    `НОВЫЙ ЗАКАЗ APPGRADE\n№ ${id}\n\nКлиент: ${order.customer.name}\nТелефон: ${order.customer.phone}\nСвязаться: ${order.customer.contactMethod === 'telegram' ? '@' + order.customer.telegramUsername.replace(/^@/, '') : 'по телефону'}\nГород: ${order.city.name}\nПолучение: ${order.fulfillment === 'pickup' ? 'Самовывоз — ' + order.city.address : 'Доставка — ' + order.deliveryAddress}`,
    ...order.items.map(
      (item) =>
        `${item.name}\n${item.configuration}\n${item.quantity} шт. × ${money(item.price)} = ${money(item.quantity * item.price)}`,
    ),
    `Услуги: ${order.services.length ? order.services.map((s) => `${s.title} — ${money(s.price)}`).join('; ') : 'не выбраны'}\nТовары: ${money(order.productsTotal)}\nУслуги: ${money(order.servicesTotal)}\nИТОГО: ${money(order.total)}`,
    ...(order.customer.comment
      ? [`Комментарий: ${order.customer.comment}`]
      : []),
  ];
  const messages: string[] = [];
  let current = '';
  for (const block of blocks) {
    if (current.length + block.length + 2 > 3800) {
      messages.push(current);
      current = `Заказ № ${id} (продолжение)`;
    }
    current += `${current ? '\n\n' : ''}${block}`;
  }
  if (current) messages.push(current);
  return messages;
}
