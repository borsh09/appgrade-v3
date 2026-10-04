import {writeFileSync,mkdirSync} from 'node:fs';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import {catalogItems,itemConfiguration} from '../lib/catalog-registry';
import media from '../data/catalog-product-media.json';

const assets=[...new Set(catalogItems.filter(item=>!item.photoMissing).flatMap(item=>item.gallery??[item.image]))];
const dimensions=new Map<string,{width:number;height:number}>();
for(const image of assets){const metadata=await sharp(`public${image}`).metadata();dimensions.set(image,{width:metadata.width??0,height:metadata.height??0});}
const products=catalogItems.map(item=>({id:item.id,article:item.article,model:item.model,color:item.color,size:item.size,category:item.sourceCategory,configuration:itemConfiguration(item),
 status:item.photoMissing?'missing':'available',
 source:(media as Record<string,{source?:string}>)[item.id]?.source,
 images:item.photoMissing?[]:(item.gallery??[item.image]).map(image=>({image,...dimensions.get(image)}))}));
mkdirSync('.tmp-qa',{recursive:true});
writeFileSync('.tmp-qa/catalog-photo-quality.json',JSON.stringify({total:products.length,available:products.filter(item=>item.status==='available').length,
 missing:products.filter(item=>item.status==='missing').length,products},null,2)+'\n');
console.log(JSON.stringify({products:products.length,available:products.filter(item=>item.status==='available').length,uniquePhotos:assets.length,
 under600:[...dimensions].filter(([,size])=>Math.max(size.width,size.height)<600).length,
 under400:[...dimensions].filter(([,size])=>Math.max(size.width,size.height)<400).length}));
