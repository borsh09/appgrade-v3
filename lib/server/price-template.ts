import ExcelJS from 'exceljs';
import { catalogItems, type CatalogItem } from '../catalog-registry';

function productBrand(item: CatalogItem) {
  if (item.brand) return item.brand;
  const category = item.sourceCategory ?? '';
  const groups: [RegExp, string][] = [
    [/iPhone|iPad|Macbook|Mac Mini|iMac|AirPods|Apple/i, 'Apple'],
    [/Galaxy|Samsung/i, 'Samsung'], [/Vacuum Cleaner|Purifier|Dyson/i, 'Dyson'],
    [/Pixel|Google/i, 'Google'], [/PlayStation|Sony/i, 'Sony'],
    [/Steam/i, 'Valve'], [/Xbox/i, 'Microsoft'], [/Oculus/i, 'Meta'],
    [/Fujifilm/i, 'Fujifilm'], [/B&W/i, 'Bowers & Wilkins'],
    [/Harman/i, 'Harman Kardon'], [/Poco/i, 'POCO'], [/Redmi/i, 'Redmi'],
    [/Xiaomi|^Mi$/i, 'Xiaomi'], [/RedMagic/i, 'REDMAGIC'],
  ];
  const group = groups.find(([pattern]) => pattern.test(category));
  if (group) return group[1];
  const brands = ['Яндекс', 'Amazon', 'Bang & Olufsen', 'Beats', 'Bose', 'Canon', 'DJI', 'Garmin', 'GoPro', 'Honor', 'Huawei', 'Infinix', 'Insta360', 'JBL', 'Kodak', 'Marshall', 'Nintendo', 'Nothing', 'OnePlus', 'Oura', 'Plaud', 'Ray-Ban', 'Realme', 'Tecno', 'VIVO', 'XREAL'];
  return brands.find(brand => category.toLowerCase().includes(brand.toLowerCase())) ?? '';
}

export async function createPriceTemplate() {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet('Сайт Аппгрейд', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: 'Бренд', key: 'brand', width: 22 },
    { header: 'Название', key: 'name', width: 110 },
    { header: 'Артикул', key: 'article', width: 20 },
    { header: 'Цена', key: 'price', width: 18 },
  ];
  sheet.addRows(catalogItems.map(item => ({
    brand: productBrand(item),
    name: item.sourceTitle || item.priceAlias || [item.model, item.storage, item.color, item.sim].filter(Boolean).join(' '),
    article: item.article,
    price: null,
  })));
  sheet.getColumn('article').numFmt = '@';
  sheet.getColumn('price').numFmt = '#,##0';
  sheet.autoFilter = `A1:D${sheet.rowCount}`;
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF243746' } };
  sheet.getRow(1).height = 26;
  return Buffer.from(await book.xlsx.writeBuffer());
}
