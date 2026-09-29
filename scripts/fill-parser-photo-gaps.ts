import { readFile, writeFile } from 'node:fs/promises';
import rows from '../data/parser-catalog.json';

type Photo = { image: string; source: string; approximate?: boolean };
const photoFile = 'data/parser-photo-map.json';
const failureFile = 'data/parser-photo-failures.json';
const photos = JSON.parse(await readFile(photoFile, 'utf8')) as Record<string, Photo>;
const failures = JSON.parse(await readFile(failureFile, 'utf8')) as Record<string, string>;
const originals = new Set(Object.keys(photos));
let exact = 0, model = 0;
for (const item of rows) {
  if (photos[item.id]) continue;
  const siblings = rows.filter((candidate) => originals.has(candidate.id) && candidate.modelSlug === item.modelSlug);
  const sameColor = siblings.find((candidate) => candidate.color && candidate.color === item.color);
  const fallback = sameColor ?? siblings[0];
  if (!fallback) continue;
  photos[item.id] = { ...photos[fallback.id], approximate: !sameColor || photos[fallback.id].approximate };
  delete failures[item.id];
  if (sameColor) exact++; else model++;
}
await writeFile(photoFile, JSON.stringify(photos, null, 2) + '\n');
await writeFile(failureFile, JSON.stringify(failures, null, 2) + '\n');
console.log(`Фото той же модели: ${exact} совпадений цвета, ${model} иллюстраций модели; осталось ${Object.keys(failures).length}.`);
