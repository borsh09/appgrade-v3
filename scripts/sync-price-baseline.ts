import { readFile, writeFile } from 'node:fs/promises';
import { basePrices } from '../lib/catalog-registry';
import { inspectPriceWorkbook } from '../lib/server/price-import';
const report = await inspectPriceWorkbook(await readFile('PRICE KINGSTORE, APPGRADE 14.19.xlsx'), basePrices);
if(report.errors.length) throw new Error(report.errors.join('\n'));
const previous=JSON.parse(await readFile('data/price-baseline.json','utf8'));
for(const change of report.changes) previous[change.id]=change.after;
await writeFile('data/price-baseline.json',JSON.stringify(previous,null,2)+'\n');
console.log(`Synchronized ${report.changes.length} base prices. Missing prices were preserved.`);
