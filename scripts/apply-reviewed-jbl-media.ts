import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const candidates=['studio','new-studio'].flatMap(key=>JSON.parse(readFileSync(`.tmp-qa/jbl/${key}-candidates.json`,'utf8'))) as {model:string;color:string;angle:string;source:string;sourceTitle:string;url:string;image:string}[];
const reviews=[
 {id:'P-79572328',model:'JBL Xtreme 5',color:'Black',assetColor:'Black'},
 {id:'P-73823887',model:'JBL Xtreme 5',color:'Blue',assetColor:'Blue'},
 {id:'P-69355789',model:'JBL Xtreme 5',color:'Squad',assetColor:'Squad'},
 {id:'P-96706021',model:'JBL Partybox 330',color:'White',assetColor:'White'},
 {id:'P-66628114',model:'JBL Partybox 720',color:'',assetColor:'Black'},
 {id:'P-65311006',model:'JBL Flip 7',color:'Blue',assetColor:'Blue'},
 {id:'P-82534807',model:'JBL Flip 7',color:'Pink',assetColor:'Pink'},
 {id:'P-52130549',model:'JBL Flip 7',color:'Purple',assetColor:'Purple'},
 {id:'P-62561026',model:'JBL Flip 7',color:'Red',assetColor:'Red'},
 {id:'P-81799915',model:'JBL Flip 7',color:'Squad',assetColor:'Squad'},
 {id:'P-43587369',model:'JBL Flip 7',color:'White',assetColor:'White'},
 {id:'P-38733259',model:'JBL Charge 6',color:'Squad',assetColor:'Squad'},
 {id:'P-75601573',model:'JBL Charge 6',color:'Red',assetColor:'Red'},
 {id:'P-23172740',model:'JBL Charge 6',color:'Pink',assetColor:'Pink'},
 {id:'P-53939736',model:'JBL Charge 6',color:'Purple',assetColor:'Purple'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets=[];
const hashes:Record<string,string>={
 'JBL Xtreme 5|Black':'117d1d65b7bbd708bc893f84','JBL Xtreme 5|Blue':'3674cd223f91848d473979f4','JBL Xtreme 5|Squad':'98305e2b3d53caba4b4ab515',
 'JBL Partybox 330|White':'358c40b5e179c1d5700ace39','JBL Partybox 720|Black':'1862248c976ba9aafacb218b',
 'JBL Flip 7|Blue':'76366b687a13f564ee466e6f','JBL Flip 7|Pink':'8679c437295861e8ecfceb71','JBL Flip 7|Purple':'0ff8d2d5c760e76e30f931a2','JBL Flip 7|Red':'ad1b9e7602cb7590e5531ef7','JBL Flip 7|Squad':'416bcd5e0ae8dacb953b6239','JBL Flip 7|White':'03e88304fe1009790a86323f',
 'JBL Charge 6|Squad':'b49811b00ab1575a20da8fd9','JBL Charge 6|Red':'2ced0a95cc920c7408623377','JBL Charge 6|Pink':'85d15a9822ecb28c1e073d96','JBL Charge 6|Purple':'394d3035ba9e5cee4564bad7',
};
for(const review of reviews){
 const row=raw.find(row=>row.id===review.id);if(!row)throw Error('JBL SKU missing');const item=presentCatalogItem(row as CatalogItem);
 if(item.model!==review.model||item.color!==review.color||item.sourceCategory!=='JBL Speakers')throw Error('JBL identity changed');
 const photos=candidates.filter(a=>a.model===review.model&&a.color===review.assetColor&&a.angle==='Main');
 if(photos.length!==1)throw Error('Reviewed JBL primary is ambiguous');const a=photos[0];
 if(a.image!==`/images/products/verified/${hashes[review.model+'|'+review.assetColor]}.jpg`||new URL(a.source).hostname!=='news.jbl.com'||new URL(a.url).hostname!=='d21buns5ku92am.cloudfront.net'||!a.url.includes('-original-')||!existsSync('public'+a.image)||a.sourceTitle!==decodeURIComponent(new URL(a.url).pathname.split('/').at(-1)!))throw Error('Reviewed JBL original changed');
 media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};
 assets.push({...a,model:item.model,color:item.color});console.log(item.id,item.model,item.color);
}
writeFileSync('data/jbl-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
