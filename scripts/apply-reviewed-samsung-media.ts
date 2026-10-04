import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
import {catalogItems} from '../lib/catalog-registry';
type Asset={model:string;color:string;source:string;sourceTitle:string;sku:string;url:string;image:string;width:number;height:number;angle:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/samsung/api-candidates.json','utf8')) as Asset[];
type Review={ids:string[];model:string;color:string;catalogColor?:string;sku:string;hashes:string[];extensions?:string[];size?:string;titlePattern?:string;dimensions?:number[][]};
const reviews:Review[]=[
 {ids:['P-70745246','P-37323620','P-86627982','P-55121867'],model:'Samsung Galaxy A57',color:'Navy',sku:'SM-A576BDBQXSP',hashes:['556f1b7fad4376a5dbb71be2','66fcaf39b0eddd21ca30bedb']},
 {ids:['P-34688620','P-95290527','P-81200694'],model:'Samsung Galaxy A57',color:'Icyblue',sku:'SM-A576BLBTXSP',hashes:['f78da8c9c4af3d784a7f6616','0c376ecc1d5e7b740e97a976']},
 {ids:['P-78848496','P-64539891'],model:'Samsung Galaxy A07s',color:'Green',sku:'SM-A077MZGGGTO',hashes:['1005d11cac817baa1ba708d8','d3b2c4172338bcacf7a31169']},
 {ids:['P-57105727','P-17362330'],model:'Samsung Galaxy A07s',color:'Violet',sku:'SM-A077MLVGGTO',hashes:['ac14138842c39ae81d988016','52003a16feb10335eb0acad8']},
 {ids:['P-90378900','P-39572357'],model:'Samsung Galaxy A27',color:'Black',sku:'SM-A276BZKFARO',hashes:['0ad0b77be7bedc5ffeb66242','4c518ec03a5af3370701b98a']},
 {ids:['P-24721425','P-13555141'],model:'Samsung Galaxy A27',color:'Blue',sku:'SM-A276BZBFARO',hashes:['977a02010ea5d8c650976f13','90919c78423cc0346c4f2ff3']},
 {ids:['P-95340350','P-61897175'],model:'Samsung Galaxy A27',color:'Pink',sku:'SM-A276BLIFARO',hashes:['10edc3eba13e79eb3e3bb203','5e818b08dd15ed9b30a27a74']},
 {ids:['P-71298187'],model:'Samsung Galaxy A08',color:'Green',sku:'SM-A085FZGGMEA',hashes:['5321b3af498129f14a640427','1d590b18e115c52d358044d8']},
 {ids:['P-86583545','P-40185684'],model:'Samsung Galaxy A08',color:'Silver',sku:'SM-A085FZSGMEA',hashes:['0e3e1dd94277b1a0b967d883','cf40e872ee6c52645225a0df']},
 {ids:['P-28664974','P-40242074'],model:'Samsung Galaxy A56',color:'Olive',sku:'SM-A566EZGZINS',hashes:['99e39baaea53d112b3697b6d','3b6784c106ebdc1fdb77bf5b']},
 {ids:['P-24484244'],model:'Samsung Galaxy A56',color:'Lightgray',sku:'SM-A566EZAZINS',hashes:['a2a89983ede115af858d9883','85dee510080365a0cc9e3289']},
 {ids:['P-14144353'],model:'Samsung Galaxy A56',color:'Blue',sku:'SM-A566EDBZINS',hashes:['e8901bdbee76b29874f04911','689f22d04c3949b07ba47b87']},
 {ids:['P-85571133'],model:'Samsung Galaxy S25',color:'Blueblack',sku:'SM-S931BZKDEUE',hashes:['f818be874c8830d35fc81585','e2a0e7b2f13d1873037b877f']},
 {ids:['P-87499620','P-85030753'],model:'Samsung Galaxy S25 Ultra',color:'Silverblue',sku:'SM-S938BZBDEUE',hashes:['0355f1b83dc94631d5104dd6','a14bc69395406f54b45102fc']},
 {ids:['P-10341453'],model:'Samsung Galaxy S25 Edge',color:'Icyblue',sku:'SM-S937BLBDEUB',hashes:['6e3aced36dc25aceec1e1912','1d4b021ba58cf418c7161550']},
 {ids:['P-14827343','P-36798470'],model:'Samsung Galaxy S26 Plus',color:'Violet',sku:'SM-S947BZVDEUB',hashes:['11866d72f91b06fd4862c761','ac83f54f6968ab32c57244c6']},
 {ids:['P-20440230','P-83550149'],model:'Samsung Galaxy S26 FE',color:'Blueberry',sku:'SM-S741BZVDEUB',hashes:['54d025155a0bb5ea40b65f25','1dfbc7d46142c2f1d83af18a']},
 {ids:['P-25108277','P-82533902'],model:'Samsung Galaxy S26 FE',color:'Graphite',sku:'SM-S741BZKDEUB',hashes:['de349016a3bd873f3e123978','0e4b447c7bae36009b6a5091']},
 {ids:['P-93292337','P-15027944'],model:'Samsung Galaxy S26 FE',color:'Pistachio',sku:'SM-S741BLGDEUB',hashes:['66e40b952f1a73be8eac0535','332a1033711c8689b6ac092a']},
 {ids:['P-44265957'],model:'Samsung Galaxy A07',color:'Green',sku:'SM-A075MZGGGTO',hashes:['81cb1a98bd544e0c28a9b06d','4ebe4bd170f0526b506a7b1f']},
 {ids:['P-20325216'],model:'Samsung Galaxy A07',color:'Violet',sku:'SM-A075MLVGGTO',hashes:['a932efc67ce841680118d4ce','00efb42c07b1290d359e4e1f']},
 {ids:['P-97520773'],model:'Samsung Galaxy A16',color:'Green',sku:'SM-A165MLGDZTO',hashes:['43f2ee2ec5d4e1df1f971fc3','7f6389f2dcefbaeb34397372']},
 {ids:['P-43233940'],model:'Samsung Galaxy S25',color:'Pinkgold',sku:'SM-S931BZDDEUB',hashes:['7e693bc6589b673bddf0651d','2e5d1f11ebfbdf9ca1c598fa']},
 {ids:['P-39549018','P-60734130','P-11943260'],model:'Samsung Galaxy S25 Ultra',color:'Whitesilver',sku:'SM-S938BZSGEUE',hashes:['f8a0edacc0347c7d5fc1dde3','e46ac232c3d5b4a30a883013']},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
reviews.push(...JSON.parse(readFileSync('data/samsung-additional-photo-reviews.json','utf8')) as Review[]);
for(const review of reviews){
 const photos=review.hashes.map((hash,index)=>{const a=candidates.find(a=>a.image===`/images/products/verified/${hash}.${review.extensions?.[index]??'png'}`);
  if(!a||a.model!==review.model||a.color!==review.color||a.sku!==review.sku||new URL(a.source).hostname!=='www.samsung.com'||(!new URL(a.source).pathname.includes(review.sku.toLowerCase())&&new URL(a.source).searchParams.get('modelCode')!==review.sku)||new URL(a.url).hostname!=='images.samsung.com'||(!new URL(a.url).pathname.includes('/gallery/')||!new URL(a.url).pathname.includes(review.sku.toLowerCase()))||a.width!==(review.dimensions?.[index]?.[0]??1920)||a.height!==(review.dimensions?.[index]?.[1]??1280)||!existsSync('public'+a.image))throw Error('Reviewed Samsung original changed');assets.push(a);return a;});
 for(const id of review.ids){
  const row=raw.find(row=>row.id===id),item=row?presentCatalogItem(row as CatalogItem):catalogItems.find(item=>item.id===id);if(!item)throw Error('Samsung SKU missing');
  if(item.model!==review.model||(item.color||item.configuration)!==(review.catalogColor??review.color))throw Error('Samsung identity changed');
  if((review.size&&item.size!==review.size)||(review.titlePattern&&!new RegExp(review.titlePattern).test(item.sourceTitle||'')))throw Error('Samsung size or connectivity changed');
  media[item.id]={image:photos[0].image,gallery:photos.map(a=>a.image),status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:photos[0].source,sourceTitle:photos[0].sourceTitle};console.log(item.id,item.model,item.color);
 }
}
writeFileSync('data/samsung-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
