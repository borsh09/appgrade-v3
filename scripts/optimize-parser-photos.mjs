import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import { readFile, writeFile, stat, unlink } from 'node:fs/promises';

(async () => {
  const file = 'data/parser-photo-map.json';
  const photos = JSON.parse(await readFile(file, 'utf8'));
  const assets = [...new Set(Object.values(photos).map((entry) => entry.image))];
  const replacements = new Map();
  let before = 0, after = 0;
  for (const image of assets) {
    if (!/^\/images\/products\/parser\/.+\.(?:jpe?g|png)$/i.test(image)) continue;
    const input = `public${image}`;
    const outputImage = image.replace(/\.(?:jpe?g|png)$/i, '.webp');
    const output = `public${outputImage}`;
    const inputSize = (await stat(input)).size;
    await sharp(input).rotate().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toFile(output);
    const outputSize = (await stat(output)).size;
    if (outputSize >= inputSize) {
      await unlink(output);
      continue;
    }
    before += inputSize;
    after += outputSize;
    replacements.set(image, outputImage);
  }
  for (const entry of Object.values(photos)) entry.image = replacements.get(entry.image) ?? entry.image;
  await writeFile(file, JSON.stringify(photos, null, 2) + '\n');
  for (const image of replacements.keys()) await unlink(`public${image}`);
  console.log(`Оптимизировано ${replacements.size} файлов: ${(before / 1048576).toFixed(1)} → ${(after / 1048576).toFixed(1)} МБ`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
