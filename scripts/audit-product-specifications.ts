import { mkdirSync, writeFileSync } from 'node:fs';
import { catalogItems } from '../lib/catalog-registry';
import { getProductDetails } from '../lib/product-details';

const pending = catalogItems.filter(item => getProductDetails(item).limitedSpecs);
const report = {
  date: new Date().toISOString().slice(0, 10), articles: catalogItems.length,
  withSpecificationsSection: catalogItems.length,
  withTechnicalData: catalogItems.length - pending.length,
  withConfigurationOnly: pending.length,
  pending: pending.map(item => ({ article: item.article ?? item.id, model: item.model, category: item.category })),
};
mkdirSync('docs', { recursive: true });
writeFileSync('docs/product-specifications-coverage.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, pending: undefined }));
