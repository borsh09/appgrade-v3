import ExcelJS from 'exceljs';
import { catalogItems } from '../lib/catalog-registry';
import { getPrices } from '../lib/server/prices';
import sourceRows from '../data/new-price-source.json';

const input = process.argv[2] ?? 'C:/Users/borsh/Downloads/Парсер (1).xlsx';
const output = process.argv[3] ?? 'outputs/price_import_20260930/Парсер — товары сайта.xlsx';
const byArticle = new Map(sourceRows.map(row => [row.article, row]));

function brandFor(category: string, model: string): string {
  const value = category.toLowerCase();
  if (/яндекс/.test(value)) return 'Яндекс';
  if (/amazon/.test(value)) return 'Amazon';
  if (/macbook|airpods|iphone|ipad|apple|imac|mac mini/.test(value)) return 'Apple';
  if (/bang & olufsen/.test(value)) return 'Bang & Olufsen';
  if (/beats/.test(value)) return 'Beats';
  if (/bose/.test(value)) return 'Bose';
  if (/b&w/.test(value)) return 'Bowers & Wilkins';
  if (/canon/.test(value)) return 'Canon';
  if (/dji/.test(value)) return 'DJI';
  if (/dyson|vacuum cleaner|purifier/.test(value)) return 'Dyson';
  if (/fujifilm/.test(value)) return 'Fujifilm';
  if (/garmin/.test(value)) return 'Garmin';
  if (/pixel|google/.test(value)) return 'Google';
  if (/gopro/.test(value)) return 'GoPro';
  if (/harman/.test(value)) return 'Harman/Kardon';
  if (/honor/.test(value)) return 'Honor';
  if (/huawei/.test(value)) return 'Huawei';
  if (/infinix/.test(value)) return 'Infinix';
  if (/insta360/.test(value)) return 'Insta360';
  if (/jbl/.test(value)) return 'JBL';
  if (/kodak/.test(value)) return 'Kodak';
  if (/marshall/.test(value)) return 'Marshall';
  if (/oculus/.test(value)) return 'Meta';
  if (/nintendo/.test(value)) return 'Nintendo';
  if (/nothing/.test(value)) return 'Nothing';
  if (/oneplus/.test(value)) return 'OnePlus';
  if (/oura/.test(value)) return 'Oura';
  if (/plaud/.test(value)) return 'Plaud';
  if (/poco/.test(value)) return 'POCO';
  if (/ray-ban/.test(value)) return 'Ray-Ban';
  if (/realme/.test(value)) return 'Realme';
  if (/galaxy|samsung/.test(value)) return 'Samsung';
  if (/sony|playstation/.test(value)) return 'Sony';
  if (/tecno/.test(value)) return 'Tecno';
  if (/steam deck/.test(value)) return 'Valve';
  if (/vivo/.test(value)) return 'Vivo';
  if (/xbox/.test(value)) return 'Microsoft';
  if (/redmi/.test(value)) return 'Redmi';
  if (/xiaomi|^mi$/.test(value)) return 'Xiaomi';
  if (/xreal/.test(value)) return 'XREAL';
  if (/redmagic/.test(value)) return 'RedMagic';
  return model.split(/\s+/)[0] || 'Не указан';
}

const book = new ExcelJS.Workbook();
await book.xlsx.readFile(input);
const existing = book.getWorksheet('Товары сайта');
if (existing) book.removeWorksheet(existing.id);
const sheet = book.addWorksheet('Товары сайта', { views: [{ state: 'frozen', ySplit: 1 }] });
sheet.columns = [
  { header: 'SKU сайта', key: 'sku', width: 38 },
  { header: 'Артикул прайса', key: 'article', width: 20 },
  { header: 'Бренд', key: 'brand', width: 24 },
  { header: 'Модель', key: 'model', width: 64 },
  { header: 'Цена, ₽', key: 'price', width: 18 },
];
const prices = (await getPrices()).prices;
for (const item of catalogItems) {
  if (!item.article) throw new Error(`Missing article for site SKU ${item.id}`);
  const source = byArticle.get(item.article);
  if (!source) throw new Error(`Missing source row for article ${item.article}`);
  const price = prices[item.id] ?? item.price;
  sheet.addRow({ sku: item.id, article: item.article, brand: brandFor(source.category, item.model), model: item.model, price });
}
sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF153A55' } };
sheet.getRow(1).alignment = { vertical: 'middle' };
sheet.getRow(1).height = 25;
sheet.getColumn(5).numFmt = '#,##0" ₽"';
sheet.autoFilter = `A1:E${sheet.rowCount}`;
if (sheet.rowCount !== catalogItems.length + 1) throw new Error('Export row count mismatch');
await book.xlsx.writeFile(output);
console.log(`Exported ${catalogItems.length} site products to ${output}`);
