import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
const sources = JSON.parse(await readFile('data/product-photo-sources.json', 'utf8'));
for (const [model, source] of Object.entries(sources)) {
  const destination = `public${source.image}`;
  try { await access(destination); continue; } catch {}
  try {
    let image = source.url;
    if (!image) {
      const page = await fetch(source.page, { signal: AbortSignal.timeout(30000) });
      if (!page.ok) throw new Error(`Page ${page.status}`);
      const html = await page.text();
      image = html.match(/(?:src|href)="([^"\s]+\/images\/[^"\s]+\.970\.webp)"/)?.[1];
    }
    if (!image) throw new Error('No full-size product photo');
    const url = new URL(image, source.page).href;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image ${response.status}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    source.url = url;
    console.log('Downloaded', model);
  } catch (error) { console.error(model, error.message); }
}
await writeFile('data/product-photo-sources.json', JSON.stringify(sources, null, 2) + '\n');
