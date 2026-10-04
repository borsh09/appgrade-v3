import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Cache public manufacturer pages and their explicitly labelled original assets.
// This preview never modifies catalog assignments.
const pages=[
 'https://www.playstation.com/en-us/accessories/dualsense-wireless-controller/',
 'https://www.playstation.com/en-us/accessories/dualsense-edge-wireless-controller/',
 'https://www.playstation.com/en-us/ps5/ps5-pro/',
 'https://www.playstation.com/en-gb/accessories/dualsense-edge-wireless-controller/buy-now/product/midnight-black/',
 'https://direct.playstation.com/en-us/buy-consoles/playstation5-pro-console-2-tb',
 'https://www.playstation.com/en-gb/accessories/dualsense-wireless-controller/buy-now/product/nova-pink/',
 'https://www.playstation.com/en-gb/accessories/playstation-portal-remote-player/',
];
mkdirSync('.tmp-qa/playstation',{recursive:true});
if(process.argv.includes('--disc-two-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,rows=[];
 for(const [key,stem]of [['marvels-spider-man-2-ps5','ps5-msm2-box-front'],['the-last-of-us-part-ii-remastered-ps5','PS5-TLOU2-REMASTERED-HERO-1-US-VER']]){const h=readFileSync('.tmp-qa/playstation/disc-'+key+'.html','utf8'),base='https://media.direct.playstation.com/is/image/sierialto/'+stem;if(!h.includes(base))throw Error('Factory disc gallery missing');const props=await(await fetch(base+'?req=imageprops',{signal:AbortSignal.timeout(25000)})).text(),w=Number(props.match(/image.width=(\d+)/)?.[1]),hh=Number(props.match(/image.height=(\d+)/)?.[1]);writeFileSync('.tmp-qa/playstation/'+key+'-imageprops.txt',props);const url=base+'?scl=1&fmt=png',r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata();if(m.width!==w||m.height!==hh||Math.max(w,hh)<600)throw Error('Native dimension mismatch');const image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.png';writeFileSync('public'+image,b);rows.push({key,url,image,width:w,height:hh});}writeFileSync('.tmp-qa/playstation/disc-two-candidates.json',JSON.stringify(rows,null,2));console.log(rows);process.exit(0);
}
if(process.argv.includes('--disc-gallery-list')){
 for(const key of ['marvels-spider-man-2-ps5','the-last-of-us-part-ii-remastered-ps5']){const h=readFileSync('.tmp-qa/playstation/disc-'+key+'.html','utf8');console.log(key,[...h.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/g)].map(m=>({url:m[1].replaceAll('&amp;','&'),alt:m[2]})).filter(x=>x.url.includes('media.direct.playstation.com')).slice(0,8));}process.exit(0);
}
if(process.argv.includes('--disc-games-inspect')){
 const products=process.argv.includes('--more')?['astro-bot','astro-bot-game-ps5','gran-turismo-7-launch-edition-ps5','gran-turismo-7-standard-edition-ps5']:['astro-bot-ps5','marvels-spider-man-2-ps5','gran-turismo-7-ps5','the-last-of-us-part-ii-remastered-ps5'];
 const results=await Promise.allSettled(products.map(async key=>{const source='https://direct.playstation.com/en-us/buy-games/'+key,r=await fetch(source,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(key+' '+r.status);const h=await r.text(),title=h.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1];writeFileSync('.tmp-qa/playstation/disc-'+key+'.html',h);const images=[...new Set([...h.matchAll(/https:\/\/media\.direct\.playstation\.com\/is\/image\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))].filter(u=>/game.*(box|front)|pack|ps5.*box/i.test(u));console.log(key,title,r.url,images.slice(0,10));}));for(const r of results)if(r.status==='rejected')console.log(String(r.reason));process.exit(0);
}
if(process.argv.includes('--games-links')){
 for(const key of ['tlou1','astro','spider2','gt7']){const h=readFileSync('.tmp-qa/playstation/game-'+key+'.html','utf8');console.log(key,[...new Set([...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')))].filter(u=>/buy-games|direct|\/games\/ps5/.test(u)).slice(0,30));}process.exit(0);
}
if(process.argv.includes('--tlou1-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,h=readFileSync('.tmp-qa/playstation/game-tlou1.html','utf8');const base='https://media.direct.playstation.com/is/image/sierialto/ps5-tlou-part-1-game-box-front';if(!h.includes(base))throw Error('Own disc gallery missing');
 const props=await(await fetch(base+'?req=imageprops',{signal:AbortSignal.timeout(25000)})).text();writeFileSync('.tmp-qa/playstation/tlou1-imageprops.txt',props);const w=Number(props.match(/image.width=(\d+)/)?.[1]),hh=Number(props.match(/image.height=(\d+)/)?.[1]);
 const url=base+'?scl=1&fmt=png',r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata();if(m.width!==w||m.height!==hh)throw Error('Native dimension mismatch');const image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.png';writeFileSync('public'+image,b);writeFileSync('.tmp-qa/playstation/tlou1-candidate.json',JSON.stringify({url,image,width:w,height:hh}));console.log(image,w,hh);process.exit(0);
}
if(process.argv.includes('--games-inspect')){
 const pages={astro:'https://www.playstation.com/en-us/games/astro-bot/',tlou1:'https://direct.playstation.com/en-us/buy-games/the-last-of-us-part-i-ps5',spider2:'https://www.playstation.com/en-us/games/marvels-spider-man-2/',gt7:'https://www.playstation.com/en-us/games/gran-turismo-7/'};
 const results=await Promise.allSettled(Object.entries(pages).map(async([key,source])=>{const r=await fetch(source,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(key+' '+r.status);const h=await r.text();writeFileSync('.tmp-qa/playstation/game-'+key+'.html',h);const links=[...new Set([...h.matchAll(/https:\/\/direct\.playstation\.com\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))].filter(u=>/buy-games/.test(u));const images=[...new Set([...h.matchAll(/https:\/\/(?:gmedia|media\.direct)\.playstation\.com\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))].filter(u=>/box|pack|standard|ps5.*front|hero/i.test(u));console.log(key,JSON.stringify({links,images:images.slice(0,15)}));}));for(const r of results)if(r.status==='rejected')console.log(String(r.reason));process.exit(0);
}
if(process.argv.includes('--pink-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,rows=[],urls=[...new Set(JSON.parse(readFileSync('.tmp-qa/playstation/pink-urls.json','utf8')).map(u=>u.replace(/,$/,'')))].filter(u=>/16x9/.test(u));
 for(const url of urls){const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata(),image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.'+(m.format==='png'?'png':'jpg');writeFileSync('public'+image,b);rows.push({url,image,width:m.width,height:m.height});}writeFileSync('.tmp-qa/playstation/pink-candidates.json',JSON.stringify(rows,null,2));console.log(rows);process.exit(0);
}
if(process.argv.includes('--pink-inspect')){
 const h=readFileSync('.tmp-qa/playstation/page-5.html','utf8');for(const term of ['NovaPink','nova-pink','Nova Pink']){const pos=h.indexOf(term);console.log(term,h.slice(Math.max(0,pos-150),pos+550));}
 const urls=[...new Set([...h.matchAll(/(?:https[^\s"<>\\]+|\/_next\/image\/\?[^\s"<>\\]+)/g)].map(m=>{try{const u=new URL(m[0].replaceAll('&amp;','&'),'https://www.playstation.com');return u.searchParams.get('url')??u.href;}catch{return ''}}))].filter(u=>/gmedia\.playstation\.com/.test(u)&&/pink/i.test(u));writeFileSync('.tmp-qa/playstation/pink-urls.json',JSON.stringify(urls,null,2));console.log(urls);process.exit(0);
}
if(process.argv.includes('--direct-native-props')){
 const rows=JSON.parse(readFileSync('.tmp-qa/playstation/direct-accessory-candidates.json','utf8'));for(const a of rows){const base=a.url.split('?')[0],r=await fetch(base+'?req=imageprops',{signal:AbortSignal.timeout(25000)});console.log(a.key,base,await r.text());}process.exit(0);
}
if(process.argv.includes('--direct-accessories-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,rows=[];
 for(const key of ['station','drive']){const h=readFileSync('.tmp-qa/playstation/direct-'+key+'.html','utf8');const urls=[...new Set([...h.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(u=>key==='station'?u.includes('/psdglobal/dualsense-charging-station-ps5-accessory-front'):/\/sierialto\/Disc-Drive-PS5-(Hero-1|hero-2)$/.test(u)))];
 for(const base of urls){if(!h.includes(base))throw Error('Factory gallery asset missing');const props=await(await fetch(base+'?req=imageprops',{signal:AbortSignal.timeout(25000)})).text();if(!props.includes('image.width=900')||!props.includes('image.height=900'))throw Error('Native factory size changed');const url=base+'?scl=1&fmt=png';const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata();if(m.width!==900||m.height!==900)throw Error('Factory native scale mismatch');const image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.png';writeFileSync('public'+image,b);rows.push({key,url,image,width:m.width,height:m.height});}}
 writeFileSync('.tmp-qa/playstation/direct-accessory-candidates.json',JSON.stringify(rows,null,2));console.log(rows);process.exit(0);
}
if(process.argv.includes('--direct-accessories')){
 const sources={station:'https://direct.playstation.com/en-gb/buy-accessories/dualsense-charging-station',drive:'https://direct.playstation.com/en-us/buy-accessories/disc-drive-for-ps5-digital-edition-consoles'};
 const results=await Promise.allSettled(Object.entries(sources).map(async([key,source])=>{const r=await fetch(source,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const h=await r.text();writeFileSync('.tmp-qa/playstation/direct-'+key+'.html',h);console.log(key,[...h.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/g)].map(m=>({url:m[1].replaceAll('&amp;','&'),alt:m[2]})).filter(x=>x.url.includes('media.direct.playstation.com')&&(/Charging Station|Disc Drive/i.test(x.alt))));}));for(const r of results)if(r.status==='rejected')console.log(String(r.reason));process.exit(0);
}
if(process.argv.includes('--supplier-accessories-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,rows=[];
 const sources=JSON.parse(readFileSync('.tmp-qa/playstation/supplier-accessories.json','utf8')).filter(r=>r.status==='fulfilled').map(r=>r.value);
 for(const s of sources){const h=readFileSync(s.file,'utf8'),urls=[...new Set([...h.matchAll(/<a href="([^"]+)" data-fancybox="gallery"/g)].map(m=>new URL(m[1],s.url).href))];
 for(const url of urls){const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata(),image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.'+(m.format==='png'?'png':'jpg');writeFileSync('public'+image,b);rows.push({...s,url,image,width:m.width,height:m.height});}}
 writeFileSync('.tmp-qa/playstation/supplier-accessory-candidates.json',JSON.stringify(rows,null,2));console.log(rows.map(x=>({row:x.row,image:x.image,width:x.width,height:x.height})));process.exit(0);
}
if(process.argv.includes('--supplier-accessory-images')){
 for(const n of [642,646]){const h=readFileSync('.tmp-qa/playstation/supplier-'+n+'.html','utf8');console.log(n,[...new Set([...h.matchAll(/(?:src|href|data-src)="([^"]+\.(?:jpg|png|webp)[^"]*)"/gi)].map(m=>m[1]))].filter(u=>/upload/.test(u)).slice(0,40));}process.exit(0);
}
if(process.argv.includes('--supplier-accessories')){
 const inventory=JSON.parse(readFileSync('.tmp-qa/all-supplier-inventory.json','utf8'));
 const sources=inventory.filter(x=>/zaryadnaya_stantsiya_playstation|diskovod_dlya_pristavki_sony/.test(x.url));
 const results=await Promise.allSettled(sources.map(async s=>{const r=await fetch(s.url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const h=await r.text(),file='.tmp-qa/playstation/supplier-'+s.row+'.html';writeFileSync(file,h);console.log(s.title,h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1],file);return {...s,file};}));writeFileSync('.tmp-qa/playstation/supplier-accessories.json',JSON.stringify(results,null,2));for(const x of results)if(x.status==='rejected')console.log(String(x.reason));process.exit(0);
}
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const assets=[];
if(process.argv.includes('--direct-pro-download')){
 const source=pages[4];const html=readFileSync('.tmp-qa/playstation/page-4.html','utf8');
 const candidates=[];
 for(const m of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/g)){
  const url=decode(m[1]);const alt=decode(m[2]);
  if(!url.startsWith('https://media.direct.playstation.com/is/image/sierialto/')||!alt.startsWith('PlayStation®5 Pro Console - 2 TB')||/with-disc-drive|colourful-background/.test(url)||candidates.some(a=>a.url===url))continue;
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!=='media.direct.playstation.com')throw Error('Invalid direct product image');
  const bytes=Buffer.from(await response.arrayBuffer());if(!(bytes[0]===0xff||bytes[0]===0x89)||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${bytes[0]===0x89?'png':'jpg'}`;
  writeFileSync(`public${image}`,bytes);candidates.push({source,alt,url,image});
 }
 writeFileSync('.tmp-qa/playstation/direct-pro-candidates.json',JSON.stringify(candidates,null,2)+'\n');
 console.log(candidates.length,'official retail Pro images awaiting model revision and visual review');process.exit(0);
}
for(const [index,source] of pages.entries()){
 const file=`.tmp-qa/playstation/page-${index}.html`;
 if(!existsSync(file)){
  const response=await fetch(source,{signal:AbortSignal.timeout(35000)});
  if(!response.ok||!['www.playstation.com','direct.playstation.com'].includes(new URL(response.url).hostname))throw Error(`Page HTTP ${response.status}`);
  writeFileSync(file,await response.text());
 }
 const html=readFileSync(file,'utf8');
 // Selected product pages publish native images through Next's image URLs.
 const selectedPrefix=index===3?'DualsenseEdge-MidnightBlack-':index===5?'dualsense-nova-pink-':undefined;
 if(selectedPrefix){
  for(const img of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)){
   const encoded=decode(img[1]);
   const parsed=new URL(encoded,source);
   const url=parsed.searchParams.get('url')??encoded;
   if(!url.startsWith(`https://gmedia.playstation.com/is/image/SIEPDC/${selectedPrefix}`)||/3D/.test(url)||assets.some(a=>a.url===url))continue;
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.jpg`;
   assets.push({source,alt:index===3?'DualSense Edge Midnight Black selected product gallery':'DualSense Nova Pink selected product gallery',url,image});
  }
 }
 for(const match of html.matchAll(/<picture\b[\s\S]*?<\/picture>/gi)){
  const attrs=Object.fromEntries([...match[0].matchAll(/\b(alt|data-alt)\s*=\s*"([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
  const alt=attrs['data-alt']??attrs.alt??'';
  if(!/DualSense|PS5 Pro|PlayStation 5 Pro|charging station|Portal/i.test(alt))continue;
  const url=decode(match[0].match(/<source\b[^>]*srcset="([^"]+)"/)?.[1]??'');
  if(!url||!url.startsWith('https://gmedia.playstation.com/'))continue;
  if(assets.some(a=>a.url===url))continue;
  const ext=new URL(url).pathname.toLowerCase().endsWith('.png')?'png':'jpg';
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
  assets.push({source,alt,url,image});
 }
}
writeFileSync('.tmp-qa/playstation/assets.json',JSON.stringify(assets,null,2)+'\n');
for(const asset of assets)console.log(asset.alt,asset.url);
console.log(assets.length,'labelled manufacturer assets; no assignments changed');
if(process.argv.includes('--download')){
 const wanted=/Techno Red|Rhythm Blue|Teal DualSense|Chroma Pearl|Chroma Indigo|Sterling Silver|Cobalt Blue|Galactic Purple|Starlight Blue|Cosmic Red|Midnight Black|Classic White|Gray Camo|007 First Light|Genshin Impact|DualSense Edge Controller|DualSense charging station/i;
 const selected=assets.filter(a=>(wanted.test(a.alt)||/DualSense Edge Midnight Black|DualSense Nova Pink/.test(a.alt)||a.url.includes('Genshin-Impact-LE-DualSense-image-block')||a.url.includes('/ps-portal-remote-player-image-block-01-en-22aug23?'))&&!/keyart/i.test(a.url));
 let cursor=0;
 async function worker(){while(cursor<selected.length){const a=selected[cursor++];
  if(!existsSync(`public${a.image}`)&&existsSync(`public${a.image.replace(/\.jpg$/,'.png')}`))a.image=a.image.replace(/\.jpg$/,'.png');
  if(!existsSync(`public${a.image}`)){
   const response=await fetch(a.url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok||new URL(response.url).hostname!=='gmedia.playstation.com')throw Error(`Image HTTP ${response.status}`);
   const bytes=Buffer.from(await response.arrayBuffer());
   if(bytes.length<1000||bytes.length>15000000||!(bytes[0]===0xff||bytes[0]===0x89))throw Error('Invalid original image');
   a.image=a.image.replace(/\.(png|jpg)$/,bytes[0]===0x89?'.png':'.jpg');
   writeFileSync(`public${a.image}`,bytes);
  }
 }}
 await Promise.all(Array.from({length:4},worker));
 writeFileSync('.tmp-qa/playstation/photo-candidates.json',JSON.stringify(selected,null,2)+'\n');
 console.log(selected.length,'originals awaiting visual review');
}
