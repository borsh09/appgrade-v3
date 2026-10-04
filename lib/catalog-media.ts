import media from '@/data/catalog-product-media.json';
import type { CatalogItem } from './catalog-registry';
import {mediaAppearance} from './catalog-media-identity';
import {photoSourceMatchesItem} from './catalog-photo-source';

export const missingProductImage = '/images/product-photo-pending.svg';
export type ProductMedia = { image: string; gallery: string[]; status: 'verified' | 'pending'; referenceModel?: string; referenceColor?: string; referenceAppearance?: string; source?: string; sourceTitle?: string; sourceWorkbook?: string; sourceSheet?: string; sourceRow?: number };
export function applyCatalogMedia(item: CatalogItem): CatalogItem {
  const entry = (media as Record<string, ProductMedia>)[item.id];
  const verified = entry?.status === 'verified' && entry.referenceModel === item.model && entry.referenceColor === item.color && entry.referenceAppearance===mediaAppearance(item) && photoSourceMatchesItem(item,entry);
  return { ...item, image: verified ? entry.image : missingProductImage,
    gallery: verified ? entry.gallery : [missingProductImage], photoApproximate: false,
    photoMissing: !verified };
}
