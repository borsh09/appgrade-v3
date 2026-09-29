import { readFile, writeFile } from 'node:fs/promises';

const root = 'https://www.apple.com/newsroom/images/2026/09/';
const series = `${root}introducing-apple-watch-series-12-with-the-all-new-health-sensing-system/article/`;
const ultra = `${root}apple-unveils-apple-watch-ultra-4/article/`;
const airpods = `${root}apple-introduces-airpods-5-with-best-in-class-open-ear-active-noise-cancellation/article/`;
const sources: Record<string, { url: string; ids: number[]; approximate?: boolean }> = {
  'watch-dark-bronze': { url: `${series}Apple-Watch-Series-12-Dark-Bronze-Aluminum-with-Olive-Sport-Band-260909_inline.jpg.large.jpg`, ids: [1104, 1108] },
  'watch-light-gold': { url: `${series}Apple-Watch-Series-12-Light-Gold-Aluminum-with-Olive-Sport-Loop-260909_inline.jpg.large.jpg`, ids: [1103, 1107], approximate: true },
  'watch-black': { url: `${series}Apple-Watch-Series-12-Black-Aluminum-with-Burgundy-Plaid-Sport-Loop-260909_inline.jpg.large.jpg`, ids: [1106, 1110], approximate: true },
  'watch-space-gray': { url: `${series}Apple-Watch-Series-12-Silver-Aluminum-with-Wildflower-Blue-Braided-Solo-Loop-260909_inline.jpg.large.jpg`, ids: [1105, 1109], approximate: true },
  'watch-radiant-gold': { url: `${series}Apple-Watch-Series-12-Radiant-Gold-Titanium-with-Mulberry-Modern-Buckle-260909_inline.jpg.large.jpg`, ids: [1115, 1117], approximate: true },
  'watch-natural-titanium': { url: `${series}Apple-Watch-Series-12-Natural-Titanium-with-Milanese-Loop-260909_inline.jpg.large.jpg`, ids: [1116, 1118] },
  'watch-pearl-white': { url: `${series}Apple-Watch-Series-12-Pearl-White-Ceramic-with-Sand-Sport-Band-260909_inline.jpg.large.jpg`, ids: [1113, 1114] },
  'watch-night-blue': { url: `${series}Apple-Watch-Series-12-Navy-Blue-Ceramic-with-Navy-Blue-Braided-Solo-Loop-260909_inline.jpg.large.jpg`, ids: [1111, 1112], approximate: true },
  'airpods-5': { url: `${airpods}Apple-AirPods-5-hero-260909_big.jpg.large.jpg`, ids: [1119] },
  'airpods-5-wireless': { url: `${airpods}Apple-AirPods-5-Wireless-Charging-Case-260909_inline.jpg.large.jpg`, ids: [1120] },
  'watch-ultra-black': { url: `${ultra}Apple-Watch-Ultra-4-Alpine-Loop-Band-burgundy-260909_inline.jpg.large.jpg`, ids: [1121, 1122, 1123], approximate: true },
  'watch-ultra-natural': { url: `${ultra}Apple-Watch-Ultra-4-Trail-Loop-sand-260909_inline.jpg.large.jpg`, ids: [1124, 1125, 1126], approximate: true },
};

const photoFile = 'data/parser-photo-map.json';
const failureFile = 'data/parser-photo-failures.json';
const photos = JSON.parse(await readFile(photoFile, 'utf8')) as Record<string, { image: string; source: string; approximate?: boolean }>;
const failures = JSON.parse(await readFile(failureFile, 'utf8')) as Record<string, string>;
for (const [name, entry] of Object.entries(sources)) {
  const response = await fetch(entry.url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  if (new URL(response.url).hostname !== 'www.apple.com') throw new Error(`${name}: unexpected redirect`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 4096 || bytes.length > 8_000_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8)
    throw new Error(`${name}: invalid JPEG`);
  const image = `/images/products/parser/official-${name}.jpg`;
  await writeFile(`public${image}`, bytes);
  for (const row of entry.ids) {
    const id = `parser-sheet1-${row}`;
    photos[id] = { image, source: entry.url, approximate: entry.approximate };
    delete failures[id];
  }
  console.log(`${name}: ${entry.ids.length} карточки`);
}
await writeFile(photoFile, JSON.stringify(photos, null, 2) + '\n');
await writeFile(failureFile, JSON.stringify(failures, null, 2) + '\n');
