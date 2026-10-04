import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';

const pages=JSON.parse(readFileSync('.tmp-qa/apple-refurb/pages.json','utf8')) as {url:string;file:string;title:string}[];
const items=raw.filter(item=>item.sourceCategory==='iPhone'&&!/Active/i.test(item.priceAlias??'')).map(item=>presentCatalogItem(item as CatalogItem));
const normalize=(color:string)=>color.toLowerCase().replace(/\s*titanium$/,'').replaceAll(' ','-');
const file='data/verified-product-media.json';const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const visited=new Set<string>();
for(const page of pages){try{
 const title=page.title.normalize('NFKC').replace(/[\u200b-\u200d]/g,'');const match=title.match(/^Refurbished (iPhone \d+(?: Pro Max| Pro| Plus|e)?) \d+\s*(?:GB|TB) - (.*?) \((?:Unlocked|SIM[- ]Free)\)/)??title.match(/^Refurbished (iPhone \d+(?: Pro Max| Pro| Plus|e)?), \d+\s*(?:GB|TB), (.*?) \(zonder abonnement\)/);
 if(!match)continue;
 const model=match[1],color=match[2],identity=`${model}|${normalize(color)}`;
 if(visited.has(identity))continue;
 const matches=items.filter(item=>item.model===model&&normalize(item.color)===normalize(color));if(!matches.length)continue;
 const html=readFileSync(page.file,'utf8');
 const photos=[...html.matchAll(/https[^"<>\s]+\/is\/refurb-iphone-[^"<>\s]+/g)].map(m=>m[0].replaceAll('&amp;','&')).filter(url=>{
  const u=new URL(url);const stem=u.pathname.split('/').at(-1)??'';
  const expected=`refurb-${model.toLowerCase().replaceAll(' ','-')}-${color.toLowerCase().replaceAll(' ','-')}`.replaceAll('-','');
  return u.hostname==='store.storeimages.cdn-apple.com'&&/-\d{6}$/.test(stem)&&stem.replace(/-\d{6}$/,'').replaceAll('-','')===expected&&Number(u.searchParams.get('wid'))>=1000&&Number(u.searchParams.get('hei'))>=1000;
 });
 const url=photos.sort((a,b)=>Number(new URL(b).searchParams.get('hei'))-Number(new URL(a).searchParams.get('hei')))[0];
 if(!url){console.log('Missing studio photo',identity);continue;}
 const hash=createHash('sha256').update(url).digest('hex').slice(0,24),image=`/images/products/verified/${hash}.jpg`;
 if(!existsSync(`public${image}`)){const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok||new URL(r.url).hostname!=='store.storeimages.cdn-apple.com')throw Error(`HTTP ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0xff||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');writeFileSync(`public${image}`,bytes);}
 for(const item of matches)manual[item.id]={image,gallery:[image],status:'verified',referenceModel:item.model,referenceColor:item.color,source:page.url,sourceTitle:title};
 writeFileSync(file,JSON.stringify(manual,null,2)+'\n');visited.add(identity);console.log(identity,matches.length,'articles');
}catch(error){console.log(page.url,String(error));}}
