import ExcelJS from 'exceljs';
import { assertSafeWorkbookArchive } from './xlsx-guard';
import {
  catalogItems,
  hiddenCatalogArticles,
  normalizeProductName,
  priceAliases,
} from '../catalog-registry';

export type PriceChange = {
  id: string;
  name: string;
  before: number | null;
  after: number;
  source: string;
};
export type ImportReport = {
  changes: PriceChange[];
  matched: number;
  matchedRows?: number;
  unchanged: number;
  inputRows?: number;
  unmatchedRows?: number;
  unavailableRows?: number;
  hiddenRows?: number;
  articleMappings?: Record<string, string>;
  warnings: string[];
  errors: string[];
};
const sheets: Record<string, number> = {
  iphone: 2,
  macbook: 2,
  ipad: 2,
  'apple watch': 2,
  airpods: 2,
  'samsung s': 2,
  playstation: 2,
  google: 3,
  xiaomi: 3,
  fujifilm: 3,
  dyson: 2,
  'marshall , jbl': 2,
  yandex: 2,
};

// Evaluate the simple arithmetic used by this price workbook instead of trusting
// stale cached formula results after the purchase-price cell has been edited.
export function numericCell(
  cell: ExcelJS.Cell,
  visiting = new Set<string>(),
): number {
  if (visiting.has(cell.address) || visiting.size > 20)
    throw new Error('Циклическая формула');
  if (!cell.formula) {
    if (typeof cell.value === 'number' && Number.isFinite(cell.value))
      return cell.value;
    throw new Error('Цена отсутствует или не является числом');
  }
  visiting.add(cell.address);
  try {
    const expression = cell.formula
      .replace(/^=/, '')
      .replace(/\$?([A-Z]+)\$?(\d+)/gi, (_, col, row) => {
        return String(
          numericCell(cell.worksheet.getCell(`${col}${row}`), visiting),
        );
      })
      .replace(/\s/g, '');
    const tokens = expression.match(/\d+(?:\.\d+)?|[()+*/%-]/g) ?? [];
    if (tokens.join('') !== expression || tokens.length > 100)
      throw new Error('Неподдерживаемая формула');
    let pos = 0;
    const atom = (): number => {
      const token = tokens[pos++];
      let value: number;
      if (token === '(') {
        value = sum();
        if (tokens[pos++] !== ')') throw new Error('Ошибка формулы');
      } else if (token === '-') value = -atom();
      else if (token === '+') value = atom();
      else if (token && /^\d/.test(token)) value = Number(token);
      else throw new Error('Ошибка формулы');
      if (tokens[pos] === '%') {
        pos++;
        value /= 100;
      }
      return value;
    };
    const product = (): number => {
      let value = atom();
      while (tokens[pos] === '*' || tokens[pos] === '/') {
        const op = tokens[pos++];
        const next = atom();
        value = op === '*' ? value * next : value / next;
      }
      return value;
    };
    const sum = (): number => {
      let value = product();
      while (tokens[pos] === '+' || tokens[pos] === '-') {
        const op = tokens[pos++];
        const next = product();
        value = op === '+' ? value + next : value - next;
      }
      return value;
    };
    const result = sum();
    if (pos !== tokens.length || !Number.isFinite(result))
      throw new Error('Ошибка формулы');
    return result;
  } finally {
    visiting.delete(cell.address);
  }
}

export async function inspectPriceWorkbook(
  buffer: Buffer,
  prices: Record<string, number | null>,
  target?: { cities: string[]; cityPrices: Record<string, Record<string, number>> },
  articleMap: Record<string, string> = {},
): Promise<ImportReport> {
  if (buffer.length > 10 * 1024 * 1024)
    throw new Error('Файл должен быть не больше 10 МБ');
  assertSafeWorkbookArchive(buffer);
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(
    buffer as unknown as Parameters<typeof book.xlsx.load>[0],
  );
  const report: ImportReport = {
    changes: [],
    matched: 0,
    matchedRows: 0,
    unchanged: 0,
    articleMappings: {},
    warnings: [],
    errors: [],
  };
  const aliases = new Map<string, typeof catalogItems>();
  const catalogArticles = new Map(catalogItems.filter(item => item.article).map(item => [item.article!, item.id]));
  for (const item of catalogItems)
    for (const alias of priceAliases(item)) {
      aliases.set(alias, [...(aliases.get(alias) ?? []), item]);
    }
  const modelNameCounts = new Map<string, number>();
  for (const item of catalogItems) {
    const key = normalizeProductName(item.model);
    modelNameCounts.set(key, (modelNameCounts.get(key) ?? 0) + 1);
  }
  for (const item of catalogItems) {
    if (item.storage || item.ram || item.sim || item.size || item.connectivity) continue;
    const key = normalizeProductName(item.model);
    if (modelNameCounts.get(key) === 1)
      aliases.set(key, [...(aliases.get(key) ?? []), item]);
  }
  const proposed = new Map<
    string,
    { price: number; source: string; specificity: number }
  >();
  const websiteSheet = book.worksheets.find((sheet) =>
    sheet.name.trim().toLowerCase() === '\u0441\u0430\u0439\u0442 \u0430\u043f\u043f\u0433\u0440\u0435\u0439\u0434'
    && normalizeProductName(sheet.getRow(1).getCell(1).text) === '\u0430\u0440\u0442\u0438\u043a\u0443\u043b'
    && normalizeProductName(sheet.getRow(1).getCell(2).text) === '\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'
    && normalizeProductName(sheet.getRow(1).getCell(3).text) === '\u0446\u0435\u043d\u0430',
  );
  const articleMapColumn = websiteSheet
    ? Array.from({ length: Math.max(0, websiteSheet.columnCount - 3) }, (_, index) => index + 4)
        .find((column) => {
          const header = websiteSheet.getRow(1).getCell(column).text.trim().toLowerCase();
          return header.includes('sku сайта') || ['site sku', 'catalog sku'].includes(header);
        })
    : undefined;
  const priceSheets = websiteSheet ? [websiteSheet] : book.worksheets;
  for (const sheet of priceSheets) {
    const isWebsiteSheet = sheet === websiteSheet;
    const column = isWebsiteSheet ? 3 : sheets[sheet.name.trim().toLowerCase()];
    if (!column) {
      report.warnings.push(
        `Лист «${sheet.name}» пропущен: нет настроенного сопоставления.`,
      );
      continue;
    }
    if (sheet.rowCount > 5000 || sheet.columnCount > 100)
      throw new Error('Слишком большой лист прайса');
    sheet.eachRow((row, rowNumber) => {
      if (isWebsiteSheet && rowNumber === 1) return;
      const article = isWebsiteSheet ? row.getCell(1).text.trim() : '';
      const title = row.getCell(isWebsiteSheet ? 2 : 1).text.trim();
      if (!title) return;
      const cell = row.getCell(column);
      if (isWebsiteSheet && (cell.value === null || (typeof cell.value === 'string' && !cell.value.trim()))) return;
      if (isWebsiteSheet && !article) {
        report.errors.push(`${sheet.name}!${row.number}: missing product article.`);
        return;
      }
      if (isWebsiteSheet) report.inputRows = (report.inputRows ?? 0) + 1;
      if (isWebsiteSheet && hiddenCatalogArticles.has(article)) {
        report.hiddenRows = (report.hiddenRows ?? 0) + 1;
        return;
      }
      const source = `${sheet.name}!${row.getCell(column).address}${article ? ` (${article})` : ''}`;
      const key = normalizeProductName(title);
      const explicitSku = isWebsiteSheet && articleMapColumn
        ? row.getCell(articleMapColumn).text.trim()
        : '';
      if (explicitSku && !catalogItems.some((item) => item.id === explicitSku)) {
        report.errors.push(`${source}: invalid site SKU "${explicitSku}".`);
        return;
      }
      const builtInSku = isWebsiteSheet ? catalogArticles.get(article) : undefined;
      if (explicitSku && builtInSku && explicitSku !== builtInSku) {
        report.errors.push(`${source}: site SKU conflicts with catalog article mapping.`);
        return;
      }
      const mappedSku = builtInSku || explicitSku || (isWebsiteSheet ? articleMap[article] : undefined);
      const rawMatches = mappedSku
        ? catalogItems.filter((item) => item.id === mappedSku)
        : aliases.get(key);
      const matches = rawMatches
        ? [...new Map(rawMatches.map((item) => [item.id, item])).values()]
        : undefined;
      if (!matches?.length) {
        if (isWebsiteSheet) {
          report.unmatchedRows = (report.unmatchedRows ?? 0) + 1;
          if (report.warnings.length < 20)
            report.warnings.push(`${source}: "${title}" - product is not mapped to the site catalog.`);
        } else if (cell.value !== null && rowNumber > 1) {
          report.warnings.push(
            `${source}: «${title}» — нет товара в каталоге.`,
          );
        }
        return;
      }
      if (isWebsiteSheet) {
        if (matches.length !== 1) {
          report.errors.push(`${source}: multiple site SKUs match this article; select one SKU explicitly.`);
          return;
        }
        report.matchedRows = (report.matchedRows ?? 0) + 1;
        const previousSku = report.articleMappings?.[article];
        if (previousSku && previousSku !== matches[0].id) {
          report.errors.push(`${source}: article is linked to more than one site SKU.`);
          return;
        }
        report.articleMappings![article] = matches[0].id;
      }
      let price: number;
      try {
        price = Math.round(numericCell(cell));
      } catch {
        report.warnings.push(
          `${source}: «${title}» — нет корректной цены, старая сохранится.`,
        );
        return;
      }
      if (!Number.isSafeInteger(price) || price <= 0 || price > 10_000_000) {
        report.errors.push(`${source}: недопустимая цена для «${title}».`);
        return;
      }
      if (isWebsiteSheet && price <= 1) {
        report.unavailableRows = (report.unavailableRows ?? 0) + 1;
        return;
      }
      for (const item of matches) {
        const specificity = key.endsWith(normalizeProductName(item.color))
          ? 1
          : 0;
        const previous = proposed.get(item.id);
        if (
          previous &&
          previous.specificity === specificity &&
          previous.price !== price
        ) {
          report.errors.push(
            `${source} и ${previous.source}: разные цены для ${item.id}.`,
          );
        } else if (!previous || specificity >= previous.specificity) {
          proposed.set(item.id, { price, source, specificity });
        }
      }
    });
  }
  if (websiteSheet) {
    if ((report.unmatchedRows ?? 0) > 20)
      report.warnings.push(`Additional unmatched rows: ${(report.unmatchedRows ?? 0) - 20}.`);
  }
  for (const item of catalogItems) {
    const proposal = proposed.get(item.id);
    if (!proposal) continue;
    report.matched++;
    const baseBefore = prices[item.id] ?? item.price;
    const cityBefore = target?.cities.map((city) => target.cityPrices[item.id]?.[city] ?? baseBefore) ?? [];
    const before = cityBefore.length && cityBefore.every((price) => price === cityBefore[0])
      ? cityBefore[0]
      : cityBefore.length ? null : baseBefore;
    const unchanged = cityBefore.length
      ? cityBefore.every((price) => price === proposal.price)
      : baseBefore === proposal.price;
    if (unchanged) report.unchanged++;
    else
      report.changes.push({
        id: item.id,
        name: `${item.model} ${item.storage ?? ''} ${item.color}`.trim(),
        before,
        after: proposal.price,
        source: proposal.source,
      });
  }
  if (websiteSheet && (report.inputRows ?? 0) > 0 && (report.matchedRows ?? 0) / report.inputRows! < 0.8)
    report.errors.push(`Only ${report.matchedRows ?? 0} of ${report.inputRows} rows in Site Appgrade matched the catalog. Import is blocked until product articles are linked to catalog SKUs.`);
  if (!report.matched)
    report.errors.push('Не найдено ни одной позиции с корректной ценой.');
  return report;
}
