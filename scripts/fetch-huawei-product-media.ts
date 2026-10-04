import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';

// Only labelled factory studio assets, never blurred previews or lifestyle pictures.
const rules=[
 {page:'freeclip2',model:'Huawei FreeClip 2S',path:/\/freeclip2-s\/list-(?:deepsea-blue|space-silver)\.png$/,colors:{Blue:'Deepsea Blue',Silver:'Space Silver'}},
 {page:'freeclip2',model:'Huawei FreeClip 2',path:/\/freeclip2\/list-purple\.png$/,colors:{Purple:'Berry Purple'}},
 {page:'pura90sproMax',specs:true,model:'Huawei Pura 90s Pro Max',path:/\/specs-[\w-]+\.png$/,colors:{Gold:'Blush Gold',Orange:'Orange Ocean',Purple:'Blaze Purple',Black:'Graphite Black'}},
 {page:'matext',specs:true,model:'Huawei Mate XT Ultimate Design',path:/\/specs\/\w+\.png$/,colors:{Red:'Red',Black:'Black'}},
 {page:'nova15max',specs:true,model:'Huawei Nova 15 Max',path:/\/specs-[\w-]+\.png$/,colors:{Cyan:'Lake Cyan',Black:'Golden Black'}},
 {page:'novay74',specs:true,model:'Huawei Nova Y74',path:/\/specs-\w+\.png$/,colors:{Blue:'Blue'}},
 {page:'mate80pro',specs:true,model:'Huawei Mate 80 Pro',path:/\/specs-\w+\.png$/,colors:{Gold:'Gold',Green:'Green'}},
 {page:'matex7',specs:true,model:'Huawei Mate X7',path:/\/specs-\w+\.png$/,colors:{Black:'Black'}},
 {page:'pura80',specs:true,model:'Huawei Pura 80',path:/\/specs-\w+\.png$/,colors:{Black:'Frosted Black'}},
 {page:'watchgt6pro',specs:true,model:'Huawei Watch GT 6 Pro',path:/\/specs-\w+\.png$/,colors:{Brown:'Brown'}},
 {page:'pura90spro',model:'Huawei Pura 90s Pro',path:/\/img\/design\/design-color-phone-\d\.png$/,colors:{Pink:'Guava Soda',Orange:'Orange Soda',White:'Coconut White',Black:'Mulberry Black'}},
 {page:'nova15',model:'Huawei Nova 15',path:/colours-and-id-details-\w+-1\.png$/,colors:{Green:'green',White:'white',Black:'black'}},
 {page:'watchgt7',model:'Huawei Watch GT 7',path:/\/design\/huawei-watch-gt-7-(?:46|41)-mm-\w+\.png$/,colors:{Blue:'blue',Black:'black',Yellow:'yellow'}},
 {page:'watchgt7pro',model:'Huawei Watch GT 7 Pro',path:/design-color-watch-\d-2x\.png$/,colors:{Black:'black',Green:'green',Yellow:'yellow'}},
 {page:'watchgt6',model:'Huawei Watch GT 6',path:/\/switch\/huawei-watch-gt-6-46-mm-strap-1-1\.png$/,colors:{Green:'green'}},
];
const pages=JSON.parse(readFileSync('.tmp-qa/huawei/pages.json','utf8')) as Record<string,string>;
const items=raw.map(item=>presentCatalogItem(item as CatalogItem));
const file='data/verified-product-media.json';const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
for(const rule of rules){
 const html=readFileSync(`.tmp-qa/huawei/${rule.page}${rule.specs?'-specs':''}.html`,'utf8');
 const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>({alt:m[0].match(/alt="([^"]*)"/)?.[1]??'',src:m[0].match(/data-src="([^"]*)"/)?.[1]??m[0].match(/\bsrc="([^"]*)"/)?.[1]??''}));
 if(rule.page==='freeclip2'){
   const decoded=html.replaceAll('&quot;','"').replaceAll('&amp;','&');
   for(const match of decoded.matchAll(/"colorName":"([^"]+)","colorValue":"[^"]*","img":"([^"]+)"/g))tags.push({alt:match[1],src:match[2]});
 }
 for(const [color,factoryColor] of Object.entries(rule.colors)){
  const matches=items.filter(item=>item.model.toLowerCase()===rule.model.toLowerCase()&&item.color===color);
  for(const item of matches){try{
   const size=String(item.size??'').match(/\d+/)?.[0];
   const photo=tags.find(tag=>rule.path.test(tag.src)&&tag.alt.toLowerCase().includes(factoryColor.toLowerCase())&&(!rule.page.endsWith('watchgt7')||Boolean(size&&tag.alt.includes(`${size}mm`))));
   if(!photo){console.log('Missing exact asset',item.id,item.model,item.color,item.size);continue;}
   const path=rule.page==='freeclip2'&&photo.src.startsWith('/content/dam/')?`/dam${photo.src}`:photo.src;
   const url=new URL(path,pages[rule.page]).href;
   const hash=createHash('sha256').update(url).digest('hex').slice(0,24);const image=`/images/products/verified/${hash}.png`;
   if(!existsSync(`public${image}`)){
    const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
    if(!response.ok||new URL(response.url).hostname!=='consumer.huawei.com')throw new Error(`Photo HTTP ${response.status}`);
    const bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000||bytes.length>15000000)throw new Error('Invalid PNG original');
    writeFileSync(`public${image}`,bytes);
   }
   manual[item.id]={image,gallery:[image],status:'verified',referenceModel:item.model,referenceColor:item.color,source:pages[rule.page]+(rule.specs?'specs/':''),sourceTitle:`${item.model}: ${photo.alt}`};
   writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log('Verified',item.id,item.model,item.color,item.size);
  }catch(error){console.log(item.id,String(error));}}
 }
}
