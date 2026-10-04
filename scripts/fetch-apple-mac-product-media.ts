import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const file='data/verified-product-media.json';
const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const items=raw.filter(item=>item.sourceCategory==='Macbook').map(item=>presentCatalogItem(item as CatalogItem));
const groups=new Map<string,CatalogItem[]>();
for(const item of items){const key=`${item.model}|${item.color}`;groups.set(key,[...groups.get(key)??[],item]);}
mkdirSync('public/images/products/verified',{recursive:true});
for(const [key,list] of groups){
 if(list.every(item=>media[item.id]?.source?.startsWith('https://www.apple.com/shop/product/')&&media[item.id]?.referenceModel===item.model&&media[item.id]?.referenceColor===item.color))continue;
 const part=list.map(item=>item.sourceTitle?.match(/^([A-Z0-9]{5})\s*-/)?.[1]??item.configuration?.match(/\b[A-Z0-9]{5}\b/)?.[0]).find(Boolean);
 if(!part){console.log(key,'no manufacturer code');continue;}
 const page=`https://www.apple.com/shop/product/${part}LL/A`;
 try{
  const response=await fetch(page,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const html=await response.text();const title=html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1]??'';
  const item=list[0],size=item.model.match(/\b(13|14|15|16)\b/)?.[1];
  const kind=item.model.includes('Air')?'Air':item.model.includes('Neo')?'Neo':'Pro';
  if(!title.includes(`MacBook ${kind}`)||(kind!=='Neo'&&!title.includes(`${size}-inch`)))throw new Error(`Wrong model: ${title}`);
  const color=item.color.toLowerCase().replaceAll(' ','');
  if(!title.toLowerCase().replaceAll(' ','').includes(color))throw new Error(`Wrong finish: ${title}`);
  const urls=html.match(/https:\/\/store\.storeimages[^\s"<>]+/g)??[];
  const url=urls.find(url=>(kind==='Neo'?/macbook-neo-color-select/.test(url):/specs-select/.test(url))&&url.includes(kind==='Neo'?`-${color}-`:`${size}inch-${color}`))?.replaceAll('&amp;','&');
  if(!url)throw new Error('No exact size and finish image');
  const photo=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!photo.ok)throw new Error(`Photo HTTP ${photo.status}`);
  const bytes=Buffer.from(await photo.arrayBuffer());if(bytes.length<1000||bytes[0]!==0xff)throw new Error('Invalid JPEG');
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.jpg`;
  writeFileSync(`public${image}`,bytes);
  for(const item of list)media[item.id]={image,gallery:[image],status:'verified',referenceModel:item.model,referenceColor:item.color,source:page,sourceTitle:title};
  console.log(key,`verified ${list.length}`);
 }catch(error){console.log(key,error instanceof Error?error.message:String(error));}
}
writeFileSync(file,`${JSON.stringify(media,null,2)}\n`);
