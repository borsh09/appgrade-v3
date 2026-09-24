import assert from 'node:assert/strict';
import { test } from 'node:test';
import { basePrices, catalogItems } from '@/lib/catalog-registry';
import { validateOrder, orderMessages } from '@/lib/server/orders';
import { calculateTradeInEstimate, tradeInDiscount, tradeInModels, tradeInPrices, type TradeInSelection } from '@/lib/trade-in-estimate';

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

void test('Trade-In estimate reduces the provisional order total and cannot be forged', () => {
  const selection: TradeInSelection = {
    rowId: 75, batteryPercent: 85, functionState: 'working', bodyState: 'clean',
  };
  const estimate = calculateTradeInEstimate(selection);
  assert.equal(estimate, 40000);
  const order = validateOrder({ ...sampleOrder(), tradeIn: { ...selection, estimate } }, basePrices);
  assert.equal(order.estimatedDiscount, tradeInDiscount(estimate!, order.productsTotal));
  assert.equal(order.total, order.productsTotal + order.servicesTotal - order.estimatedDiscount);
  assert.ok(orderMessages('trade-in-order', order).join('\n').includes('iPhone 15 Pro'));
  assert.throws(() => validateOrder({ ...sampleOrder(), tradeIn: { ...selection, estimate: estimate + 10000 } }, basePrices), /Trade-In/);
  assert.equal(tradeInDiscount(estimate!, 10000), 10000);
});

void test('Trade-In catalog follows the supplied table and does not price request-only variants', () => {
  assert.equal(tradeInPrices.length, 82);
  assert.ok(tradeInModels.includes('iPhone 17 Pro Max'));
  assert.ok(!tradeInModels.includes('iPhone 18 Pro Max'));
  assert.equal(calculateTradeInEstimate({ rowId: 3, batteryPercent: 80, functionState: 'working', bodyState: 'clean' }), 4000);
  assert.equal(calculateTradeInEstimate({ rowId: 75, batteryPercent: 92, functionState: 'working', bodyState: 'clean' }), null);
  assert.equal(calculateTradeInEstimate({ rowId: 106, batteryPercent: 97, functionState: 'working', bodyState: 'clean' }), null);
  assert.equal(calculateTradeInEstimate({ rowId: 75, batteryPercent: 85, functionState: 'broken', bodyState: 'clean' }), null);
});
