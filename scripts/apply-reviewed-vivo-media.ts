import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={model:string;color:string;label:string;source:string;sourceTitle:string;satelliteListed:boolean;url:string;image:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/vivo/candidates.json','utf8')) as Asset[];
const reviews=[
 {ids:['P-41435680'],model:'Vivo X300 FE',assetModel:'Vivo X300 FE',color:'Purple',label:'Mist Purple',hash:'91adb2aba428309111a76f25',path:'/th/products/param/x300-fe'},
 {ids:['P-59135959'],model:'Vivo X300 FE',assetModel:'Vivo X300 FE',color:'White',label:'Glow White',hash:'0dde8f61243bd219a1017a1d',path:'/th/products/param/x300-fe'},
 {ids:['P-62281214','P-95164671'],model:'Vivo X300',assetModel:'Vivo X300',color:'Black',label:'纯粹黑',hash:'43180ad40283322d5d0e5dae',path:'/vivo/param/x300'},
 {ids:['P-97062172'],model:'Vivo X300 Pro',assetModel:'Vivo X300 Pro',color:'Brown',label:'旷野棕',hash:'de9364d5a65278df1940bc11',path:'/vivo/param/x300pro'},
 {ids:['P-43075923'],model:'Vivo X300 Pro Satellite',assetModel:'Vivo X300 Pro',color:'White',label:'简单白',hash:'274896b0984d997576e67ac7',path:'/vivo/param/x300pro'},
 {ids:['P-15799047'],model:'Vivo X300 Pro Satellite',assetModel:'Vivo X300 Pro',color:'Black',label:'纯粹黑',hash:'8fd5bfc4d9f703c24c437a2b',path:'/vivo/param/x300pro'},
 {ids:['P-79195881'],model:'Vivo X300 Ultra',assetModel:'Vivo X300 Ultra',color:'Black',label:'黑 Ka',hash:'72115d0a8a8c2ba7e43fc3a5',path:'/vivo/param/x300ultra'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const a=candidates.find(a=>a.image===`/images/products/verified/${review.hash}.png`);
 if(!a||a.model!==review.assetModel||a.color!==review.color||a.label!==review.label||new URL(a.source).pathname!==review.path||!['www.vivo.com','www.vivo.com.cn'].includes(new URL(a.source).hostname)||!['asia-exstatic-vivofs.vivo.com','wwwstatic.vivo.com.cn','cn-exstatic-vivofs.iqoo.com'].includes(new URL(a.url).hostname)||!existsSync('public'+a.image))throw Error('Reviewed Vivo original changed');
 if(review.model.endsWith('Satellite')&&!a.satelliteListed)throw Error('Factory specification must explicitly include Satellite edition');
 for(const id of review.ids){
  const row=raw.find(row=>row.id===id);if(!row)throw Error('Vivo SKU missing');const item=presentCatalogItem(row as CatalogItem);
  if(item.model!==review.model||item.color!==review.color)throw Error('Vivo identity changed');
  media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};console.log(item.id,item.model,item.color);
 }
 assets.push(a);
}
writeFileSync('data/vivo-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
