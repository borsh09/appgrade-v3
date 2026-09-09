import ExcelJS from 'exceljs';
import {
  catalogItems,
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
  unchanged: number;
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
): Promise<ImportReport> {
  if (buffer.length > 10 * 1024 * 1024)
    throw new Error('Файл должен быть не больше 10 МБ');
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(
    buffer as unknown as Parameters<typeof book.xlsx.load>[0],
  );
  const report: ImportReport = {
    changes: [],
    matched: 0,
    unchanged: 0,
    warnings: [],
    errors: [],
  };
  const aliases = new Map<string, typeof catalogItems>();
  for (const item of catalogItems)
    for (const alias of priceAliases(item)) {
      aliases.set(alias, [...(aliases.get(alias) ?? []), item]);
    }
  const proposed = new Map<
    string,
    { price: number; source: string; specificity: number }
  >();
  for (const sheet of book.worksheets) {
    const column = sheets[sheet.name.trim().toLowerCase()];
    if (!column) {
      report.warnings.push(
        `Лист «${sheet.name}» пропущен: нет настроенного сопоставления.`,
      );
      continue;
    }
    if (sheet.rowCount > 5000 || sheet.columnCount > 100)
      throw new Error('Слишком большой лист прайса');
    sheet.eachRow((row, rowNumber) => {
      const title = row.getCell(1).text.trim();
      if (!title) return;
      const source = `${sheet.name}!${row.getCell(column).address}`;
      const key = normalizeProductName(title);
      const matches = aliases.get(key);
      const cell = row.getCell(column);
      if (!matches) {
        if (cell.value !== null && rowNumber > 1)
          report.warnings.push(
            `${source}: «${title}» — нет товара в каталоге.`,
          );
        return;
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
  for (const item of catalogItems) {
    const proposal = proposed.get(item.id);
    if (!proposal) continue;
    report.matched++;
    const before = prices[item.id] ?? item.price;
    if (before === proposal.price) report.unchanged++;
    else
      report.changes.push({
        id: item.id,
        name: `${item.model} ${item.storage ?? ''} ${item.color}`.trim(),
        before,
        after: proposal.price,
        source: proposal.source,
      });
  }
  if (!report.matched)
    report.errors.push('Не найдено ни одной позиции с корректной ценой.');
  return report;
}
