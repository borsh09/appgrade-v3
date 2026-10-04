import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
mkdirSync('.tmp-qa/samsung',{recursive:true});
if(process.argv.includes('--adapter-research')){
 const variants=[['25-white-cable','mk','EP-TA800XWEGWW'],['25-black-cable','id','EP-TA800XBEGWW'],['25-black','ru','EP-TA800NBEGRU'],['45-black-cable','vn','EP-T4510XBEGWW'],['45-white','sk','EP-T4511NWEGEU']];
 if(process.argv.includes('--remaining'))variants.splice(0,variants.length,['45-black-cable-eu','es','EP-T4510XBEGEU'],['45-white-cable-eu','sk','EP-T4511XWEGEU'],['45-black-eu','de','EP-T4511NBEGEU']);
 const results=await Promise.allSettled(variants.map(async([key,siteCode,modelList])=>{
  const u=new URL('https://searchapi.samsung.com/v6/front/b2c/product/card/detail/global');
  for(const [k,v]of Object.entries({siteCode,modelList,saleSkuYN:'N',onlyRequestSkuYN:'N',keySummaryYN:'N',keySpecYN:'N',quicklookYN:'N'}))u.searchParams.set(k,v);
  const r=await fetch(u,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(key+': '+r.status);
  const body=await r.json();writeFileSync('.tmp-qa/samsung/adapter-'+key+'.json',JSON.stringify(body,null,2));
  console.log(key,JSON.stringify(body.response?.resultData?.productList?.flatMap(p=>p.modelList).map(v=>({sku:v.modelCode,name:v.displayName,source:v.pdpUrl,alt:v.thumbUrlAlt,images:v.galleryImageLarge}))).slice(0,4500));
 }));for(const r of results)if(r.status==='rejected')console.error(r.reason.message);process.exit(results.some(r=>r.status==='rejected')?1:0);
}
async function factoryFetch(url){let last;for(let i=0;i<3;i++){try{return await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(25000)});}catch(e){last=e;}}throw last;}
const pages={a57:'https://www.samsung.com/sg/smartphones/galaxy-a/galaxy-a57-5g-awesome-navy-128gb-sm-a576bdbqxsp/',a07s:'https://www.samsung.com/latin/smartphones/galaxy-a/galaxy-a07s-green-128gb-sm-a077mzgggto/',a27:'https://shop.samsung.com/ar/galaxy-a27-5g/p'};
if(process.argv.includes('--api')){
 const more={a07:{siteCode:'latin',modelList:'SM-A075MZGGGTO'},a16:{siteCode:'br',modelList:'SM-A165MLGIZTO'},s25uk:{siteCode:'uk',modelList:'SM-S931BZDHEUB'},s25ultrach:{siteCode:'ch',modelList:'SM-S938BZSGEUE'}};
 Object.assign(more,{s25normal:{siteCode:'uk',modelList:'SM-S931BZSHEUB'},buds4:{siteCode:'uk',modelList:'SM-R540NZWAEUB'},buds4pro:{siteCode:'de',modelList:'SM-R640NZDADBT'},ring:{siteCode:'sg',modelList:'SM-Q505NZDAASA'},taba11:{siteCode:'es',modelList:'SM-X130NZAEEUB'},tablitewifi:{siteCode:'latin',modelList:'SM-X400NZRDGTO'},tabfe5g:{siteCode:'de',modelList:'SM-X526BLBREUB'}});
 Object.assign(more,{watch8bt40:{siteCode:'ie',modelList:'SM-L320NDAAEUA'},watch8bt44:{siteCode:'lv',modelList:'SM-L330NZSAEUE'},watch8lte40:{siteCode:'lv',modelList:'SM-L325FDAAEUE'},watch8lte44:{siteCode:'es',modelList:'SM-L335FZSAEUB'},watch9lte40:{siteCode:'es',modelList:'SM-L345FZKAEUB'},watch9bt40:{siteCode:'us',modelList:'SM-L340NZKAXAA'},watchultra2025:{siteCode:'lv',modelList:'SM-L705FZB2EUE'}});
 Object.assign(more,{watch9bt44:{siteCode:'us',modelList:'SM-L350NZSDXAA'},watch9lte44:{siteCode:'latin',modelList:'SM-L355FZSAGTO'},buds3pro:{siteCode:'tr',modelList:'SM-R630NZAATUR'},fit3:{siteCode:'es',modelList:'SM-R390NIDAEUB'},fold7:{siteCode:'lv',modelList:'SM-F966BZSBEUE'},tablite5g:{siteCode:'es',modelList:'SM-X406BZRREUB'},tabfewifi:{siteCode:'us',modelList:'SM-X520NZAAXAR'},tabfe5gstandard:{siteCode:'uk',modelList:'SM-X526BZAPEUB'},tabpluswifi:{siteCode:'us',modelList:'SM-X820NZSAXAR'}});
 Object.assign(more,{watchultra2:{siteCode:'latin',modelList:'SM-L715FZSAGTO'},tabplus5g:{siteCode:'ie',modelList:'SM-X826BZSREUB'},watch7lte44:{siteCode:'at',modelList:'SM-L315FZGAEUE'}});
 Object.assign(more,{s26silver:{siteCode:'ie',modelList:'SM-S942BZSGEUB'}});
 Object.assign(more,{watch7silver:{siteCode:'br',modelList:'SM-L315FZSAZTO'}});
 await Promise.all(Object.entries({...more,a57:{siteCode:'sg',modelList:'SM-A576BDBQXSP'},a07s:{siteCode:'latin',modelList:'SM-A077MZGGGTO'},a27:{siteCode:'ar',modelList:'SM-A276BZBFARO'},a08:{siteCode:'ae',modelList:'SM-A085FZGGMEA'},a56:{siteCode:'in',modelList:'SM-A566EZGZINS'},s25:{siteCode:'ee',modelList:'SM-S931BZKDEUE'},s25ultra:{siteCode:'ee',modelList:'SM-S938BZBDEUE'},s25edge:{siteCode:'ie',modelList:'SM-S937BLBDEUB'},s26plus:{siteCode:'uk',modelList:'SM-S947BZWDEUB'},s26fe:{siteCode:'uk',modelList:'SM-S741BZVDEUB'}}).map(async([key,identity])=>{
  const url=new URL('https://searchapi.samsung.com/v6/front/b2c/product/card/detail/global');for(const [k,v] of Object.entries({...identity,saleSkuYN:'N',onlyRequestSkuYN:'N',keySummaryYN:'N',keySpecYN:'N',quicklookYN:'N'}))url.searchParams.set(k,v);
  const r=await factoryFetch(url.href);if(!r.ok)throw Error(`Samsung API ${key}: ${r.status}`);const body=await r.json();writeFileSync(`.tmp-qa/samsung/${key}-api.json`,JSON.stringify(body,null,2)+'\n');console.log(key,Object.keys(body));
 }));process.exit(0);
}
if(process.argv.includes('--download-api')){
 const candidates=[];
 const additional=existsSync('.tmp-qa/samsung/additional-selections.json')?JSON.parse(readFileSync('.tmp-qa/samsung/additional-selections.json','utf8')):[];
 const selections=[['a57','SM-A576BDBQXSP','Samsung Galaxy A57','Navy'],['a57','SM-A576BLBTXSP','Samsung Galaxy A57','Icyblue'],['a07s','SM-A077MZGGGTO','Samsung Galaxy A07s','Green'],['a07s','SM-A077MLVGGTO','Samsung Galaxy A07s','Violet'],['a27','SM-A276BZKFARO','Samsung Galaxy A27','Black'],['a27','SM-A276BZBFARO','Samsung Galaxy A27','Blue'],['a27','SM-A276BLIFARO','Samsung Galaxy A27','Pink']];
 selections.push(['a08','SM-A085FZGGMEA','Samsung Galaxy A08','Green'],['a08','SM-A085FZSGMEA','Samsung Galaxy A08','Silver'],['a56','SM-A566EZGZINS','Samsung Galaxy A56','Olive'],['a56','SM-A566EZAZINS','Samsung Galaxy A56','Lightgray'],['a56','SM-A566EDBZINS','Samsung Galaxy A56','Blue'],['s25','SM-S931BZKDEUE','Samsung Galaxy S25','Blueblack'],['s25ultra','SM-S938BZBDEUE','Samsung Galaxy S25 Ultra','Silverblue'],['s25edge','SM-S937BLBDEUB','Samsung Galaxy S25 Edge','Icyblue'],['s26plus','SM-S947BZVDEUB','Samsung Galaxy S26 Plus','Violet'],['s26fe','SM-S741BZVDEUB','Samsung Galaxy S26 FE','Blueberry'],['s26fe','SM-S741BZKDEUB','Samsung Galaxy S26 FE','Graphite'],['s26fe','SM-S741BLGDEUB','Samsung Galaxy S26 FE','Pistachio']);
 selections.push(['a07','SM-A075MZGGGTO','Samsung Galaxy A07','Green'],['a07','SM-A075MLVGGTO','Samsung Galaxy A07','Violet'],['a16','SM-A165MLGDZTO','Samsung Galaxy A16','Green'],['s25uk','SM-S931BZDDEUB','Samsung Galaxy S25','Pinkgold'],['s25ultrach','SM-S938BZSGEUE','Samsung Galaxy S25 Ultra','Whitesilver']);
 const displayNames={a16:'Galaxy A16 (128GB)',a56:'Galaxy A56 5G (8 GB Memory)',s25:'Galaxy S25 (Eksklusiivne värv)',s25uk:'Galaxy S25 (Samsung.com only)',s26plus:'Galaxy S26+'};
 for(const a of additional){selections.push([a.key,a.sku,a.model,a.color]);displayNames[a.key+':'+a.sku]=a.displayName;}
 async function downloadSelection([key,sku,model,color]){const result=[];
  const body=JSON.parse(readFileSync(`.tmp-qa/samsung/${key}-api.json`,'utf8')),v=body.response.resultData.productList.flatMap(p=>p.modelList).find(v=>v.modelCode===sku);if(!v||v.displayName!==(displayNames[key+':'+sku]||displayNames[key]||model.replace(/^Samsung /,'')+(['a57','a27'].includes(key)?' 5G':'')))throw Error('Samsung factory model mismatch');
  const angles=v.largeUrl.includes('-thumb-')?[['main',v.galleryImageLarge[0]],['gallery',v.galleryImageLarge[1]]]:[['main',v.largeUrl],['gallery',v.galleryImageLarge[0]]];
  for(const [angle,path] of angles){
   const original=new URL(path,'https://images.samsung.com');if(original.hostname!=='images.samsung.com'||(!original.pathname.includes('/gallery/')||!original.pathname.includes(sku.toLowerCase())))throw Error('Unexpected Samsung original');
   const url=original.href,stem=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}`;let image=stem+(existsSync('public'+stem+'.jpg')?'.jpg':'.png');
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok)throw Error('Samsung original unavailable');const bytes=Buffer.from(await r.arrayBuffer()),ext=bytes[0]===0x89?'png':bytes[0]===0xff&&bytes[1]===0xd8?'jpg':null;if(!ext||bytes.length>15000000)throw Error('Invalid Samsung original');image=stem+'.'+ext;writeFileSync('public'+image,bytes);}
   const {width,height}=await sharp('public'+image).metadata();
   const source=new URL(v.pdpUrl,'https://www.samsung.com');if(!source.pathname.includes(sku.toLowerCase()))source.searchParams.set('modelCode',sku);
   result.push({model,color,source:source.href,sourceTitle:v.thumbUrlAlt.trim(),sku,url,image,width,height,angle});console.log(model,color,angle,width,height,image);
  }
 return result;}
 for(let i=0;i<selections.length;i+=4)candidates.push(...(await Promise.all(selections.slice(i,i+4).map(downloadSelection))).flat());
 writeFileSync('.tmp-qa/samsung/api-candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
if(process.argv.includes('--download-ar')){
 const b=JSON.parse(readFileSync('.tmp-qa/samsung/a27-state.json','utf8')),p=b['Product:galaxy-a27-5g'];if(p.productReference!=='SM-A276B'||p.productName!=='Galaxy A27 5G')throw Error('Exact A27 source changed');const candidates=[];
 for(const ref of p.items){const v=b[ref.id];if(!['Light Pink','Blue','Black'].includes(v.name))continue;const color=v.name==='Light Pink'?'Pink':v.name;
  const photo=b[v.images[0].id],url=photo.imageUrl;if(!url||new URL(url).hostname!=='samsungar.vtexassets.com')throw Error('Unexpected Samsung store original');
  const r=await factoryFetch(url);if(!r.ok)throw Error('Samsung store original unavailable');const bytes=Buffer.from(await r.arrayBuffer()),ext=bytes[0]===0x89?'png':bytes[0]===0xff?'jpg':null;if(!ext)throw Error('Invalid Samsung original');const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;if(!existsSync('public'+image))writeFileSync('public'+image,bytes);
  candidates.push({model:'Samsung Galaxy A27',color,source:pages.a27,sourceTitle:v.nameComplete,sku:v.itemId,url,image});console.log(color,image);
 }
 writeFileSync('.tmp-qa/samsung/ar-candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
if(process.argv.includes('--bundle')){
 const html=readFileSync('.tmp-qa/samsung/a57.html','utf8');const paths=[...html.matchAll(/src=["']([^"']+page-feature-pd\.min\.[^"']+\.js)["']/g)].map(m=>new URL(m[1],pages.a57).href);if(paths.length!==1)throw Error('Exact Samsung gallery source missing');
 const file='.tmp-qa/samsung/gallery.js';if(!existsSync(file)){const r=await factoryFetch(paths[0]);if(!r.ok)throw Error('Samsung client source unavailable');writeFileSync(file,await r.text());}const js=readFileSync(file,'utf8');console.log([...new Set([...js.matchAll(/["']([^"']*(?:product\/|family|detail\?)[^"']*)["']/g)].map(m=>m[1]))].filter(s=>s.length<300).slice(0,50));process.exit(0);
}
if(process.argv.includes('--dynamic')){
 for(const key of ['a57','a07s']){
  const html=readFileSync(`.tmp-qa/samsung/${key}.html`,'utf8'),path=html.match(/value="([^"]+\.dynamic)"/)?.[1];if(!path)throw Error('Published Samsung dynamic source missing');
  const file=`.tmp-qa/samsung/${key}-dynamic.html`;if(!existsSync(file)){const r=await factoryFetch(new URL(path,pages[key]).href);if(!r.ok)throw Error('Samsung dynamic unavailable');writeFileSync(file,await r.text());}
  const body=readFileSync(file,'utf8');console.log(key,body.length,body.slice(0,120));
 }
 process.exit(0);
}
await Promise.all(Object.entries(pages).map(async([key,source])=>{
 const file=`.tmp-qa/samsung/${key}.html`;if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error(`${key}: ${r.status}`);writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const imgs=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/samsung/${key}-images.json`,JSON.stringify(imgs,null,2)+'\n');console.log(key,imgs.filter(t=>/a576|a077|a276|Gallery|gallery|Front|Back/.test(t)).slice(0,14).map(t=>t.slice(0,650)).join('\n'));
}));
