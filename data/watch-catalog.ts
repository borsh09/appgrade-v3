export interface WatchCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  size: string;
  color: string;
  connectivity: string;
  price: number;
  image: string;
  gallery: string[];
}
const models = [
  {
    model: 'Apple Watch Series 11',
    sizes: ['42 мм', '46 мм'],
    colors: [
      'Глянцевый чёрный',
      'Розовое золото',
      'Серебристый',
      'Серый космос',
    ],
    connectivity: 'GPS',
    base: 39990,
  },
  {
    model: 'Apple Watch SE 3',
    sizes: ['40 мм', '44 мм'],
    colors: ['Тёмная ночь', 'Сияющая звезда'],
    connectivity: 'GPS',
    base: 26990,
  },
  {
    model: 'Apple Watch Ultra 3',
    sizes: ['49 мм'],
    colors: ['Натуральный титан', 'Чёрный титан'],
    connectivity: 'GPS + Cellular',
    base: 79990,
  },
] as const;
const galleryFolders: Record<string, string> = {
  'Apple Watch Series 11|Глянцевый чёрный':
    'apple-watch-series-11-glossy-black',
  'Apple Watch Series 11|Розовое золото': 'apple-watch-series-11-rose-gold',
  'Apple Watch Series 11|Серебристый': 'apple-watch-series-11-silver',
  'Apple Watch Series 11|Серый космос': 'apple-watch-series-11-space-gray',
  'Apple Watch SE 3|Тёмная ночь': 'apple-watch-se-3-midnight',
  'Apple Watch SE 3|Сияющая звезда': 'apple-watch-se-3-starlight',
  'Apple Watch Ultra 3|Натуральный титан':
    'apple-watch-ultra-3-natural-titanium',
  'Apple Watch Ultra 3|Чёрный титан': 'apple-watch-ultra-3-black-titanium',
};
export const watchSlugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const watchCatalog: WatchCatalogSku[] = models.flatMap((item) =>
  item.sizes.flatMap((size, sizeIndex) =>
    item.colors.map((color, colorIndex) => {
      const folder = galleryFolders[`${item.model}|${color}`];
      const gallery = [1, 2, 3].map(
        (i) => `/images/products/gallery/${folder}/view-${i}.jpg`,
      );
      const price =
        item.base +
        sizeIndex * 3000 +
        (item.model.includes('Series') && colorIndex === 3 ? 2000 : 0);
      return {
        id: `${watchSlugify(item.model)}-${size.replace(/\D/g, '')}-${folder}`,
        model: item.model,
        modelSlug: watchSlugify(item.model),
        size,
        color,
        connectivity: item.connectivity,
        price,
        image: gallery[0],
        gallery,
      };
    }),
  ),
);
export const watchModels = [
  ...new Map(watchCatalog.map((s) => [s.modelSlug, s.model])).entries(),
].map(([slug, name]) => ({ name, slug }));
