export interface SamsungCatalogSku {
  id: string;
  model: string;
  modelSlug: string;
  storage: string;
  ram: string;
  color: string;
  sim: string;
  price: number;
  image: string;
  gallery: string[];
}

const sourceRows = `
Samsung Galaxy S24 Ultra 12/256|66990
Samsung Galaxy S24 Ultra 12/512|70990
Samsung Galaxy S25 12/256|54990
Samsung Galaxy S25 12/512|64990
Samsung Galaxy S25 FE 8/256|49990
Samsung Galaxy S25 FE 8/512|54990
Samsung Galaxy S25 Plus 12/256|59990
Samsung Galaxy S25 Plus 12/512|71990
Samsung Galaxy S25 Ultra 12/256|68990
Samsung Galaxy S25 Ultra 12/512|78990
Samsung Galaxy S25 Ultra 12/1TB|80990
Samsung Galaxy S25 Edge 12/256|51990
Samsung Galaxy S25 Edge 12/512|59990
Samsung Galaxy S26 12/256|57990
Samsung Galaxy S26 12/512|68990
Samsung Galaxy S26 Plus 12/256|65990
Samsung Galaxy S26 Plus 12/512|77990
Samsung Galaxy S26 Ultra 12/256|78990
Samsung Galaxy S26 Ultra 12/512|94990
Samsung Galaxy S26 Ultra 16/1TB|114990
Samsung Galaxy A57 8/128|29990
Samsung Galaxy A57 8/256|33990
Samsung Galaxy A57 12/256|37990
Samsung Galaxy A57 12/512|44990
Samsung Galaxy A37 8/128|25990
Samsung Galaxy A37 8/256|29990
Samsung Galaxy A37 12/256|30990
Samsung Galaxy A17 4/128|13990
Samsung Galaxy A17 6/128|15990
Samsung Galaxy A17 8/256|18990
Samsung Galaxy Z Fold 8 12/256|131990
Samsung Galaxy Z Fold 8 12/512|152990
Samsung Galaxy Z Fold 8 16/1TB|179990
Samsung Galaxy Z Flip 8 12/256|89990
Samsung Galaxy Z Flip 8 12/512|105990
Samsung Galaxy Z Fold 8 Ultra 12/256|142990
Samsung Galaxy Z Fold 8 Ultra 12/512|164990
Samsung Galaxy Z Fold 8 Ultra 16/1TB|201990`;

const colorsByModel: Record<string, string[]> = {
  'Samsung Galaxy S24 Ultra': ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'],
  'Samsung Galaxy S25': ['Navy', 'Icyblue', 'Mint', 'Silver Shadow'],
  'Samsung Galaxy S25 FE': ['Navy', 'Jetblack', 'Icyblue', 'White'],
  'Samsung Galaxy S25 Plus': ['Navy', 'Icyblue', 'Mint', 'Silver Shadow'],
  'Samsung Galaxy S25 Ultra': ['Titanium Silverblue', 'Titanium Gray', 'Titanium Black', 'Titanium Whitesilver'],
  'Samsung Galaxy S25 Edge': ['Titanium Icyblue', 'Titanium Silver', 'Titanium Jetblack'],
  'Samsung Galaxy S26': ['Cobalt Violet', 'Sky Blue', 'Black', 'White'],
  'Samsung Galaxy S26 Plus': ['Cobalt Violet', 'Sky Blue', 'Black', 'White'],
  'Samsung Galaxy S26 Ultra': ['Cobalt Violet', 'Sky Blue', 'Black', 'White'],
  'Samsung Galaxy A57': ['Awesome Icyblue', 'Awesome Gray', 'Awesome Navy'],
  'Samsung Galaxy A37': ['Gray Green', 'Lavender', 'Charcoal', 'White'],
  'Samsung Galaxy A17': ['Black', 'Gray', 'Light Blue'],
  'Samsung Galaxy Z Fold 8': ['Lavender', 'Graphite', 'Cream', 'Pistachio'],
  'Samsung Galaxy Z Flip 8': ['Pink', 'Graphite', 'Cream', 'Mint'],
  'Samsung Galaxy Z Fold 8 Ultra': ['Green Shadow', 'Violet Shadow', 'Graphite', 'Cream'],
};

const mediaByModel: Record<string, string> = {
  'Samsung Galaxy S24 Ultra': 'https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-kv.jpg',
  'Samsung Galaxy S25': 'https://i.ebayimg.com/images/g/TiUAAOSwjRFoIvZL/s-l1600.png',
  'Samsung Galaxy S25 Plus': 'https://i.ebayimg.com/images/g/TiUAAOSwjRFoIvZL/s-l1600.png',
  'Samsung Galaxy S25 FE': 'https://www.telekoplus.com/repo/mobilni-telefoni/images/Samsung/Samsung-Galaxy-S25-FE-all-colors.jpg',
  'Samsung Galaxy S25 Ultra': 'https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-s25-ultra/images/galaxy-s25-ultra-features-kv.jpg',
  'Samsung Galaxy S25 Edge': 'https://images.samsung.com/sa/smartphones/galaxy-s25-edge/buy/kv_color_MO.png?imbypass=true',
  'Samsung Galaxy S26': 'https://clickbuy.com.vn/uploads/images/samsung-galaxy-s26-plus/samsung-galaxy-s26-plus-co-may-mau.jpg',
  'Samsung Galaxy S26 Plus': 'https://clickbuy.com.vn/uploads/images/samsung-galaxy-s26-plus/samsung-galaxy-s26-plus-co-may-mau.jpg',
  'Samsung Galaxy S26 Ultra': 'https://images.samsung.com/hk_en/smartphones/galaxy-s26-ultra/buy/M3_GlobalGroupImage_MO_720x480.jpg?imbypass=true',
  'Samsung Galaxy A57': 'https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-a57-5g/galaxy-a57-5g-share-image.jpg',
  'Samsung Galaxy A37': 'https://images.samsung.com/is/image/samsung/assets/tr/smartphones/socialimage/260320_a37_multi_cutout_carousel_buypage_720x480px.png',
  'Samsung Galaxy A17': 'https://images.samsung.com/is/image/samsung/assets/global/smartphones/galaxy-a17-5g/galaxy-a17-5g-share-image.jpg',
  'Samsung Galaxy Z Fold 8': 'https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-z-fold8/galaxy-z-fold8-share-image.jpg',
  'Samsung Galaxy Z Flip 8': 'https://images.samsung.com/kz_kz/smartphones/galaxy-z-flip7/buy/gallery/b7_global_color_group_kv_no-text_mo_720x480_250609.jpg?imbypass=true',
  'Samsung Galaxy Z Fold 8 Ultra': 'https://images.samsung.com/is/image/samsung/assets/us/smartphones/galaxy-z-fold8/galaxy-z-fold8-share-image.jpg',
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const mediaFor = (model: string, color: string) => {
  if (['Samsung Galaxy S24 Ultra', 'Samsung Galaxy S25', 'Samsung Galaxy S25 FE', 'Samsung Galaxy S25 Plus', 'Samsung Galaxy S25 Ultra', 'Samsung Galaxy S25 Edge', 'Samsung Galaxy S26', 'Samsung Galaxy S26 Plus', 'Samsung Galaxy S26 Ultra', 'Samsung Galaxy A57', 'Samsung Galaxy A37', 'Samsung Galaxy A17', 'Samsung Galaxy Z Fold 8', 'Samsung Galaxy Z Flip 8', 'Samsung Galaxy Z Fold 8 Ultra'].includes(model)) {
    const root = `/images/products/gallery/${slugify(`${model}-${color}`)}`;
    const gallery = [1, 2, 3].map((index) => `${root}/view-${index}.${model === 'Samsung Galaxy S25 Edge' && index === 3 ? 'png' : 'jpg'}`);
    return { image: gallery[0], gallery };
  }
  const image = mediaByModel[model];
  return { image, gallery: [`${image}${image.includes('?') ? '&' : '?'}view=1`, `${image}${image.includes('?') ? '&' : '?'}view=2`, `${image}${image.includes('?') ? '&' : '?'}view=3`] };
};

export const samsungCatalog: SamsungCatalogSku[] = sourceRows.trim().split('\n').flatMap((row) => {
  const [title, rawPrice] = row.split('|');
  const config = title.match(/(\d+)\/(128|256|512|1TB)$/);
  if (!config) return [];
  const model = title.slice(0, config.index).trim();
  const ram = `${config[1]} GB`;
  const storage = config[2] === '1TB' ? '1 TB' : `${config[2]} GB`;
  const modelSlug = slugify(model);
  return (colorsByModel[model] ?? ['Black']).map((color) => {
    const media = mediaFor(model, color);
    return { id: slugify(`${title}-${color}`), model, modelSlug, ram, storage, color, sim: 'Dual SIM / eSIM', price: Number(rawPrice), ...media };
  });
});

export const samsungModels = [...new Map(samsungCatalog.map((sku) => [sku.modelSlug, sku.model])).entries()].map(([slug, name]) => ({ slug, name }));
