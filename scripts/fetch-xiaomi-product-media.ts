import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
import {mediaAppearance} from '../lib/catalog-media-identity';

// Original assets observed in the official store gallery after selecting each colour.
const rules=[{model:'Xiaomi 17 Ultra',source:'https://www.mi.com/uk/product/xiaomi-17-ultra/buy/',date:'25/02/2026',colors:{
 White:['297/43d81b98e011c52d912374a6350c027a','137/cfb09e798111a015f380ca82cacffb65','78/ccaee825df3deb34363ff58858feef75'],
 Black:['423/c7d99874ebd751c344aeaa0d52148f37','332/825ab38715972c7fac61cd036de7a88b','990/638229d280d8a3b6bb4d2bc828f87d01'],
 Green:['710/464f43559dc13b599675a93e62c6dd56','220/0f8305a3393a805e4340dd0cce530229','612/0030360e7b364a50fe0b9687af7a2dc2'],
}}, {model:'Poco F8 Pro',source:'https://www.mi.com/uk/product/poco-f8-pro/buy/',date:'25/11/2025',colors:{
 Blue:['14/66cb537ce47c4cd08d4542414efc96f9','637/3c61754f54a5a6cb949a63fb24d263dd','928/cd51e5d88331420840e7a9311166768c'],
 Black:['917/46caa5ebd30dfdfd0ef7d8b380d6d5ae','363/4f736181ee94f440542441fed3d73cf3','731/d2b35acf6d0cbfba4f2a710cf94f8335'],
 Silver:['349/0a9c24029facf7c063c0d740a2b990b4','517/3e568eec629a472288af7738775f9da0','782/cab08f84b2feb5b11b1fe8eac9400b9b'],
}}];
const items=raw.map(item=>presentCatalogItem(item as CatalogItem));
// Standard factory galleries do not establish a supplier's reduced Slim kit.
const supportsKit=(item:CatalogItem,title:string)=>!(/\bslim\b/i.test(item.configuration??''))||/\bslim\b/i.test(title);
const file='data/verified-product-media.json';
const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
if(process.argv.includes('--apply-reviewed')){
 const candidates=JSON.parse(readFileSync('.tmp-qa/xiaomi/exact-gallery-candidates.json','utf8')) as {model:string;color:string;title:string;ids:string[];source:string;image:string}[];
 const reviewed=JSON.parse(readFileSync('data/xiaomi-reviewed-photo-assets.json','utf8')) as string[];
 let added=0;
 for(const candidate of candidates){
  if(!reviewed.includes(candidate.image)||!existsSync(`public${candidate.image}`))continue;
  for(const id of candidate.ids){
   const item=items.find(i=>i.id===id);if(!item||!supportsKit(item,candidate.title))continue;
   if(manual[id]?.source===candidate.source&&manual[id].gallery.length>1)continue;
   manual[id]={image:candidate.image,gallery:[candidate.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:candidate.source,sourceTitle:candidate.title};added++;
  }
 }
 writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log('Applied',added,'reviewed article photos');process.exit(0);
}
if(process.argv.includes('--api-preview')){
 const norm=(s:string)=>s.toLowerCase().replace(/^mi\b/,'xiaomi').replaceAll('+',' plus ').replace(/[^a-z0-9]+/g,' ').trim();
 const aliases:Record<string,string>={'starlit green':'green','titanium silver':'silver','denim blue':'blue','graphite gray':'gray','graphite grey':'gray','mint green':'green','forest green':'green','pine green':'green','titan gray':'gray','titan grey':'gray','titan black':'black','titan blue':'blue','lavender purple':'purple','ice blue':'blue','glacier blue':'blue','ocean blue':'blue','sand gold':'gold','grey':'gray','deep blue':'blue','aurora green':'green','dark cherry':'cherry'};
 const colorNorm=(s:string)=>({'черный':'black','чёрный':'black','белый':'white','голубой':'blue','синий':'blue','серый':'gray','зеленый':'green','зелёный':'green','фиолетовый':'purple'} as Record<string,string>)[s.toLowerCase()]??aliases[norm(s)]??norm(s);
 const candidates=[];
 for(const cache of readdirSync('.tmp-qa/xiaomi').filter(f=>f.endsWith('-store-data.json'))){
  const response=JSON.parse(readFileSync(`.tmp-qa/xiaomi/${cache}`,'utf8'));if(response.errno!==0)continue;
  const detail=response.data?.item_detail;
  const colorIndex=detail?.specs_list?.specs_list?.findIndex((s:{key:string})=>s.key==='color');
  if(colorIndex===undefined||colorIndex<0)continue;
  const owners=new Map<string,Set<string>>();
  for(const spu of detail.spu_list??[])for(const sku of spu.item_list??[]){
   const color=detail.specs_list.sku_list.find((s:{item_id:number})=>s.item_id===sku.item_id)?.specs_item[colorIndex];
   for(const p of sku.resource_list??[]){const set=owners.get(p.src)??new Set<string>();set.add(`${spu.spu_name}|${color}`);owners.set(p.src,set);}
  }
  for(const spu of detail.spu_list??[]){
   const seen=new Set<string>();
   for(const sku of spu.item_list??[]){
    const factoryColor=detail.specs_list.sku_list.find((s:{item_id:number})=>s.item_id===sku.item_id)?.specs_item[colorIndex];
    if(!factoryColor||seen.has(factoryColor))continue;seen.add(factoryColor);
    const canonical=aliases[norm(factoryColor)]??norm(factoryColor);
    const matches=items.filter(i=>norm(i.model)===norm(spu.spu_name)&&colorNorm(i.color)===canonical&&supportsKit(i,sku.item_name));
    if(!matches.length)continue;
    const photo=sku.resource_list?.find((p:{type:string;src:string;description?:string})=>p.type==='image'&&p.src&&owners.get(p.src)?.size===1&&(!/^redmi pad 2(?: 4g)?$/.test(norm(spu.spu_name))||/\b(?:back|rear)\b/i.test(p.description??'')));
    if(!photo||!sku.item_name.toLowerCase().includes(spu.spu_name.toLowerCase())||!sku.item_name.toLowerCase().includes(factoryColor.toLowerCase()))continue;
    const url=new URL(photo.src,'https://www.mi.com').href;
    if(!['i02.appmifile.com','i05.appmifile.com'].includes(new URL(url).hostname))continue;
    const ext=new URL(url).pathname.endsWith('.png')?'png':new URL(url).pathname.endsWith('.jpg')?'jpg':undefined;if(!ext)continue;
    const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
    if(!existsSync(`public${image}`)){
     const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(`Original HTTP ${r.status}`);
     const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||bytes.length>15000000||(ext==='png'?bytes[0]!==0x89:bytes[0]!==0xff))throw Error('Invalid original');writeFileSync(`public${image}`,bytes);
    }
    candidates.push({model:spu.spu_name,color:factoryColor,title:sku.item_name,ids:matches.map(i=>i.id),source:`https://www.mi.com/uk/product/${cache.replace('-store-data.json','')}/buy/`,image,url,description:photo.description});
    console.log(spu.spu_name,factoryColor,matches.length,image);
   }
  }
 }
 writeFileSync('.tmp-qa/xiaomi/exact-gallery-candidates.json',JSON.stringify(candidates,null,2)+'\n');
 process.exit(0);
}
for(const rule of rules){
for(const [color,assets] of Object.entries(rule.colors)){
 if(!assets)continue;
 const gallery=[];
 for(const asset of assets){
  const [folder,name]=asset.split('/');
  const url=`https://i05.appmifile.com/${folder}_item_uk/${rule.date}/${name}.png`;
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
  if(!existsSync(`public${image}`)){
   const r=await fetch(url,{signal:AbortSignal.timeout(25000)});
   if(!r.ok||new URL(r.url).hostname!=='i05.appmifile.com')throw Error(`Photo HTTP ${r.status}`);
   const bytes=Buffer.from(await r.arrayBuffer());
   if(bytes[0]!==0x89||bytes.length<1000||bytes.length>15000000)throw Error('Invalid PNG original');
   writeFileSync(`public${image}`,bytes);
  }
  gallery.push(image);
 }
 console.log(color,gallery);
 if(process.argv.includes('--preview'))continue;
 const matches=items.filter(item=>item.model.toLowerCase()===rule.model.toLowerCase()&&item.color===color&&supportsKit(item,rule.model));
 for(const item of matches)manual[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:rule.source,sourceTitle:`${rule.model} ${color==='Green'?'Starlit Green':color==='Silver'?'Titanium Silver':color}: selected official studio gallery`};
 console.log('Verified',color,matches.length,'articles');
}
}
if(!process.argv.includes('--preview'))writeFileSync(file,JSON.stringify(manual,null,2)+'\n');
