import { readFile, writeFile } from 'node:fs/promises';

type Photo = { image: string; source: string; approximate?: boolean };
const local: Record<number, Photo> = {
  425: { image: '/images/products/clean/dualsense-ps5.png', source: '/images/products/clean/dualsense-ps5.png' },
  1358: { image: '/images/products/gallery/marshall-major-5-black/view-1.jpg', source: '/images/products/gallery/marshall-major-5-black/view-1.jpg' },
  1420: { image: '/images/products/gallery/airpods-max-2-2026-starlight/view-1.jpg', source: '/images/products/gallery/airpods-max-2-2026-starlight/view-1.jpg' },
};
const remote: Array<{ name: string; url: string; ids: number[]; approximate?: boolean }> = [
  { name: 'steam-deck-oled', url: 'https://cdn.fastly.steamstatic.com/steamdeck/images/press/renderings/press_oled_orb_thumb.jpg', ids: [449, 450] },
  { name: 'magic-keyboard-white', url: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MDFW4?.v=1760724503193&fmt=jpeg&hei=1000&qlt=95&wid=1000', ids: [997], approximate: true },
  { name: 'magic-keyboard-black', url: 'https://cdn.shopify.com/s/files/1/0641/9388/8321/files/50097036_1024552.png?v=1776254688', ids: [998], approximate: true },
  { name: 'gurdini-felt-13', url: 'https://trendcase.ru/wa-data/public/shop/products/96/28/2896/images/19344/19344.200.jpg', ids: [1284] },
  { name: 'gurdini-felt-15', url: 'https://trendcase.ru/wa-data/public/shop/products/01/29/2901/images/19379/19379.200.jpg', ids: [1285] },
  { name: 'dyson-v10', url: 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary-locale/en_US/400474-01.png?fmt=png-alpha', ids: [1297] },
  { name: 'earpods-usbc', url: 'https://www.istorm.gr/cdn/shop/files/IMG-10758699_2c152af4-75e4-4d9a-a4a2-50c586b8e698.png?v=1723683595', ids: [1365] },
  { name: 'marshall-major-v-brown', url: 'https://empr.store/cdn/shop/files/Marshal-Major-V-Brown-2.jpg?v=1747215767', ids: [1366] },
  { name: 'marshall-major-v-cream', url: 'https://content.rozetka.com.ua/goods/images/big/542489439.jpg', ids: [1367, 1368], approximate: true },
  { name: 'marshall-motif-ii', url: 'https://shop.r10s.jp/e-earphone/cabinet/marshall/imgrc0100185747.jpg', ids: [1388] },
  { name: 'marshall-monitor-ii', url: 'https://images.ctfassets.net/javen7msabdh/7K0VDvsMWiqZUiIYlMGrFc/3ce12ddda226f5fe997571955047eee4/monitor-ii-anc-front-mobile.jpeg', ids: [1400] },
  { name: 'apple-tv-4k', url: 'https://www.istudio.store/cdn/shop/files/TH_Apple_TV_4K_PDP_Image_Position-1_a7d64e5a-f409-4bec-bfe2-db6f79cdc6d4.jpg?v=1706872595', ids: [1433, 1434], approximate: true },
];
const photoFile = 'data/parser-photo-map.json';
const failureFile = 'data/parser-photo-failures.json';
const photos = JSON.parse(await readFile(photoFile, 'utf8')) as Record<string, Photo>;
const failures = JSON.parse(await readFile(failureFile, 'utf8')) as Record<string, string>;
const assign = (row: number, photo: Photo) => {
  const id = `parser-sheet1-${row}`;
  photos[id] = photo;
  delete failures[id];
};
for (const [row, photo] of Object.entries(local)) assign(Number(row), photo);
for (const entry of remote) {
  if (entry.ids.every((row) => photos[`parser-sheet1-${row}`])) continue;
  try {
    const response = await fetch(entry.url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    let ext: string;
    if (bytes[0] === 0xff && bytes[1] === 0xd8) ext = 'jpg';
    else if (bytes[0] === 0x89 && bytes[1] === 0x50) ext = 'png';
    else if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF') ext = 'webp';
    else throw new Error('Unsupported image');
    if (bytes.length < 1000 || bytes.length > 12_000_000) throw new Error(`Unexpected size ${bytes.length}`);
    const image = `/images/products/parser/source-${entry.name}.${ext}`;
    await writeFile(`public${image}`, bytes);
    for (const id of entry.ids) assign(id, { image, source: entry.url, approximate: entry.approximate });
    console.log(`${entry.name}: ${entry.ids.length}`);
  } catch (error) {
    console.error(`${entry.name}:`, error instanceof Error ? error.message : error);
  }
}
await writeFile(photoFile, JSON.stringify(photos, null, 2) + '\n');
await writeFile(failureFile, JSON.stringify(failures, null, 2) + '\n');
console.log(`Осталось без фото: ${Object.keys(failures).length}`);
