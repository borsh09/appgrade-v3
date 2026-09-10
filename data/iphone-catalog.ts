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
iPhone 18 Pro Max 256 eSim Black|169990
iPhone 18 Pro Max 256 eSim Burgundy|171990
iPhone 18 Pro Max 256 Sim/eSim Black|171990
iPhone 18 Pro Max 256 Sim/eSim Burgundy|173990
iPhone 18 Pro Max 512 eSim Black|181990
iPhone 18 Pro Max 512 eSim Burgundy|183990
iPhone 18 Pro Max 512 Sim/eSim Black|183990
iPhone 18 Pro Max 512 Sim/eSim Burgundy|185990
iPhone 18 Pro Max 1TB eSim Black|204990
iPhone 18 Pro Max 1TB eSim Burgundy|206990
iPhone 18 Pro Max 1TB Sim/eSim Black|206990
iPhone 18 Pro Max 1TB Sim/eSim Burgundy|208990
iPhone 18 Pro Max 2TB eSim Black|229990
iPhone 18 Pro Max 2TB eSim Burgundy|231990
iPhone 18 Pro Max 2TB Sim/eSim Black|231990
iPhone 18 Pro Max 2TB Sim/eSim Burgundy|233990
iPhone Duo 256 eSim Star White|239990
iPhone Duo 512 eSim Star White|259990
iPhone Duo 1TB eSim Star White|289990
iPhone Duo 2TB eSim Star White|329990
iPhone 18 Pro 256 eSim Black|147990
iPhone 18 Pro 256 eSim Burgundy|149990
iPhone 18 Pro 256 Sim/eSim Black|149990
iPhone 18 Pro 256 Sim/eSim Burgundy|151990
iPhone 18 Pro 512 eSim Black|159990
iPhone 18 Pro 512 eSim Burgundy|161990
iPhone 18 Pro 512 Sim/eSim Black|161990
iPhone 18 Pro 512 Sim/eSim Burgundy|163990
iPhone 18 Pro 1TB eSim Black|179990
iPhone 18 Pro 1TB eSim Burgundy|181990
iPhone 18 Pro 1TB Sim/eSim Black|181990
iPhone 18 Pro 1TB Sim/eSim Burgundy|183990
iPhone 18 Pro 2TB eSim Black|199990
iPhone 18 Pro 2TB eSim Burgundy|201990
iPhone 18 Pro 2TB Sim/eSim Black|201990
iPhone 18 Pro 2TB Sim/eSim Burgundy|203990
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

const expandedSourceRows = sourceRows.trim().split('\n').flatMap((row) => {
  if (!/^iPhone 18 Pro(?: Max)? /.test(row) || !/ (Black|Burgundy)\|/.test(row)) return [row];
  const silver = row.replace(/ (Black|Burgundy)\|/, ' Silver|').replace(/\|(\d+)$/, (_, price) => `|${Number(price) + 1000}`);
  const glacier = row.replace(/ (Black|Burgundy)\|/, ' Glacier|').replace(/\|(\d+)$/, (_, price) => `|${Number(price) + 500}`);
  return [row, silver, glacier];
});

const parsedSkus = expandedSourceRows.map((row) => {
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
  const apple2027Image: Record<string, string> = {
    'iPhone 18 Pro Max': '/images/products/apple-2027/clean/iphone-18-pro-max.png',
    'iPhone Duo': '/images/products/apple-2027/clean/iphone-duo.png',
    'iPhone 18 Pro': '/images/products/apple-2027/clean/iphone-18-pro.png',
  };
  const apple2027ColorImage: Record<string, string> = {
    'iPhone 18 Pro|Silver': '/images/products/apple-2027/clean/iphone-18-pro-silver.png',
    'iPhone 18 Pro|Glacier': '/images/products/apple-2027/clean/iphone-18-pro-glacier.png',
    'iPhone 18 Pro Max|Silver': '/images/products/apple-2027/clean/iphone-18-pro-max-silver.png',
    'iPhone 18 Pro Max|Glacier': '/images/products/apple-2027/clean/iphone-18-pro-max-glacier.png',
  };
  if (apple2027ColorImage[`${sku.model}|${sku.color}`]) return apple2027ColorImage[`${sku.model}|${sku.color}`];
  if (apple2027Image[sku.model]) return apple2027Image[sku.model];
  const imageName = slugify(`${sku.model}-${sku.color}`);
  if (sku.model === 'iPhone 13' && ['Pink', 'Blue', 'Midnight', 'Starlight', '(PRODUCT)RED', 'Green'].includes(sku.color)) {
    return `/images/products/clean/iphone-13-${slugify(sku.color)}.png`;
  }
  if ((sku.model === 'iPhone 14' && ['Midnight', 'Blue', 'Starlight', 'Purple', '(PRODUCT)RED', 'Yellow'].includes(sku.color)) ||
      (sku.model === 'iPhone 15' && ['Black', 'Blue', 'Green', 'Yellow', 'Pink'].includes(sku.color))) {
    return `/images/products/clean/${slugify(sku.model)}-${slugify(sku.color)}.png`;
  }
  if ((sku.model === 'iPhone 16' || sku.model === 'iPhone 16 Plus') && ['Black', 'White', 'Pink', 'Teal', 'Ultramarine'].includes(sku.color)) {
    return `/images/products/clean/iphone-16-${slugify(sku.color)}.png`;
  }
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
  const apple2027Gallery: Record<string, string[]> = {
    'iPhone 18 Pro Max': [image],
    'iPhone Duo': [image],
    'iPhone 18 Pro': [image],
  };
  if (apple2027Gallery[sku.model]) return apple2027Gallery[sku.model];
  const imported = importedGalleryForSku(sku);
  if (imported) return imported;
  if (sku.model === 'iPhone 13' || sku.model === 'iPhone 14' || sku.model === 'iPhone 15' || sku.model === 'iPhone 16' || sku.model === 'iPhone 16 Plus') return [image];
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

// Keep every new iPhone variant at the front of the default catalog, then
// distribute the remaining models in a stable mixed order.
const newIphoneModels = new Set(['iPhone 18 Pro Max', 'iPhone Duo', 'iPhone 18 Pro']);
const stableMix = (items: IphoneCatalogSku[]) => [...items].sort((a, b) => {
  const score = (value: string) => {
    let total = 7;
    for (let index = 0; index < value.length; index += 1) total = (total * 31 + value.charCodeAt(index)) % 1000003;
    return total;
  };
  return score(a.id) - score(b.id);
});
const mixWithoutDuplicatePairs = (items: IphoneCatalogSku[]) => {
  const mixed = stableMix(items);
  for (let index = 1; index < mixed.length; index += 1) {
    if (mixed[index].model !== mixed[index - 1].model || mixed[index].color !== mixed[index - 1].color) continue;
    const swapIndex = mixed.findIndex((candidate, candidateIndex) => candidateIndex > index && (candidate.model !== mixed[index - 1].model || candidate.color !== mixed[index - 1].color));
    if (swapIndex > index) [mixed[index], mixed[swapIndex]] = [mixed[swapIndex], mixed[index]];
  }
  return mixed;
};
const interleaveNewModels = (items: IphoneCatalogSku[]) => {
  const modelOrder = ['iPhone 18 Pro Max', 'iPhone Duo', 'iPhone 18 Pro'];
  const queues = new Map(modelOrder.map((model) => [model, stableMix(items.filter((sku) => sku.model === model))]));
  const result: IphoneCatalogSku[] = [];
  let round = 0;
  while (result.length < items.length) {
    for (let offset = 0; offset < modelOrder.length; offset += 1) {
      const model = modelOrder[(round + offset) % modelOrder.length];
      const queue = queues.get(model);
      if (queue?.length) result.push(queue.shift()!);
    }
    round += 1;
  }
  return result;
};
const orderedBaseIphoneCatalog = [
  ...interleaveNewModels(baseIphoneCatalog.filter((sku) => newIphoneModels.has(sku.model))),
  ...mixWithoutDuplicatePairs(baseIphoneCatalog.filter((sku) => !newIphoneModels.has(sku.model))),
];

// Every model card/page gets a small media rail. Models without dedicated
// multi-angle assets use the first available local finishes of that model;
// dedicated galleries above always take precedence.
export const iphoneCatalog: IphoneCatalogSku[] = orderedBaseIphoneCatalog.map((sku) => {
  if (sku.gallery?.length) return sku;
  const modelImages = [...new Set(orderedBaseIphoneCatalog.filter((item) => item.model === sku.model).map((item) => item.image))].slice(0, 3);
  return { ...sku, gallery: modelImages.length > 1 ? modelImages : undefined };
});

export const iphoneModels = [...new Map(iphoneCatalog.map((sku) => [sku.modelSlug, sku.model])).entries()].map(([slug, name]) => ({ slug, name }));
