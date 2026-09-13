import { mkdir, writeFile } from 'node:fs/promises';

// Read-only source catalogue inventory. Photos are selected separately, by model.
const origin = 'https://ads-store.ru';
const paths = process.argv.slice(2);
await mkdir('.tmp-qa/media', { recursive: true });
for (const path of paths) {
  const response = await fetch(new URL(path, origin));
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  const html = await response.text();
  const products = [...html.matchAll(/<a href="(\/product\/[^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*>/g)]
    .map(([, href, image]) => ({ href, image }));
  const file = path.replace(/[^a-z0-9]+/gi, '-');
  await writeFile(`.tmp-qa/media/${file}.json`, JSON.stringify(products, null, 2));
  await writeFile(`.tmp-qa/media/${file}.html`, html);
  console.log(path, products.length);
}
