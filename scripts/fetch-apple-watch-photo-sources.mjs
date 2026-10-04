import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('.tmp-qa/apple-phones',{recursive:true});
const sources=JSON.parse(readFileSync('data/apple-watch-photo-sources.json','utf8'));
const norm=s=>s.normalize('NFKC').replace(/[\u200b-\u200d]/g,'').replace(/\s+/g,' ').trim();
const candidates=[]; let cursor=0;
async function worker(){while(cursor<sources.length){const s=sources[cursor++];try{
 const url=`https://www.apple.com/shop/buy-watch/${s.family??'apple-watch'}/${s.path}`;
 const file=`.tmp-qa/apple-phones/${s.key}.html`;
 let h=existsSync(file)?readFileSync(file,'utf8'):'';
 if(!norm(h.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]??'').startsWith(s.title)){
  const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok||new URL(r.url).hostname!=='www.apple.com')throw Error(`HTTP ${r.status}`);
  h=await r.text();writeFileSync(file,h);
 }
 const title=norm(h.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]??'');
 if(!title.startsWith(s.title))throw Error(`Unconfirmed configuration: ${title}`);
 const blocks=[...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const products=[];function walk(v){if(!v||typeof v!=='object')return;if(v['@type']==='Product')products.push(v);for(const x of Object.values(v))if(typeof x==='object')walk(x);}blocks.forEach(walk);
 const p=products.find(p=>typeof p.image==='string'&&p.image.includes('watch-case-'));
 if(!p)throw Error('No original composite image');
 const u=new URL(p.image);if(u.hostname!=='store.storeimages.cdn-apple.com'||Number(u.searchParams.get('wid'))<1000||u.searchParams.get('fmt')!=='png-alpha')throw Error('Unqualified original');
 const image=`/images/products/verified/${createHash('sha256').update(p.image).digest('hex').slice(0,24)}.png`;
 if(!existsSync(`public${image}`)){const r=await fetch(p.image,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(`Image HTTP ${r.status}`);const b=Buffer.from(await r.arrayBuffer());if(b[0]!==0x89||b.length<1000||b.length>15000000)throw Error('Invalid PNG');writeFileSync(`public${image}`,b);}
 candidates.push({...s,source:url,sourceTitle:title,image,url:p.image});console.log(s.key,image);
 }catch(e){console.log(s.key,String(e));}}}
await Promise.all(Array.from({length:4},worker));
writeFileSync('.tmp-qa/apple-phones/watch-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'confirmed configurations');
