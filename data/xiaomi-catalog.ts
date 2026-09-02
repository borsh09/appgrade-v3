export interface XiaomiCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  storage: string;
  ram: string;
  color: string;
  price: number;
  image: string;
  gallery: string[];
  chip: string;
}

const rows = [
  [
    'Xiaomi 15 Ultra',
    '16 GB',
    '512 GB',
    'Silver Chrome',
    119990,
    '15-ultra-main.png',
    'Snapdragon 8 Elite',
  ],
  [
    'Xiaomi 15',
    '12 GB',
    '256 GB',
    'Green',
    79990,
    '15-main.png',
    'Snapdragon 8 Elite',
  ],
  [
    'Redmi Note 14 Pro+ 5G',
    '12 GB',
    '512 GB',
    'Frost Blue',
    46990,
    'redmi-blue.png',
    'Snapdragon 7s Gen 3',
  ],
  [
    'Redmi Note 14 Pro+ 5G',
    '12 GB',
    '512 GB',
    'Midnight Black',
    46990,
    'redmi-black.png',
    'Snapdragon 7s Gen 3',
  ],
  [
    'Poco X7 Pro',
    '12 GB',
    '512 GB',
    'Yellow',
    42990,
    'poco-yellow.png',
    'Dimensity 8400-Ultra',
  ],
  [
    'Poco X7 Pro',
    '12 GB',
    '512 GB',
    'Black / Yellow',
    42990,
    'poco-main.png',
    'Dimensity 8400-Ultra',
  ],
] as const;

export const xiaomiSlugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const xiaomiCatalog: XiaomiCatalogSku[] = rows.map(
  ([model, ram, storage, color, price, file, chip]) => {
    const modelSlug = xiaomiSlugify(model);
    const image = `/images/products/xiaomi/${file}`;
    return {
      id: `${modelSlug}-${xiaomiSlugify(storage)}-${xiaomiSlugify(color)}`,
      model,
      modelSlug,
      storage,
      ram,
      color,
      price,
      image,
      gallery: [image],
      chip,
    };
  },
);

export const xiaomiModels = [
  ...new Map(xiaomiCatalog.map((sku) => [sku.modelSlug, sku.model])).entries(),
].map(([slug, name]) => ({ slug, name }));
