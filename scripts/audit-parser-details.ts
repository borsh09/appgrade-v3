import { writeFile } from 'node:fs/promises';
import { catalogItems } from '../lib/catalog-registry';
import { getProductDetails } from '../lib/product-details';
import parserRows from '../data/parser-catalog.json';
import supplierDetails from '../data/parser-details.json';

const sourceByModel = new Map<string, { source: string; name: string; specs: string[][] }>();
for (const row of parserRows) {
  const source = (supplierDetails as Record<string, { source: string; name: string; specs: string[][] }>)[row.id];
  if (source && !sourceByModel.has(row.modelSlug)) sourceByModel.set(row.modelSlug, source);
}
const imported = catalogItems.filter(item => item.id.startsWith('parser-sheet1-'));
const conflicts: Record<string, { reason: string; verificationSource: string }> = {
  'parser-sheet1-997': {
    reason: 'Артикул MWR43 указан Apple для Magic Keyboard к iPad Pro 13, а в таблице написано iPad Air 13.',
    verificationSource: 'https://www.apple.com/education/pricelists/pdfs/Apple_US_Education_Institution_Price_List.pdf',
  },
  'parser-sheet1-1294': {
    reason: 'Артикул MQ052 указан Apple для Magic Keyboard with Numeric Keypad без Touch ID; название в таблице противоречит артикулу.',
    verificationSource: 'https://salesdownload.apple.com/public/sites/asw/common/compliance/index.htm',
  },
};
const review = imported.filter(item => getProductDetails(item).limitedSpecs).map(item => {
  const source = sourceByModel.get(item.modelSlug);
  return {
    id: item.id,
    title: item.priceAlias,
    category: item.category,
    reason: conflicts[item.id]?.reason ?? (!source ? 'Нет источника' : source.specs.length <= 2 ? 'У поставщика нет технических параметров' : 'Название модели у поставщика требует проверки'),
    supplierName: source?.name ?? null,
    source: source?.source ?? null,
    verificationSource: conflicts[item.id]?.verificationSource ?? null,
  };
});
const report = {
  imported: imported.length,
  withTechnicalSpecifications: imported.length - review.length,
  needsReview: review.length,
  review,
};
await writeFile('data/parser-details-review.json', JSON.stringify(report, null, 2) + '\n');
console.log(`${report.withTechnicalSpecifications}/${report.imported} новых карточек с техническими характеристиками; ${report.needsReview} требуют проверки источника.`);
