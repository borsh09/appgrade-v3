import fs from 'node:fs';
import ExcelJS from 'exceljs';

const source = process.argv[2] ?? fs.readdirSync('.').find(name => name.includes('Trade 1.xlsx'));
if (!source) throw new Error('Trade-In workbook not found');

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(source);
const sheet = workbook.worksheets[0];
if (!sheet) throw new Error('Trade-In workbook has no sheets');

const text = value => {
  if (value && typeof value === 'object' && 'richText' in value) {
    return value.richText.map(part => part.text).join('').trim();
  }
  return String(value ?? '').trim();
};

const price = raw => {
  const numbers = [...raw.matchAll(/\d[\d\s]*/g)].map(match => Number(match[0].replace(/\s/g, '')));
  if (/по запросу/i.test(raw)) return { minPrice: /^от\s/i.test(raw) && numbers.length ? numbers[0] : null, maxPrice: null };
  if (/^до\s/i.test(raw) && numbers.length === 1) return { minPrice: null, maxPrice: numbers[0] };
  if (numbers.length === 2 && numbers[0] <= numbers[1]) return { minPrice: numbers[0], maxPrice: numbers[1] };
  throw new Error(`Unrecognized price: ${raw}`);
};

const battery = raw => {
  if (/по запросу/i.test(raw)) return { minBattery: null, maxBattery: null };
  const numbers = [...raw.matchAll(/\d+/g)].map(match => Number(match[0]));
  if (/^до\s/i.test(raw) && numbers.length === 1) return { minBattery: 0, maxBattery: numbers[0] };
  if (numbers.length === 2 && numbers[0] <= numbers[1]) return { minBattery: numbers[0], maxBattery: numbers[1] };
  throw new Error(`Unrecognized battery range: ${raw}`);
};

const rows = [];
for (let number = 3; number <= sheet.rowCount; number += 1) {
  const row = sheet.getRow(number);
  const name = text(row.getCell(1).value).replace(/\s+/g, ' ');
  if (!name) continue;
  const storageRaw = text(row.getCell(2).value);
  const batteryRaw = text(row.getCell(3).value);
  const priceRaw = text(row.getCell(4).value);
  if (!storageRaw || !batteryRaw || !priceRaw) throw new Error(`Incomplete Trade-In row ${number}`);
  const simMatch = name.match(/\s+(sim\/esim|esim)$/i);
  const model = simMatch ? name.slice(0, -simMatch[0].length) : name;
  const sim = simMatch ? (/^esim$/i.test(simMatch[1]) ? 'eSIM' : 'SIM / eSIM') : null;
  const storage = /и выше/i.test(storageRaw) ? '64 ГБ и выше'
    : /tb/i.test(storageRaw) ? '1 ТБ'
      : `${Number(storageRaw)} ГБ`;
  if (storage.includes('NaN')) throw new Error(`Unrecognized storage in row ${number}`);
  rows.push({
    id: number, model, storage, sim,
    ...battery(batteryRaw), ...price(priceRaw),
    batteryLabel: batteryRaw, priceLabel: priceRaw,
  });
}

fs.writeFileSync('data/trade-in-prices.json', `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Imported ${rows.length} Trade-In variants from ${source}`);
