import type { FeaturedProduct, ProductModel, ProductSku } from '@/types/catalog';

export const productModels: ProductModel[] = [
  { id: 'iphone-17-pro', slug: 'iphone-17-pro', name: 'iPhone 17 Pro', brand: 'Apple', category: 'smartphones' },
  { id: 'iphone-17', slug: 'iphone-17', name: 'iPhone 17', brand: 'Apple', category: 'smartphones' },
  { id: 'iphone-16-pro', slug: 'iphone-16-pro', name: 'iPhone 16 Pro', brand: 'Apple', category: 'smartphones' },
  { id: 'macbook-air', slug: 'macbook-air', name: 'MacBook Air 13', brand: 'Apple', category: 'laptops' },
  { id: 'airpods-pro', slug: 'airpods-pro', name: 'AirPods Pro', brand: 'Apple', category: 'audio' },
  { id: 'apple-watch', slug: 'apple-watch', name: 'Apple Watch Series 11', brand: 'Apple', category: 'watches' },
];

const allCities = { magnitogorsk: 4, beloretsk: 2, troitsk: 1 };
export const productSkus: ProductSku[] = [
  { id: '17p-256-orange', modelId: 'iphone-17-pro', storage: '256 GB', color: 'Cosmic Orange', colorSlug: 'orange', sim: 'esim', price: 109990, oldPrice: 119990, image: '/images/king-product-iphone.webp', availability: allCities },
  { id: '17-256-black', modelId: 'iphone-17', storage: '256 GB', color: 'Black', colorSlug: 'black', sim: 'esim', price: 89990, image: '/images/king-product-iphone.webp', availability: allCities },
  { id: '16p-256-titanium', modelId: 'iphone-16-pro', storage: '256 GB', color: 'Black Titanium', colorSlug: 'titanium', sim: 'esim', price: 94990, oldPrice: 102990, image: '/images/king-product-iphone.webp', availability: allCities },
  { id: 'mba-16-256', modelId: 'macbook-air', storage: '16 / 256 GB', color: 'Silver', colorSlug: 'silver', price: 99990, image: '/images/king-category-computers.webp', availability: allCities },
  { id: 'airpods-pro-white', modelId: 'airpods-pro', color: 'White', colorSlug: 'white', price: 23990, image: '/images/king-product-headphones.webp', availability: allCities },
  { id: 'watch-46-black', modelId: 'apple-watch', storage: '46 mm', color: 'Jet Black', colorSlug: 'black', price: 42990, image: '/images/king-category-watches.webp', availability: allCities },
];

export const featuredProducts: FeaturedProduct[] = productSkus.map((sku) => ({
  sku,
  model: productModels.find((model) => model.id === sku.modelId)!,
}));

export const categories = ['iPhone', 'Samsung', 'MacBook', 'iPad', 'Apple Watch', 'AirPods', 'PlayStation', 'Dyson', 'Аксессуары'];
