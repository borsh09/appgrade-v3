import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import parserRows from '../data/parser-catalog.json';

type Item = (typeof parserRows)[number];
type Photo = { image: string; source: string };
const photoFile = 'data/parser-photo-map.json';
const failureFile = 'data/parser-photo-failures.json';
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
const concurrencyArg = process.argv.find((arg) => arg.startsWith('--concurrency='));
const concurrency = concurrencyArg ? Math.max(1, Math.min(12, Number(concurrencyArg.split('=')[1]))) : 6;
const book = new ExcelJS.Workbook();
await book.xlsx.readFile('Парсер.xlsx');
const sheet = book.getWorksheet('Лист1');
if (!sheet) throw new Error('Лист1 не найден');
const readJson = async <T>(file: string, fallback: T): Promise<T> => {
  try { return JSON.parse(await readFile(file, 'utf8')) as T; } catch { return fallback; }
};
const photos = await readJson<Record<string, Photo>>(photoFile, {});
const failures = await readJson<Record<string, string>>(failureFile, {});
const imageDir = 'public/images/products/parser';
await mkdir(imageDir, { recursive: true });
const allowedHost = 'mgg.stores-apple.com';
const urlFor = (item: Item): string | null => {
  const number = Number(item.source.match(/A(\d+)$/)?.[1]);
  if (!Number.isInteger(number)) return null;
  for (const column of [3, 2, 4]) {
    const cell = sheet.getRow(number).getCell(column).value;
    const raw = typeof cell === 'string' ? cell : cell && typeof cell === 'object' && 'hyperlink' in cell ? cell.hyperlink : null;
    if (typeof raw !== 'string') continue;
    try {
      const url = new URL(raw);
      if (url.protocol === 'https:' && url.hostname === allowedHost) return url.href;
    } catch { /* Skip damaged source links. */ }
  }
  return null;
};
async function get(url: string, timeoutMs: number): Promise<Response> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; APPGRADE catalog photo importer)' },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const final = new URL(response.url);
  if (final.protocol !== 'https:' || final.hostname !== allowedHost) throw new Error('Unexpected redirect host');
  return response;
}
const imagePath = (html: string): string | null => {
  const gallery = html.match(/<div class="product-detail-gallery__container[\s\S]*?<div class="right_info">/)?.[0] ?? html;
  const relative = gallery.match(/<link\s+href="([^"<>]+)"\s+itemprop="image"\s*\/?\s*>/)?.[1]
    ?? gallery.match(/<a\s+href="([^"<>]+)"\s+data-fancybox="gallery"/)?.[1];
  return relative?.replaceAll('&amp;', '&') ?? null;
};
const extension = (data: Uint8Array): string | null => {
  if (data.length < 4096 || data.length > 25_000_000) return null;
  if (data[0] === 0xff && data[1] === 0xd8) return 'jpg';
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'png';
  if (String.fromCharCode(...data.slice(0, 4)) === 'RIFF' && String.fromCharCode(...data.slice(8, 12)) === 'WEBP') return 'webp';
  return null;
};
const inFlight = new Map<string, Promise<string>>();
async function downloadPhoto(url: string): Promise<string> {
  const old = inFlight.get(url);
  if (old) return old;
  const promise = (async () => {
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 24);
    for (const ext of ['jpg', 'png', 'webp']) {
      const local = `${imageDir}/${hash}.${ext}`;
      if (existsSync(local)) return '/' + local.replace(/^public\//, '');
    }
    const response = await get(url, 45_000);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const ext = extension(bytes);
    if (!ext) throw new Error(`Unsupported image (${bytes.length} bytes)`);
    const local = `${imageDir}/${hash}.${ext}`;
    await writeFile(local, bytes);
    return '/' + local.replace(/^public\//, '');
  })();
  inFlight.set(url, promise);
  try { return await promise; } finally { inFlight.delete(url); }
}
async function processItem(item: Item): Promise<void> {
  if (photos[item.id]?.image && existsSync(path.join('public', photos[item.id].image))) return;
  const source = urlFor(item);
  if (!source) { failures[item.id] = 'В строке нет ссылки на страницу товара'; return; }
  try {
    const page = await get(source, 45_000);
    const html = await page.text();
    const image = imagePath(html);
    if (!image) throw new Error('Фото товара не найдено на странице');
    const absolute = new URL(image, source);
    if (absolute.protocol !== 'https:' || absolute.hostname !== allowedHost) throw new Error('Фото размещено на другом домене');
    const local = await downloadPhoto(absolute.href);
    photos[item.id] = { image: local, source: absolute.href };
    delete failures[item.id];
  } catch (error) {
    failures[item.id] = error instanceof Error ? error.message : String(error);
  }
}
const targets = parserRows.filter((item) => !photos[item.id]?.image || !existsSync(path.join('public', photos[item.id].image))).slice(0, limit);
let cursor = 0, done = 0;
async function worker() {
  while (cursor < targets.length) {
    const item = targets[cursor++];
    await processItem(item);
    done++;
    if (done % 25 === 0 || done === targets.length) {
      await Promise.all([
        writeFile(photoFile, JSON.stringify(photos, null, 2) + '\n'),
        writeFile(failureFile, JSON.stringify(failures, null, 2) + '\n'),
      ]);
      console.log(`Обработано ${done}/${targets.length}; фото ${Object.keys(photos).length}; без фото ${Object.keys(failures).length}`);
    }
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
