import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pages={airpodspro3:'https://www.apple.com/shop/buy-airpods/airpods-pro-3',ipad:'https://www.apple.com/shop/buy-ipad/ipad',airpods5:'https://www.apple.com/shop/buy-airpods/airpods-5',ipadair:'https://www.apple.com/shop/buy-ipad/ipad-air',airpods5base:'https://www.apple.com/shop/buy-airpods/airpods-5/without-wireless-charging-case',airpodsmax2:'https://www.apple.com/shop/browse/home/shop_airpods/family/airpods_max_2',ipadpro:'https://www.apple.com/shop/buy-ipad/ipad-pro',refurbipad:'https://www.apple.com/shop/refurbished/ipad',refurbipaduk:'https://www.apple.com/uk/shop/refurbished/ipad'};
mkdirSync('.tmp-qa/apple-accessories',{recursive:true});
if(process.argv.includes('--mac2021-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,rows=[];
 const urls=JSON.parse(readFileSync('.tmp-qa/apple-accessories/mac2021-press-urls.json','utf8')).filter(u=>/14-inch-(Logic-Pro|Redshift)_10182021_big_carousel\.jpg\.large_2x\.jpg$/.test(u));
 if(urls.length!==2)throw Error('Exact 14-inch press originals missing');
 for(const url of urls){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata(),image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.jpg';writeFileSync('public'+image,b);rows.push({url,image,width:m.width,height:m.height});}
 writeFileSync('.tmp-qa/apple-accessories/mac2021-candidates.json',JSON.stringify(rows,null,2));console.log(rows);process.exit(0);
}
if(process.argv.includes('--mac2021-press')){
 const source='https://www.apple.com/newsroom/2021/10/apple-unveils-game-changing-macbook-pro/';const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status);const h=await r.text();writeFileSync('.tmp-qa/apple-accessories/mac2021-press.html',h);
 const urls=[...new Set([...h.matchAll(/https:\/\/www\.apple\.com\/newsroom\/images\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];writeFileSync('.tmp-qa/apple-accessories/mac2021-press-urls.json',JSON.stringify(urls,null,2));console.log(urls.filter(u=>!/\/thumbs\//.test(u)));process.exit(0);
}
if(process.argv.includes('--adapter20-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,rows=[];
 const urls=JSON.parse(readFileSync('.tmp-qa/apple-accessories/adapter20-urls.json','utf8')).filter(u=>new URL(u).searchParams.get('wid')==='2000'&&/^MD3J4(?:_AV[12])?$/.test(new URL(u).pathname.split('/').at(-1)));
 if(urls.length!==3)throw Error('Factory adapter gallery changed');
 for(const url of urls){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata(),image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.jpg';writeFileSync('public'+image,b);rows.push({url,image,width:m.width,height:m.height});}
 writeFileSync('.tmp-qa/apple-accessories/adapter20-candidates.json',JSON.stringify(rows,null,2));console.log(rows);process.exit(0);
}
if(process.argv.includes('--adapter20-inspect')){
 const source='https://www.apple.com/de/shop/product/md3j4zm/a/20w-usb%E2%80%91c-power-adapter';
 const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status);const h=await r.text();
 writeFileSync('.tmp-qa/apple-accessories/adapter20.html',h);
 const urls=[...new Set([...h.matchAll(/https:\/\/store\.storeimages\.cdn-apple\.com\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];
 writeFileSync('.tmp-qa/apple-accessories/adapter20-urls.json',JSON.stringify(urls,null,2));console.log(r.url,h.match(/<title[^>]*>([^<]+)/)?.[1],urls.filter(u=>new URL(u).searchParams.get('wid')==='2000'));process.exit(0);
}
if(process.argv.includes('--airtag2026-download')){
 const sharp=(await import('../node_modules/next/node_modules/sharp/dist/index.mjs')).default,rows=[];
 for(const [key,count]of [['airtag2026one',1],['airtag2026four',4]]){
  const urls=JSON.parse(readFileSync('.tmp-qa/apple-accessories/'+key+'-urls.json','utf8'));const url=urls.find(u=>u.includes('airtag-'+count+'pack-select-202601')&&new URL(u).searchParams.get('wid')==='890');if(!url)throw Error('Own AirTag count gallery missing');
  const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata(),image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.jpg';writeFileSync('public'+image,b);rows.push({model:'AirTag '+count+' Pack (2026)',color:'',configuration:'',source:'https://www.apple.com/shop/buy-airtag/airtag/'+count+'-pack',sourceTitle:'Apple AirTag '+count+' pack; next generation 2026, own manufacturer count-specific original',url,image,width:m.width,height:m.height});
 }writeFileSync('.tmp-qa/apple-accessories/airtag2026-candidates.json',JSON.stringify(rows,null,2));console.log(rows);process.exit(0);
}
if(process.argv.includes('--remaining-small-inspect')){
 const sources={adapter20:'https://www.apple.com/de/shop/product/md3j4zm/a/20w-usb%E2%80%91c-power-adapter',airtag2026one:'https://www.apple.com/shop/buy-airtag/airtag/1-pack',airtag2026four:'https://www.apple.com/shop/buy-airtag/airtag/4-pack',airpods4anc:'https://www.apple.com/shop/buy-airpods/airpods-4/with-active-noise-cancellation'};
 const results=await Promise.allSettled(Object.entries(sources).map(async([key,source])=>{const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(key+' '+r.status);const h=await r.text();writeFileSync('.tmp-qa/apple-accessories/'+key+'.html',h);
 const urls=[...new Set([...h.matchAll(/https:\/\/store\.storeimages\.cdn-apple\.com\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];writeFileSync('.tmp-qa/apple-accessories/'+key+'-urls.json',JSON.stringify(urls,null,2));console.log(key,h.match(/<title[^>]*>([^<]+)/)?.[1],urls.filter(u=>/2000|1400|1500/.test(u)).slice(0,15));}));for(const r of results)if(r.status==='rejected')console.error(r.reason.message);process.exit(0);
}
if(process.argv.includes('--refresh-ipad')){
 for(const key of ['refurbipad','refurbipaduk']){const r=await fetch(pages[key],{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='www.apple.com')throw Error('Factory iPad list unavailable');writeFileSync(`.tmp-qa/apple-accessories/${key}.html`,await r.text());console.log(key,'refreshed');}process.exit(0);
}
if(process.argv.includes('--small-accessories')){
 const sources={earpods:'https://www.apple.com/shop/product/myqy3am/a/earpods-usb-c',cable60:'https://www.apple.com/shop/product/mw493am/a/60w-usb-c-charge-cable-1-m',lightning:'https://www.apple.com/shop/product/muq93am/a/usb-c-to-lightning-cable-1-m',magsafe2:'https://www.apple.com/shop/product/mgdm4ll/a/magsafe-charger-2-m',magsafe1:'https://www.apple.com/shop/product/mgd74ll/a/magsafe-charger-1-m',mouseblack:'https://www.apple.com/shop/product/mxk63am/a/magic-mouse-usb%E2%80%91c-black-multi-touch-surface'};
 // Published gallery asset names differ from the current retail part numbers.
 const parts={earpods:'MTJY3',cable60:'MQKJ3',lightning:'MM0A3',magsafe2:'MGDM4',magsafe1:'MGD74',mouseblack:'MXK63'};
 sources.mousewhite='https://www.apple.com/shop/product/mxk53am/a/magic-mouse-usb%E2%80%91c-white-multi-touch-surface';
 parts.mousewhite='MXK53';
 const candidates=[];
 for(const [key,source] of Object.entries(sources)){
  const file=`.tmp-qa/apple-accessories/${key}.html`;
  if(!existsSync(file)){const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='www.apple.com')throw Error('Invalid Apple accessory page');writeFileSync(file,await response.text());}
  const html=readFileSync(file,'utf8'),title=html.match(/<title[^>]*>([^<]+)/)?.[1];
  const urls=[...new Set([...html.matchAll(/https:\/\/store\.storeimages\.cdn-apple\.com\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];
  const selected=urls.filter(url=>new URL(url).searchParams.get('wid')==='2000'&&new RegExp(`^${parts[key]}(?:_AV[0-9]+)?$`).test(new URL(url).pathname.split('/').at(-1)));
  console.log(key,title,selected.length);
  for(const url of selected){
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw Error('Invalid Apple accessory original');
   const bytes=Buffer.from(await response.arrayBuffer()),ext=bytes[0]===0x89?'png':bytes[0]===0xff?'jpg':undefined;if(!ext||bytes.length<1000||bytes.length>15000000)throw Error('Invalid Apple accessory image');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;writeFileSync('public'+image,bytes);
   candidates.push({key,source,sourceTitle:title,url,image,angle:new URL(url).pathname.split('/').at(-1)});
  }
 }
 writeFileSync('.tmp-qa/apple-accessories/small-accessory-candidates.json',JSON.stringify(candidates,null,2)+'\n');
 process.exit(0);
}
if(process.argv.includes('--beats-inspect')||process.argv.includes('--beats-download')){
 const sources={powerbeats:'https://www.apple.com/shop/product/mx753ll/a/powerbeats-pro-2-high-performance-earbuds-hyper-purple',solo:'https://www.apple.com/shop/product/muw33ll/a/beats-solo-4-on-ear-wireless-headphones-cloud-pink',powerbeatssand:'https://www.apple.com/shop/product/MX733LL/A',powerbeatsorange:'https://www.apple.com/shop/product/MX743LL/A'};
 const expected={powerbeats:{part:'MX753',model:'Beats Powerbeats Pro 2',color:'Purple',finish:'Hyper Purple'},solo:{part:'MUW33',model:'Beats Solo 4',color:'Pink',finish:'Cloud Pink'},powerbeatssand:{part:'MX733',model:'Beats Powerbeats Pro 2',color:'Sand',finish:'Quick Sand'},powerbeatsorange:{part:'MX743',model:'Beats Powerbeats Pro 2',color:'Orange',finish:'Electric Orange'}};
 const candidates=[];
 for(const [key,source] of Object.entries(sources)){
  const file=`.tmp-qa/apple-accessories/${key}.html`;
  if(!existsSync(file)){const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='www.apple.com')throw Error('Invalid Beats factory page');writeFileSync(file,await response.text());}
  const html=readFileSync(file,'utf8');const urls=[...new Set([...html.matchAll(/https:\/\/store\.storeimages\.cdn-apple\.com\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];
  writeFileSync(`.tmp-qa/apple-accessories/${key}-urls.json`,JSON.stringify(urls,null,2)+'\n');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
  if(process.argv.includes('--beats-download')){
   const e=expected[key],title=html.match(/<title[^>]*>([^<]+)/)?.[1];
   if(!title?.includes(e.finish)||!title.includes(e.model.replace(/^Beats /,'')))throw Error('Beats model or finish changed');
   const selected=urls.filter(url=>new URL(url).searchParams.get('wid')==='2000'&&new URL(url).pathname.split('/').at(-1).match(new RegExp(`^${e.part}(?:_AV[1-6])?$`)));
   if(selected.length!==7)throw Error('Expected seven published studio/gallery originals');
   for(const url of selected){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw Error('Invalid factory image');
    const bytes=Buffer.from(await response.arrayBuffer()),ext=bytes[0]===0x89?'png':bytes[0]===0xff?'jpg':undefined;if(!ext||bytes.length<1000||bytes.length>15000000)throw Error('Invalid Beats original');
    const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;writeFileSync('public'+image,bytes);
    candidates.push({source,sourceTitle:title,model:e.model,color:e.color,finish:e.finish,angle:new URL(url).pathname.split('/').at(-1)===e.part?'Main':'Detail '+url.match(/_AV(\d)/)[1],image,url});
   }
   continue;
  }
  console.log(urls.filter(u=>/MX7[345]3|MUW33/i.test(u)).map(u=>new URL(u).pathname.split('/').at(-1)+' '+new URL(u).searchParams.get('wid')+'x'+new URL(u).searchParams.get('hei')).join('\n'));
  console.log([...new Set([...html.matchAll(/(?:https:\/\/www\.apple\.com)?\/shop\/product\/[^"<>\s\\]+/g)].map(m=>m[0]))].filter(u=>/powerbeats|solo-4/.test(u)).slice(0,12).join('\n'));
 }
 if(process.argv.includes('--beats-download')){writeFileSync('.tmp-qa/apple-accessories/beats-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'exact factory Beats originals awaiting visual review');}
 process.exit(0);
}
for(const [key,url] of Object.entries(pages)){
 const file=`.tmp-qa/apple-accessories/${key}.html`;
 if(!existsSync(file)){
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!=='www.apple.com')throw Error(`Apple page HTTP ${response.status}`);
  writeFileSync(file,await response.text());
 }
 const html=readFileSync(file,'utf8');
 const urls=[...new Set([...html.matchAll(/https:\/\/store\.storeimages\.cdn-apple\.com\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];
 writeFileSync(`.tmp-qa/apple-accessories/${key}-urls.json`,JSON.stringify(urls,null,2)+'\n');
 console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1],urls.length);
 if(process.argv.includes('--ipad-inspect')&&key==='ipadair')console.log(urls.filter(s=>/ipad-air-select-(11|13)in-/.test(s)).map(s=>{const u=new URL(s);return `${u.pathname.split('/').at(-1)} ${u.searchParams.get('wid')}x${u.searchParams.get('hei')} ${u.searchParams.get('fmt')}`;}).join('\n'));
 if(process.argv.includes('--ipad-inspect')&&key==='ipadpro')console.log([...new Set(urls.filter(s=>/ipad-pro.*select/.test(s)).map(s=>new URL(s).pathname.split('/').at(-1)))].join('\n'));
}
const raw=JSON.parse(readFileSync('data/new-price-catalog.json','utf8'));
if(process.argv.includes('--airpods-pro-download')){
 const urls=JSON.parse(readFileSync('.tmp-qa/apple-accessories/airpodspro3-urls.json','utf8'));
 const title=readFileSync('.tmp-qa/apple-accessories/airpodspro3.html','utf8').match(/<title[^>]*>([^<]+)/)?.[1];
 if(title!=='Buy AirPods Pro 3 - Apple')throw Error('AirPods Pro model changed');
 const main=urls.find(u=>u.includes('/airpods-pro-3-hero-select-202509?')&&new URL(u).searchParams.get('wid')==='976');
 if(!main)throw Error('Factory main photo absent');
 const selected=[main,...urls.filter(u=>/\/airpods-pro-3-gallery-[1-5]-202509\?/.test(u))];const candidates=[];
 for(const url of selected){
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.jpg`;
  if(!existsSync(`public${image}`)){
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw Error('Invalid factory original');
   const bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==0xff||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');writeFileSync(`public${image}`,bytes);
  }
  candidates.push({source:pages.airpodspro3,sourceTitle:title,model:'AirPods Pro 3',color:'',angle:url===main?'Main':`Detail ${url.match(/gallery-(\d)/)[1]}`,url,image});
 }
 writeFileSync('.tmp-qa/apple-accessories/airpods-pro-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'Pro 3 originals awaiting visual review');
}
if(process.argv.includes('--ipad-a16-download')){
 const html=readFileSync('.tmp-qa/apple-accessories/ipad.html','utf8');
 if(!html.includes('A16 chip')||!html.includes('Buy iPad'))throw Error('iPad A16 model not confirmed');
 const candidates=[];
 for(const url of JSON.parse(readFileSync('.tmp-qa/apple-accessories/ipad-urls.json','utf8'))){
  const m=url.match(/\/ipad-2022-hero-(blue|pink|silver|yellow)-(wifi|cell)-select\?/);if(!m)continue;
  const u=new URL(url);if(Number(u.searchParams.get('wid'))<900||u.searchParams.get('fmt')!=='png-alpha')continue;
  candidates.push({source:pages.ipad,sourceTitle:'Buy iPad; A16 chip',model:'iPad 11 A16',color:m[1][0].toUpperCase()+m[1].slice(1),connectivity:m[2]==='wifi'?'Wi-Fi':'Cellular',angle:'Main',url,image:`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`});
 }
 if(candidates.length!==8)throw Error(`Expected eight explicit connectivity and color images, got ${candidates.length}`);
 for(const c of candidates){if(existsSync(`public${c.image}`))continue;
  const response=await fetch(c.url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw Error('Invalid iPad photo source');
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');writeFileSync(`public${c.image}`,bytes);
 }
 writeFileSync('.tmp-qa/apple-accessories/ipad-a16-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');
 console.log(candidates.length,'iPad A16 originals awaiting visual review');
}
if(process.argv.includes('--ipad-a16-inspect')){
 console.log([...new Set(JSON.parse(readFileSync('.tmp-qa/apple-accessories/ipad-urls.json','utf8')).filter(u=>/\/ipad/.test(u)&&!/gallery|engraving|pencil|keyboard|trade-in|connectivity|accessor/.test(u)).map(u=>new URL(u).pathname.split('/').at(-1)))].join('\n'));
 console.log(raw.filter(p=>p.sourceCategory==='iPad'&&p.sourceTitle.startsWith('iPad 11 ')).map(p=>`${p.id} ${p.sourceTitle}`).join('\n'));
}
if(process.argv.includes('--refurb-ipad-pages')){
 const observed=new Set();
 for(const key of ['refurbipad','refurbipaduk']){
  const html=readFileSync(`.tmp-qa/apple-accessories/${key}.html`,'utf8');
  for(const match of html.matchAll(/href="([^"]*\/shop\/product\/[^"?]*ipad[^"?]*)/g)){
   const url=new URL(match[1].replaceAll('&amp;','&'),pages[key]).href;
   if(!/(?:m[234]|mini)/i.test(url))continue;
   observed.add(url);
  }
 }
 const jobs=[...observed];let cursor=0;const records=[];
 async function worker(){while(cursor<jobs.length){const url=jobs[cursor++];
  const file=`.tmp-qa/apple-accessories/refurb-${createHash('sha256').update(url).digest('hex').slice(0,20)}.html`;
  try{
   if(!existsSync(file)){
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
    if(!response.ok||new URL(response.url).hostname!=='www.apple.com')throw Error(`Page HTTP ${response.status}`);
    writeFileSync(file,await response.text());
   }
   const html=readFileSync(file,'utf8');const title=html.match(/<title[^>]*>([^<]+)/)?.[1];
   records.push({url,file,title});
  }catch(e){console.log('Unavailable source',url,String(e));}
 }}
 await Promise.all(Array.from({length:4},worker));
 writeFileSync('.tmp-qa/apple-accessories/refurb-ipad-pages.json',JSON.stringify(records,null,2)+'\n');console.log(records.length,'observed factory iPad product pages cached');
}
if(process.argv.includes('--inventory'))console.log(raw.filter(p=>p.sourceCategory==='AirPods'||p.sourceCategory==='iPad').map(p=>`${p.id} ${p.sourceTitle}`).join('\n'));
if(process.argv.includes('--ipad-pro-download')){
 const html=readFileSync('.tmp-qa/apple-accessories/ipadpro.html','utf8');
 if(!html.includes('M5 chip'))throw Error('Current iPad Pro generation not confirmed');
 const candidates=[];
 for(const url of JSON.parse(readFileSync('.tmp-qa/apple-accessories/ipadpro-urls.json','utf8'))){
  const match=url.match(/\/ipad-pro-(11|13)-select-(wifi|wificell)-(spaceblack|silver)-202405\?/);if(!match)continue;
  const [,size,connection,finish]=match;
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.jpg`;
  candidates.push({source:pages.ipadpro,sourceTitle:'Shop iPad Pro; M5 chip',model:`iPad Pro ${size} M5`,color:finish==='spaceblack'?'Space Black':'Silver',connectivity:connection==='wifi'?'Wi-Fi':'Cellular',angle:'Main',image,url});
 }
 const groups=new Map();
 for(const page of JSON.parse(readFileSync('.tmp-qa/apple-accessories/refurb-ipad-pages.json','utf8'))){
  const title=(page.title??'').replaceAll('Grey','Gray');
  const mini=title.match(/^Refurbished iPad Mini \(A17 Pro\) Wi-Fi \d+(?:GB|TB) - (Blue|Purple|Starlight|Space Gray) - Apple$/);
  const air=title.match(/^Refurbished (11|13)-inch iPad Air \((M[23])\) Wi-Fi \d+(?:GB|TB) - (Blue|Purple|Starlight|Space Gray) - Apple(?: \(UK\))?$/);
  if(!mini&&!air)continue;
  const model=mini?'iPad Mini 7':`iPad Air ${air[1]} ${air[2]}`;
  const color=mini?mini[1]:air[3];
  if(groups.has(`${model}|${color}`))continue;
  const html=readFileSync(page.file,'utf8');
  for(const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
   const product=JSON.parse(match[1]);
   if(product['@type']!=='Product'||typeof product.image!=='string'||!title.startsWith(product.name.replaceAll('Grey','Gray')))continue;
   const url=product.image;const u=new URL(url);
   if(u.hostname!=='store.storeimages.cdn-apple.com'||Number(u.searchParams.get('wid'))<1000||!['jpeg','png-alpha'].includes(u.searchParams.get('fmt')))continue;
   const ext=u.searchParams.get('fmt')==='jpeg'?'jpg':'png';
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
   groups.set(`${model}|${color}`,{source:page.url,sourceTitle:title,model,color,connectivity:'Wi-Fi',angle:'Main',image,url});
  }
 }
 candidates.push(...groups.values());let cursor=0;
 async function worker(){while(cursor<candidates.length){const c=candidates[cursor++];if(existsSync(`public${c.image}`))continue;
  const response=await fetch(c.url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw Error(`iPad original HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());if(!(bytes[0]===0xff||bytes[0]===0x89)||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');writeFileSync(`public${c.image}`,bytes);
 }}
 await Promise.all(Array.from({length:4},worker));
 writeFileSync('.tmp-qa/apple-accessories/ipad-older-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'exact factory iPad Pro, mini and older Air originals awaiting review');
}
if(process.argv.includes('--ipad-download')){
 const candidates=[];
 const html=readFileSync('.tmp-qa/apple-accessories/ipadair.html','utf8');
 if(!html.includes('M4 chip')||!html.includes('Shop iPad Air'))throw Error('Current iPad Air generation not confirmed');
 for(const url of JSON.parse(readFileSync('.tmp-qa/apple-accessories/ipadair-urls.json','utf8'))){
  const match=url.match(/\/ipad-air-select-(11|13)in-(wifi|cell)-(blue|purple|starlight|spacegray)-202405\?/);
  if(!match)continue;
  const [,size,connection,finish]=match;
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.jpg`;
  candidates.push({source:pages.ipadair,sourceTitle:'Shop iPad Air; M4 chip',model:`iPad Air ${size} M4`,color:finish==='spacegray'?'Space Gray':finish[0].toUpperCase()+finish.slice(1),size,connectivity:connection==='wifi'?'Wi-Fi':'Cellular',angle:'Main',image,url});
 }
 if(candidates.length!==16)throw Error('Expected 16 manufacturer finishes and connectivity combinations');
 let cursor=0;
 async function worker(){while(cursor<candidates.length){const c=candidates[cursor++];
  if(!existsSync(`public${c.image}`)){
   const response=await fetch(c.url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw Error(`iPad original HTTP ${response.status}`);
   const bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==0xff||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');writeFileSync(`public${c.image}`,bytes);
  }
 }}
 await Promise.all(Array.from({length:4},worker));
 const bundleArg=process.argv.find(s=>s.startsWith('--bundle='));
 if(bundleArg){
  const bundle=JSON.parse(readFileSync(bundleArg.slice(9),'utf8'));
  for(const a of bundle.assets){
   if(a.contentType!=='image/webp'||!a.url.includes('/ipad-air-finish-select-gallery-202405-13inch-blue-wifi'))throw Error('Unexpected reviewed browser asset');
   const image=`/images/products/verified/${createHash('sha256').update(a.url).digest('hex').slice(0,24)}.webp`;
   copyFileSync(a.path,`public${image}`);
   candidates.push({source:pages.ipadair,sourceTitle:'Shop iPad Air; M4 chip; selected 13-inch Blue Wi-Fi',model:'iPad Air 13 M4',color:'Blue',size:'13',connectivity:'Wi-Fi',angle:a.url.includes('_AV1')?'Rear and side':'Front and rear',image,url:a.url});
  }
 }
 writeFileSync('.tmp-qa/apple-accessories/ipad-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'exact manufacturer iPad photos awaiting visual review');
}
if(process.argv.includes('--download')){
 const candidates=[];
 for(const key of ['airpods5base','airpodsmax2']){
  const html=readFileSync(`.tmp-qa/apple-accessories/${key}.html`,'utf8');
  const title=html.match(/<title[^>]*>([^<]+)/)?.[1].replaceAll('\u00a0',' ');
  if(title!==`Buy ${key==='airpods5base'?'AirPods 5':'AirPods Max 2'} - Apple`)throw Error('Apple model changed');
  const urls=JSON.parse(readFileSync(`.tmp-qa/apple-accessories/${key}-urls.json`,'utf8'));
  for(const url of urls){
   const m=key==='airpods5base'?url.match(/\/airpods-5-select-202609_FV1\?/):url.match(/\/airpods-max-select-202409-(midnight|starlight|orange|blue|purple)_FV1\?/);
   const gallery=key==='airpods5base'?url.match(/\/airpods-5-202609-gallery-([124])\?/):undefined;
   if(!m&&!gallery)continue;
   const model=key==='airpods5base'?'AirPods 5':'AirPods Max 2';
   const color=m?.[1]?m[1][0].toUpperCase()+m[1].slice(1):'';
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.jpg`;
   candidates.push({source:pages[key],sourceTitle:title,model,color,angle:gallery?`Detail ${gallery[1]}`:'Main',url,image});
  }
 }
 let cursor=0;
 async function worker(){while(cursor<candidates.length){const c=candidates[cursor++];
  if(!existsSync(`public${c.image}`)){
   const response=await fetch(c.url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw Error(`Apple original HTTP ${response.status}`);
   const bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==0xff||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');writeFileSync(`public${c.image}`,bytes);
  }
 }}
 await Promise.all(Array.from({length:4},worker));
 writeFileSync('.tmp-qa/apple-accessories/photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'originals awaiting visual review');
}

