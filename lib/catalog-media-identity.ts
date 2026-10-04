import type {CatalogItem} from './catalog-registry';
/** Visible kit, case size and finish must agree; memory and sales region do not affect the exterior. */
export function mediaAppearance(item:CatalogItem):string {
  const parts=(item.configuration??'').split(' · ').filter(value=>value&&!/^(?:[A-Z0-9]{5}|RU|CN|EU|US|JP|KR|Ростест|Размер \d+)$/.test(value));
  if((item.category==='ipads'||/^iPad\b/.test(item.model))&&item.connectivity){
    const connection=item.connectivity.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g,'');
    parts.push(/cellular|lte|5g/.test(connection)?'Cellular':connection==='wifi'?'Wi-Fi':item.connectivity);
  }
  return [item.category==='watches'?item.size??'':'',...parts].map(value=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()).sort().join('|');
}
