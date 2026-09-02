export interface CameraCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  color: string;
  price: number;
  cashlessPrice: number;
  image: string;
  gallery: string[];
  kind: 'Моментальная' | 'Гибридная';
}
const rows = [
  [
    'Instax Mini 13',
    'Frost Blue',
    12444,
    15182,
    'mini13-blue.jpg',
    'Моментальная',
  ],
  [
    'Instax Mini 12',
    'Pastel Blue',
    9394,
    11461,
    'mini12-blue.jpg',
    'Моментальная',
  ],
  ['Instax Mini Evo', 'Black', 18056, 22028, 'evo-black.png', 'Гибридная'],
  ['Instax Mini Evo', 'Brown', 18788, 22921, 'evo-brown.png', 'Гибридная'],
  ['Instax Mini Evo', 'Gentle Rose', 22440, 27377, 'evo-rose.png', 'Гибридная'],
  [
    'Instax Mini Evo Cinema',
    'Black',
    34320,
    41870,
    'evo-cinema.png',
    'Гибридная',
  ],
] as const;
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const cameraCatalog: CameraCatalogSku[] = rows.map(
  ([model, color, price, cashlessPrice, file, kind]) => {
    const modelSlug = slugify(model),
      image = `/images/products/cameras/${file}`;
    return {
      id: `${modelSlug}-${slugify(color)}`,
      model,
      modelSlug,
      color,
      price,
      cashlessPrice,
      image,
      gallery: [image],
      kind,
    };
  },
);
