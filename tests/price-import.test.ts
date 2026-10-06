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
import newPriceSource from '@/data/new-price-source.json';
import { createPriceTemplate } from '@/lib/server/price-template';
import { readPriceWorkbook } from '@/lib/server/read-price-workbook';

void test('desktop four-column table matches every catalog article after filling prices', async () => {
  const book = await readPriceWorkbook(await readFile('tests/fixtures/appgrade-desktop.xlsx'));
  const sheet = book.worksheets[0];
  sheet.eachRow((row, number) => { if (number > 1) row.getCell(4).value = 60003; });
  const report = await inspectPriceWorkbook(Buffer.from(await book.xlsx.writeBuffer()), basePrices);
  assert.deepEqual(report.errors, []);
  assert.equal(report.matched, catalogItems.length);
  assert.equal(report.changes.length + report.unchanged, catalogItems.length);
});

void test('downloaded template has current articles and blank prices', async () => {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(await createPriceTemplate() as unknown as Parameters<typeof book.xlsx.load>[0]);
  const sheet = book.worksheets[0];
  assert.deepEqual((sheet.getRow(1).values as unknown[]).slice(1), ['Бренд', 'Название', 'Артикул', 'Цена']);
  assert.equal(sheet.rowCount, catalogItems.length + 1);
  for (const item of catalogItems) assert.ok(sheet.getColumn(3).values.includes(item.article));
  assert.ok(sheet.getColumn(4).values.slice(2).every(value => value == null));
});

void test('four-column import follows headers and articles even with edited names and text prices', async () => {
  const item = catalogItems[0];
  const report = await inspect([
    ['Цена', 'Артикул', 'Бренд', 'Название'],
    ['60 004', item.article, 'Изменён', 'Другое название'],
    [null, catalogItems[1].article, 'Бренд', 'Без цены'],
  ], 'Прайс');
  assert.deepEqual(report.errors, []);
  assert.equal(report.changes[0].id, item.id);
  assert.equal(report.changes[0].after, 60004);
  assert.equal(report.blankRows, 1);
});

void test('four-column import blocks unknown articles, invalid prices and conflicting duplicates', async () => {
  const item = catalogItems[0];
  for (const badRow of [
    ['Бренд', item.sourceTitle, 'P-999999999999', 60005],
    ['Бренд', item.sourceTitle, item.article, 'не цена'],
    ['Бренд', item.sourceTitle, item.article, 60005.5],
  ]) {
    const report = await inspect([['Бренд', 'Название', 'Артикул', 'Цена'], badRow], 'Прайс');
    assert.ok(report.errors.length);
    assert.equal(report.changes.length, 0);
  }
  const report = await inspect([
    ['Бренд', 'Название', 'Артикул', 'Цена'],
    ['Бренд', 'Одно имя', item.article, 60005],
    ['Бренд', 'Другое имя', item.article, 60006],
  ], 'Прайс');
  assert.ok(report.errors.some(error => error.includes('разные цены')));
});

async function inspect(rows: unknown[][], sheet = 'iPhone', articleMap: Record<string, string> = {}) {
  const book = new ExcelJS.Workbook();
  book.addWorksheet(sheet).addRows(rows);
  return inspectPriceWorkbook(
    Buffer.from(await book.xlsx.writeBuffer()),
    basePrices,
    undefined,
    articleMap,
  );
}
void test('parser imports only Site Appgrade column D without headers, including the first row', async () => {
  const item = catalogItems[0];
  const book = new ExcelJS.Workbook();
  book.addWorksheet('Другой прайс').addRows([['Бренд', 'Название', 'Артикул', 'Цена'], ['Apple', item.model, item.article, 80000]]);
  book.addWorksheet('Сайт Аппгрейд').addRows([['Apple', item.model, item.article, 60007], ['Apple', catalogItems[1].model, catalogItems[1].article, null]]);
  const report = await inspectPriceWorkbook(Buffer.from(await book.xlsx.writeBuffer()), basePrices);
  assert.deepEqual(report.errors, []);
  assert.equal(report.changes.length, 1);
  assert.equal(report.changes[0].after, 60007);
  assert.ok(report.changes[0].source.startsWith('Сайт Аппгрейд!D1'));
  assert.equal(report.blankRows, 1);
});
void test('named Site Appgrade cannot fall back to a different sheet when its layout is invalid', async () => {
  const book = new ExcelJS.Workbook();
  book.addWorksheet('Сайт Аппгрейд').addRow(['Неверный формат']);
  book.addWorksheet('Прайс').addRows([['Бренд', 'Название', 'Артикул', 'Цена'], ['Apple', catalogItems[0].model, catalogItems[0].article, 60008]]);
  await assert.rejects(inspectPriceWorkbook(Buffer.from(await book.xlsx.writeBuffer()), basePrices), /Сайт Аппгрейд/);
});
void test('parser VLOOKUP imports saved prices and skips empty results without reading other sheets', async () => {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet('Сайт Аппгрейд');
  book.addWorksheet('Новый прайс').addRow(['irrelevant', 99999]);
  sheet.addRow(['Apple', 'edited name', catalogItems[0].article, { formula: `IFERROR(VLOOKUP(C1,'Новый прайс'!A:N,14,0),"")`, result: 60009 }]);
  sheet.addRow(['Apple', 'no price', catalogItems[1].article, { formula: `IFERROR(VLOOKUP(C2,'Новый прайс'!A:N,14,0),"")`, result: '' }]);
  const report = await inspectPriceWorkbook(Buffer.from(await book.xlsx.writeBuffer()), basePrices);
  assert.deepEqual(report.errors, []);
  assert.equal(report.changes.length, 1);
  assert.equal(report.changes[0].id, catalogItems[0].id);
  assert.equal(report.changes[0].after, 60009);
  assert.equal(report.blankRows, 1);
  assert.match(report.warnings[0], /сохранённых результатов Excel/);
  sheet.getCell('D1').value = { formula: `IFERROR(VLOOKUP(C1,'[remote.xlsx]Новый прайс'!A:N,14,0),"")`, result: 60009 };
  const external = await inspectPriceWorkbook(Buffer.from(await book.xlsx.writeBuffer()), basePrices);
  assert.ok(external.errors.length);
  assert.equal(external.changes.length, 0);
});
void test('price import rejects archives with excessive expanded size', async () => {
  const book = new ExcelJS.Workbook();
  book.addWorksheet('iPhone').addRow(['iPhone']);
  const buffer = Buffer.from(await book.xlsx.writeBuffer());
  const entry = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  assert.ok(entry >= 0);
  buffer.writeUInt32LE(60 * 1024 * 1024, entry + 24);
  await assert.rejects(() => inspectPriceWorkbook(buffer, basePrices), /слишком большой файл Excel/i);
});
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
void test('older price workbook updates only products present in the current catalog', async () => {
  const report = await inspectPriceWorkbook(
    await readFile('PRICE KINGSTORE, APPGRADE 14.19.xlsx'),
    basePrices,
  );
  assert.deepEqual(report.errors, []);
  assert.ok(report.matched > 100);
  assert.ok(report.matched < 477);
  assert.ok(report.changes.every((change) => catalogItems.some((item) => item.id === change.id)));
  assert.ok(report.warnings.some((warning) => warning.includes("\u043d\u0435\u0442 \u0442\u043e\u0432\u0430\u0440\u0430 \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0435")));
});
void test('Site Appgrade sheet uses articles, final prices and blocks incomplete catalog matches', async () => {
  const book = new ExcelJS.Workbook();
  book.addWorksheet('\u0421\u0430\u0439\u0442 \u0410\u043f\u043f\u0433\u0440\u0435\u0439\u0434').addRows([
    ['\u0410\u0440\u0442\u0438\u043a\u0443\u043b', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435', '\u0426\u0435\u043d\u0430'],
    ['P-58689282', 'Xiaomi 15 12/256 Green', 55990],
    ['P-58689282-OLD', 'Xiaomi 15 12/256 Green', 1],
    ['P-UNKNOWN', 'Unknown product', 1999],
    ['P-UNKNOWN-2', 'Another missing product', 1999],
  ]);
  const report = await inspectPriceWorkbook(
    Buffer.from(await book.xlsx.writeBuffer()),
    basePrices,
  );
  assert.equal(report.inputRows, 4);
  assert.equal(report.matched, 1);
  assert.equal(report.matchedRows, 2);
  assert.equal(report.unmatchedRows, 2);
  assert.equal(report.unavailableRows, 1);
  assert.equal(report.changes[0].id, 'xiaomi-15-256-gb-green');
  assert.ok(report.changes[0].source.includes('P-58689282'));
  assert.ok(report.errors.some((error) => error.includes('Import is blocked')));
});
void test('Site Appgrade article links map once and remain usable without the extra SKU column', async () => {
  const rows = [
    ['\u0410\u0440\u0442\u0438\u043a\u0443\u043b', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435', '\u0426\u0435\u043d\u0430', 'SKU \u0441\u0430\u0439\u0442\u0430'],
    ['P-ONE', 'Vendor name differs', 54990, 'xiaomi-15-256-gb-green'],
    ['P-TWO', 'Another vendor name', 16990, 'parser-sheet1-1394'],
  ];
  const first = await inspect(rows, '\u0421\u0430\u0439\u0442 \u0410\u043f\u043f\u0433\u0440\u0435\u0439\u0434');
  assert.deepEqual(first.errors, []);
  assert.equal(first.matchedRows, 2);
  assert.deepEqual(first.articleMappings, {
    'P-ONE': 'xiaomi-15-256-gb-green',
    'P-TWO': 'parser-sheet1-1394',
  });
  const next = await inspect([
    ['\u0410\u0440\u0442\u0438\u043a\u0443\u043b', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435', '\u0426\u0435\u043d\u0430'],
    ['P-ONE', 'Vendor name differs', 55990],
    ['P-TWO', 'Another vendor name', 17990],
  ], '\u0421\u0430\u0439\u0442 \u0410\u043f\u043f\u0433\u0440\u0435\u0439\u0434', first.articleMappings);
  assert.deepEqual(next.errors, []);
  assert.equal(next.matchedRows, 2);
  assert.equal(next.changes.length, 2);
});
void test('Site Appgrade keeps unpriced catalog rows as references without importing them', async () => {
  const report = await inspect([
    ['Артикул', 'Название', 'Цена', 'Site SKU'],
    ['P-58689282', 'Xiaomi 15 256 Green', 54990, 'xiaomi-15-256-gb-green'],
    ['', 'iPhone 17 256 Black', null, 'iphone-17-256-esim-black'],
  ], 'Сайт Аппгрейд');
  assert.deepEqual(report.errors, []);
  assert.equal(report.inputRows, 1);
  assert.equal(report.matchedRows, 1);
  assert.equal(report.matched, 1);
  assert.deepEqual(report.articleMappings, { 'P-58689282': 'xiaomi-15-256-gb-green' });
  assert.deepEqual(report.warnings, []);
});
void test('explicit color and SIM update only the exact variant', async () => {
  const report = await inspect([
    ['Модель', 'Цена'],
    ['iPhone 17 256 eSim Black', 70123],
  ]);
  assert.equal(report.changes.length, 1);
  assert.equal(report.changes[0].id, 'iphone-17-256-esim-black');
});
void test('every price-list article imports without a separate SKU column', async () => {
  const report = await inspect([
    ['Артикул', 'Название', 'Цена'],
    ...newPriceSource.map(row => [row.article, row.title, row.price]),
  ], 'Сайт Аппгрейд');
  assert.deepEqual(report.errors, []);
  assert.equal(report.inputRows, 1591);
  assert.equal(report.matchedRows, 1572);
  assert.equal(report.hiddenRows, 19);
  assert.equal(report.unmatchedRows ?? 0, 0);
});
void test('city import includes prices that differ in any selected city', async () => {
  const id = 'iphone-17-256-esim-black';
  const base = basePrices[id];
  assert.equal(typeof base, 'number');
  const book = new ExcelJS.Workbook();
  book.addWorksheet('iPhone').addRows([
    ['Модель', 'Цена'],
    ['iPhone 17 256 eSim Black', base],
  ]);
  const buffer = Buffer.from(await book.xlsx.writeBuffer());
  const report = await inspectPriceWorkbook(buffer, basePrices, {
    cities: ['beloretsk', 'troitsk'],
    cityPrices: { [id]: { troitsk: Number(base) + 100 } },
  });
  assert.deepEqual(report.errors, []);
  assert.equal(report.changes.length, 1);
  assert.equal(report.changes[0].id, id);
  assert.equal(report.changes[0].before, null);
  assert.equal(report.changes[0].after, base);
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
  assert.ok(report.errors.some((e) => e.includes("\u0440\u0430\u0437\u043d\u044b\u0435 \u0446\u0435\u043d\u044b")));
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
