import rows from './additional-catalog.json';

export interface AdditionalCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  color: string;
  price: number | null;
  category: string;
  image: string;
  source: string;
  priceAlias: string;
  storage?: string;
  ram?: string;
  sim?: string;
  size?: string;
  connectivity?: string;
  configuration?: string;
  legacySlug?: string;
}

function normalizeRow(row: AdditionalCatalogSku): AdditionalCatalogSku {
  let model = row.model;
  const item = { ...row, legacySlug: row.modelSlug };
  const phone = model.match(/^(iPhone .+?) (\d+|\d+TB) (eSim|Sim\/eSim) (.+)$/);
  const memory = model.match(/^(.*?) (\d+)\/(\d+|\d+TB)(.*)$/);
  const watch = model.match(/^(Apple Watch .+?) (\d+)$/);
  if (phone) {
    [, model, item.storage, item.sim, item.color] = phone;
  } else if (memory) {
    model = memory[1].replace(/^Samsung /, 'Samsung Galaxy ');
    item.ram = memory[2]; item.storage = memory[3];
    item.connectivity = /Wi-Fi/.test(memory[4]) ? 'Wi-Fi' : undefined;
    item.configuration = /RUSSIAN/.test(memory[4]) ? 'Ростест' : undefined;
    item.color = memory[4].replace(/\(RUSSIAN\)|Wi-Fi/g, '').trim();
  } else if (watch) {
    model = watch[1].replace('Apple Watch 10', 'Apple Watch Series 10');
    item.size = watch[2];
  }
  item.model = model.replace(/ Pro Plus/g, ' Pro+');
  // Cyrillic product names already have a stable transliterated route.
  if (/^[a-z]/i.test(model)) item.modelSlug = item.model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return item;
}
export const additionalCatalog: AdditionalCatalogSku[] = rows.map(normalizeRow);
