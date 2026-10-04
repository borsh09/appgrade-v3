import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Factory studio photographs are used as hardware references only.
// Product condition, pricing and descriptions are never imported.
const pages=JSON.parse(readFileSync('.tmp-qa/apple-refurb/watch-pages.json','utf8'));
const raw=JSON.parse(readFileSync('data/new-price-catalog.json','utf8'));
const norm=s=>s.normalize('NFKC').replace(/[\u200b-\u200d]/g,'').replace(/\s+/g,' ').replaceAll('Aluminium','Aluminum').replaceAll('Grey','Gray').trim();
const selected=new Map();
for(const page of pages){
 const title=norm(page.title??'');
 const m=title.match(/^Refurbished Apple Watch (Series \d+|Ultra \d+) GPS(?:\s*\+\s*Cellular)?, (\d+)mm (.+?) [Cc]ase with (.+?) - Apple/);
 if(!m)continue;
 const [,model,size,finish,band]=m;
 for(const item of raw){
  if(item.sourceCategory!=='Apple Watch'||selected.has(item.id))continue;
  const series=item.sourceTitle.match(/^S(10|11) (\d+)mm (Space Gray|Jet Black|Rose Gold|Silver|Natural|Slate|Gold) (Sport Band|Sport Loop|Milanese Loop)(?: \((S\/M|M\/L)\))?$/);
  const ultra=item.sourceTitle.match(/^Ultra 3 49mm (Natural|Black) Ti (Blue|Black) Ocean Band$/);
  if(series){
   const [,generation,expectedSize,color,type,length]=series;
   const expectedFinish=`${color} ${['Natural','Slate','Gold'].includes(color)?'Titanium':'Aluminum'}`;
   if(model!==`Series ${generation}`||size!==expectedSize||finish!==expectedFinish||!band.endsWith(type))continue;
   if(length&&!band.startsWith(`${length} `))continue;
  }else if(ultra){
   const [,color,strap]=ultra;
   if(model!=='Ultra 3'||size!=='49'||finish!==`${color} Titanium`||band!==(strap==='Blue'?'Anchor Blue Ocean Band':'Black Ocean Band'))continue;
  }else continue;
  const html=readFileSync(page.file,'utf8');
  const products=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).filter(p=>p['@type']==='Product');
  const product=products.find(p=>typeof p.image==='string'&&title.startsWith(norm(p.name)));
  if(!product)continue;
  const u=new URL(product.image);
  if(u.hostname!=='store.storeimages.cdn-apple.com'||!u.pathname.includes('/is/refurb-')||Number(u.searchParams.get('wid'))<1000||Number(u.searchParams.get('hei'))<1000||!['jpeg','png-alpha'].includes(u.searchParams.get('fmt')))continue;
  const ext=u.searchParams.get('fmt')==='png-alpha'?'png':'jpg';
  const image=`/images/products/verified/${createHash('sha256').update(product.image).digest('hex').slice(0,24)}.${ext}`;
  selected.set(item.id,{ids:[item.id],catalogSourceTitle:item.sourceTitle,source:page.url,sourceTitle:title,image,url:product.image});
 }
}
const candidates=[...selected.values()];let cursor=0;
async function worker(){while(cursor<candidates.length){const c=candidates[cursor++];
 if(!existsSync(`public${c.image}`)){
  const r=await fetch(c.url,{signal:AbortSignal.timeout(25000)});if(!r.ok||new URL(r.url).hostname!=='store.storeimages.cdn-apple.com')throw Error(`Image HTTP ${r.status}`);
  const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||bytes.length>15000000||(c.image.endsWith('.png')?bytes[0]!==0x89:bytes[0]!==0xff))throw Error('Invalid original');writeFileSync(`public${c.image}`,bytes);
 }
 console.log(c.catalogSourceTitle,c.image);
}}
await Promise.all(Array.from({length:4},worker));
writeFileSync('.tmp-qa/apple-refurb/watch-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'exact watch configurations awaiting visual review');
