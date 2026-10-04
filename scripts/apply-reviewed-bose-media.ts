import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={model:string;color:string;source:string;sourceTitle:string;url:string;publishedUrl:string;image:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/bose/candidates.json','utf8')) as Asset[];
const reviews=[
 {id:'P-65972803',color:'Violet',finish:'MidnightViolet',hashes:['fad3ecb5e10da3eeb4795463','a3677e13661088982f71b21c']},
 {id:'P-53157386',color:'Gold',finish:'DesertGold',hashes:['21e61095f862c0bd8711faff','395087ad47e102a5e5eed3bf']},
 {id:'P-86257595',color:'White',finish:'WhiteSmoke',hashes:['dea7678c7e6cfed9cead8a4a']},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const gallery=review.hashes.map(hash=>{
  const a=candidates.find(a=>a.image===`/images/products/verified/${hash}.png`);
  if(!a||a.model!=='Bose Headphones QC Ultra 2'||a.color!==review.color||!a.sourceTitle.includes('QuietComfort Ultra Headphones (2nd Gen)')||new URL(a.source).hostname!=='www.bose.com'||new URL(a.url).hostname!=='assets.bosecreative.com'||!a.publishedUrl.includes(review.finish)||!a.publishedUrl.includes('QCUHII')||!existsSync('public'+a.image))throw Error('Reviewed Bose original changed');
  assets.push(a);return a;
 });
 const row=raw.find(row=>row.id===review.id);if(!row)throw Error('Bose SKU missing');const item=presentCatalogItem(row as CatalogItem);
 if(item.model!=='Bose Headphones QC Ultra 2'||item.color!==review.color)throw Error('Bose identity changed');
 const a=gallery[0];media[item.id]={image:a.image,gallery:gallery.map(a=>a.image),status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};console.log(item.id,item.model,item.color);
}
writeFileSync('data/bose-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
