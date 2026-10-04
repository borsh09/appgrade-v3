import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={source:string;sourceTitle:string;model:string;color:string;angle:string;image:string;url:string};
const assets=JSON.parse(readFileSync('data/yandex-reviewed-photo-assets.json','utf8')) as Asset[];
const supplier=JSON.parse(readFileSync('data/yandex-supplier-reviewed-media.json','utf8')) as {id:string;image:string;gallery:string[];source:string;sourceTitle:string}[];
const file='data/verified-product-media.json';const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const norm=(s:string)=>s.toLowerCase().replaceAll('ё','е');let count=0;
const models:Record<string,string>={'Яндекс Станция Дуо Макс':'station-duo-max','Яндекс Станция 3':'station-3','Яндекс Станция Мини 3':'station-mini-3','Яндекс Станция Мини 3 Про':'station-mini-3-pro','Яндекс Станция Стрит':'station-street','Яндекс Станция Макс':'station-max','Яндекс Станция Миди':'station-midi'};
for(const record of raw){
 if(record.sourceCategory!=='Яндекс Станция')continue;
 const item=presentCatalogItem(record as CatalogItem);
 const reviewedModel=Object.keys(models).find(model=>norm(model)===norm(item.model));if(!reviewedModel){console.log('Unmatched station model',item.id,item.model,item.color);continue;}
 const higherResolution=supplier.find(s=>s.id===item.id);
 if(higherResolution){
  if(new URL(higherResolution.source).hostname!=='mgg.stores-apple.com'||!higherResolution.gallery.every(image=>existsSync('public'+image)))throw Error('Invalid reviewed supplier original');
  manual[item.id]={image:higherResolution.image,gallery:higherResolution.gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:higherResolution.source,sourceTitle:higherResolution.sourceTitle};
  console.log(item.id,'retained native 1000px supplier gallery');count++;continue;
 }
 const selected=assets.filter(a=>norm(a.model)===norm(item.model)&&norm(a.color)===norm(item.color));
 if(selected.length!==1||selected[0].angle!=='Main')throw Error('Reviewed exact station color missing');
 const a=selected[0];
 if(a.source!==`https://alice.yandex.ru/store/product/${models[reviewedModel]}`||new URL(a.url).hostname!=='avatars.mds.yandex.net'||!a.url.includes('/get-iot/')||!existsSync(`public${a.image}`))throw Error('Invalid reviewed Yandex source');
 manual[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:`${a.sourceTitle}; ${a.color}`};
 console.log(item.id,item.color);count++;
}
if(count!==23)throw Error(`Expected 23 reviewed station configurations, got ${count}`);writeFileSync(file,JSON.stringify(manual,null,2)+'\n');
