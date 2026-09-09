import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import {
  basePrices,
  catalogItems,
  normalizeProductName,
} from '@/lib/catalog-registry';
import { inspectPriceWorkbook, numericCell } from '@/lib/server/price-import';
import { isPriceAdmin } from '@/bots/price-bot';

async function inspect(rows: unknown[][], sheet = 'iPhone') {
  const book = new ExcelJS.Workbook();
  book.addWorksheet(sheet).addRows(rows);
  return inspectPriceWorkbook(
    Buffer.from(await book.xlsx.writeBuffer()),
    basePrices,
  );
}
void test('catalog has unique stable SKU identifiers', () => {
  assert.equal(
    new Set(catalogItems.map((i) => i.id)).size,
    catalogItems.length,
  );
});
void test('normalization preserves storage and SIM distinctions', () => {
  assert.equal(
    normalizeProductName('iPad Air 11 M4 128 GB Wi‑Fi'),
    normalizeProductName('iPad Air 11 M4 128 Wi-Fi'),
  );
  assert.equal(
    normalizeProductName('Google Pixel 10 256 ГБ'),
    normalizeProductName('Pixel 10 256'),
  );
  assert.notEqual(
    normalizeProductName('iPhone 17 256 eSim Black'),
    normalizeProductName('iPhone 17 256 Sim/eSim Black'),
  );
});
void test('real workbook matches current catalog using retail columns', async () => {
  const report = await inspectPriceWorkbook(
    await readFile('PRICE KINGSTORE, APPGRADE 14.19.xlsx'),
    basePrices,
  );
  assert.deepEqual(report.errors, []);
  assert.equal(report.matched, 477);
  assert.ok(!report.warnings.some(w => w.includes('нет товара в каталоге')));
  assert.equal(
    report.changes.find((c) => c.id === 'pixel10proxl-obsidian')?.after,
    74800,
  );
  assert.equal(
    report.changes.find((c) => c.id === 'pixel10-indigo')?.after,
    51700,
  );
  assert.ok(report.warnings.some((w) => w.includes('Ray-Ban')));
});
void test('explicit color and SIM update only the exact variant', async () => {
  const report = await inspect([
    ['Модель', 'Цена'],
    ['iPhone 17 256 eSim Black', 70123],
  ]);
  assert.equal(report.changes.length, 1);
  assert.equal(report.changes[0].id, 'iphone-17-256-esim-black');
});
void test('generic row applies to all colors but does not invent variants', async () => {
  const report = await inspect([
    ['Модель', 'Цена'],
    ['iPhone 13 128', 47000],
  ]);
  assert.ok(report.changes.length > 1);
  assert.ok(report.changes.every((c) => c.id.startsWith('iphone-13-128')));
});
void test('blank, dash and broken formula never set a zero price', async () => {
  for (const value of [
    null,
    '-',
    { formula: '1/0', result: 99999 },
    { error: '#VALUE!' },
  ]) {
    const report = await inspect([
      ['Модель', 'Цена'],
      ['iPhone 17 256 eSim Black', value],
    ]);
    assert.equal(report.changes.length, 0);
    assert.ok(report.warnings.length);
  }
  for (const value of [0, -1, 10_000_001]) {
    const report = await inspect([
      ['Модель', 'Цена'],
      ['iPhone 13 128', value],
    ]);
    assert.ok(report.errors.length);
  }
});
void test('conflicting duplicates block the whole upload', async () => {
  const report = await inspect([
    ['Модель', 'Цена'],
    ['iPhone 13 128', 47000],
    ['iPhone 13 128', 48000],
  ]);
  assert.ok(report.errors.some((e) => e.includes('разные цены')));
});
void test('formulas recalculate from inputs and reject external references', () => {
  const sheet = new ExcelJS.Workbook().addWorksheet('Google');
  sheet.getCell('B3').value = 80000;
  sheet.getCell('C3').value = { formula: 'B3*110%', result: 74800 };
  assert.ok(Math.abs(numericCell(sheet.getCell('C3')) - 88000) < 0.001);
  sheet.getCell('C4').value = { sharedFormula: 'C3', result: 74800 };
  sheet.getCell('B4').value = 70000;
  assert.equal(Math.round(numericCell(sheet.getCell('C4'))), 77000);
  sheet.getCell('C3').value = { formula: 'C3+1', result: 0 };
  assert.throws(() => numericCell(sheet.getCell('C3')));
  sheet.getCell('C3').value = { formula: "'[remote.xlsx]sheet'!B3", result: 0 };
  assert.throws(() => numericCell(sheet.getCell('C3')));
});
void test('unauthorized Telegram users cannot manage prices', () => {
  process.env.TELEGRAM_PRICE_ADMIN_IDS = '123, 456';
  assert.equal(isPriceAdmin(123), true);
  assert.equal(isPriceAdmin(12), false);
  assert.equal(isPriceAdmin(undefined), false);
});
