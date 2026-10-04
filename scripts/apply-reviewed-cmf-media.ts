import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={model:string;color:string;source:string;sourceTitle:string;url:string;image:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/nothing/cmf-candidates.json','utf8')) as Asset[];
const reviews=[
 {id:'P-92329623',model:'CMF Buds 2a',color:'Dark Gray',hashes:['1385deddc2fe2a8d3a27f24e']},
 {id:'P-24770461',model:'CMF Buds 2a',color:'Light Gray',hashes:['18d6a4dfea6e6136a3c4698d']},
 {id:'P-70705790',model:'CMF Buds 2a',color:'Orange',hashes:['f68cf88cf4b00ace6544ad7d']},
 {id:'P-83135019',model:'CMF Buds Pro 2',color:'Blue',hashes:['a6746b831368117a2e3f5818','a853bf6e0c9b3f99f04476d9','4e9585ef1cdf03f7e80a24aa','c795113b3e8942fad9d2379e']},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const gallery=review.hashes.map(hash=>{
  const a=candidates.find(a=>a.image===`/images/products/verified/${hash}.png`);
  if(!a||a.model!==review.model||a.color!==review.color||!a.sourceTitle.startsWith(review.model+' |')||!['us.nothing.tech','in.nothing.tech'].includes(new URL(a.source).hostname)||new URL(a.url).hostname!=='cdn.shopify.com'||!existsSync('public'+a.image))throw Error('Reviewed CMF original changed');
  assets.push(a);return a;
 });
 const row=raw.find(row=>row.id===review.id);if(!row)throw Error('CMF SKU missing');const item=presentCatalogItem(row as CatalogItem);
 if(item.model!==review.model||item.color!==review.color)throw Error('CMF identity changed');
 const a=gallery[0];media[item.id]={image:a.image,gallery:gallery.map(a=>a.image),status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};console.log(item.id,item.model,item.color);
}
writeFileSync('data/cmf-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
