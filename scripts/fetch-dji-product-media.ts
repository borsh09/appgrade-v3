import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const file='data/verified-product-media.json';
const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const norm=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^dji\s+/,'').replace(/[^a-z0-9]+/g,' ').trim();
const family=(name:string)=>name.replace(/ (?:Device Only|Standard Combo|Creator Combo|Adventure Combo|Essential Combo|Vlog Combo|Advanced Tracking Combo)$/, '');
const items=raw.filter(item=>item.sourceCategory==='DJI Handheld'||item.sourceCategory==='DJI Power').map(item=>presentCatalogItem(item as CatalogItem));
const groups=new Map<string,CatalogItem[]>();
for(const item of items){if(media[item.id])continue;const root=family(item.model);const list=groups.get(root)??[];list.push(item);groups.set(root,list);}
mkdirSync('public/images/products/verified',{recursive:true});
for(const [root,list] of groups){
 // Microphone transmitter counts and finishes need their own SKU association.
 if(/Mic/.test(root))continue;
 const page=`https://store.dji.com/uk/product/${norm(root).replaceAll(' ','-')}`;
 try{
  const response=await fetch(page,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const html=await response.text();const title=html.match(/<title[^>]*>([^<]+)<\/title>/)?.[1]??'';
  if(!(` ${norm(title)} `).includes(` ${norm(root)} `))throw new Error('Different model in page title');
  const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
  for(const item of list){
   const deviceOnly=item.model.endsWith('Device Only');
   const expected=norm(item.model);
   const kit=item.model.match(/(Standard|Creator|Adventure|Essential|Vlog|Advanced Tracking) Combo$/)?.[1];
   const kitLabels:Record<string,RegExp>={Standard:/standard|estandar/,Creator:/creator|creadores/,Adventure:/adventure|aventura/,Essential:/essential|esencial/,Vlog:/vlog/,'Advanced Tracking':/advanced tracking|seguimiento avanzado/};
   // A generic carousel thumbnail may show people, phones or a different kit.
   // Device Only requires an explicit exact label or a separately reviewed original.
   const tag=deviceOnly?tags.find(tag=>tag.includes('/spu/cover/')&&norm(tag.match(/alt="([^"]+)"/)?.[1]??'')===expected)
    :tags.find(tag=>{
      if(!/\/spu\/cover\//.test(tag))return false;
      const label=norm(tag.match(/alt="([^"]+)"/)?.[1]??'');
      return kit?(` ${label} `).includes(` ${norm(root)} `)&&kitLabels[kit].test(label):label===expected;
    });
   const rawUrl=tag?.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');
   if(!rawUrl){console.log(item.model,'no exact kit image');continue;}
   const url=new URL(rawUrl,page);url.pathname=url.pathname.replace('@small.','@ultra.');
   if(url.hostname!=='se-cdn.djiits.com')throw new Error('Unexpected image host');
   const photo=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!photo.ok)throw new Error(`Image HTTP ${photo.status}`);
   const bytes=Buffer.from(await photo.arrayBuffer());
   const ext=bytes[0]===0xff?'jpg':bytes[0]===0x89?'png':bytes.toString('ascii',0,4)==='RIFF'?'webp':undefined;
   if(!ext||bytes.length<1000||bytes.length>15000000)throw new Error('Invalid image');
   const image=`/images/products/verified/${createHash('sha256').update(url.href).digest('hex').slice(0,24)}.${ext}`;
   writeFileSync(`public${image}`,bytes);
   media[item.id]={image,gallery:[image],status:'verified',referenceModel:item.model,referenceColor:item.color,source:page,sourceTitle:tag!.match(/alt="([^"]+)"/)?.[1]??title};
   writeFileSync(file,`${JSON.stringify(media,null,2)}\n`);console.log(item.model,'verified');
  }
 }catch(error){console.log(root,error instanceof Error?error.message:String(error));}
}
