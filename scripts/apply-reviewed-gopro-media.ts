import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={key:string;source:string;alt:string;url:string;file:string;width:number;height:number;sku?:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/gopro/candidates.json','utf8')) as Asset[];
const reviews=[
 {id:'P-49788634',model:'GoPro HERO 13',key:'hero13',sku:'CHDHX-131-master',alt:'GoPro HERO13 Black Action Camera',hashes:['0073bf0d11ff1b4c7e286596','2619ed3dd08a3a13ed0df07d'],dimensions:[[3000,1688],[3000,1688]]},
 {id:'P-44203854',model:'GoPro Hero 11 Mini',key:'mini11',sku:'CHDHF-111-master',alt:'GoPro HERO11 Mini Black Action Camera Angle Shot',hashes:['16d88ff68e6d6e8796e18e14'],dimensions:[[3000,1688]]},
 {id:'P-56852990',model:'GoPro HERO 12',key:'hero12',sku:'CHDHX-121-master',alt:'GoPro HERO12 Black Action Camera',hashes:['79552ca07effc209c39ef8ef','f5b91291ff3f06923dcb5fb2'],dimensions:[[3000,1688],[3000,1688]]},
 {id:'P-16132131',model:'GoPro Mission 1',key:'mission1',sku:'CHDHW-001-master',alt:'MISSION 1',hashes:['8f8a835519cc275631acab79'],dimensions:[[720,560]]},
 {id:'P-39886663',model:'GoPro Mission 1 Pro',key:'mission1pro',sku:'CHDHW-011-master',alt:'MISSION 1 PRO',hashes:['19fd95d6163e635298e6d21d'],dimensions:[[720,560]]},
 {id:'P-27382827',model:'GoPro Max 2',key:'max2-camera',sku:'CHDHZ-311-master',alt:'MAX2',hashes:['7285a4c27e013797cd4c1354','0e18cbfeb71533b1daf09139'],dimensions:[[3000,1760],[3000,1836]]},
 {id:'P-47578657',model:'GoPro Max 2 Accessory Bundle',key:'max2',sku:'CHDFZ-311-master',alt:'MAX2 Starter Bundle Image 1',hashes:['29a8e9b6dac5c9253d4ca263'],dimensions:[[3000,1688]]},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const gallery:string[]=[];let source='';
 for(const [i,hash] of review.hashes.entries()){
  const a=candidates.find(a=>a.file===`/images/products/verified/${hash}.png`);if(!a)throw Error('Reviewed GoPro photo missing');const page=new URL(a.source),url=new URL(a.url);
  const exactSku=page.searchParams.get('option-id')??page.pathname.split('/').at(-1)?.replace(/\.html$/,'');
  if(a.key!==review.key||!a.alt.startsWith(review.alt)||page.hostname!=='gopro.com'||exactSku!==review.sku||!['gopro.com','static.gopro.com'].includes(url.hostname)||/thumb|award/.test(url.pathname)||createHash('sha256').update(a.url).digest('hex').slice(0,24)!==hash||!existsSync('public'+a.file))throw Error('Reviewed GoPro identity changed');
  const m=await sharp('public'+a.file).metadata();if(m.width!==review.dimensions[i][0]||m.height!==review.dimensions[i][1]||m.width!==a.width||m.height!==a.height)throw Error('GoPro native dimensions changed');
  gallery.push(a.file);source=a.source;assets.push(a);
 }
 const r=raw.find(r=>r.id===review.id);if(!r)throw Error('GoPro article missing');const item=presentCatalogItem(r as CatalogItem);if(item.model!==review.model||item.color||item.configuration)throw Error('GoPro configuration changed');
 media[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source,sourceTitle:`${review.model} (${review.sku})`};console.log(item.id,item.model);
}
writeFileSync('data/gopro-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');writeFileSync(file,JSON.stringify(media,null,2)+'\n');
