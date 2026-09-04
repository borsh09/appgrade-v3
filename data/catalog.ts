import type { FeaturedProduct, ProductModel, ProductSku } from '@/types/catalog';
import { iphoneCatalog } from './iphone-catalog';
import { macbookCatalog } from './macbook-catalog';
import { audioCatalog } from './audio-catalog';

export const productModels: ProductModel[] = [
  { id: 'iphone-17-pro', slug: 'iphone-17-pro', name: 'iPhone 17 Pro', brand: 'Apple', category: 'smartphones' },
  { id: 'iphone-17', slug: 'iphone-17', name: 'iPhone 17', brand: 'Apple', category: 'smartphones' },
  { id: 'airpods-max', slug: 'airpods-max-2-2026', name: 'AirPods Max 2 2026', brand: 'Apple', category: 'audio' },
  { id: 'macbook-air', slug: 'macbook-air', name: 'MacBook Air 13', brand: 'Apple', category: 'laptops' },
  { id: 'airpods-pro', slug: 'airpods-pro', name: 'AirPods Pro', brand: 'Apple', category: 'audio' },
  { id: 'apple-watch', slug: 'apple-watch', name: 'Apple Watch Series 11', brand: 'Apple', category: 'watches' },
  { id: 'samsung-s25-ultra', slug: 'samsung-galaxy-s25-ultra', name: 'Samsung Galaxy S25 Ultra', brand: 'Samsung', category: 'smartphones' },
];

const allCities = { magnitogorsk: 4, beloretsk: 2, troitsk: 1 };
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const iphonePro = iphoneCatalog.find((item) => item.model === 'iPhone 17 Pro' && item.storage === '256 GB' && item.color === 'Cosmic Orange') ?? iphoneCatalog.find((item) => item.model === 'iPhone 17 Pro')!;
const iphone = iphoneCatalog.find((item) => item.model === 'iPhone 17' && item.storage === '256 GB' && item.color === 'Black') ?? iphoneCatalog.find((item) => item.model === 'iPhone 17')!;
const macbook = macbookCatalog.find((item) => item.model === 'MacBook Air 15 M5' && item.storage === '512 GB') ?? macbookCatalog.find((item) => item.model === 'MacBook Air 15 M5')!;
const airpodsMax = audioCatalog.find((item) => item.model === 'AirPods Max 2 2026' && item.color === 'Starlight') ?? audioCatalog.find((item) => item.model === 'AirPods Max 2 2026')!;

export const productSkus: ProductSku[] = [
  { id: iphonePro.id, modelId: 'iphone-17-pro', storage: iphonePro.storage, color: iphonePro.color, colorSlug: slug(iphonePro.color), sim: 'esim', price: iphonePro.price, image: iphonePro.image, availability: allCities },
  { id: iphone.id, modelId: 'iphone-17', storage: iphone.storage, color: iphone.color, colorSlug: slug(iphone.color), sim: 'esim', price: iphone.price, image: iphone.image, availability: allCities },
  { id: macbook.id, modelId: 'macbook-air', storage: macbook.storage, color: macbook.color, colorSlug: slug(macbook.color), price: macbook.price, image: macbook.image, availability: allCities },
  { id: airpodsMax.id, modelId: 'airpods-max', color: airpodsMax.color, colorSlug: slug(airpodsMax.color), price: airpodsMax.price ?? 0, image: airpodsMax.image, availability: allCities },
];

export const featuredProducts: FeaturedProduct[] = productSkus.map((sku) => ({
  sku,
  model: productModels.find((model) => model.id === sku.modelId)!,
}));

export const categories = ['iPhone', 'Samsung', 'MacBook', 'iPad', 'Apple Watch', 'AirPods', 'PlayStation', 'Dyson', 'Аксессуары'];
