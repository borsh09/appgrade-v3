import { writeFile } from 'node:fs/promises';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import { catalogItems } from '../lib/catalog-registry';

// Inspect pixels only: the originals remain untouched. These bounds control
// layout so empty margins in different suppliers' photos do not shrink products.
const result: Record<string, { width: number; height: number; bounds: number[] }> = {};
for (const src of [...new Set(catalogItems.flatMap(item => [item.image, ...(item.gallery ?? [])]))].sort()) {
  if (src.endsWith('.svg')) continue;
  const { data, info } = await sharp(`public${src}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rows = new Uint32Array(height), columns = new Uint32Array(width);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const offset = (y * width + x) * channels;
    // Keep near-white metal and soft shadows, ignore transparent/white margins.
    if (data[offset + 3] > 24 && Math.min(data[offset], data[offset + 1], data[offset + 2]) < 242) {
      rows[y]++; columns[x]++;
    }
  }
  const xs = [...columns.keys()].filter(x => columns[x] > Math.max(2, height * .002));
  const ys = [...rows.keys()].filter(y => rows[y] > Math.max(2, width * .002));
  if (!xs.length || !ys.length) continue;
  const margin = Math.ceil(Math.max(width, height) * .008);
  const left = Math.max(0, xs[0] - margin), top = Math.max(0, ys[0] - margin);
  const right = Math.min(width, xs.at(-1)! + margin + 1), bottom = Math.min(height, ys.at(-1)! + margin + 1);
  result[src] = { width, height, bounds: [left, top, right - left, bottom - top] };
  // Apple's press image has three independent views. The storefront presents
  // the complete front-facing watch in the centre, without the two side views.
  if (src === '/images/products/completed/watch-ultra-2.jpg') {
    result[src].bounds = [780, 184, 466, 790];
  }
}
await writeFile('data/product-photo-framing.json', JSON.stringify(result, null, 2) + '\n');
console.log(`Measured ${Object.keys(result).length} photos without changing image files.`);
