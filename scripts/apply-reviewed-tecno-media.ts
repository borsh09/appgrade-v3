import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={model:string;color:string;source:string;sourceTitle:string;url:string;image:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/tecno-infinix/candidates.json','utf8')) as Asset[];
const reviews=[
 {ids:['P-26051674'],model:'Tecno Spark 50',color:'Blue',hash:'54016b778485ebd7f912f22f'},
 {ids:['P-26372901'],model:'Tecno Camon 50',color:'Black',hash:'80afb714737855acf18ac43d'},
 {ids:['P-59960766','P-90112050'],model:'Tecno Camon 50',color:'Malachite Green',hash:'9d58beb601b207035e9f3c12'},
 {ids:['P-43005589','P-93848079'],model:'Tecno Camon 50',color:'Titanium',hash:'72e081ba5e06876dbbe982e3'},
 {ids:['P-99156677'],model:'Tecno Camon 50',color:'Fir Green',hash:'c687eb46a427dcb19cbff7c1'},
 {ids:['P-56792312'],model:'Tecno Spark 50',color:'Gray',hash:'331ba06b6678b8d21b9fd014'},
 {ids:['P-84612187'],model:'Tecno Spark 50',color:'Black',hash:'03a3d228225ef12b0c777f6d'},
 {ids:['P-39303471','P-89267561'],model:'Tecno Spark Go 3',color:'Black',hash:'65cc54a35f44c07a106da8a0'},
 {ids:['P-65691339','P-20112358'],model:'Tecno Spark Go 3',color:'Gray',hash:'c4d3173ddbcac31cf4619bf4'},
 {ids:['P-26890583'],model:'Tecno Spark Go 3',color:'Purple',hash:'c4d454fcb2d41ed6d306e636'},
 {ids:['P-69068180'],model:'Tecno Spark Go 3',color:'Blue',hash:'d128b022c57b9fc9fac884c3'},
 {ids:['P-89578932','P-95568986','P-73136382'],model:'Tecno Camon 50 Ultra',color:'Black',hash:'14a482276ef309829bf97694'},
 {ids:['P-20846390','P-19686637','P-43487963'],model:'Tecno Camon 50 Ultra',color:'Green',hash:'021221581178a883cbcc27f9'},
 {ids:['P-55241626','P-69411823'],model:'Tecno Camon 50 Ultra',color:'Titanium',hash:'bc3fa406cd53f3ac9a01539e'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const a=candidates.find(a=>a.image===`/images/products/verified/${review.hash}.png`);
 if(!a||a.model!==review.model||a.color!==review.color||!a.sourceTitle.toLowerCase().includes(review.model.replace(/^Tecno /,'').toLowerCase())||new URL(a.source).hostname!=='www.tecno-mobile.com'||!new URL(a.source).pathname.includes('/tech-specs/')||new URL(a.url).hostname!=='d13pvy8xd75yde.cloudfront.net'||!existsSync('public'+a.image))throw Error('Reviewed Tecno original changed');
 for(const id of review.ids){
  const row=raw.find(row=>row.id===id);if(!row)throw Error('Tecno SKU missing');const item=presentCatalogItem(row as CatalogItem);
  const finish=item.color||(item.configuration==='Titanium'?'Titanium':'');
  if(item.model.toLowerCase()!==review.model.toLowerCase()||finish!==review.color)throw Error('Tecno identity changed');
  media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};console.log(item.id,item.model,finish);
 }
 assets.push(a);
}
writeFileSync('data/tecno-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
