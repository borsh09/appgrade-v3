export type ProductCategory =
  | 'smartphones'
  | 'laptops'
  | 'tablets'
  | 'watches'
  | 'audio'
  | 'gaming'
  | 'dyson'
  | 'accessories';

export interface ProductModel {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description?: string;
}

export interface ProductSku {
  id: string;
  modelId: ProductModel['id'];
  storage?: string;
  color: string;
  colorSlug: string;
  sim?: 'sim' | 'esim' | 'dual-sim';
  price: number;
  oldPrice?: number;
  image: string;
  availability: Partial<Record<import('@/config/cities').CityId, number>>;
}

export interface FeaturedProduct {
  model: ProductModel;
  sku: ProductSku;
}
