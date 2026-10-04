import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const candidates=JSON.parse(readFileSync('.tmp-qa/nothing/candidates.json','utf8')) as {model:string;color:string;source:string;sourceTitle:string;url:string;image:string}[];
const reviews=[
 {ids:['P-45015758','P-25841710'],model:'Nothing Phone 3',color:'Black',hash:'873951cbd399087c3f915205',ext:'png',title:'Phone (3)'},
 {ids:['P-60759689','P-91084926'],model:'Nothing Phone 3',color:'White',hash:'79edf621285d9e07b3e97f11',ext:'png',title:'Phone (3)'},
 {ids:['P-21683448'],model:'Nothing Phone 3a Lite',color:'White',hash:'22f7e56bbe9e51e35a668a8f',ext:'png',title:'Phone (3a) Lite'},
 {ids:['P-46704596'],model:'Nothing Phone 4a Pro',color:'Black',hash:'a5189e4068febcc65b7f5a76',ext:'png',title:'Phone (4a) Pro'},
 {ids:['P-78748453'],model:'Nothing Phone 4b',color:'Black',hash:'fb1f8b36bda7a5f6662e9329',ext:'webp',title:'Phone (4b)'},
 {ids:['P-69360510'],model:'Nothing Phone 4b',color:'Blue',hash:'5a70fe4323b0626cde5f64af',ext:'webp',title:'Phone (4b)'},
 {ids:['P-54487670'],model:'Nothing Phone 4b',color:'White',hash:'9a1ae0acb2aa82b6f9b870be',ext:'webp',title:'Phone (4b)'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets=[];
for(const review of reviews){
 const a=candidates.find(a=>a.model===review.model&&a.color===review.color);
 if(!a||a.image!==`/images/products/verified/${review.hash}.${review.ext}`||!a.sourceTitle.startsWith(review.title)||!['us.nothing.tech','intl.nothing.tech'].includes(new URL(a.source).hostname)||new URL(a.url).hostname!=='cdn.shopify.com'||!existsSync('public'+a.image))throw Error('Reviewed Nothing original changed');
 for(const id of review.ids){
  const row=raw.find(row=>row.id===id);if(!row)throw Error('Nothing SKU missing');const item=presentCatalogItem(row as CatalogItem);
  if(item.model!==review.model||item.color!==review.color)throw Error('Nothing identity changed');
  media[id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};console.log(id,item.model,item.color);
 }
 assets.push(a);
}
writeFileSync('data/nothing-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
