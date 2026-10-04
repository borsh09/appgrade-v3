import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setDefaultResultOrder} from 'node:dns';
setDefaultResultOrder('ipv4first');
const pages={
 'wf5-pink':'https://www.sony.co.uk/store/product/wf1000xm5p.ce7/WF-1000XM5',
 'wf5-silver':'https://www.sony.co.uk/store/product/wf1000xm5s.ce7/WF-1000XM5',
 'wf5-pink-gallery':'https://www.sony.co.uk/electronics/gallery/wf-1000xm5/buy/wf1000xm5p.ce7',
 'wf5-silver-gallery':'https://www.sony.co.uk/electronics/gallery/wf-1000xm5/buy/wf1000xm5s.ce7',
 'wh6-pink':'https://electronics.sony.com/audio/headphones/headband/p/wh1000xm6-p',
 'pulse-elite-black':'https://www.playstation.com/en-gb/accessories/pulse-elite-wireless-headset/product/midnight-black/',
 'pulse-elite-white':'https://www.playstation.com/en-gb/accessories/pulse-elite-wireless-headset/',
 'wh5-blue':'https://www.sony.co.uk/store/product/wh1000xm5l.ce7/WH-1000XM5-Wireless-Noi',
 'ult-white':'https://www.sony.co.uk/store/product/whult900nw.ce7/ULT-POWER-SOUND-series-ULT-WEAR-Wireless-Noise-Cancelling-Headphones',
};
mkdirSync('.tmp-qa/sony',{recursive:true});
if(process.argv.includes('--cameras')||process.argv.includes('--cameras-download')){
 const candidates=[];
 const sources={'a7iv-body':'https://electronics.sony.com/imaging/interchangeable-lens-cameras/all-interchangeable-lens-cameras/p/ilce7m4-b','a7iii-body':'https://electronics.sony.com/imaging/interchangeable-lens-cameras/full-frame/p/ilce7m3-b','a7c-body':'https://electronics.sony.com/imaging/interchangeable-lens-cameras/all-interchangeable-lens-cameras/p/ilce7c-b','xperia7-black':'https://www.sony.co.uk/store/product/xqfs54eukcb.gc/Xperia-1-VII-New-Ultra-wide-sensor-Xperia-Intelligence-2-days-battery-life'};
 for(const [key,source] of Object.entries(sources)){
  const file=`.tmp-qa/sony/${key}.html`;if(!existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!==new URL(source).hostname)throw Error('Invalid Sony camera page');writeFileSync(file,await r.text());}
  const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
  const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/sony/${key}-images.json`,JSON.stringify(tags,null,2)+'\n');
  console.log(tags.filter(t=>/1200x1050|alt="Xperia 1 VII/.test(t)).slice(0,8).join('\n'));
  if(process.argv.includes('--cameras-download')){
   const tag=tags.find(t=>key==='xperia7-black'?t.includes('alt="Xperia 1 VII'):t.includes('1200x1050'));
   const published=tag?.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');if(!published)throw Error('Sony exact studio photo missing');
   let url=published,ext='img';
   if(key==='xperia7-black'){
    const props=new URL(published);props.search='req=imageprops';const r=await fetch(props,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Xperia native metadata missing');const text=await r.text();
    const width=Number(text.match(/image\.width=(\d+)/)?.[1]),height=Number(text.match(/image\.height=(\d+)/)?.[1]);if(!width||!height||Math.max(width,height)<600)throw Error('Xperia native too small');
    writeFileSync('.tmp-qa/sony/xperia7-black-properties.txt',text);const native=new URL(published);native.search=`fmt=png-alpha&wid=${width}&hei=${height}`;url=native.href;ext='png';
   }
   const file=`.tmp-qa/sony/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
   if(!existsSync(file)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Sony camera original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||!([0xff,0x89].includes(bytes[0])||bytes.toString('ascii',0,4)==='RIFF'))throw Error('Invalid Sony camera original');writeFileSync(file,bytes);}
   candidates.push({key,source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,file});
  }
 }
 if(process.argv.includes('--cameras-download'))writeFileSync('.tmp-qa/sony/cameras-candidates.json',JSON.stringify(candidates,null,2)+'\n');
 process.exit(0);
}
if(process.argv.includes('--sa-gallery')){
 const source='https://www.sony.co.uk/electronics/gallery/wh-1000xm5sab/buy/wh1000xm5sab.ce7';
 const file='.tmp-qa/sony/wh5-sa-gallery.html';if(!existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('SA factory gallery unavailable');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const urls=[...new Set([...html.matchAll(/(?:https?:)?\/\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')).filter(u=>/scene7|sony.com\/is\/image|sonyglobalsolutions|softcase/.test(u)))];
 console.log(urls.slice(0,25).join('\n'));writeFileSync('.tmp-qa/sony/wh5-sa-gallery-urls.json',JSON.stringify(urls,null,2)+'\n');process.exit(0);
}
if(process.argv.includes('--remaining-two')||process.argv.includes('--remaining-two-download')){
 const candidates=[];
 const sources={'wh5-sa':'https://www.sony.co.uk/store/product/wh1000xm5sab.ce7/WH-1000XM5SA-Soft-Case-Wireless-Noise-Cancelling-Headphones','pulse3-black':'https://direct.playstation.com/en-gb/buy-accessories/pulse-3d-wireless-headset-midnight-black-ps5-ps4'};
 for(const [key,source] of Object.entries(sources)){
  const file=`.tmp-qa/sony/${key}.html`;
  if(!existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!==new URL(source).hostname)throw Error('Unexpected Sony page');writeFileSync(file,await r.text());}
  const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
  const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/sony/${key}-images.json`,JSON.stringify(tags,null,2)+'\n');
  console.log(tags.filter(t=>/WH-1000XM5SA|pulse|headset|scene7|sonyglobalsolutions/i.test(t)).slice(0,12).join('\n'));
  if(process.argv.includes('--remaining-two-download')){
   const selected=key==='wh5-sa'?tags.filter(t=>t.includes('alt="WH-1000XM5SA')).map(t=>t.match(/\bsrc="([^"]+)"/)?.[1]):tags.filter(t=>t.includes('Thumbnail')&&/accessory-(?:front-angle|left|bottom)|accessorry-front/.test(t)).map(t=>t.match(/\bdata-src="([^"]+)"/)?.[1]);
   for(const published of new Set(selected.filter(Boolean))){
    let url=published.replaceAll('&amp;','&');
    if(key==='pulse3-black'){
     const props=new URL(url);props.search='req=imageprops';const r=await fetch(props,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Pulse native metadata unavailable');const text=await r.text();
     const width=Number(text.match(/image\.width=(\d+)/)?.[1]),height=Number(text.match(/image\.height=(\d+)/)?.[1]);if(!width||!height||Math.max(width,height)<600)throw Error('Pulse native resolution too small');
     writeFileSync(`.tmp-qa/sony/pulse3-${new URL(url).pathname.split('/').at(-1)}-properties.txt`,text);
     const native=new URL(url);native.search=`fmt=png-alpha&wid=${width}&hei=${height}`;url=native.href;
    }
    const file=`.tmp-qa/sony/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
    if(!existsSync(file)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Sony original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000)throw Error('Invalid Sony PNG');writeFileSync(file,bytes);}
    candidates.push({key,source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,file});
   }
  }
 }
 if(process.argv.includes('--remaining-two-download'))writeFileSync('.tmp-qa/sony/remaining-two-candidates.json',JSON.stringify(candidates,null,2)+'\n');
 process.exit(0);
}
if(process.argv.includes('--remaining-us')){
 const sources={
 'wf5-black':{source:'https://electronics.sony.com/audio/headphones/truly-wireless-earbuds/p/wf1000xm5-b',alt:'WF1000XM5/B'},
 'wh4-silver':{source:'https://electronics.sony.com/audio/headphones/headband/p/wh1000xm4-s',alt:'Sony WH1000XM4/B Premium Noise Cancelling Wireless Over-The-Ear Headphones, White'},
 'wh5-blue-us':{source:'https://electronics.sony.com/audio/headphones/headband/p/wh1000xm5-l',alt:'Sony WH-1000XM5 Wireless Noise Cancelling Headphones | WH1000XM5/L'},
 'ult-black':{source:'https://electronics.sony.com/audio/headphones/all-headphones/p/whult900n-b',alt:'WHULT900N/B'},
 'ult-gray':{source:'https://electronics.sony.com/audio/headphones/all-headphones/p/whult900n-h',alt:'WHULT900N/H'},
 'wf6-silver':{source:'https://electronics.sony.com/audio/headphones/truly-wireless-earbuds/p/wf1000xm6-s',alt:'WF1000XM6/S'},
 };
 const results=[];
 for(const [key,e] of Object.entries(sources)){
  try{
   const cache=`.tmp-qa/sony/${key}.html`;
   if(!existsSync(cache)){const r=await fetch(e.source,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='electronics.sony.com')throw Error('Invalid Sony page');writeFileSync(cache,await r.text());}
   const html=readFileSync(cache,'utf8'),title=html.match(/<title[^>]*>([^<]+)/)?.[1];
   const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).filter(tag=>tag.includes(`alt="${e.alt}"`));
   const urls=[...new Set(tags.map(tag=>tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;','&')).filter(Boolean))];
   console.log(key,title,urls);
   for(const url of urls){if(new URL(url).hostname!=='d1ncau8tqf99kp.cloudfront.net')throw Error('Unrecognized native Sony host');
    const file=`.tmp-qa/sony/${createHash('sha256').update(url).digest('hex').slice(0,24)}.img`;
    if(!existsSync(file)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Sony original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||!([0xff,0x89].includes(bytes[0])||bytes.toString('ascii',0,4)==='RIFF'))throw Error('Invalid Sony original');writeFileSync(file,bytes);}
    results.push({key,source:e.source,sourceTitle:title,url,file});
   }
  }catch(error){console.log(key,String(error));}
 }
 writeFileSync('.tmp-qa/sony/remaining-us-candidates.json',JSON.stringify(results,null,2)+'\n');process.exit(0);
}
const candidates=[];
if(process.argv.includes('--wf-native')||process.argv.includes('--extra-native')){
 const assets=[];
 for(const key of process.argv.includes('--extra-native')?['wh5-blue','ult-white']:['wf5-pink','wf5-silver']){
  if(!existsSync(`.tmp-qa/sony/${key}.html`)){const r=await fetch(pages[key],{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='www.sony.co.uk')throw Error('Unexpected Sony page');writeFileSync(`.tmp-qa/sony/${key}.html`,await r.text());}
  const html=readFileSync(`.tmp-qa/sony/${key}.html`,'utf8');
  const tag=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]).find(t=>key==='wh5-blue'?/alt="WH-1000XM5 Wireless Noise Cancelling Headphones"/.test(t):key==='ult-white'?/alt="ULT POWER SOUND series/.test(t):/alt="WF-1000XM5 Wireless Noise Cancelling Headphones"/.test(t));
  const published=tag?.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');if(!published)throw Error('Selected primary missing');
  if(new URL(published.startsWith('//')?'https:'+published:published).hostname!=='sony.scene7.com'){console.log(key,'requires another native source',published);continue;}
  const propsUrl=new URL(published);propsUrl.search='req=imageprops';
  const response=await fetch(propsUrl,{signal:AbortSignal.timeout(30000)});if(!response.ok||response.headers.get('content-type')?.startsWith('image/'))throw Error('Metadata unavailable');
  const props=await response.text();writeFileSync(`.tmp-qa/sony/${key}-native-properties.txt`,props);
  const width=Number(props.match(/image\.width=(\d+)/)?.[1]),height=Number(props.match(/image\.height=(\d+)/)?.[1]);
  console.log(key,width,height);if(!width||!height||Math.max(width,height)<600)throw Error('No high resolution original');
  const native=new URL(published);native.search=`fmt=png-alpha&wid=${width}&hei=${height}`;
  const r=await fetch(native,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Native unavailable');
  const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Native is not PNG');
  const file=`.tmp-qa/sony/${createHash('sha256').update(native.href).digest('hex').slice(0,24)}.png`;writeFileSync(file,bytes);
  assets.push({key,source:pages[key],sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],published,url:native.href,width,height,file});
 }
 writeFileSync(`.tmp-qa/sony/${process.argv.includes('--extra-native')?'extra':'wf'}-native-candidates.json`,JSON.stringify(assets,null,2)+'\n');process.exit(0);
}
for(const [key,source] of Object.entries(pages)){
 if(process.argv.includes('--gaming-only')&&!key.startsWith('pulse'))continue;
 if(process.argv.includes('--sony-only')&&key.startsWith('pulse'))continue;
 const file=`.tmp-qa/sony/${key}.html`;
 if(!existsSync(file)){const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok||new URL(response.url).hostname!==new URL(source).hostname)throw Error(`${key}: HTTP ${response.status} or changed host`);writeFileSync(file,await response.text());}
 const html=readFileSync(file,'utf8');
 console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
 writeFileSync(`.tmp-qa/sony/${key}-images.json`,JSON.stringify(images,null,2)+'\n');
 console.log(images.filter(t=>/WF.?1000|WH.?1000|pulse|headset|scene7|sonyglobalsolutions/i.test(t)).slice(0,5).map(t=>t.slice(0,650)).join('\n'));
 if(process.argv.includes('--download')&&(key.startsWith('pulse')||key==='wh6-pink')){
  let urls=[];
  if(key.startsWith('pulse'))for(const tag of images){const src=tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');if(!src?.startsWith('/_next/image/'))continue;const u=new URL(src,source).searchParams.get('url');if(u&&/PulseEliteHeadset-(White|MidnightBlack)-/.test(u))urls.push(u);}
  else urls=images.filter(t=>/alt="WH1000XM6\/P"/.test(t)).map(t=>t.match(/\bsrc="([^"]+)"/)?.[1]).filter(Boolean);
  for(const url of new Set(urls)){
   if(process.argv.includes('--main-only')&&key.startsWith('pulse')&&!/-(?:White|MidnightBlack)-01-16x9-/.test(url))continue;
   const hash=createHash('sha256').update(url).digest('hex').slice(0,24);const dest=`.tmp-qa/sony/${hash}.img`;
   if(!existsSync(dest)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Not an original image: HTTP '+r.status+' '+url);const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||!([0xff,0x89].includes(bytes[0])||bytes.toString('ascii',0,4)==='RIFF'))throw Error('Invalid image bytes');writeFileSync(dest,bytes);}
   candidates.push({key,source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,file:dest});
  }
 }
}
if(process.argv.includes('--download'))writeFileSync('.tmp-qa/sony/candidates.json',JSON.stringify(candidates,null,2)+'\n');
