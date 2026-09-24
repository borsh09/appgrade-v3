import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateTradeIn } from '@/lib/server/trade-in';

const request = (rowId: number, batteryPercent: number, estimate: number | null) => ({
  rowId, batteryPercent, functionState: 'working', bodyState: 'clean',
  estimate, name: 'Тест', phone: '+7 999 123-45-67', city: 'sibay', consent: true,
});

void test('Trade-In lead uses only listed model and authoritative table price', () => {
  const priced = validateTradeIn(request(75, 85, 40000));
  assert.equal(priced.model, 'iPhone 15 Pro');
  assert.equal(priced.estimate, 40000);
  assert.match(priced.details, /128 ГБ/);
  assert.throws(() => validateTradeIn(request(75, 85, 50000)), /Trade-In/);
  assert.throws(() => validateTradeIn(request(999, 85, null)), /Trade-In/);
});

void test('Trade-In request-only model sends a lead without invented discount', () => {
  const lead = validateTradeIn(request(106, 97, null));
  assert.equal(lead.model, 'iPhone 17 Pro');
  assert.equal(lead.estimate, null);
  assert.throws(() => validateTradeIn(request(106, 97, 70000)), /Trade-In/);
});
