import { readFile } from 'node:fs/promises';
import { basePrices } from '@/lib/catalog-registry';
import { inspectPriceWorkbook } from '@/lib/server/price-import';
import { reportText } from '@/bots/price-bot';
const filename = process.argv[2] || 'PRICE KINGSTORE, APPGRADE 14.19.xlsx';
const report = await inspectPriceWorkbook(await readFile(filename), basePrices);
console.log(reportText(report));
if (report.errors.length) process.exitCode = 1;
