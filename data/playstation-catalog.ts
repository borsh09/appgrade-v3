export type PlaystationKind = 'Консоли' | 'Аксессуары';

export interface PlaystationCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  kind: PlaystationKind;
  configuration: string;
  color: string;
  price: number;
  image: string;
  gallery: string[];
}

export const playstationSlugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const products: Array<[string, PlaystationKind, string, string, number, string]> = [
  ['PlayStation 5 Pro', 'Консоли', '2 ТБ · Digital Edition', 'Белый', 107990, 'playstation-5-pro-2tb'],
  ['PlayStation 5 Slim', 'Консоли', '1 ТБ · Blu-ray', 'Белый', 64990, 'playstation-5-slim-1tb'],
  ['PlayStation 5 Slim Digital', 'Консоли', '1 ТБ · Digital Edition', 'Белый', 58990, 'playstation-5-slim-1tb-digital'],
  ['DualSense PS5', 'Аксессуары', 'Беспроводной контроллер', 'Белый', 6990, 'dualsense-ps5'],
  ['DualSense PS5', 'Аксессуары', 'Беспроводной контроллер', 'Чёрный', 6990, 'dualsense-ps5-midnight-black'],
  ['DualSense PS5', 'Аксессуары', 'Беспроводной контроллер', 'Красный', 6990, 'dualsense-ps5-cosmic-red'],
  ['DualSense PS5', 'Аксессуары', 'Беспроводной контроллер', 'Розовый', 6990, 'dualsense-ps5-nova-pink'],
  ['Charging Station PS5', 'Аксессуары', 'Зарядная станция DualSense', 'Белый', 3490, 'charging-station-ps5'],
];

export const playstationCatalog: PlaystationCatalogSku[] = products.map(([model, kind, configuration, color, price, folder]) => {
  const cleanImages: Record<string, string> = {
    'playstation-5-pro-2tb': '/images/home/ps5-pro.png',
    'playstation-5-slim-1tb': '/images/products/clean/playstation-5-slim-1tb.png',
    'playstation-5-slim-1tb-digital': '/images/products/clean/playstation-5-slim-1tb-digital.png',
    'dualsense-ps5': '/images/products/clean/dualsense-ps5.png',
    'dualsense-ps5-midnight-black': '/images/products/clean/dualsense-ps5-midnight-black.png',
    'dualsense-ps5-cosmic-red': '/images/products/clean/dualsense-ps5-cosmic-red.png',
    'dualsense-ps5-nova-pink': '/images/products/clean/dualsense-ps5-nova-pink.png',
  };
  const cleanImage = cleanImages[folder];
  const gallery = cleanImage
    ? [cleanImage, cleanImage, cleanImage]
    : [1, 2, 3].map((index) => `/images/products/gallery/${folder}/view-${index}.jpg`);
  return { id: folder, model, modelSlug: playstationSlugify(model), kind, configuration, color, price, image: gallery[0], gallery };
});

export const playstationModels = [...new Map(playstationCatalog.map(({ model, modelSlug }) => [modelSlug, model])).entries()].map(([slug, name]) => ({ name, slug }));
