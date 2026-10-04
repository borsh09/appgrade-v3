import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={model:string;color:string;source:string;sourceTitle:string;url:string;image:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/plaud/candidates.json','utf8')) as Asset[];
const reviews=[
 {id:'P-46954973',model:'Plaud Note Pro',color:'Black',hash:'8613ebc8a938d6db17a2c977',ext:'png'},
 {id:'P-58210955',model:'Plaud Note Pro',color:'Silver',hash:'9ca14a83630dfd2c53a0c321',ext:'png'},
 {id:'P-77858258',model:'Plaud Note',color:'Blue',hash:'6971554d37265967e65294d6',ext:'webp'},
 {id:'P-16842851',model:'Plaud Note',color:'Starlight',hash:'0ffbbff3b8f7c731963006dd',ext:'png'},
 {id:'P-85146808',model:'Plaud Note',color:'Black',hash:'a23a00b8243442225e50bc51',ext:'png'},
 {id:'P-88972707',model:'Plaud Note',color:'Silver',hash:'cd6d0e550a315677d8426192',ext:'png'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const a=candidates.find(a=>a.image===`/images/products/verified/${review.hash}.${review.ext}`);
 if(!a||a.model!==review.model||a.color!==review.color||a.sourceTitle!==review.model||!['global.plaud.ai','marketing.plaud.ai'].includes(new URL(a.source).hostname)||new URL(a.url).hostname!==new URL(a.source).hostname||!new URL(a.source).searchParams.has('variant')||!existsSync('public'+a.image))throw Error('Reviewed Plaud original changed');
 const row=raw.find(row=>row.id===review.id);if(!row)throw Error('Plaud SKU missing');const item=presentCatalogItem(row as CatalogItem);
 if(item.model!==review.model||item.color!==review.color)throw Error('Plaud identity changed');
 media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};assets.push(a);console.log(item.id,item.model,item.color);
}
writeFileSync('data/plaud-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
