import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import raw from '../data/new-price-catalog.json';
import supplierSources from '../data/parser-store-links.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Review={ids:string[];model:string;color:string;configuration:string;source:string;sourceTitle:string;sourceWorkbook?:string;sourceSheet?:string;sourceRow?:number;assets:{url:string;image:string;width:number;height:number}[]};
// This manifest contains only originals individually inspected before inclusion.
const reviews=JSON.parse(readFileSync('data/reviewed-product-photo-import.json','utf8')) as Review[];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
for(const review of reviews){
 if(!review.ids.length||!review.assets.length||new URL(review.source).protocol!=='https:')throw Error('Invalid reviewed source');
 if(review.sourceWorkbook!==undefined&&(review.sourceWorkbook!=='Парсер.xlsx'||!supplierSources.some(s=>s.url===review.source&&s.sheet===review.sourceSheet&&s.row===review.sourceRow)))throw Error('Reviewed supplier workbook link changed');
 for(const a of review.assets){
  const hash=createHash('sha256').update(a.url).digest('hex').slice(0,24);
  if(new URL(a.url).protocol!=='https:'||!new RegExp(`^/images/products/verified/${hash}\\.(png|jpg|webp)$`).test(a.image))throw Error('Reviewed original URL/path changed');
  const m=await sharp('public'+a.image).metadata();if(m.width!==a.width||m.height!==a.height||Math.max(a.width,a.height)<600)throw Error('Reviewed native dimensions changed');
 }
 for(const id of review.ids){const r=raw.find(r=>r.id===id);if(!r)throw Error('Reviewed SKU missing');const item=presentCatalogItem(r as CatalogItem);
  if(item.model!==review.model||item.color!==review.color||(item.configuration??'')!==review.configuration)throw Error('Reviewed model/color/configuration changed');
  media[id]={image:review.assets[0].image,gallery:review.assets.map(a=>a.image),status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:review.source,sourceTitle:review.sourceTitle,...(review.sourceWorkbook?{sourceWorkbook:review.sourceWorkbook,sourceSheet:review.sourceSheet,sourceRow:review.sourceRow}:{})};console.log(id,item.model,item.color);
 }
}
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
