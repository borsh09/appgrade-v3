import ExcelJS from 'exceljs';
import { writeFile } from 'node:fs/promises';
import {
  catalogItems,
  normalizeProductName,
  priceAliases,
} from '../lib/catalog-registry';
import { numericCell } from '../lib/server/price-import';
import type { AdditionalCatalogSku } from '../data/additional-catalog';
import { iphoneCatalog } from '../data/iphone-catalog';

const book = new ExcelJS.Workbook();
await book.xlsx.readFile('PRICE KINGSTORE, APPGRADE 14.19.xlsx');
const aliases = new Set(
  catalogItems.filter((item) => !item.priceAlias).flatMap(priceAliases),
);
const config: Record<string, [string, number]> = {
  iPhone: ['iphones', 2],
  macbook: ['macbooks', 2],
  iPad: ['ipads', 2],
  'Apple Watch': ['watches', 2],
  AirPods: ['audio', 2],
  'Samsung S': ['samsung', 2],
  PlayStation: ['playstation', 2],
  Google: ['google', 3],
  Xiaomi: ['xiaomi', 3],
  Fujifilm: ['cameras', 3],
  Dyson: ['dyson', 2],
  Yandex: ['gadgets', 2],
  'Marshall , JBL': ['audio', 2],
};
const added: AdditionalCatalogSku[] = [];
for (const sheet of book.worksheets) {
  // Ray-Ban contains a duplicate Samsung S26 price list, not glasses.
  if (sheet.name === 'Ray-Ban') continue;
  const [category, column] = config[sheet.name];
  sheet.eachRow((row, index) => {
    const title = row.getCell(1).text.trim();
    if (!title || index === 1 || aliases.has(normalizeProductName(title)))
      return;

    // Section headings have no prices, formulas or purchase-price inputs.
    if (
      row.getCell(column).value === null &&
      row.getCell(2).value === null &&
      !/\d+\/(?:\d+|1TB)/.test(title)
    )
      return;
    let price: number | null = null;
    try {
      const value = Math.round(numericCell(row.getCell(column)));
      if (value > 0) price = value;
    } catch {
      /* Price is absent in the source. */
    }
    const slug = title
      .toLowerCase()
      .replace(/я/g, 'ya')
      .replace(/н/g, 'n')
      .replace(/д/g, 'd')
      .replace(/е/g, 'e')
      .replace(/к/g, 'k')
      .replace(/с/g, 's')
      .replace(/т/g, 't')
      .replace(/а/g, 'a')
      .replace(/ц/g, 'ts')
      .replace(/и/g, 'i')
      .replace(/о/g, 'o')
      .replace(/у/g, 'u')
      .replace(/м/g, 'm')
      .replace(/л/g, 'l')
      .replace(/й/g, 'y')
      .replace(/р/g, 'r')
      .replace(/п/g, 'p')
      .replace(/ч/g, 'ch')
      .replace(/ы/g, 'y')
      .replace(/в/g, 'v')
      .replace(/з/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const iphone = title.startsWith('iPhone 17 512 eSim')
      ? iphoneCatalog.find(
          (item) => item.model === 'iPhone 17' && title.endsWith(item.color),
        )
      : undefined;
    added.push({
      id: `additional-${slug}`,
      model: title.replace(/\s+/g, ' '),
      modelSlug: slug,
      color: '',
      price,
      category,
      image: iphone?.image ?? '/images/product-photo-pending.svg',
      source: `${sheet.name}!A${index}`,
      priceAlias: title,
    });
  });
}
await writeFile(
  'data/additional-catalog.json',
  JSON.stringify(added, null, 2) + '\n',
);
console.log(`Added ${added.length} product configurations`);
