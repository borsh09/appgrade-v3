import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import rawCatalog from '../data/new-price-catalog.json';
import { additionalCatalog } from '../data/additional-catalog';
import { iphoneCatalog } from '../data/iphone-catalog';
import { samsungCatalog } from '../data/samsung-catalog';
import { macbookCatalog } from '../data/macbook-catalog';
import { ipadCatalog } from '../data/ipad-catalog';
import { watchCatalog } from '../data/watch-catalog';
import { audioCatalog } from '../data/audio-catalog';
import { playstationCatalog } from '../data/playstation-catalog';
import { googleCatalog } from '../data/google-catalog';
import { xiaomiCatalog } from '../data/xiaomi-catalog';
import { cameraCatalog } from '../data/camera-catalog';
import { dysonCatalog } from '../data/dyson-catalog';
import parserPhotos from '../data/parser-photo-map.json';
import macSources from '../data/macbook-photo-sources.json';
import { presentCatalogItem } from '../lib/catalog-presentation';
import type { CatalogItem } from '../lib/catalog-registry';
import type { ProductMedia } from '../lib/catalog-media';
import {mediaAppearance} from '../lib/catalog-media-identity';
import {photoSourceMatchesItem} from '../lib/catalog-photo-source';
import exclusions from '../data/product-media-exclusions.json';
import supplierSources from '../data/parser-store-links.json';
import xrealSharedPhoto from '../data/xreal-reviewed-shared-photo.json';
import raybanSharedPhotos from '../data/rayban-reviewed-shared-photos.json';

const colors: Record<string,string> = {
  'серебро':'silver','серебряный':'silver','серебрянный':'silver','графит':'graphite',
  'черный':'black','чёрный':'black','белый':'white','синий':'blue','голубой':'blue','розовый':'pink',
  'зеленый':'green','зелёный':'green','фиолетовый':'purple','желтый':'yellow','жёлтый':'yellow',
  'серебристый':'silver','серый':'gray','золотой':'gold','бежевый':'beige','красный':'red',
  'черный космос':'space black','чёрный космос':'space black','серый космос':'space gray',
  'сияющая звезда':'starlight','полуночный черный':'midnight','небесно-голубой':'sky blue',
  'желтый цитрус':'citrus','ультрамарин':'ultramarine','grey':'gray',
  'фиолетовые':'purple','оранжевые':'orange','голубые':'blue',
  'розовые':'pink','серебристые':'silver','зеленые':'green','черные':'black','белые':'white',
};
const clean = (value:string) => value.normalize('NFKC').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const colorKey = (value:string) => {
  const stripped=value.replace(/,\s*[A-Z0-9]{5}$/, '').trim().toLowerCase();
  const translated=stripped.split(/\s*[/|]\s*/).map(part=>colors[part]??part);
  if(translated.length>1&&new Set(translated).size===1)return clean(translated[0]);
  return clean(colors[stripped] ?? stripped);
};
const modelKey = (value:string) => {
  const mac=value.match(/^MacBook Pro (14|16) \(2024\)$/); if(mac) return `macbook pro ${mac[1]} m4`;
  const dyson=value.match(/^Dyson .*?\b(HS\d+|HD\d+|HT\d+|TP\d+|PH\d+)\b/i);
  if(dyson) return `dyson ${dyson[1].toLowerCase()}`;
  const body=value.replace(/^(?:Смартфон|Планшет|Ноутбук|Компактный Фотоаппарат|Беспроводные наушники|Наушники|Умные часы|Моноблок)\s+/i,'').replace(/^(?:Apple|Google|Samsung|Fujifilm)\s+/i,'').replace(/\bMark\s*III\b/gi,'Mark 3');
  return clean(/^Galaxy Tab\b/i.test(body)?body.replace(/\s+(?:Wi-Fi|WiFi|LTE|Cellular)$/i,''):body);
};
const key = (item:CatalogItem) => `${modelKey(item.model)}|${colorKey(item.color)}|${mediaAppearance(item)}`;
const usable = (path:string) => path.startsWith('/images/products/') && !(path in exclusions) && !/pending|art-directed|concept|apple-2027/i.test(path) && existsSync(`public${path}`);
const sources = [...iphoneCatalog,...samsungCatalog,...macbookCatalog,...ipadCatalog,...watchCatalog,...audioCatalog,...playstationCatalog,...googleCatalog,...xiaomiCatalog,...cameraCatalog,...dysonCatalog,...additionalCatalog] as CatalogItem[];
const inferColor = (item:CatalogItem):CatalogItem => {
  if(item.color) return item;
  const alias=item.priceAlias??'';
  const named=[...Object.keys(colors),'Jasper Plum','Jusper Plum','Amber Silk','Ceramic Apricot','Ceramic Pink','Strawberry Bronze','Red Velvet','Vinca Blue']
    .sort((a,b)=>b.length-a.length).find(color=>new RegExp(`(?:^|[\\s(/])${color}(?=$|[\\s)/,])`,'i').test(alias));
  if(!named) return item;
  const corrected=named==='Jusper Plum'?'Jasper Plum':colors[named]??named;
  return {...item,color:corrected};
};
const references = sources.map(item=>inferColor(presentCatalogItem(item))).filter(item=>!item.photoApproximate && usable(item.image));
const identities = new Map<string, Set<string>>();
for (const item of references) for (const path of [item.image,...item.gallery??[]]) {
  const set=identities.get(path)??new Set<string>(); set.add(key(item)); identities.set(path,set);
}
const sameFolder = (a:string,b:string) => !a.includes('/gallery/') || a.slice(0,a.lastIndexOf('/'))===b.slice(0,b.lastIndexOf('/'));
const media: Record<string,ProductMedia> = {};
const byKey=new Map<string,CatalogItem[]>();
for (const item of references) { const entries=byKey.get(key(item))??[]; entries.push(item); byKey.set(key(item),entries); }
const macPhoto = (item:CatalogItem):ProductMedia|undefined => {
  if(item.sourceCategory!=='Macbook') return undefined;
  const color=colorKey(item.color).replaceAll(' ','-');
  let gallery:string[]=[];
  if (/^MacBook Air (13|15) M5$/.test(item.model)) {
    const root=`/images/products/gallery/${item.model.toLowerCase().replaceAll(' ','-')}-${color}`;
    const primary=['view-1-correct.jpg','view-1.png','view-1.webp','view-1.jpg'].find(file=>existsSync(`public${root}/${file}`));
    if(primary) gallery=[`${root}/${primary}`,...['view-2','view-3'].flatMap(view=>['webp','jpg','png'].filter(ext=>existsSync(`public${root}/${view}.${ext}`)).map(ext=>`${root}/${view}.${ext}`))];
  } else if(item.model==='MacBook Neo 13') {
    const root=`/images/products/gallery/macbook-neo-${color}`;
    gallery=['view-1.png','view-2.jpg',color==='indigo'?'view-3-correct.jpg':'view-3.jpg'].map(file=>`${root}/${file}`).filter(usable);
  } else {
    const pro=item.model.match(/^MacBook Pro (14|16) M5(?: Pro| Max)?$/);
    const source=pro?(macSources as Record<string,{image:string;source:string}>)[`pro-${pro[1]}-2026-${color.replaceAll('-','')}`]:undefined;
    // The plain M5 model is the 2025 release; do not give it the 2026 photo.
    if(source && /M5 (Pro|Max)$/.test(item.model)) return {image:source.image,gallery:[source.image],status:'verified',referenceModel:item.model,referenceColor:item.color,source:source.source};
  }
  if(gallery.length) return {image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,source:'Apple product gallery: exact model and colour'};
};
for(const raw of rawCatalog) {
  const item=presentCatalogItem(raw as CatalogItem);
  let entry=macPhoto(item);
  if(!entry) {
    const candidates=byKey.get(key(item))??[];
    const candidate=candidates.find(candidate=>candidate.id===item.id && identities.get(candidate.image)?.size===1)
      ??candidates.find(candidate=>identities.get(candidate.image)?.size===1);
    if(candidate) {
      const gallery=[...new Set([candidate.image,...candidate.gallery??[]])].filter(path=>usable(path)&&sameFolder(candidate.image,path)&&identities.get(path)?.size===1);
      const source=(parserPhotos as Record<string,{source:string}>)[candidate.id]?.source??`Existing exact-model asset: ${candidate.id}`;
      if(gallery.length) entry={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,source};
    }
  }
  media[item.id]=entry??{image:'/images/product-photo-pending.svg',gallery:['/images/product-photo-pending.svg'],status:'pending'};
}
// Independently reviewed supplier pages can add missing exact product photos.
const manualFile='data/verified-product-media.json';
if(existsSync(manualFile)) {
  const manual=JSON.parse(readFileSync(manualFile,'utf8')) as Record<string,ProductMedia>;
  for(const [id,entry] of Object.entries(manual)) {
    const raw=rawCatalog.find(item=>item.id===id); if(!raw) throw new Error(`Unknown photo SKU: ${id}`);
    const item=presentCatalogItem(raw as CatalogItem);
    if(entry.status!=='verified'||entry.referenceModel!==item.model||colorKey(entry.referenceColor??'')!==colorKey(item.color)||!entry.source) { console.log('Stale photo mapping rejected:',id); continue; }
    if(entry.referenceAppearance!==undefined&&entry.referenceAppearance!==mediaAppearance(item)){console.log('Stale kit photo rejected:',id);continue;}
    const gallery=entry.gallery.filter(usable);
    if(gallery.length) media[id]={...entry,image:gallery[0],gallery};
  }
}
for(const raw of rawCatalog){
 const item=presentCatalogItem(raw as CatalogItem),entry=media[item.id];
 if(entry.status==='verified'&&!photoSourceMatchesItem(item,entry)){
  console.log('Different charging case source rejected:',item.id);
  media[item.id]={image:'/images/product-photo-pending.svg',gallery:['/images/product-photo-pending.svg'],status:'pending'};
 }
}
// Memory and region changes do not change a device's exterior. Reuse a reviewed
// photo only within the same model, finish and visible kit configuration.
const appearance = (item:CatalogItem) => (item.configuration??'').split(' · ')
  .filter(value=>value&&!/^(?:[A-Z0-9]{5}|RU|CN|EU|US|JP|KR|Ростест|Размер \d+)$/.test(value)).map(clean).sort().join('|');
const reviewed=new Map<string,ProductMedia>();
for(const raw of rawCatalog) {
  const item=presentCatalogItem(raw as CatalogItem);const entry=media[item.id];
  if(entry.status==='verified') reviewed.set(`${key(item)}|${appearance(item)}`,entry);
}
for(const raw of rawCatalog) {
  const item=presentCatalogItem(raw as CatalogItem);
  if(media[item.id].status==='verified')continue;
  const entry=reviewed.get(`${key(item)}|${appearance(item)}`);
  if(entry)media[item.id]={...entry,referenceModel:item.model,referenceColor:item.color};
}
// Detect a supplier reusing the same image for different bodies or finishes.
const bodies=new Map<string,Set<string>>();
const imageIdentity=(path:string)=>path.replace(/\.(jpg|png|webp)$/,'');
// Apple publishes the same original for these individually verified band lengths.
// This allowlist never merges case sizes, finishes or different band designs.
const equivalences=JSON.parse(readFileSync('data/product-photo-reviewed-equivalences.json','utf8')) as {image:string;ids:string[]}[];
const equivalentAppearance=new Map<string,string>();
// The manufacturer's ProductGroup assigns this exact original to both named
// IPD SKUs. Keep their catalog models separate; only this reviewed asset can
// share a collision identity, with each source bound to its own factory variant.
const factoryBody=new Map<string,string>();
for(const variant of xrealSharedPhoto.variants){
 const raw=rawCatalog.find(i=>i.id===variant.id),entry=media[variant.id];
 if(!raw)throw Error('Reviewed XREAL SKU missing');const item=presentCatalogItem(raw as CatalogItem);
 if(!/^XREAL One Pro \((M|L)\)$/.test(variant.model)||item.model!==variant.model||item.color!==''||mediaAppearance(item)!=='')throw Error('Reviewed XREAL hardware changed');
 if(entry.status==='verified'&&entry.gallery.includes(xrealSharedPhoto.image)&&entry.source===`${xrealSharedPhoto.source}?variant=${variant.variant}`&&entry.sourceTitle?.includes(variant.sku))factoryBody.set(`${imageIdentity(xrealSharedPhoto.image)}|${item.id}`,'xreal one pro|');
}
// Ray-Ban assigns these originals to both individually verified frame sizes.
// Bind only the listed image and factory EAN; retain each SKU's appearance guard.
for(const group of raybanSharedPhotos){
 const physical=new Set<string>();
 for(const variant of group.variants){
  const raw=rawCatalog.find(i=>i.id===variant.id);if(!raw)throw Error('Reviewed Ray-Ban SKU missing');const item=presentCatalogItem(raw as CatalogItem);
  if(!/^Ray-Ban Wayfarer RW4012$/.test(item.model)||item.model!==variant.model||item.color!==variant.color||item.configuration!==variant.configuration||!/[ML]$/.test(variant.configuration))throw Error('Reviewed Ray-Ban frame changed');
  physical.add(`${item.model}|${item.color}|${variant.configuration.replace(/ [ML]$/,'')}`);
  const source=new URL(variant.source);
  if(source.hostname!=='www.ray-ban.com'||!source.pathname.startsWith('/usa/electronics/')||!source.pathname.endsWith('/'+variant.ean)||!variant.modelCode.startsWith('RW4012 ')||new URL(group.url).hostname!=='images2.ray-ban.com')throw Error('Reviewed Ray-Ban factory source changed');
 }
 if(group.variants.length!==2||physical.size!==1)throw Error('Invalid Ray-Ban shared photo across different frames or lenses');
 for(const variant of group.variants){const entry=media[variant.id];if(entry.status==='verified'&&entry.gallery.includes(group.image)&&entry.source===variant.source&&entry.sourceTitle?.includes(variant.modelCode)&&entry.sourceTitle.includes('factory EAN '+variant.ean))factoryBody.set(`${imageIdentity(group.image)}|${variant.id}`,[...physical][0]);}
}
for(const group of equivalences){
 const members=group.ids.map(id=>{const raw=rawCatalog.find(i=>i.id===id);if(!raw)throw Error(`Unknown equivalent SKU: ${id}`);return presentCatalogItem(raw as CatalogItem);});
 const physicalKey=(item:CatalogItem)=>`${item.model}|${item.color}|${mediaAppearance({...item,configuration:(item.configuration??'').replace(/\s*\((?:S\/M|M\/L)\)/g,'').replace(/\b(?:S\/M|M\/L|Small|Medium|Large)\b/g,'').trim()})}`;
 if(!members.length||members.some(i=>i.category!=='watches'||physicalKey(i)!==physicalKey(members[0])))throw Error('Invalid photo equivalence across different hardware');
 for(const item of members){
  const entry=media[item.id];
  const manufacturer=entry.source?.startsWith('https://www.apple.com/shop/')&&/^\/shop\/(?:buy-watch|product)\//.test(new URL(entry.source).pathname);
  const supplier=entry.sourceWorkbook==='Парсер.xlsx'&&supplierSources.some(s=>s.url===entry.source&&s.sheet===entry.sourceSheet&&s.row===entry.sourceRow);
  if(entry.status!=='verified'||!entry.gallery.includes(group.image)||(!manufacturer&&!supplier))continue;
  equivalentAppearance.set(`${imageIdentity(group.image)}|${item.id}`,mediaAppearance(members[0]));
 }
}
for(const raw of rawCatalog){const item=presentCatalogItem(raw as CatalogItem),entry=media[item.id];if(entry.status!=='verified')continue;
 for(const path of entry.gallery){
  const visibleAppearance=equivalentAppearance.get(`${imageIdentity(path)}|${item.id}`)??mediaAppearance(item);
  const body=factoryBody.get(`${imageIdentity(path)}|${item.id}`)??`${modelKey(item.model).replace(/^(macbook pro \d+ m\d+) (pro|max)$/,'$1')}|${colorKey(item.color)}|${visibleAppearance}`;
  const set=bodies.get(imageIdentity(path))??new Set<string>();set.add(body);bodies.set(imageIdentity(path),set);
 }
}
writeFileSync('.tmp-qa/media-identity-conflicts.json',JSON.stringify([...bodies].filter(([,identities])=>identities.size>1).map(([image,identities])=>({image,identities:[...identities]})),null,2)+'\n');
for(const raw of rawCatalog){const item=presentCatalogItem(raw as CatalogItem),entry=media[item.id];if(entry.status!=='verified')continue;
 const gallery=entry.gallery.filter(path=>bodies.get(imageIdentity(path))?.size===1);
 media[item.id]=gallery.length?{...entry,image:gallery[0],gallery,referenceAppearance:mediaAppearance(item)}:{image:'/images/product-photo-pending.svg',gallery:['/images/product-photo-pending.svg'],status:'pending'};
}
writeFileSync('data/catalog-product-media.json',`${JSON.stringify(media,null,2)}\n`);
const groups=new Map<string,{total:number;verified:number}>();
for(const item of rawCatalog) {
  const group=groups.get(item.sourceCategory)??{total:0,verified:0};group.total++;if(media[item.id].status==='verified')group.verified++;groups.set(item.sourceCategory,group);
}
console.log('Exact photos:',Object.values(media).filter(item=>item.status==='verified').length,'of',rawCatalog.length);
console.log([...groups].map(([category,count])=>`${category}: ${count.verified}/${count.total}`).join('\n'));
