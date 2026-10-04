import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pages={duo:'https://alice.yandex.ru/support/ru/station/meet/characteristics-duo-max',store:'https://alice.yandex.ru/store/product/station-duo-max'};
mkdirSync('.tmp-qa/yandex',{recursive:true});
if(process.argv.includes('--drops-press')){
 const publicKey='https://disk.yandex.ru/d/Xn8xoi5VGGcn6w',url=new URL('https://cloud-api.yandex.net/v1/disk/public/resources');url.searchParams.set('public_key',publicKey);url.searchParams.set('limit','100');if(process.argv[3])url.searchParams.set('path',process.argv[3]);
 const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Public press metadata '+r.status);const d=await r.json();writeFileSync('.tmp-qa/yandex/drops-press-list.json',JSON.stringify(d,null,2));console.log(d._embedded?.items?.map(i=>({name:i.name,type:i.type,path:i.path,size:i.size})));process.exit(0);
}
if(process.argv.includes('--drops-press-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,list=JSON.parse(readFileSync('.tmp-qa/yandex/drops-press-list.json','utf8'))._embedded.items.filter(i=>i.type==='file'&&i.mime_type==='image/png'),rows=[];
 for(let start=0;start<list.length;start+=2)await Promise.all(list.slice(start,start+2).map(async i=>{if(!i.file)throw Error('Own public original missing');const r=await fetch(i.file,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Press original '+r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata();if(m.format!=='png')throw Error('Not factory PNG');const image='/images/products/verified/'+createHash('sha256').update('https://disk.yandex.ru/d/Xn8xoi5VGGcn6w'+i.path).digest('hex').slice(0,24)+'.png';writeFileSync('public'+image,b);rows.push({name:i.name,path:i.path,url:i.file,image,width:m.width,height:m.height});console.log(i.name,m.width,m.height);}));
 writeFileSync('.tmp-qa/yandex/drops-press-candidates.json',JSON.stringify(rows,null,2));const tiles=await Promise.all(rows.map(async(a,i)=>({input:await sharp('public'+a.image).resize(300,280,{fit:'contain',background:'white'}).flatten({background:'white'}).png().toBuffer(),left:(i%4)*300,top:Math.floor(i/4)*300})));
 await sharp({create:{width:1200,height:Math.ceil(rows.length/4)*300,channels:3,background:'white'}}).composite(tiles).jpeg().toFile('.tmp-qa/yandex/drops-press-review.jpg');process.exit(0);
}
if(process.argv.includes('--drops-download')){
 const candidates=[];
 for(const key of ['drops','dropsspecs']){
  const html=readFileSync(`.tmp-qa/yandex/${key}.html`,'utf8');
  for(const m of html.matchAll(/<img\b[^>]*>/g)){
   const tag=m[0],url=tag.match(/src="([^"]+)"/)?.[1],alt=tag.match(/alt="([^"]+)"/)?.[1]??'';
   if(!url||!(/^(?:Наушники )?Яндекс Дропс$/.test(alt)||/Яндекс.*Дропс — (?:черный|фиолетовый|белый)$/.test(alt)))continue;
   const source=key==='drops'?'https://alice.yandex.ru/wearables/drops':'https://alice.yandex.ru/support/ru/drops/characteristics';
   const host=new URL(url).hostname;if(!['avatars.mds.yandex.net','cdn-viewer.diplodoc.com'].includes(host))throw Error('Unexpected Drops image host');
   const response=await fetch(url.replaceAll('&amp;','&'),{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!==host)throw Error('Invalid Drops original');
   const bytes=Buffer.from(await response.arrayBuffer()),ext=bytes[0]===0x89?'png':bytes[0]===0xff?'jpg':bytes.toString('ascii',0,4)==='RIFF'?'webp':undefined;
   if(!ext||bytes.length<1000||bytes.length>15000000)throw Error('Invalid Drops image');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;writeFileSync('public'+image,bytes);
   candidates.push({source,sourceTitle:'Яндекс Дропс',model:'Яндекс Дропс',color:alt.includes(' — ')?alt.split(' — ')[1]:'Review required',angle:'Main',alt,image,url});
  }
 }
 writeFileSync('.tmp-qa/yandex/drops-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'factory Drops originals awaiting visual review');process.exit(0);
}
if(process.argv.includes('--drops-inspect')){
 for(const [key,url] of Object.entries({drops:'https://alice.yandex.ru/wearables/drops',dropsspecs:'https://alice.yandex.ru/support/ru/drops/characteristics'})){
  const file=`.tmp-qa/yandex/${key}.html`;
  if(!existsSync(file)){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='alice.yandex.ru')throw Error('Invalid Drops manufacturer source');writeFileSync(file,await response.text());}
  const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
  console.log([...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).filter(tag=>/дропс|drops|черн|белы|фиолет|purple|white|black/i.test(tag)).slice(0,35).join('\n'));
 }
 process.exit(0);
}
if(process.argv.includes('--station-download')){
 const inventory=JSON.parse(readFileSync('.tmp-qa/yandex/store-inventory.json','utf8'));
 const models={'station-3':'Яндекс Станция 3','station-mini-3':'Яндекс Станция Мини 3','station-mini-3-pro':'Яндекс Станция Мини 3 Про','station-street':'Яндекс Станция Стрит','station-max':'Яндекс Станция Макс','station-midi':'Яндекс Станция Миди'};
 const candidates=[];
 for(const record of inventory){const slug=new URL(record.url).pathname.split('/').at(-1),model=models[slug];if(!model)continue;
  for(const tag of record.photos){
   const url=tag.match(/src="([^"]+)"/)?.[1],color=tag.match(/alt="([^"]+)"/)?.[1];
   if(!url||!color||!tag.includes('product-variants__image')||new URL(url).hostname!=='avatars.mds.yandex.net')throw Error('Unrecognized color variant');
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='avatars.mds.yandex.net')throw Error('Invalid factory photo');
   const bytes=Buffer.from(await response.arrayBuffer());const ext=bytes[0]===0xff?'jpg':bytes[0]===0x89?'png':bytes.toString('ascii',0,4)==='RIFF'?'webp':undefined;
   if(!ext||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
   writeFileSync('public'+image,bytes);candidates.push({source:record.url,sourceTitle:record.title,model,color,angle:'Main',image,url});
  }
 }
 writeFileSync('.tmp-qa/yandex/station-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'factory station color originals awaiting visual review');process.exit(0);
}
if(process.argv.includes('--store-inventory')){
 const root='https://alice.yandex.ru/store';const file='.tmp-qa/yandex/store-root.html';
 if(!existsSync(file)){const response=await fetch(root,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='alice.yandex.ru')throw Error('Invalid official store');writeFileSync(file,await response.text());}
 const html=readFileSync(file,'utf8');
 const urls=[...new Set([...html.matchAll(/href="([^"<>]+)"/g)].map(m=>new URL(m[1].replaceAll('&amp;','&'),root).href))].filter(u=>u.startsWith(root+'/product/'));
 const records=[];
 for(const url of urls){
  const path=`.tmp-qa/yandex/product-${createHash('sha256').update(url).digest('hex').slice(0,16)}.html`;
  if(!existsSync(path)){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='alice.yandex.ru')continue;writeFileSync(path,await response.text());}
  const body=readFileSync(path,'utf8');
  records.push({url,file:path,title:body.match(/<title[^>]*>([^<]+)/)?.[1],photos:[...body.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).filter(tag=>/avatars\.mds\.yandex\.net\/get-iot\//.test(tag))});
 }
 writeFileSync('.tmp-qa/yandex/store-inventory.json',JSON.stringify(records,null,2)+'\n');console.log(records.map(r=>`${r.title} ${r.photos.length} ${r.url}`).join('\n'));process.exit(0);
}
for(const [key,url] of Object.entries(pages)){
 const file=`.tmp-qa/yandex/${key}.html`;
 if(!existsSync(file)){
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!=='alice.yandex.ru')throw Error(`Yandex source HTTP ${response.status}`);
  writeFileSync(file,await response.text());
 }
 const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 console.log([...html.matchAll(/<img\b[^>]+>/g)].filter(m=>/дуо|duo|зелен|зелён|бежев|Станция/i.test(m[0])).slice(0,15).map(m=>m[0]).join('\n'));
 const links=[...new Set([...html.matchAll(/href="([^"<>]+)"/g)].map(m=>new URL(m[1].replaceAll('&amp;','&'),url).href))];
 console.log(links.filter(u=>/\/store\/product\/|\/station.*\.(png|jpg|webp)/.test(u)).slice(0,40).join('\n'));
}
if(process.argv.includes('--duo-download')){
 const html=readFileSync('.tmp-qa/yandex/store.html','utf8');const candidates=[];
 for(const m of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/g)){
  const url=m[1];const color=m[2];if(!url.startsWith('https://avatars.mds.yandex.net/get-iot/station-duo-max-')||!['Бежевый','Зелёный'].includes(color))continue;
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!=='avatars.mds.yandex.net')throw Error('Invalid factory image host');
  const bytes=Buffer.from(await response.arrayBuffer());
  const ext=bytes[0]===0xff?'jpg':bytes[0]===0x89?'png':bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'webp':undefined;
  if(!ext||bytes.length<1000||bytes.length>15000000)throw Error('Invalid factory original');
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
  writeFileSync(`public${image}`,bytes);candidates.push({source:pages.store,sourceTitle:'Яндекс Станция Дуо Макс; официальный выбор цвета',color,model:'Яндекс Станция Дуо Макс',angle:'Main',image,url});
 }
 if(candidates.length!==2)throw Error('Expected both factory colour images');
 writeFileSync('.tmp-qa/yandex/duo-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log('Two factory Duo Max colors awaiting review');
}
if(process.argv.includes('--inventory')){
 const raw=JSON.parse(readFileSync('data/new-price-catalog.json','utf8'));
 console.log(raw.filter(p=>p.sourceCategory==='Яндекс Станция').map(p=>`${p.id} ${p.sourceTitle??p.model}`).join('\n'));
}
