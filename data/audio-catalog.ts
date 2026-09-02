export type AudioKind = 'AirPods' | 'Наушники' | 'Акустика';

export interface AudioCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  brand: 'Apple' | 'Marshall' | 'JBL';
  kind: AudioKind;
  color: string;
  price: number | null;
  image: string;
  gallery: string[];
}

export const audioSlugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const galleryOrderByModel: Record<string, number[]> = {
  // The II and III generations have almost identical front views. Lead with a
  // different, still useful product angle so they are distinguishable in the grid.
  'marshall-stanmore-2': [3, 1, 2],
  'marshall-woburn-2': [2, 1, 3],
};

const products: Array<[string, AudioCatalogSku['brand'], AudioKind, number | null, string[]]> = [
  ['AirPods Max 2 2024', 'Apple', 'AirPods', 39990, ['Midnight', 'Blue', 'Purple', 'Orange', 'Starlight']],
  ['AirPods Max 2 2026', 'Apple', 'AirPods', 44990, ['Midnight', 'Blue', 'Purple', 'Orange', 'Starlight']],
  ['AirPods 4', 'Apple', 'AirPods', 10990, ['White']],
  ['AirPods 4 ANC', 'Apple', 'AirPods', 15490, ['White']],
  ['AirPods Pro 2', 'Apple', 'AirPods', 15490, ['White']],
  ['AirPods Pro 3', 'Apple', 'AirPods', 18990, ['White']],
  ['Marshall Major 5', 'Marshall', 'Наушники', 7990, ['Black']],
  ['Marshall Monitor 3 ANC', 'Marshall', 'Наушники', 23990, ['Black']],
  ['Marshall Stanmore 3', 'Marshall', 'Акустика', 31990, ['Black']],
  ['Marshall Stanmore 2', 'Marshall', 'Акустика', 29990, ['Black']],
  ['Marshall Woburn 3', 'Marshall', 'Акустика', 43990, ['Black']],
  ['Marshall Woburn 2', 'Marshall', 'Акустика', 35990, ['Black']],
  ['JBL Flip 6', 'JBL', 'Акустика', 9490, ['Black']],
  ['JBL Charge 6', 'JBL', 'Акустика', 13990, ['Black']],
  ['JBL Flip 7', 'JBL', 'Акустика', 10990, ['Black']],
  ['JBL Go 3', 'JBL', 'Акустика', 3990, ['Black']],
  ['JBL Go 4', 'JBL', 'Акустика', 4090, ['Black']],
  ['JBL Xtreme 3', 'JBL', 'Акустика', 20990, ['Black']],
  ['JBL Xtreme 4', 'JBL', 'Акустика', 22990, ['Black']],
  ['JBL Boombox 3', 'JBL', 'Акустика', null, ['Black']],
  ['JBL PartyBox', 'JBL', 'Акустика', null, ['Black']],
];

export const audioCatalog: AudioCatalogSku[] = products.flatMap(([model, brand, kind, price, colors]) => colors.map((color) => {
  const folder = audioSlugify(`${model}-${color}`);
  const order = galleryOrderByModel[audioSlugify(model)] ?? [1, 2, 3];
  const gallery = order.map((index) => `/images/products/gallery/${folder}/view-${index}.jpg`);
  return { id: folder, model, modelSlug: audioSlugify(model), brand, kind, color, price, image: gallery[0], gallery };
}));

export const audioModels = [...new Map(audioCatalog.map((sku) => [sku.modelSlug, sku.model])).entries()].map(([slug, name]) => ({ slug, name }));
