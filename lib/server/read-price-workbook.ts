import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { assertSafeWorkbookArchive } from './xlsx-guard';

// ExcelJS expects unprefixed SpreadsheetML tags. Some valid Excel writers
// (including the desktop template) emit the same namespace with an x: prefix.
export async function readPriceWorkbook(buffer: Buffer) {
  assertSafeWorkbookArchive(buffer);
  const archive = await JSZip.loadAsync(buffer);
  let changed = false;
  for (const entry of Object.values(archive.files)) {
    if (/^xl\/worksheets\/_rels\/[^/]+\.rels$/.test(entry.name)) {
      const relationships = await entry.async('string');
      const relative = relationships.replace(/Target="\/xl\/tables\//g, 'Target="../tables/');
      if (relative !== relationships) { archive.file(entry.name, relative); changed = true; }
    }
    if (!entry.name.startsWith('xl/') || !entry.name.endsWith('.xml')) continue;
    const xml = await entry.async('string');
    if (!xml.includes('xmlns:x="http://schemas.openxmlformats.org/spreadsheetml/2006/main"')) continue;
    archive.file(entry.name, xml
      .replace(/(<\/?)(?:x:)/g, '$1')
      .replace(/xmlns:x="http:\/\/schemas.openxmlformats.org\/spreadsheetml\/2006\/main"/g, 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'));
    changed = true;
  }
  const bytes = changed ? await archive.generateAsync({ type: 'nodebuffer' }) : buffer;
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(bytes as unknown as Parameters<typeof book.xlsx.load>[0]);
  return book;
}
