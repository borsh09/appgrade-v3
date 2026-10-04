import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('.tmp-qa/realme',{recursive:true});
async function factoryFetch(url){let last;for(let i=0;i<3;i++){try{return await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});}catch(e){last=e;}}throw last;}
const pages={c85:'https://www.realme.com/my/realme-c85/specs',c100x:'https://www.realme.com/it/realme-c100x/specs',r16:'https://www.realme.com/tw/realme-16-5g/specs'};
const morePages={gt7t:'https://www.realme.com/tw/realme-gt-7t-5g/specs',gt7:'https://www.realme.com/my/realme-gt-7-5g/specs',note60x:'https://www.realme.com/my/realme-note-60x/specs',p4x:'https://www.realme.com/my/realme-p4x/specs'};
if(process.argv.includes('--more'))Object.assign(pages,morePages);
if(process.argv.includes('--ru'))Object.assign(pages,{c85ru:'https://www.realme.com/ru/realme-c85/specs',c85pro:'https://www.realme.com/ru/realme-c85-pro/specs',r15:'https://www.realme.com/ru/realme-15-5g/specs'});
if(process.argv.includes('--download')){
 const candidates=[];
 for(const [key,source] of Object.entries(pages)){
  const html=readFileSync(`.tmp-qa/realme/${key}.html`,'utf8');
  const blocks=[...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{return null;}}).filter(Array.isArray);
  for(const b of blocks)for(const v of b.filter(v=>v&&typeof v==='object'&&'colorName' in v)){
   const label=b[v.colorName],url=b[v.mobile];if(!url||!['image01.realme.net','image05.realme.net'].includes(new URL(url).hostname)||!/\.(?:jpg|png)$/.test(url))throw Error('Unexpected Realme original');
   const ext=new URL(url).pathname.endsWith('.png')?'png':'jpg';
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok)throw Error('Realme original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(ext==='jpg'?(bytes[0]!==0xff||bytes[1]!==0xd8):(bytes[0]!==0x89||bytes[1]!==0x50))throw Error('Invalid Realme original format');writeFileSync('public'+image,bytes);}
   candidates.push({key,label,source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,image});console.log(key,label,image);
  }
 }
 writeFileSync('.tmp-qa/realme/candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
for(const [key,source] of Object.entries(pages)){
 const file=`.tmp-qa/realme/${key}.html`;if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error(`Realme ${key}: ${r.status}`);writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/realme/${key}-images.json`,JSON.stringify(images,null,2)+'\n');console.log(images.filter(t=>/spec|param|color|colour|phone/i.test(t)).slice(0,18).map(t=>t.slice(0,700)).join('\n'));console.log('images',images.length);
}
