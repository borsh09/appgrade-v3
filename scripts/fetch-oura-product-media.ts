import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const file='data/verified-product-media.json';
const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const items=raw.filter(item=>item.sourceCategory==='Oura Ring').map(item=>presentCatalogItem(item as CatalogItem));
const groups=new Map<string,CatalogItem[]>();
for(const item of items){const key=`${item.model}|${item.color}`;const list=groups.get(key)??[];list.push(item);groups.set(key,list);}
mkdirSync('public/images/products/verified',{recursive:true});
for(const list of groups.values()){
 const item=list[0];const generation=item.model.match(/\d+/)?.[0];
 const page=`https://ouraring.com/store/rings/oura-ring-${generation}/${item.color.toLowerCase().replaceAll(' ','-')}`;
 try{
  const response=await fetch(page,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const html=await response.text();const title=html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1]??'';
  if(!title.includes(item.model))throw new Error('Different ring generation');
  const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
  const finish=item.color.toLowerCase().replaceAll(' ','-');
  const tag=tags.find(tag=>tag.includes(`Oura Ring ${generation} in ${item.color} finish, product image`))
    ??tags.find(tag=>tag.includes(`or${generation}-${finish}-front-view.png`))
    ??(generation==='4'?tags.find(tag=>tag.includes(`alt="${item.color}"`)&&tag.includes('/hardware-pdp/hero-carousel/')):undefined);
  const alternate=tags.find(tag=>tag.includes(`or${generation}-${finish}-alt.png`))
    ??tags.find(tag=>tag.includes(`or${generation}-${finish}-angle-view.png`))
    ??(generation==='4'?tags.find(candidate=>candidate!==tag&&candidate.includes(`alt="${item.color}"`)&&candidate.includes('/hardware-pdp/hero-carousel/')):undefined);
  const urls=[tag,alternate].filter((tag):tag is string=>Boolean(tag)).map(tag=>tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;','&')).filter((url):url is string=>Boolean(url));
  if(!urls.length)throw new Error('No exact finish photo in page');
  const gallery:string[]=[];
  for(const url of new Set(urls)){
   if(new URL(url).hostname!=='ourahealth.imgix.net')throw new Error('Unexpected image host');
   const photo=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!photo.ok)throw new Error(`Image HTTP ${photo.status}`);
   const bytes=Buffer.from(await photo.arrayBuffer());const extension=bytes[0]===0x89?'png':bytes[0]===0xff?'jpg':undefined;
   if(!extension||bytes.length<1000||bytes.length>15000000)throw new Error('Invalid photo');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${extension}`;
   writeFileSync(`public${image}`,bytes);gallery.push(image);
  }
  for(const variant of list)media[variant.id]={image:gallery[0],gallery,status:'verified',referenceModel:variant.model,referenceColor:variant.color,source:page,sourceTitle:title};
  writeFileSync(file,`${JSON.stringify(media,null,2)}\n`);console.log(item.model,item.color,list.length,'articles');
 }catch(error){console.log(item.model,item.color,error instanceof Error?error.message:String(error));}
}
