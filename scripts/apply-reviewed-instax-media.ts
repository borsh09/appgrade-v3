import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={source:string;url:string;image:string;color:string;angle:string};
const assets=JSON.parse(readFileSync('.tmp-qa/instax-mini13/uk-candidates.json','utf8')) as Asset[];
const source='https://instax.co.uk/cameras/mini-13/';
const reviews=[
 {id:'P-95182441',color:'Pink',label:'Candy Pink',hash:'21b825bb4a9d8387ff9337fe'},
 {id:'P-80117749',color:'Purple',label:'Dreamy Purple',hash:'1753e8a8ffb62745b45c4107'},
 {id:'P-55220776',color:'Blue',label:'Frost Blue',hash:'14a95d45c84e198dd40c9a9f'},
 {id:'P-56626036',color:'Green',label:'Lagoon Green',hash:'afd22a0b0d2a00765d08e2b1'},
 {id:'P-78526858',color:'White',label:'Clay White',hash:'2948928622a6feed35a1cad6'},
];
const html=readFileSync('.tmp-qa/instax-mini13/uk.html','utf8');
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const reviewed:Asset[]=[];
for(const review of reviews){
 const a=assets.find(a=>a.image===`/images/products/verified/${review.hash}.webp`);
 const expected=`https://instax.co.uk/wp-content/uploads/sites/3/2026/02/hero-mini-13-${review.label.toLowerCase().replaceAll(' ','-')}.webp`;
 if(!a||a.source!==source||a.url!==expected||a.color!==review.color.toLowerCase()||!html.includes(expected)||createHash('sha256').update(a.url).digest('hex').slice(0,24)!==review.hash)throw Error('Reviewed factory camera photo changed');
 const m=await sharp('public'+a.image).metadata();if(m.width!==745||m.height!==1000||!m.hasAlpha)throw Error('Native camera dimensions changed');
 const r=raw.find(r=>r.id===review.id);if(!r)throw Error('Camera SKU missing');const item=presentCatalogItem(r as CatalogItem);
 if(item.model!=='Fujifilm Instax Mini 13'||item.color!==review.color||item.configuration)throw Error('Camera model/color/configuration changed');
 media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source,sourceTitle:`instax mini 13 ${review.label}`};reviewed.push(a);console.log(item.id,item.model,item.color);
}
writeFileSync('data/instax-mini13-reviewed-photo-assets.json',JSON.stringify(reviewed,null,2)+'\n');writeFileSync(file,JSON.stringify(media,null,2)+'\n');
