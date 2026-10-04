import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const candidates=JSON.parse(readFileSync('.tmp-qa/apple-accessories/small-accessory-candidates.json','utf8')) as {key:string;source:string;sourceTitle:string;url:string;image:string;angle:string}[];
const reviews=[
 {id:'P-35326595',key:'earpods',model:'EarPods USB-C',title:'EarPods (USB-C)',angles:['MTJY3']},
 {id:'P-83505097',key:'cable60',model:'Apple 60W USB-C Charge Cable (1m)',title:'60W USB-C Charge Cable',angles:['MQKJ3','MQKJ3_AV1']},
 {id:'P-76552048',key:'lightning',model:'Apple USB-C to Lightning Cable (1m)',title:'USB-C to Lightning Cable',angles:['MM0A3']},
 {id:'P-23819184',key:'magsafe2',model:'Apple MagSafe Charger (2m)',title:'MagSafe Charger (2',angles:['MGDM4','MGDM4_AV1','MGDM4_AV2']},
 {id:'P-33709233',key:'magsafe1',model:'Apple MagSafe Charger (1m)',title:'MagSafe Charger (1',angles:['MGD74','MGD74_AV1','MGD74_AV2']},
 {id:'P-98927526',key:'mouseblack',model:'Apple Magic Mouse',title:'Magic Mouse (USB',color:'Black',configuration:'USB-C',angles:['MXK63_AV1','MXK63','MXK63_AV2','MXK63_AV3']},
 {id:'P-37661327',key:'mousewhite',model:'Apple Magic Mouse',title:'Magic Mouse (USB',color:'White',configuration:'USB-C',angles:['MXK53_AV1','MXK53','MXK53_AV2','MXK53_AV3']},
];
const file='data/verified-product-media.json';const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const assets=[];
for(const review of reviews){
 const row=raw.find(row=>row.id===review.id);if(!row)throw Error('Missing Apple accessory');
 const item=presentCatalogItem(row as CatalogItem);if(item.model!==review.model||item.color!==(review.color??'')||('configuration' in review&&item.configuration!==review.configuration))throw Error('Apple accessory identity changed');
 const photos=review.angles.map(angle=>candidates.find(a=>a.key===review.key&&a.angle===angle));
 if(photos.some(a=>!a||new URL(a.source).hostname!=='www.apple.com'||new URL(a.url).hostname!=='store.storeimages.cdn-apple.com'||!a.sourceTitle.replaceAll('\u00a0',' ').includes(review.title)||!existsSync('public'+a.image)))throw Error('Reviewed Apple original missing');
 const verified=photos as typeof candidates;
 media[item.id]={image:verified[0].image,gallery:verified.map(a=>a.image),status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:verified[0].source,sourceTitle:verified[0].sourceTitle};
 assets.push(...verified.map(a=>({...a,model:item.model,color:item.color})));
 console.log(item.id,item.model,verified.length);
}
writeFileSync('data/small-apple-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
