import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
const pages={nintendo:'https://www.nintendo.com/es-mx/store/products/nintendo-switch-oled-model-white-set/',neon:'https://www.nintendo.com/es-mx/store/products/nintendo-switch-oled-model-neon-blue-neon-red-set/',quest:'https://www.meta.com/quest/family/'};
mkdirSync('.tmp-qa/gaming',{recursive:true});
if(process.argv.includes('--steam-download')){
 const source='https://www.steamdeck.com/en/press',h=readFileSync('.tmp-qa/gaming/steam-oled.html','utf8');const urls=[...new Set([...h.matchAll(/href="([^"]+press_oled_front_(?:english|cocoon)\.png)"/g)].map(m=>m[1]))];if(urls.length!==2)throw Error('Expected OLED factory front originals');const candidates=[];
 for(const url of urls){if(new URL(url).hostname!=='cdn.fastly.steamstatic.com')throw Error('Unexpected Valve host');const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;if(!existsSync('public'+image)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Steam photo ${r.status}`);writeFileSync('public'+image,Buffer.from(await r.arrayBuffer()));}const m=await sharp('public'+image).metadata();candidates.push({source,sourceTitle:'Steam Deck OLED — factory press rendering',url,image,width:m.width,height:m.height});}
 writeFileSync('.tmp-qa/gaming/steam-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates);process.exit(0);
}
if(process.argv.includes('--steam-inspect')){
 for(const [key,url] of [['steam-oled','https://www.steamdeck.com/en/press'],['steam-controller','https://store.steampowered.com/steamcontroller']]){
  const file=`.tmp-qa/gaming/${key}.html`;if(!existsSync(file)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Steam HTTP ${r.status}`);writeFileSync(file,await r.text());}
  const h=readFileSync(file,'utf8');console.log(key,h.length);console.log([...h.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(u=>/zip|oled|controller.*(?:png|jpg)|(?:png|jpg).*controller/.test(u)).slice(0,25));
 }process.exit(0);
}
if(process.argv.includes('--microsoft-inspect')||process.argv.includes('--microsoft-download')){
 const source='https://www.microsoft.com/en-gb/d/xbox-wireless-controller-deep-pink/8xn59crbsqgz';
 const file='.tmp-qa/gaming/microsoft-xbox.html';if(!existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='www.microsoft.com')throw Error('Invalid Microsoft factory page');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8'),tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync('.tmp-qa/gaming/microsoft-xbox-images.json',JSON.stringify(tags,null,2)+'\n');
 if(process.argv.includes('--microsoft-download')){
  const assets={Black:'gldn-Xbox-Cntrl-Black-b00',White:'gldn-Xbox-Cntrl-White-b01-1',Blue:'gldn-Xbox-Cntrl-Blue-b02',Pink:'3899411_Image-Buy-Box-0_2000x2000',Red:'029437852_Image-Buy-Box-0_2555x1555'},candidates=[];
  for(const [color,asset] of Object.entries(assets)){
   const tag=tags.find(tag=>tag.includes('/'+asset+'?')&&tag.includes('data-src='));
   const published=tag?.match(/\bdata-src="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');if(!published)throw Error('Exact Xbox retail original missing');
   const props=new URL(published);props.search='req=imageprops';const metadata=await fetch(props,{signal:AbortSignal.timeout(30000)});if(!metadata.ok)throw Error('Microsoft native metadata unavailable');const properties=await metadata.text();
   const width=Number(properties.match(/image\.width=(\d+)/)?.[1]),height=Number(properties.match(/image\.height=(\d+)/)?.[1]);if(!width||!height||Math.max(width,height)<600)throw Error('Microsoft original too small');
   writeFileSync(`.tmp-qa/gaming/xbox-${color}-properties.txt`,properties);
   const native=new URL(published);native.search=`fmt=png-alpha&wid=${width}&hei=${height}`;const url=native.href;
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='cdn-dynmedia-1.microsoft.com')throw Error('Invalid Microsoft image');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000)throw Error('Invalid Xbox PNG');writeFileSync('public'+image,bytes);}
   candidates.push({source,sourceTitle:tag.match(/\balt="([^"]+)"/)?.[1],color,url,image,width,height});console.log(color,width,height,image);
  }
  writeFileSync('.tmp-qa/gaming/xbox-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');
 }else console.log(tags.filter(t=>/controller|Shock Blue|Deep Pink|Pulse Red|Robot White|Carbon Black/i.test(t)).slice(0,35).join('\n'));
 process.exit(0);
}
if(process.argv.includes('--xbox-inspect')){
 const source='https://www.xbox.com/en-US/accessories/controllers/xbox-wireless-controller';
 const file='.tmp-qa/gaming/xbox.html';if(!existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='www.xbox.com')throw Error('Invalid Xbox factory page');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
 writeFileSync('.tmp-qa/gaming/xbox-images.json',JSON.stringify(tags,null,2)+'\n');
 console.log(tags.filter(t=>/front|side|back|Shock Blue|Deep Pink|Pulse Red|Robot White|Carbon Black/i.test(t)).slice(0,45).join('\n'));
 process.exit(0);
}
// Observed in the manufacturer's selected 128 GB PDP image carousel.
if(process.argv.includes('--quest-download')){
 const source='https://www.meta.com/quest/quest-3s/buy-now/';
 const views=[['3193017200856821','Right quarter'],['1364548828094606','Side'],['987782126862471','Angled'],['1645757416108887','Controllers'],['672863402289879','Main']];
 const candidates=[];
 for(const [id,angle] of views){
  const url=`https://lookaside.fbsbx.com/elementpath/media/?media_id=${id}&version=1772546511&transcode_extension=webp`;
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!=='lookaside.fbsbx.com')throw Error('Invalid Meta photo host');
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<1000||bytes.length>15000000||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')throw Error('Invalid native WEBP');
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.webp`;
  writeFileSync(`public${image}`,bytes);candidates.push({source,sourceTitle:'Meta Quest 3S; selected 128 GB; factory product carousel',model:'Meta Quest 3S',storage:'128 GB',color:'White',angle,url,image});
 }
 writeFileSync('.tmp-qa/gaming/quest-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'Quest 3S originals awaiting visual review');process.exit(0);
}
for(const [key,url] of Object.entries(pages)){
 const file=`.tmp-qa/gaming/${key}.html`;
 if(!existsSync(file)){
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok||new URL(response.url).hostname!==new URL(url).hostname)throw Error(`${key} source HTTP ${response.status}`);
  writeFileSync(file,await response.text());
 }
 const html=readFileSync(file,'utf8');
 console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const urls=[...new Set([...html.matchAll(/https:\/\/[^\s"<>\\]+/g)].map(m=>m[0].replaceAll('&amp;','&')))];
 writeFileSync(`.tmp-qa/gaming/${key}-urls.json`,JSON.stringify(urls,null,2)+'\n');
 if(process.argv.includes('--inspect'))console.log(urls.filter(s=>/switch|oled|quest|batman/i.test(s)&&!/\.js|\.css/.test(s)).slice(0,25).join('\n'));
}
if(process.argv.includes('--nintendo-download')){
 const candidates=[];
 for(const key of ['nintendo','neon']){
  const urls=JSON.parse(readFileSync(`.tmp-qa/gaming/${key}-urls.json`,'utf8'));
  for(const url of urls){
   if(!url.startsWith('https://assets.nintendo.com/image/upload/q_auto:best/f_auto/dpr_2.0/ncom/en_US/products/hardware/nintendo-switch-oled-model-')||/box-?art/.test(url))continue;
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok||new URL(response.url).hostname!=='assets.nintendo.com')throw Error('Invalid Nintendo image');
   const bytes=Buffer.from(await response.arrayBuffer());
   if(!(bytes[0]===0xff||bytes[0]===0x89)||bytes.length<1000||bytes.length>15000000)throw Error('Invalid original');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${bytes[0]===0x89?'png':'jpg'}`;
   writeFileSync(`public${image}`,bytes);candidates.push({source:pages[key],sourceTitle:readFileSync(`.tmp-qa/gaming/${key}.html`,'utf8').match(/<title[^>]*>([^<]+)/)?.[1],model:'Nintendo Switch OLED',color:key==='neon'?'Neon Blue/Neon Red':'White',url,image,angle:/dock-joy-con[-_]grip/.test(url)?'Main':url.includes('console-front')?'Console front':/joy-con[-_]straps/.test(url)?'Controllers':'Detached controllers'});
  }
 }
 if(candidates.length!==8)throw Error(`Unexpected Nintendo gallery: ${candidates.length}`);
 writeFileSync('.tmp-qa/gaming/nintendo-photo-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'factory originals awaiting review');
}
