export type DysonKind = 'Стайлер' | 'Фен' | 'Выпрямитель';

export interface DysonCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  kind: DysonKind;
  color: string;
  price: number;
  cashlessPrice: number;
  image: string;
  gallery: string[];
}

export const dysonCatalog: DysonCatalogSku[] = [
  [
    'Dyson Airwrap Long HS05',
    'Стайлер',
    'Prussian Blue / Rich Copper',
    34990,
    41988,
    'hs05.jpg',
  ],
  [
    'Dyson Airwrap Long HS05',
    'Стайлер',
    'Nickel / Copper',
    34990,
    41988,
    'hs05-nickel.jpg',
  ],
  [
    'Dyson Airwrap Long HS08',
    'Стайлер',
    'Ceramic Patina / Topaz',
    34990,
    41988,
    'hs08.webp',
  ],
  [
    'Dyson Airwrap Long HS08',
    'Стайлер',
    'Strawberry Bronze / Blush Pink',
    34990,
    41988,
    'hs08-strawberry.png',
  ],
  [
    'Dyson Airwrap Long HS09',
    'Стайлер',
    'Ceramic Pink / Rose Gold',
    39990,
    47988,
    'hs09.png',
  ],
  [
    'Dyson Airwrap Long HS09',
    'Стайлер',
    'Jasper Plum',
    39990,
    47988,
    'hs09-plum.jpg',
  ],
  [
    'Dyson Supersonic HD16',
    'Фен',
    'Ceramic Patina / Topaz',
    32990,
    39588,
    'hd16.jpg',
  ],
  [
    'Dyson Supersonic HD16',
    'Фен',
    'Prussian Blue / Rich Copper',
    32990,
    39588,
    'hd16-blue.png',
  ],
  [
    'Dyson Supersonic HD18',
    'Фен',
    'Vinca Blue / Topaz',
    32990,
    39588,
    'hd18.jpg',
  ],
  [
    'Dyson Supersonic HD18',
    'Фен',
    'Ceramic Pink / Rose Gold',
    32990,
    39588,
    'hd18-pink.jpg',
  ],
  [
    'Dyson Airstrait HT01',
    'Выпрямитель',
    'Ceramic Pink / Rose Gold',
    29990,
    35988,
    'ht01.jpg',
  ],
  [
    'Dyson Airstrait HT01',
    'Выпрямитель',
    'Prussian Blue / Rich Copper',
    29990,
    35988,
    'ht01-blue.jpg',
  ],
].map(([model, kind, color, price, cashlessPrice, file]) => {
  const modelSlug = String(model)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const colorSlug = String(color)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const image = `/images/products/dyson/${file}`;
  return {
    id: `${modelSlug}-${colorSlug}`,
    model: String(model),
    modelSlug,
    kind: kind as DysonKind,
    color: String(color),
    price: Number(price),
    cashlessPrice: Number(cashlessPrice),
    image,
    gallery: [image],
  };
});
