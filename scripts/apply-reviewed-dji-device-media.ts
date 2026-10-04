import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
const selected=[
 {id:'P-10546523',key:'dji-mobile8',model:'DJI Osmo Mobile 8 Device Only',photo:'707bfc04f430d59268873440.jpg'},
 {id:'P-89832823',key:'dji-mobile8p',model:'DJI Osmo Mobile 8P Device Only',photo:'d08fc8f60e7351d4cbac55d1.jpg'},
];
const file='data/verified-product-media.json';const media=JSON.parse(readFileSync(file,'utf8'));
for(const review of selected){
 const rawItem=raw.find(p=>p.id===review.id);if(!rawItem)throw Error('Missing reviewed SKU');
 const item=presentCatalogItem(rawItem as CatalogItem);
 const candidates=JSON.parse(readFileSync(`.tmp-qa/photo-review-candidates/${review.key}.json`,'utf8')) as {file:string;url:string;source:string;sourceTitle:string;alt:string}[];
 const c=candidates.find(c=>c.file.endsWith('/'+review.photo));
 if(item.model!==review.model||!c||c.alt!=='dots-2'||new URL(c.url).hostname!=='se-cdn.djiits.com'||c.source!==`https://store.dji.com/uk/product/${review.key.replace('dji-mobile','osmo-mobile-')}`)throw Error('Reviewed model or factory source changed');
 const image='/images/products/verified/'+review.photo;copyFileSync(c.file,'public'+image);
 media[item.id]={image,gallery:[image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:c.source,sourceTitle:c.sourceTitle};
}
writeFileSync(file,JSON.stringify(media,null,2)+'\n');console.log('Two DJI Device Only lifestyle mains replaced with reviewed factory studio originals');
