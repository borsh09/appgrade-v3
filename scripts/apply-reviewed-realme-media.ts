import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={key:string;label:string;source:string;sourceTitle:string;url:string;image:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/realme/candidates.json','utf8')) as Asset[];
const reviews=[
 {ids:['P-87739926','P-97577201'],model:'Realme C85',color:'Purple',label:'Parrot Purple',key:'c85',hash:'7235f531aee4b252c061115a',path:'/my/realme-c85/specs'},
 {ids:['P-32069801'],model:'Realme 16',color:'White',label:'月霜白',key:'r16',hash:'1ff014fd0a9cd6c6a9aa9f3f',path:'/tw/realme-16-5g/specs'},
 {ids:['P-66365846'],model:'Realme 16',color:'Black',label:'霧隱黑',key:'r16',hash:'da6b1dce655d0bf2c03d0345',path:'/tw/realme-16-5g/specs'},
 {ids:['P-36694747','P-36652153'],model:'Realme GT 7T',color:'Black',label:'凜冽黑',key:'gt7t',hash:'51024b3f7f2f0ab80b21cecb',path:'/tw/realme-gt-7t-5g/specs',ext:'png'},
 {ids:['P-15562733','P-50840377'],model:'Realme GT 7T',color:'Blue',label:'冰鋒藍',key:'gt7t',hash:'4862066ca50aff209fcec213',path:'/tw/realme-gt-7t-5g/specs',ext:'png'},
 {ids:['P-53523938'],model:'Realme GT 7',color:'Black',label:'IceSense black',key:'gt7',hash:'cc092ac321957e611420407c',path:'/my/realme-gt-7-5g/specs',ext:'png'},
 {ids:['P-98715951'],model:'Realme Note 60X',color:'Green',label:'Wilderness Green',key:'note60x',hash:'e3573eb99932937aae38cf5b',path:'/my/realme-note-60x/specs'},
 {ids:['P-61627518'],model:'Realme P4x',color:'White',label:'Rally White',key:'p4x',hash:'0519685dc8202596c784f51c',path:'/my/realme-p4x/specs',ext:'png'},
 {ids:['P-17742161'],model:'Realme P4x',color:'Blue',label:'Phantom Blue',key:'p4x',hash:'294e1ccc0fdba0b4e2e34ebc',path:'/my/realme-p4x/specs',ext:'png'},
 {ids:['P-88835440'],model:'Realme C85',color:'Blue',label:'Синий',key:'c85ru',hash:'8f21a8361e01ddba59bed4e7',path:'/ru/realme-c85/specs'},
 {ids:['P-42830339'],model:'Realme C85 Pro',color:'Green',label:'Темно-зеленый',key:'c85pro',hash:'4fd322af208122af87bdb13c',path:'/ru/realme-c85-pro/specs'},
 {ids:['P-67233584','P-37053024'],model:'Realme C100x',color:'Blue',label:'Deepblue Tides',key:'c100x',hash:'bc351a86c4a12be689f02b7a',path:'/it/realme-c100x/specs'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const a=candidates.find(a=>a.image===`/images/products/verified/${review.hash}.${review.ext??'jpg'}`);
 if(!a||a.key!==review.key||a.label!==review.label||new URL(a.source).hostname!=='www.realme.com'||new URL(a.source).pathname!==review.path||new URL(a.url).hostname!==(review.key==='c100x'?'image05.realme.net':'image01.realme.net')||!existsSync('public'+a.image))throw Error('Reviewed Realme original changed');
 for(const id of review.ids){
  const row=raw.find(row=>row.id===id);if(!row)throw Error('Realme SKU missing');const item=presentCatalogItem(row as CatalogItem);
  if(item.model!==review.model||item.color!==review.color)throw Error('Realme identity changed');
  media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};console.log(item.id,item.model,item.color);
 }
 assets.push(a);
}
writeFileSync('data/realme-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
