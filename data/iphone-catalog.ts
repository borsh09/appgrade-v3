export interface IphoneCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  storage: string;
  color: string;
  sim: string;
  price: number;
  image: string;
  gallery?: string[];
}

const sourceRows = `
iPhone 13 128|46990
iPhone 14 128|49990
iPhone 15 128|54990
iPhone 15 256|64990
iPhone 15 Plus 128|50990
iPhone 15 Plus 256|59990
iPhone 16e 128|44990
iPhone 16e 256|54990
iPhone 16 128|64990
iPhone 16 256|70990
iPhone 16 Plus 128|64990
iPhone 16 Plus 256|69990
iPhone 16 Pro 128|82990
iPhone 16 Pro Max 256|98990
iPhone 17 256 eSim Black|74990
iPhone 17 256 eSim Mist Blue|74990
iPhone 17 256 eSim White|74990
iPhone 17 256 eSim Lavender|74990
iPhone 17 256 eSim Sage|74990
iPhone 17 512 eSim Black|88990
iPhone 17 512 eSim Mist Blue|91990
iPhone 17 512 eSim Lavender|92990
iPhone Air 256|73990
iPhone Air 512|83990
iPhone Air 1TB|92990
iPhone 17e 256|55990
iPhone 17 Pro 256 eSim Deep Blue|97990
iPhone 17 Pro 256 eSim Cosmic Orange|97990
iPhone 17 Pro 256 eSim Silver|99990
iPhone 17 Pro 512 eSim Deep Blue|115990
iPhone 17 Pro 512 eSim Cosmic Orange|112990
iPhone 17 Pro 512 eSim Silver|112990
iPhone 17 Pro 1TB eSim Deep Blue|124990
iPhone 17 Pro 1TB eSim Cosmic Orange|124990
iPhone 17 Pro 1TB eSim Silver|129990
iPhone 17 Pro Max 256 eSim Deep Blue|105990
iPhone 17 Pro Max 256 eSim Cosmic Orange|105990
iPhone 17 Pro Max 256 eSim Silver|105990
iPhone 17 Pro Max 512 eSim Deep Blue|120990
iPhone 17 Pro Max 512 eSim Cosmic Orange|119990
iPhone 17 Pro Max 512 eSim Silver|121990
iPhone 17 Pro Max 1TB eSim Deep Blue|136990
iPhone 17 Pro Max 1TB eSim Cosmic Orange|136990
iPhone 17 Pro Max 1TB eSim Silver|136990
iPhone 17 Pro Max 2TB eSim Deep Blue|154990
iPhone 17 Pro Max 2TB eSim Cosmic Orange|152990
iPhone 17 Pro Max 2TB eSim Silver|164990
iPhone 17 256 Sim/eSim Black|75990
iPhone 17 256 Sim/eSim Mist Blue|75990
iPhone 17 256 Sim/eSim White|75990
iPhone 17 256 Sim/eSim Lavender|75990
iPhone 17 256 Sim/eSim Sage|75990
iPhone 17 512 Sim/eSim Black|88990
iPhone 17 512 Sim/eSim Mist Blue|88990
iPhone 17 512 Sim/eSim White|88990
iPhone 17 512 Sim/eSim Lavender|88990
iPhone 17 512 Sim/eSim Sage|88990
iPhone 17 Pro 256 Sim/eSim Deep Blue|99990
iPhone 17 Pro 256 Sim/eSim Cosmic Orange|99990
iPhone 17 Pro 256 Sim/eSim Silver|101990
iPhone 17 Pro 512 Sim/eSim Deep Blue|119990
iPhone 17 Pro 512 Sim/eSim Cosmic Orange|119990
iPhone 17 Pro 512 Sim/eSim Silver|123990
iPhone 17 Pro 1TB Sim/eSim Deep Blue|134990
iPhone 17 Pro 1TB Sim/eSim Cosmic Orange|135990
iPhone 17 Pro 1TB Sim/eSim Silver|145990
iPhone 17 Pro Max 256 Sim/eSim Deep Blue|109990
iPhone 17 Pro Max 256 Sim/eSim Cosmic Orange|110990
iPhone 17 Pro Max 256 Sim/eSim Silver|111990
iPhone 17 Pro Max 512 Sim/eSim Deep Blue|129990
iPhone 17 Pro Max 512 Sim/eSim Cosmic Orange|129990
iPhone 17 Pro Max 512 Sim/eSim Silver|132990
iPhone 17 Pro Max 1TB Sim/eSim Deep Blue|149990
iPhone 17 Pro Max 1TB Sim/eSim Cosmic Orange|151990
iPhone 17 Pro Max 1TB Sim/eSim Silver|151990
iPhone 17 Pro Max 2TB Sim/eSim Deep Blue|174990
iPhone 17 Pro Max 2TB Sim/eSim Cosmic Orange|174990
iPhone 17 Pro Max 2TB Sim/eSim Silver|174990`;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Apple publishes finishes even when the local price list only contains
// model/storage. Expand those rows into real selectable SKU cards.
const finishesByModel: Record<string, string[]> = {
  'iPhone 13': ['Pink', 'Blue', 'Midnight', 'Starlight', '(PRODUCT)RED', 'Green'],
  'iPhone 14': ['Midnight', 'Starlight', 'Blue', 'Purple', '(PRODUCT)RED', 'Yellow'],
  'iPhone 15': ['Black', 'Blue', 'Green', 'Yellow', 'Pink'],
  'iPhone 15 Plus': ['Black', 'Blue', 'Green', 'Yellow', 'Pink'],
  'iPhone 16e': ['Black', 'White'],
  'iPhone 16': ['Black', 'White', 'Pink', 'Teal', 'Ultramarine'],
  'iPhone 16 Plus': ['Black', 'White', 'Pink', 'Teal', 'Ultramarine'],
  'iPhone 16 Pro': ['Black Titanium', 'White Titanium', 'Natural Titanium', 'Desert Titanium'],
  'iPhone 16 Pro Max': ['Black Titanium', 'White Titanium', 'Natural Titanium', 'Desert Titanium'],
  'iPhone 17e': ['Black', 'White', 'Pink'],
  'iPhone Air': ['Space Black', 'Cloud White', 'Light Gold', 'Sky Blue'],
};

const parsedSkus = sourceRows.trim().split('\n').map((row) => {
  const [fullName, rawPrice] = row.split('|');
  const storageMatch = fullName.match(/\b(?:128|256|512|1TB|2TB)\b/);
  const storage = storageMatch?.[0] ?? '';
  const storageIndex = storageMatch?.index ?? fullName.length;
  const model = fullName.slice(0, storageIndex).trim();
  const afterStorage = fullName.slice(storageIndex + storage.length).trim();
  const simMatch = afterStorage.match(/^(eSim|Sim\/eSim)\s*/i);
  const sim = simMatch?.[1] ?? '—';
  const color = afterStorage.slice(simMatch?.[0].length ?? 0).trim() || '—';
  const id = slugify(fullName);
  return { id, model, modelSlug: slugify(model), storage, color, sim, price: Number(rawPrice), image: '/images/king-product-iphone.webp' };
});

const localImageNames = new Set([
  'iphone-13-pink', 'iphone-13-blue', 'iphone-13-midnight', 'iphone-13-starlight', 'iphone-13-green',
  'iphone-14-midnight', 'iphone-14-blue', 'iphone-14-starlight', 'iphone-14-purple',
  'iphone-15-black', 'iphone-15-blue', 'iphone-15-green', 'iphone-15-yellow', 'iphone-15-pink',
  'iphone-16-black', 'iphone-16-white', 'iphone-16-pink', 'iphone-16-teal', 'iphone-16-ultramarine',
  'iphone-16-pro-black-titanium', 'iphone-16-pro-white-titanium', 'iphone-16-pro-natural-titanium', 'iphone-16-pro-desert-titanium',
  'iphone-17-black', 'iphone-17-mist-blue', 'iphone-17-white', 'iphone-17-lavender', 'iphone-17-sage',
  'iphone-17-pro-deep-blue', 'iphone-17-pro-cosmic-orange', 'iphone-17-pro-silver',
  'iphone-air-space-black', 'iphone-air-sky-blue', 'iphone-air-cloud-white', 'iphone-air-light-gold',
  'iphone-16e-black', 'iphone-16e-white',
]);

const imageForSku = (sku: IphoneCatalogSku): string => {
  const imageName = slugify(`${sku.model}-${sku.color}`);
  if (sku.model === 'iPhone 17e' && ['Black', 'White', 'Pink'].includes(sku.color)) {
    return `/images/products/gallery/${imageName}/view-1.jpg`;
  }
  const extension = imageName.startsWith('iphone-16-pro-') || imageName.startsWith('iphone-17-') || imageName.startsWith('iphone-air-') ? 'jpg' : 'png';
  if (localImageNames.has(imageName)) return `/images/products/${imageName}.${extension}`;
  const equivalentModel = sku.model === 'iPhone 15 Plus' ? 'iPhone 15' : sku.model === 'iPhone 16 Plus' ? 'iPhone 16' : sku.model === 'iPhone 16 Pro Max' ? 'iPhone 16 Pro' : sku.model === 'iPhone 17 Pro Max' ? 'iPhone 17 Pro' : '';
  const equivalentImageName = equivalentModel ? slugify(`${equivalentModel}-${sku.color}`) : '';
  const equivalentExtension = equivalentImageName.startsWith('iphone-16-pro-') || equivalentImageName.startsWith('iphone-17-pro-') ? 'jpg' : 'png';
  if (localImageNames.has(equivalentImageName)) return `/images/products/${equivalentImageName}.${equivalentExtension}`;

  // Keep the model silhouette correct when a specific finish is not yet in the
  // local asset pack. This is safer than showing the unrelated generic hero image.
  const modelFallbacks: Record<string, string> = {
    'iPhone 13': 'iphone-13-midnight',
    'iPhone 14': 'iphone-14-midnight',
  };
  const fallback = modelFallbacks[sku.model];
  return fallback ? `/images/products/${fallback}.${fallback.startsWith('iphone-17-') ? 'jpg' : 'png'}` : sku.image;
};

const iphone13Gallery = (image: string, color: string): string[] => {
  if (color === 'Starlight') return [image, '/images/products/iphone-13/white-2.jpg', '/images/products/iphone-13/white-3.jpg'];
  if (color === 'Midnight') return [image, '/images/products/iphone-13/view-2.jpg', '/images/products/iphone-13/view-3.jpg'];
  return [image, '/images/products/iphone-13/view-2.jpg', '/images/products/iphone-13/view-3.jpg'];
};

const iphone16ProGallery = (image: string, color: string): string[] => {
  const key = color === 'Black Titanium' ? 'black' : color === 'White Titanium' ? 'white' : color === 'Natural Titanium' ? 'natural' : 'desert';
  return [image, `/images/products/iphone-16-pro/${key}-2.jpg`, `/images/products/iphone-16-pro/${key}-3.jpg`];
};

const importedGalleryKeys = new Set([
  'iphone-17-black', 'iphone-17-white', 'iphone-17-sage', 'iphone-17-mist-blue', 'iphone-17-lavender',
  'iphone-air-light-gold', 'iphone-air-space-black', 'iphone-air-sky-blue', 'iphone-air-cloud-white',
  'iphone-17-pro-deep-blue', 'iphone-17-pro-cosmic-orange', 'iphone-17-pro-silver',
  'iphone-16-black', 'iphone-16-white', 'iphone-16-pink', 'iphone-16-teal', 'iphone-16-ultramarine',
  'iphone-16-plus-black', 'iphone-16-plus-white', 'iphone-16-plus-pink', 'iphone-16-plus-teal', 'iphone-16-plus-ultramarine',
  'iphone-16e-black', 'iphone-16e-white',
  'iphone-17e-black', 'iphone-17e-white', 'iphone-17e-pink',
]);

const importedGalleryForSku = (sku: IphoneCatalogSku): string[] | undefined => {
  const galleryModel = sku.model === 'iPhone 17 Pro Max' ? 'iPhone 17 Pro' : sku.model;
  const key = slugify(`${galleryModel}-${sku.color}`);
  if (!importedGalleryKeys.has(key)) return undefined;
  return [1, 2, 3].map((index) => {
    if (/^iphone-17-(black|white|sage|mist-blue|lavender)$/.test(key) && index === 1) {
      return `/images/products/gallery/${key}/view-1-upscaled.png`;
    }
    const extension = key.startsWith('iphone-16e-') && index < 3 ? 'png' : 'jpg';
    return `/images/products/gallery/${key}/view-${index}.${extension}`;
  });
};

const galleryForSku = (sku: IphoneCatalogSku, image: string) => {
  const imported = importedGalleryForSku(sku);
  if (imported) return imported;
  if (sku.model === 'iPhone 13') return iphone13Gallery(image, sku.color);
  if (sku.model === 'iPhone 16 Pro' || sku.model === 'iPhone 16 Pro Max') return iphone16ProGallery(image, sku.color);
  return undefined;
};

const baseIphoneCatalog: IphoneCatalogSku[] = parsedSkus.flatMap((sku) => {
  if (sku.color !== '—' || !finishesByModel[sku.model]) {
    const image = imageForSku(sku);
    return [{ ...sku, image, gallery: galleryForSku(sku, image) }];
  }
  return finishesByModel[sku.model].map((color) => {
    const expanded = { ...sku, color, id: `${sku.id}-${slugify(color)}` };
    const image = imageForSku(expanded);
    return { ...expanded, image, gallery: galleryForSku(expanded, image) };
  });
});

// Every model card/page gets a small media rail. Models without dedicated
// multi-angle assets use the first available local finishes of that model;
// dedicated galleries above always take precedence.
export const iphoneCatalog: IphoneCatalogSku[] = baseIphoneCatalog.map((sku) => {
  if (sku.gallery?.length) return sku;
  const modelImages = [...new Set(baseIphoneCatalog.filter((item) => item.model === sku.model).map((item) => item.image))].slice(0, 3);
  return { ...sku, gallery: modelImages.length > 1 ? modelImages : undefined };
});

export const iphoneModels = [...new Map(iphoneCatalog.map((sku) => [sku.modelSlug, sku.model])).entries()].map(([slug, name]) => ({ slug, name }));
