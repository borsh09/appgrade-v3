import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const candidates=JSON.parse(readFileSync('.tmp-qa/gaming/xbox-photo-candidates.json','utf8')) as {color:string;source:string;sourceTitle:string;url:string;image:string;width:number;height:number}[];
const reviews=[
 {id:'P-27658957',model:'Xbox Controller',color:'White',assetColor:'White',hash:'eeeff8257119f94af6a5a9d1'},
 {id:'P-37382004',model:'Xbox Controller',color:'Carbon Black',assetColor:'Black',hash:'78492d7b07ee3412c59a3d17'},
 {id:'P-20537785',model:'Xbox Controller Deep',color:'Pink',assetColor:'Pink',hash:'b76bad8bd8712d68158f90e4'},
 {id:'P-22420356',model:'Xbox Controller',color:'Shock Blue',assetColor:'Blue',hash:'1cd96a5edcd21de9f84825c4'},
 {id:'P-83594811',model:'Xbox Controller Pulse',color:'Red',assetColor:'Red',hash:'f25ed518c033d2f933220128'},
];
const file='data/verified-product-media.json';const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const assets=[];
for(const review of reviews){
 const row=raw.find(row=>row.id===review.id);if(!row)throw Error('Xbox SKU missing');const item=presentCatalogItem(row as CatalogItem);
 if(item.model!==review.model||item.color!==review.color)throw Error('Xbox identity changed');
 const a=candidates.find(a=>a.color===review.assetColor);
 if(!a||a.image!==`/images/products/verified/${review.hash}.png`||a.width!==2000||a.height!==2000||new URL(a.source).hostname!=='www.microsoft.com'||new URL(a.url).hostname!=='cdn-dynmedia-1.microsoft.com'||!existsSync('public'+a.image))throw Error('Reviewed Xbox original missing');
 media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};
 assets.push({...a,model:item.model,color:item.color});console.log(item.id,item.model,item.color);
}
writeFileSync('data/xbox-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
