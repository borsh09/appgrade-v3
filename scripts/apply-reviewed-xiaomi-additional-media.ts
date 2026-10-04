import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const candidates=JSON.parse(readFileSync('.tmp-qa/xiaomi-additional/retail-candidates.json','utf8')) as {model:string;color:string;source:string;sourceTitle:string;url:string;image:string}[];
const finishes:Record<string,{hash:string;ids:string[]}>= {
 Black:{hash:'046914056a11a84f6e73fcc4',ids:['P-85264410','P-37191230','P-32707457']},
 White:{hash:'98ca4d45ab2e4272e9fd3e45',ids:['P-27569513','P-51550344']},
 Green:{hash:'42d55f9722603edf35c1eca9',ids:['P-43135122','P-90630780']},
 Purple:{hash:'1e4f64360ebfa6f6339997ec',ids:['P-97070833','P-37708711']},
};
const file='data/verified-product-media.json';
const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const assets=[];
for(const [color,review] of Object.entries(finishes)){
 const a=candidates.find(a=>a.color===color);
 if(!a||a.model!=='Xiaomi 17 Pro Max'||a.image!==`/images/products/verified/${review.hash}.png`||a.source!=='https://www.mi.com/shop/buy/detail?product_id=21936'||new URL(a.url).hostname!=='cdn.cnbj1.fds.api.mi-img.com'||!existsSync('public'+a.image))throw Error('Reviewed Xiaomi source changed');
 for(const id of review.ids){
  const row=raw.find(row=>row.id===id);if(!row)throw Error('Missing Xiaomi SKU');
  const item=presentCatalogItem(row as CatalogItem);
  if(item.model!==a.model||item.color!==color)throw Error('Xiaomi identity changed: '+id);
  media[id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};
  console.log(id,item.model,color);
 }
 assets.push(a);
}
const supplier=JSON.parse(readFileSync('.tmp-qa/supplier-exact-photo-candidates.json','utf8')) as {ids:string[];gallery:string[];source:string;sourceTitle:string;sourceWorkbook:string;sourceSheet:string;sourceRow:number}[];
const poco=supplier.find(a=>a.ids.length===1&&a.ids[0]==='P-61937761');
const gallery=['8e280db8488e690a57e69c08','85c39f519f7534372d74ca8d','873905f7b64e34cca84b2c66'].map(hash=>`/images/products/verified/${hash}.png`);
if(!poco||poco.source!=='https://mgg.stores-apple.com/catalog/smartfon_poco_m8_8_512_gb_serebristyy/'||poco.sourceRow!==853||JSON.stringify(poco.gallery)!==JSON.stringify(gallery)||gallery.some(image=>!existsSync('public'+image)))throw Error('Reviewed Poco supplier source changed');
const row=raw.find(row=>row.id==='P-61937761');if(!row)throw Error('Missing Poco SKU');
const item=presentCatalogItem(row as CatalogItem);
if(item.model!=='Poco M8'||item.color!=='Silver')throw Error('Poco identity changed');
media[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:poco.source,sourceTitle:poco.sourceTitle,sourceWorkbook:poco.sourceWorkbook,sourceSheet:poco.sourceSheet,sourceRow:poco.sourceRow};
assets.push({...poco,model:item.model,color:item.color});
writeFileSync('data/xiaomi-additional-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
console.log(item.id,item.model,item.color);
