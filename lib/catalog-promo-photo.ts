import type {CatalogItem} from './catalog-registry';

/** Marketing photos use the same reviewed SKU and destination as product cards. */
export function catalogPromoPhoto<T extends Pick<CatalogItem,'model'|'image'> & {href:string}>(items:readonly T[],models:readonly string[]):T|undefined {
  return items.find(item=>models.includes(item.model)&&item.image!=='/images/product-photo-pending.svg');
}
