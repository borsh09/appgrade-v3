import ExcelJS from 'exceljs';
import { readFile, writeFile } from 'node:fs/promises';
import parserRows from '../data/parser-catalog.json';

type SourceDetail = { source: string; name: string; specs: [string, string][] };
type ReportRow = { row: number; sku: string; title: string };
const file = 'data/parser-details.json';
const report = JSON.parse(await readFile('data/parser-import-report.json', 'utf8')) as { rows: ReportRow[] };
const saved = JSON.parse(await readFile(file, 'utf8').catch(() => '{}')) as Record<string, SourceDetail>;
const book = new ExcelJS.Workbook();
await book.xlsx.readFile('Парсер.xlsx');
const sheet = book.getWorksheet('Лист1');
if (!sheet) throw new Error('Лист1 не найден');

const decode = (value: string) => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
  .replace(/&#x([a-f\d]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&(?:nbsp|#160);/gi, ' ')
  .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ').trim();
const sourceUrl = (row: number): string | null => {
  for (const column of [3, 2, 4]) {
    const cell = sheet.getRow(row).getCell(column).value;
    const value = typeof cell === 'string' ? cell : cell && typeof cell === 'object' && 'hyperlink' in cell ? cell.hyperlink : null;
    if (typeof value !== 'string') continue;
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && url.hostname === 'mgg.stores-apple.com') return url.href;
    } catch { /* Damaged link. */ }
  }
  return null;
};
function readDetail(html: string, source: string): SourceDetail | null {
  const name = decode(html.match(/<meta\s+itemprop="name"\s+content="([^"<>]+)"/)?.[1] ?? '');
  const specs: [string, string][] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/<tr\b[^>]*itemprop="additionalProperty"[^>]*>([\s\S]*?)<\/tr>/g)) {
    const row = match[1];
    const label = decode(row.match(/<span\b[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
    const value = decode(row.match(/<span\b[^>]*itemprop="value"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '');
    if (!label || !value || value === '—' || value.length > 500 || seen.has(label)) continue;
    seen.add(label);
    specs.push([label, value]);
  }
  // Some supplier pages only publish the compact set beside the image.
  if (!specs.length) {
    for (const block of html.split(/<div class="properties__item\b/).slice(1)) {
      const label = decode(block.match(/js-prop-title[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '');
      const value = decode(block.match(/js-prop-value[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '');
      if (!label || !value || seen.has(label)) continue;
      seen.add(label); specs.push([label, value]);
    }
  }
  return name && specs.length ? { source, name, specs } : null;
}

const modelById = new Map(parserRows.map(row => [row.id, row.modelSlug]));
let targets = [...new Map(report.rows.filter(row => row.sku).map(row => [row.sku, row])).values()]
  .filter(row => !saved[row.sku]?.specs?.length)
  .map(row => ({ ...row, url: sourceUrl(row.row) }))
  .filter((row): row is ReportRow & { url: string } => !!row.url);
if (process.argv.includes('--models')) {
  const seen = new Set<string>();
  targets = targets.filter(row => {
    const model = modelById.get(row.sku);
    if (!model || seen.has(model)) return false;
    seen.add(model);
    return true;
  });
}
const limit = Number(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] ?? Infinity);
const count = Math.min(targets.length, limit);
let cursor = 0, processed = 0, added = 0;
const failures: Record<string, string> = {};
async function worker() {
  while (cursor < count) {
    const row = targets[cursor++];
    try {
      const response = await fetch(row.url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; APPGRADE catalog details importer)' }, signal: AbortSignal.timeout(30_000) });
      if (!response.ok || new URL(response.url).hostname !== 'mgg.stores-apple.com') throw new Error(`HTTP ${response.status}`);
      const detail = readDetail(await response.text(), row.url);
      if (!detail) throw new Error('Нет характеристик');
      saved[row.sku] = detail; added++;
    } catch (error) { failures[row.sku] = error instanceof Error ? error.message : String(error); }
    processed++;
    if (processed % 25 === 0 || processed === count) {
      await writeFile(file, JSON.stringify(saved, null, 2) + '\n');
      console.log(`${processed}/${count}; с характеристиками ${Object.keys(saved).length}; ошибок ${Object.keys(failures).length}`);
    }
  }
}
console.log(`Доступно ссылок поставщика: ${targets.length}; загрузка: ${count}`);
await Promise.all(Array.from({ length: Math.min(8, count) }, worker));
await writeFile('data/parser-details-failures.json', JSON.stringify(failures, null, 2) + '\n');
