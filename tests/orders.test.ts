import assert from 'node:assert/strict';
import { test } from 'node:test';
import { basePrices, catalogItems } from '@/lib/catalog-registry';
import { validateOrder, orderMessages } from '@/lib/server/orders';

const item = catalogItems[0];
export const sampleOrder = () => ({
  customer: {
    name: 'Тестовый клиент',
    phone: '+7 999 123-45-67',
    comment: 'Тест <b>без разметки</b>',
  },
  city: { id: 'sibay', name: 'Подменённый город' },
  fulfillment: 'pickup',
  deliveryAddress: '',
  contactMethod: 'call',
  telegramUsername: '',
  serviceIds: ['transfer'],
  items: [{ id: item.id, name: 'Подмена', price: item.price, quantity: 2 }],
  total: 1,
});
void test('server uses catalog names, configured city and authoritative totals', () => {
  const result = validateOrder(sampleOrder(), basePrices);
  assert.equal(result.items[0].name, item.model);
  assert.equal(result.city.name, 'Сибай');
  assert.equal(result.total, item.price! * 2 + 2990);
  assert.ok(
    orderMessages('test-order', result).join('\n').includes('Адрес уточняется'),
  );
});
void test('stale or tampered prices, bad quantities and unknown services are rejected', () => {
  const payload = sampleOrder();
  payload.items[0].price = 1;
  assert.throws(() => validateOrder(payload, basePrices), /Цены обновились/);
  const quantity = sampleOrder();
  quantity.items[0].quantity = -1;
  assert.throws(() => validateOrder(quantity, basePrices), /количество/);
  const service = sampleOrder();
  service.serviceIds = ['free'];
  assert.throws(() => validateOrder(service, basePrices), /услуга/);
  assert.throws(() => validateOrder(null, basePrices));
});
void test('delivery needs an address; Telegram contact needs username', () => {
  const delivery = sampleOrder();
  delivery.fulfillment = 'delivery';
  assert.throws(() => validateOrder(delivery, basePrices));
  const contact = sampleOrder();
  contact.contactMethod = 'telegram';
  assert.throws(() => validateOrder(contact, basePrices));
  contact.telegramUsername = '@customer_test';
  assert.ok(
    orderMessages('id', validateOrder(contact, basePrices))[0].includes(
      '@customer_test',
    ),
  );
});
void test('large orders split into Telegram-safe messages without dropping items', () => {
  const payload = sampleOrder();
  payload.customer.comment = 'Комментарий '.repeat(80);
  payload.items = catalogItems
    .filter((i) => i.price !== null)
    .sort((a, b) => (b.model + b.color).length - (a.model + a.color).length)
    .slice(0, 30)
    .map((i) => ({ id: i.id, name: i.model, price: i.price, quantity: 1 }));
  payload.serviceIds = [];
  const order = validateOrder(payload, basePrices),
    messages = orderMessages('order-id', order);
  assert.ok(messages.length > 1);
  assert.ok(messages.every((m) => m.length < 4096));
  assert.ok(messages.join('\n').includes('ИТОГО'));
});
