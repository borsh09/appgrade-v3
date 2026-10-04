import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import rawCatalog from '../data/new-price-catalog.json';
import baseMedia from '../data/catalog-product-media.json';
import inventoryData from '../data/parser-store-links.json';
import exclusions from '../data/product-media-exclusions.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
import {matchesSupplierUltraPhoto} from '../lib/supplier-watch-photo-identity';
import {mediaAppearance} from '../lib/catalog-media-identity';
type Inventory={title:string;url:string;sheet:string;row:number};
const pageAuditFile='.tmp-qa/supplier-page-audit.json';
const pageTitles=new Map<string,string>(existsSync(pageAuditFile)?JSON.parse(readFileSync(pageAuditFile,'utf8')).filter((source:{pageTitle?:string})=>source.pageTitle).map((source:{url:string;pageTitle:string})=>[source.url,source.pageTitle]):[]);
const inventory=(inventoryData as Inventory[]).map(source=>({...source,title:pageTitles.get(source.url)??source.title}));
const manualFile='data/verified-product-media.json';
const manual=existsSync(manualFile)?JSON.parse(readFileSync(manualFile,'utf8')) as Record<string,ProductMedia>:{};
const normalize=(value:string)=>value.toLowerCase().replace(/ё/g,'е')
 .replace(/(macbook\s+(?:air|pro)\s+\d+)"?\s*\((m\d(?:\s+(?:pro|max))?),\s*\d{4}\)/g,'$1 $2')
 .replace(/\bcooper\b/g,'copper').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const normalizedValues=new Map<string,string>();
const norm=(value:string)=>{const previous=normalizedValues.get(value);if(previous!==undefined)return previous;const result=normalize(value);normalizedValues.set(value,result);return result;};
const colours:Record<string,string[]>={
 black:['черный','черные','бесконечная чернота','dark black'],white:['белый','белые','шелковистый белый'],
 silver:['серебристый','серебро'],blue:['синий','голубой','голубые'],green:['зеленый'],pink:['розовый','розовые'],
 purple:['фиолетовый','фиолетовые'],violet:['фиолетовый','ультрафиолетовый'],gray:['серый'],grey:['серый'],
 yellow:['желтый'],gold:['золотой'],orange:['оранжевый','оранжевые'],red:['красный'],beige:['бежевый'],
 'space black':['черный космос'],'space gray':['серый космос'],midnight:['полуночный черный','темная ночь'],
 starlight:['сияющая звезда'],'sky blue':['небесно голубой','голубое небо'],citrus:['желтый цитрус'],blush:['розовый'],
 obsidian:['обсидиан'],porcelain:['фарфор'],hazel:['серо зеленый'],mint:['мятный'],navy:['темно синий'],
 teal:['бирюзовый'],lilac:['сиреневый'],olive:['оливковый'],charcoal:['серо зеленый'],
 jetblack:['черный'],blueblack:['иссиня черный'],blueberry:['черничный'],pistachio:['фисташковый'],
 'vinca blue':['vinca bluetopaz','vinca blue topaz'],'ceramic pink':['ceramic pinkrose gold','ceramic pink rose gold'],
 'ceramic patina':['ceramic patinatopaz','ceramic patina topaz'],'red velvet':['red velvetgold','red velvet gold'],
 'strawberry bronze':['strawberry bronzeblush pink','strawberry bronze blush pink'],
};
const phrase=(text:string,value:string)=>` ${norm(text)} `.includes(` ${norm(value)} `);
function matchesTitle(item:CatalogItem, sourceTitle:string):boolean {
 if(item.sourceCategory==='Apple Watch'&&/^Ultra [23] /.test(item.sourceTitle??''))return matchesSupplierUltraPhoto(item.sourceTitle!,sourceTitle);
 const part=item.sourceTitle?.match(/^([A-Z0-9]{5})\s*-/)?.[1];
 if(part) return phrase(sourceTitle,part);
 const model=item.model.replace(/^(?:Apple|Samsung|Google)\s+/i,'');
 if(model.startsWith('iMac ')) return false;
 const colourParts=(item.configuration??'').split(' · ').filter(value=>value&&!/^(?:[A-Z0-9]{5}|RU|CN|EU|US|JP|KR|Ростест|Размер \d+)$/.test(value));
 const color=norm(item.color);
 const shades=[color,...colours[color]??[]].filter(Boolean);
  const title=norm(sourceTitle);
  const dyson=model.match(/^Dyson\b.*?\b(HS\d+|HD\d+|HT\d+|TP\d+|PH\d+)\b/i);
  if(dyson){if(!phrase(title,'Dyson')||!phrase(title,dyson[1])||(/\bLong\b/i.test(model)&&!phrase(title,'Long')))return false;}
  else if(!phrase(title,model)) return false;
  const end=title.indexOf(norm(model))+norm(model).length;
  if(!dyson&&/^\s+(?:pro|max|plus|ultra|lite|fe|s|r|mini)\b/.test(title.slice(end))) return false;
  if(shades.length&&!shades.some(shade=>phrase(title,shade)))return false;
  if(colourParts.some(value=>!phrase(title,value)))return false;
  if(item.connectivity==='Wi-Fi'&&/cellular|lte|5g/.test(title))return false;
  if(/LTE|Cellular/i.test(item.connectivity??'')&&!/lte|cellular|5g/.test(title))return false;
  if(item.size&&/\d+\s*мм/i.test(item.size)&&!phrase(title,item.size))return false;
  return true;
}
for(const [id,entry] of Object.entries(manual)){
 const raw=rawCatalog.find(item=>item.id===id);const item=raw?presentCatalogItem(raw as CatalogItem):undefined;
 if(!item||entry.referenceModel!==item.model||entry.referenceColor!==item.color||entry.gallery.every(path=>path in exclusions))delete manual[id];
}
const sourceFor=(item:CatalogItem)=>inventory.filter(entry=>matchesTitle(item,entry.title));
const groups=new Map<string,{source:Inventory;items:CatalogItem[]}>();
for(const raw of rawCatalog){
 if((process.argv.includes('--watch-preview')||process.argv.includes('--watch-only'))&&raw.sourceCategory!=='Apple Watch')continue;
 if((baseMedia as Record<string,ProductMedia>)[raw.id]?.status==='verified'||manual[raw.id])continue;
 const item=presentCatalogItem(raw as CatalogItem);
 for(const source of sourceFor(item)){
  const group=groups.get(source.url)??{source,items:[]};group.items.push(item);groups.set(source.url,group);
 }
}
const limitArg=process.argv.find(value=>value.startsWith('--limit='));
const jobs=[...groups.values()].slice(0,limitArg?Number(limitArg.split('=')[1]):undefined);
const preview=process.argv.includes('--preview')||process.argv.includes('--watch-preview');
if(process.argv.includes('--audit')){
 const pending=rawCatalog.filter(item=>(baseMedia as Record<string,ProductMedia>)[item.id]?.status!=='verified').map(raw=>{
  const item=presentCatalogItem(raw as CatalogItem);
  const model=item.model.replace(/^(?:Apple|Samsung|Google)\s+/i,'');
  const code=model.match(/\b(?:HS|HD|HT|TP|PH)\d+\b/i)?.[0];
  return {id:item.id,model:item.model,color:item.color,configuration:item.configuration,size:item.size,category:item.sourceCategory,
   exact:sourceFor(item),candidates:inventory.filter(source=>phrase(source.title,code??model)).slice(0,30)};
 });
 writeFileSync('.tmp-qa/photo-source-audit.json',`${JSON.stringify(pending,null,2)}\n`);
 console.log(`Pending ${pending.length}; exact sources ${pending.filter(item=>item.exact.length).length}; model candidates ${pending.filter(item=>item.candidates.length).length}`);
 process.exit(0);
}
mkdirSync('public/images/products/verified',{recursive:true});
let cursor=0,done=0,success=0;const errors:{url:string;reason:string}[]=[];
const watchCandidates:{ids:string[];gallery:string[];source:string;sourceTitle:string;sourceWorkbook:string;sourceSheet:string;sourceRow:number}[]=[];
async function fetchPage(url:string){
 const response=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Mozilla/5.0'}});
 const hosts=new Set(inventory.map(entry=>new URL(entry.url).hostname));
 if(!response.ok||!hosts.has(new URL(response.url).hostname))throw new Error(`HTTP ${response.status} or redirected host`);
 return response;
}
async function worker(){while(cursor<jobs.length){
 const {source,items}=jobs[cursor++];
 try{
  const cacheFile=`.tmp-qa/supplier-pages/${createHash('sha256').update(source.url).digest('hex').slice(0,24)}.html`;
  const html=existsSync(cacheFile)?readFileSync(cacheFile,'utf8'):await (await fetchPage(source.url)).text();
  const heading=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g,'').replaceAll('&amp;','&').replaceAll('&quot;','"').trim();
  if(!heading||!items.every(item=>matchesTitle(item,heading)))throw new Error('Page model, colour or configuration changed; needs review');
  const gallery=html.match(/<div class="product-detail-gallery__container[\s\S]*?<div class="right_info">/)?.[0]??html;
  const paths=[...gallery.matchAll(/<a\s+href="([^"<>]+)"\s+data-fancybox="gallery"/g)].map(match=>match[1]);
  const main=gallery.match(/<link\s+href="([^"<>]+)"\s+itemprop="image"/)?.[1];
  const structured:string[]=[];
  for(const block of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
   try{const data=JSON.parse(block[1]);const products=(data['@graph']??[data]).filter((entry:{'@type':string;name:string})=>entry['@type']==='Product'&&items.every(item=>matchesTitle(item,entry.name??'')));
    for(const product of products)for(const photo of Array.isArray(product.image)?product.image:[product.image]){
     const url=typeof photo==='string'?photo:photo?.url;if(url)structured.push(url);
    }
   }catch{}
  }
  const urls=[...new Set([main,...paths,...structured].filter((value):value is string=>Boolean(value)).map(path=>new URL(path.replaceAll('&amp;','&'),source.url).href))].slice(0,3);
  if(!urls.length)throw new Error('No product gallery');
  const photos:string[]=[];
  for(const url of urls){
   if(new URL(url).protocol!=='https:')throw new Error('Unexpected image protocol');
   const hash=createHash('sha256').update(url).digest('hex').slice(0,24);
   let local=['jpg','png','webp'].map(ext=>`/images/products/verified/${hash}.${ext}`).find(path=>existsSync(`public${path}`));
   if(!local){
    const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`Photo HTTP ${response.status}`);const bytes=new Uint8Array(await response.arrayBuffer());
    const ext=bytes[0]===0xff&&bytes[1]===0xd8?'jpg':bytes[0]===0x89&&bytes[1]===0x50?'png':String.fromCharCode(...bytes.slice(0,4))==='RIFF'?'webp':undefined;
    // Supplier main-image fields can point to an SVG placeholder while the
    // selected product gallery contains valid originals. Check the next asset.
    if(!ext||bytes.length<1000||bytes.length>15000000)continue;
    local=`/images/products/verified/${hash}.${ext}`;writeFileSync(`public${local}`,bytes);
   }
   if(!(local in exclusions))photos.push(local);
  }
  if(!preview&&items.some(item=>item.sourceCategory==='Apple Watch')){
   const reviewedFile='data/supplier-watch-reviewed-photo-assets.json';
   const reviewed=existsSync(reviewedFile)?JSON.parse(readFileSync(reviewedFile,'utf8')) as string[]:[];
   for(let index=photos.length-1;index>=0;index--)if(!reviewed.includes(photos[index]))photos.splice(index,1);
  }
  if(!photos.length)throw new Error('Gallery rejected by visual review');
  if(preview){
   watchCandidates.push({ids:items.map(item=>item.id),gallery:photos,source:source.url,sourceTitle:heading,sourceWorkbook:'Парсер.xlsx',sourceSheet:source.sheet,sourceRow:source.row});
  }else{
   for(const item of items)if(!manual[item.id])manual[item.id]={image:photos[0],gallery:photos,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:source.url,sourceTitle:heading,sourceWorkbook:'Парсер.xlsx',sourceSheet:source.sheet,sourceRow:source.row};
  }
  success++;
 }catch(error){errors.push({url:source.url,reason:error instanceof Error?error.message:String(error)});}
 done++;
 if(done%10===0||done===jobs.length){if(!preview)writeFileSync(manualFile,`${JSON.stringify(manual,null,2)}\n`);console.log(`${done}/${jobs.length} source pages; verified ${success}; failed ${errors.length}; articles ${Object.keys(manual).length}`);}
}}
console.log(`Matching source pages: ${jobs.length}; articles ${jobs.reduce((sum,job)=>sum+job.items.length,0)}`);
await Promise.all(Array.from({length:Math.min(4,jobs.length)},worker));
if(preview){const stem=process.argv.includes('--watch-preview')?'supplier-watch':'supplier-exact';writeFileSync(`.tmp-qa/${stem}-photo-candidates.json`,JSON.stringify(watchCandidates,null,2)+'\n');writeFileSync(`.tmp-qa/${stem}-photo-errors.json`,JSON.stringify(errors,null,2)+'\n');console.log(watchCandidates.length,'source galleries awaiting visual review');process.exit(0);}
for(const entry of Object.values(manual)){
 const source=inventory.find(source=>source.url===entry.source);if(!source)continue;
 entry.sourceWorkbook='Парсер.xlsx';entry.sourceSheet=source.sheet;entry.sourceRow=source.row;
}
writeFileSync(manualFile,`${JSON.stringify(manual,null,2)}\n`);
writeFileSync('.tmp-qa/exact-photo-fetch-errors.json',`${JSON.stringify(errors,null,2)}\n`);
