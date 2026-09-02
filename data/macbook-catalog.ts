export interface MacbookCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  chip: string;
  ram: string;
  storage: string;
  color: string;
  price: number;
  image: string;
  gallery: string[];
}

const sourceRows = `
MacBook Air 13 M1|M1|8 GB|256 GB|56990
MacBook Neo|A18 Pro|8 GB|256 GB|63990
MacBook Neo|A18 Pro|8 GB|512 GB|72990
MacBook Air 13 M5|M5|16 GB|512 GB|119990
MacBook Air 13 M5|M5|16 GB|1 TB|134990
MacBook Air 13 M5|M5|24 GB|1 TB|160990
MacBook Air 15 M5|M5|16 GB|512 GB|133990
MacBook Air 15 M5|M5|16 GB|1 TB|158990
MacBook Air 15 M5|M5|24 GB|1 TB|189990`;

const colorsByModel: Record<string, string[]> = {
  'MacBook Air 13 M1': ['Space Gray', 'Silver', 'Gold'],
  'MacBook Neo': ['Silver', 'Blush', 'Citrus', 'Indigo'],
  'MacBook Air 13 M5': ['Sky Blue', 'Midnight', 'Starlight', 'Silver'],
  'MacBook Air 15 M5': ['Sky Blue', 'Midnight', 'Starlight', 'Silver'],
};

export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const galleryFor = (model: string, color: string) => {
  const slug = slugify(`${model}-${color}`);
  const root = `/images/products/gallery/${slug}`;
  if (slug === 'macbook-neo-indigo') return [`${root}/view-1.png`, `${root}/view-2.jpg`, `${root}/view-3-correct.jpg`];
  if (model === 'MacBook Neo') return [`${root}/view-1.png`, `${root}/view-2.jpg`, `${root}/view-3.jpg`];
  const m1Extensions: Record<string, [string, string, string]> = {
    'macbook-air-13-m1-space-gray': ['jpg', 'png', 'jpg'],
    'macbook-air-13-m1-silver': ['jpg', 'jpg', 'jpg'],
    'macbook-air-13-m1-gold': ['png', 'jpg', 'jpg'],
  };
  if (model.includes('M1')) {
    const files: Record<string, string[]> = {
      'macbook-air-13-m1-space-gray': ['view-2.png', 'view-1.jpg', 'view-3.jpg'],
      'macbook-air-13-m1-silver': ['view-3.jpg', 'view-1.jpg', 'view-2.jpg'],
      'macbook-air-13-m1-gold': ['view-1.png', 'view-2.jpg', 'view-3.jpg'],
    };
    return (files[slug] ?? m1Extensions[slug].map((extension, index) => `view-${index + 1}.${extension}`)).map((file) => `${root}/${file}`);
  }
  const correctedGalleries: Record<string, string[]> = {
    'macbook-air-13-m5-midnight': [`${root}/view-1-correct.jpg`, '/images/products/gallery/macbook-air-13-m5-starlight/view-2.webp', '/images/products/gallery/macbook-air-13-m5-starlight/view-3.jpg'],
    'macbook-air-13-m5-starlight': [`${root}/view-1-correct.jpg`, '/images/products/gallery/macbook-air-13-m5-silver/view-2.webp', '/images/products/gallery/macbook-air-13-m5-silver/view-3.webp'],
    'macbook-air-13-m5-silver': [`${root}/view-1-correct.jpg`, '/images/products/gallery/macbook-air-13-m1-silver/view-1.jpg', '/images/products/gallery/macbook-air-13-m1-silver/view-2.jpg'],
    'macbook-air-15-m5-sky-blue': [`${root}/view-1-correct.jpg`, '/images/products/gallery/macbook-air-13-m5-sky-blue/view-1.webp', '/images/products/gallery/macbook-air-13-m5-sky-blue/view-2.webp'],
    'macbook-air-15-m5-midnight': [`${root}/view-1-correct.jpg`, '/images/products/gallery/macbook-air-13-m5-starlight/view-2.webp', '/images/products/gallery/macbook-air-13-m5-starlight/view-3.jpg'],
    'macbook-air-15-m5-silver': [`${root}/view-1-correct.jpg`, '/images/products/gallery/macbook-air-13-m1-silver/view-1.jpg', '/images/products/gallery/macbook-air-13-m1-silver/view-2.jpg'],
  };
  if (correctedGalleries[slug]) return correctedGalleries[slug];
  const extensions: Record<string, [string, string, string]> = {
    'macbook-air-13-m5-silver': ['png', 'webp', 'webp'],
    'macbook-air-13-m5-starlight': ['png', 'webp', 'jpg'],
    'macbook-air-13-m5-midnight': ['png', 'webp', 'webp'],
    'macbook-air-13-m5-sky-blue': ['webp', 'webp', 'webp'],
    'macbook-air-15-m5-silver': ['png', 'jpg', 'jpg'],
    'macbook-air-15-m5-starlight': ['jpg', 'webp', 'webp'],
    'macbook-air-15-m5-midnight': ['png', 'webp', 'webp'],
    'macbook-air-15-m5-sky-blue': ['png', 'webp', 'png'],
  };
  const files = (extensions[slug] ?? ['jpg', 'jpg', 'jpg']).map((extension, index) => `view-${index + 1}.${extension}`);
  if (slug === 'macbook-air-13-m5-sky-blue') files.unshift(files.pop()!);
  return files.map((file) => `${root}/${file}`);
};

export const macbookCatalog: MacbookCatalogSku[] = sourceRows.trim().split('\n').flatMap((row) => {
  const [model, chip, ram, storage, rawPrice] = row.split('|');
  return colorsByModel[model].map((color) => {
    const gallery = galleryFor(model, color);
    return { id: slugify(`${model}-${ram}-${storage}-${color}`), model, modelSlug: slugify(model), chip, ram, storage, color, price: Number(rawPrice), image: gallery[0], gallery };
  });
});

export const macbookModels = [...new Map(macbookCatalog.map((sku) => [sku.modelSlug, sku.model])).entries()].map(([slug, name]) => ({ slug, name }));
