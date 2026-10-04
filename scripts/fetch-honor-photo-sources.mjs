import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
const dir='.tmp-qa/honor';fs.mkdirSync(dir,{recursive:true});
async function fetchFactory(url){let last;for(let attempt=0;attempt<3;attempt++){try{return await fetch(url,{signal:AbortSignal.timeout(30000)});}catch(error){last=error;console.log('Retrying public factory source',new URL(url).hostname,attempt+1);}}throw last;}
if(process.argv.includes('--pad-lte-download')){
 const {data}=JSON.parse(fs.readFileSync(`${dir}/pad-x8b-ae-gallery.json`)),sku=data.sbomList.find(s=>s.name==='HONOR Pad X8b 11.0 inch LTE 4GB+128GB Space Gray');if(data.briefName!=='HONOR Pad X8b'||!sku)throw Error('Exact LTE factory SKU missing');const rows=[];
 for(const p of sku.groupPhotoList){const url=data.imageHost+p.photoPath+'800_800_'+p.photoName,ext=/\.jpe?g$/i.test(p.photoName)?'jpg':'png',image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;if(!fs.existsSync('public'+image)){const r=await fetchFactory(url);if(!r.ok)throw Error(`Original ${r.status}`);fs.writeFileSync('public'+image,Buffer.from(await r.arrayBuffer()));}const m=await sharp('public'+image).metadata();if(Math.max(m.width,m.height)<600)throw Error('Low-quality original');rows.push({source:'https://www.honor.com/ae-en/tablets/honor-pad-x8b/buy/',sourceTitle:sku.name,color:'Space Gray',url,image,width:m.width,height:m.height});}
 fs.writeFileSync(`${dir}/pad-x8b-ae-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--ae-x7e')||process.argv.includes('--ae-lite')||process.argv.includes('--my-lite')||process.argv.includes('--my-x5d')||process.argv.includes('--my-x6e')||process.argv.includes('--ae-pad')){
 const key=process.argv.includes('--my-x6e')?'x6e':process.argv.includes('--my-x5d')?'x5d-plus':process.argv.includes('--ae-lite')?'600-lite':'x7e',model=key==='x6e'?'HONOR X6e':key==='x5d-plus'?'HONOR X5d Plus':key==='600-lite'?'HONOR 600 Lite':'HONOR X7e',region=['x5d-plus','x6e'].includes(key)?'my':'ae-en';
 const myLite=process.argv.includes('--my-lite'),pad=process.argv.includes('--ae-pad'),cacheKey=pad?'pad-x8b':myLite?'600-lite-my':key,source=pad?'https://www.honor.com/ae-en/tablets/honor-pad-x8b/buy/':myLite?'https://www.honor.com/my/phones/honor-600-lite/buy/':`https://www.honor.com/${region}/phones/honor-${key}/buy/`,file=`${dir}/${cacheKey}-ae-buy.html`;if(!fs.existsSync(file)){const r=await fetchFactory(source);if(!r.ok)throw Error(`Page ${r.status}`);fs.writeFileSync(file,await r.text());}
 const h=fs.readFileSync(file,'utf8'),base=JSON.parse('"'+h.match(/window\.ecApiHost="([^"]+)"/)[1]+'"'),id=h.match(/id="productId"[^>]*>(\d+)</)[1],url=new URL('queryPrdDisplayDetailInfo/1000',base);url.searchParams.set('productId',id);url.searchParams.set('siteCode',h.match(/"siteCode2":"([^"]+)"/)[1].toUpperCase());url.searchParams.set('loginFrom','1');
 const response=await fetchFactory(url),j=await response.json();if(j.data?.briefName!==(pad?'HONOR Pad X8b':myLite?'HONOR 600 Lite':model))throw Error('Wrong factory model');fs.writeFileSync(`${dir}/${cacheKey}-ae-gallery.json`,JSON.stringify(j,null,2)+'\n');const rows=[];
 if(pad){console.log(j.data.name,j.data.sbomList.map(s=>({name:s.name,attrs:s.gbomAttrList,photos:s.groupPhotoList.length})));process.exit(0);}
 for(const sku of j.data.sbomList){
  const color=sku.gbomAttrList.find(a=>/colou?r/i.test(a.attrName))?.attrValue.trim();if(!color)throw Error('Factory finish missing');
  if(key==='x5d-plus'&&!/black/i.test(color))continue;
  if(myLite&&!/gold/i.test(color))continue;
  for(const p of sku.groupPhotoList){
   const url=j.data.imageHost+p.photoPath+'800_800_'+p.photoName;if(rows.some(p=>p.url===url))continue;
   const ext=/\.jpe?g$/i.test(p.photoName)?'jpg':'png',image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
   if(!fs.existsSync('public'+image)){const r=await fetchFactory(url);if(!r.ok)throw Error(`Original ${r.status}`);fs.writeFileSync('public'+image,Buffer.from(await r.arrayBuffer()));}
   const m=await sharp('public'+image).metadata();if(!['png','jpeg'].includes(m.format)||Math.max(m.width,m.height)<600)throw Error('Low-quality original');rows.push({color,source,sourceTitle:`${myLite?'HONOR 600 Lite':model} ${color}`,url,image,width:m.width,height:m.height});
  }
 }
 fs.writeFileSync(`${dir}/${cacheKey}-ae-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows.map(p=>({color:p.color,image:p.image})));process.exit(0);
}
if(process.argv.includes('--ae-entry-download')){
 const {data}=JSON.parse(fs.readFileSync(`${dir}/x8d-ae-gallery.json`,'utf8')),rows=[];if(data.briefName!=='HONOR X8d')throw Error('Wrong factory model');
 for(const sku of data.sbomList){const color=sku.gbomAttrList.find(a=>a.attrName==='Color').attrValue.trim();for(const p of sku.groupPhotoList){const url=data.imageHost+p.photoPath+'800_800_'+p.photoName,image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;if(!fs.existsSync('public'+image)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Original ${r.status}`);fs.writeFileSync('public'+image,Buffer.from(await r.arrayBuffer()));}const m=await sharp('public'+image).metadata();if(m.format!=='png'||Math.max(m.width,m.height)<600)throw Error('Low-quality original');rows.push({color,source:'https://www.honor.com/ae-en/phones/honor-x8d/buy/',sourceTitle:`HONOR X8d ${color}`,url,image,width:m.width,height:m.height});}}
 fs.writeFileSync(`${dir}/x8d-ae-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--ae-entry-gallery')){
 const source='https://www.honor.com/ae-en/phones/honor-x8d/buy/',file=`${dir}/x8d-ae-buy.html`;
 if(!fs.existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Factory page ${r.status}`);fs.writeFileSync(file,await r.text());}
 const h=fs.readFileSync(file,'utf8');const base=JSON.parse('"'+h.match(/window\.ecApiHost="([^"]+)"/)[1]+'"'),id=h.match(/id="productId"[^>]*>(\d+)</)[1];
 console.log('Public factory configuration',id,[...h.matchAll(/.{0,40}(?:siteCode|countryCode).{0,70}/g)].map(m=>m[0]).slice(0,15));
 const url=new URL('queryPrdDisplayDetailInfo/1000',base);url.searchParams.set('productId',id);url.searchParams.set('siteCode',h.match(/"siteCode2":"([^"]+)"/)[1].toUpperCase());url.searchParams.set('loginFrom','1');
 const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Gallery ${r.status}`);const j=await r.json();fs.writeFileSync(`${dir}/x8d-ae-gallery.json`,JSON.stringify(j,null,2)+'\n');console.log(j.resultCode,j.resultMsg,j.data?.briefName,Object.keys(j.data||{}));if(j.data?.briefName!=='HONOR X8d')throw Error('Wrong manufacturer model');console.log(j.data.sbomList.map(s=>({attrs:s.gbomAttrList,photos:s.groupPhotoList})));
 process.exit(0);
}
if(process.argv.includes('--entry-studio-download')){
 const rows=[];
 for(const key of ['x8d','x7e','x6e']){const h=fs.readFileSync(`${dir}/${key}-spec.html`,'utf8'),source=`https://www.honor.com/${key==='x6e'?'eurasia':'global'}/phones/honor-${key}/spec/`;
 for(const m of h.matchAll(/<img\b[^>]*class="exterior"[^>]*>/g)){const tag=m[0],url=tag.match(/src="([^"]+)"/)[1],alt=tag.match(/alt="([^"]+)"/)?.[1];if(!url.includes(`/honor-${key}/`))throw Error('Wrong factory model');const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Factory studio ${r.status}`);const b=Buffer.from(await r.arrayBuffer());if(b[0]!==0x89)throw Error('Invalid factory PNG');const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;fs.writeFileSync('public'+image,b);const dimensions=await sharp(b).metadata();rows.push({key,source,url,alt,image,width:dimensions.width,height:dimensions.height});}}
 fs.writeFileSync(`${dir}/entry-studio-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--600-base-download')){
 const {data}=JSON.parse(fs.readFileSync(`${dir}/600-base-gallery.json`,'utf8')),sku=data.sbomList.find(s=>s.gbomAttrList.some(a=>a.attrName==='Colour'&&a.attrValue==='Black')&&s.gbomAttrList.some(a=>a.attrName==='Memory'&&a.attrValue==='8GB+256GB'));if(!sku)throw Error('Exact black factory SKU missing');const rows=[];
 for(const p of sku.groupPhotoList.filter(p=>/front view|rear view/i.test(p.altText))){const url=data.imageHost+p.photoPath+'800_800_'+p.photoName,r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Factory original ${r.status}`);const b=Buffer.from(await r.arrayBuffer());if(b[0]!==0x89)throw Error('Not native PNG');const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;fs.writeFileSync('public'+image,b);const m=await sharp(b).metadata();rows.push({url,image,width:m.width,height:m.height,alt:p.altText});}fs.writeFileSync(`${dir}/600-base-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--600-base-gallery')){
 const source='https://www.honor.com/uk/phones/honor-600/buy/',file=`${dir}/600-base-buy.html`;if(!fs.existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Factory page ${r.status}`);fs.writeFileSync(file,await r.text());}const h=fs.readFileSync(file,'utf8');if(!/<title[^>]*>[^<]*HONOR 600\b/i.test(h))throw Error('Factory base model missing');const base=JSON.parse('"'+h.match(/window\.ecApiHost="([^"]+)"/)[1]+'"'),id=h.match(/id="productId"[^>]*>(\d+)</)[1],url=new URL('queryPrdDisplayDetailInfo/1000',base);url.searchParams.set('productId',id);url.searchParams.set('siteCode','UK');url.searchParams.set('loginFrom','1');const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Factory gallery unavailable');const response=await r.json();if(response.data?.briefName!=='HONOR 600')throw Error('Different factory hardware');fs.writeFileSync(`${dir}/600-base-gallery.json`,JSON.stringify(response,null,2)+'\n');console.log(response.data.sbomList.map(s=>({attrs:s.gbomAttrList,photos:s.groupPhotoList.filter(p=>/front view|rear view/i.test(p.altText))})));process.exit(0);
}
if(process.argv.includes('--entry-cmf')){
 const rows=[];
 for(const key of ['x7e','x6e','x8d']){const h=fs.readFileSync(`${dir}/${key}.html`,'utf8');const urls=[...new Set([...h.matchAll(/https:\/\/www-file\.honor\.com\/[^"<>\s]+section-cmf\/img[123]@2x\.jpg/g)].map(m=>m[0]))];
 for(const url of urls){const hash=createHash('sha256').update(url).digest('hex').slice(0,24);const file=`/images/products/verified/${hash}.jpg`;if(!fs.existsSync(`public${file}`)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Photo ${r.status}`);fs.writeFileSync(`public${file}`,Buffer.from(await r.arrayBuffer()));}const m=await sharp(`public${file}`).metadata();rows.push({key,url,file,width:m.width,height:m.height});}}
 fs.writeFileSync(`${dir}/entry-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--600-download')){
 const {data}=JSON.parse(fs.readFileSync(`${dir}/600-gallery.json`,'utf8'));const sku=data.sbomList.find(s=>s.gbomAttrList.some(a=>a.attrName==='Colour'&&a.attrValue==='Golden White'));if(!sku)throw Error('Golden White missing');
 const photos=sku.groupPhotoList.filter(p=>/front view|rear view/.test(p.altText));if(photos.length!==2)throw Error('Exact front/rear gallery changed');const rows=[];
 for(const p of photos){const url=data.imageHost+p.photoPath+'800_800_'+p.photoName;const hash=createHash('sha256').update(url).digest('hex').slice(0,24);const file=`/images/products/verified/${hash}.png`;if(!fs.existsSync(`public${file}`)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Photo ${r.status}`);fs.writeFileSync(`public${file}`,Buffer.from(await r.arrayBuffer()));}const m=await sharp(`public${file}`).metadata();rows.push({key:'600-pro',source:'https://www.honor.com/uk/phones/honor-600-pro/buy/',url,file,width:m.width,height:m.height,alt:p.altText});}
 fs.writeFileSync(`${dir}/600-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--600-gallery')){
 const h=fs.readFileSync(`${dir}/600-pro-buy.html`,'utf8');const base=JSON.parse('"'+h.match(/window\.ecApiHost="([^"]+)"/)[1]+'"');const id=h.match(/id="productId"[^>]*>(\d+)</)[1];
 const url=new URL('queryPrdDisplayDetailInfo/1000',base);url.searchParams.set('productId',id);url.searchParams.set('siteCode','UK');url.searchParams.set('loginFrom','1');
 const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Public gallery ${r.status}`);const j=await r.json();fs.writeFileSync(`${dir}/600-gallery.json`,JSON.stringify(j,null,2)+'\n');console.log(j.resultCode,Object.keys(j.data||{}));process.exit(0);
}
if(process.argv.includes('--base-js')){
 const h=fs.readFileSync(`${dir}/600-pro-buy.html`,'utf8');
 const path=[...h.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).find(p=>p.includes('/common/base.min.')&&p.endsWith('.js'));
 if(!path)throw Error('Published base script missing');
 const file=`${dir}/base.js`;if(!fs.existsSync(file)){const r=await fetch(new URL(path,'https://www.honor.com'),{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`JS ${r.status}`);fs.writeFileSync(file,await r.text());}console.log(fs.statSync(file).size);process.exit(0);
}
if(process.argv.includes('--buy-js')){
 const h=fs.readFileSync(`${dir}/600-pro-buy.html`,'utf8');const paths=[...h.matchAll(/<script[^>]*src="([^"]+(?:product-option-page\/clientlibs|ec-global|ec-base|base-business)[^" ]+\.js)"/g)].map(m=>m[1]);if(paths.length!==4)throw Error('Factory product scripts missing');for(const path of paths){const url=new URL(path,'https://www.honor.com').href;const key=path.includes('ec-global')?'ec-global':path.includes('ec-base')?'ec-base':path.includes('base-business')?'base-business':'buy-gallery';const file=`${dir}/${key}.js`;if(!fs.existsSync(file)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`JS ${r.status}`);fs.writeFileSync(file,await r.text());}console.log(key,fs.statSync(file).size);}process.exit(0);
}
if(process.argv.includes('--cmf')){
 const rows=[];fs.mkdirSync('public/images/products/verified',{recursive:true});
 for(const [key,source] of [['400','https://www.honor.com/global/phones/honor-400/'],['500-pro','https://www.honor.com/cn/phones/honor-500-pro/']]){
  const h=fs.readFileSync(`${dir}/${key}.html`,'utf8');
  const urls=[...new Set([...h.matchAll(/https:\/\/www-file\.honor\.com\/[^"<>\s]+section-cmf\/[^"<>\s]+phone-[^"<>\s]+@2x\.png/g)].map(m=>m[0]))];
  for(const url of urls){const hash=createHash('sha256').update(url).digest('hex').slice(0,24);const file=`/images/products/verified/${hash}.png`;if(!fs.existsSync(`public${file}`)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Photo ${r.status}`);fs.writeFileSync(`public${file}`,Buffer.from(await r.arrayBuffer()));}const m=await sharp(`public${file}`).metadata();rows.push({key,source,url,file,width:m.width,height:m.height});}
 }
 fs.writeFileSync(`${dir}/cmf-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--download')){
 const page='https://www.honor.com/uk/phones/honor-600-pro/';const h=fs.readFileSync(`${dir}/600-pro.html`,'utf8');
 const urls=[...new Set([...h.matchAll(/https:\/\/www-file\.honor\.com\/[^"<>\s]+honor-600-pro-id-white-(?:back|front)\.png/g)].map(m=>m[0]))];
 if(urls.length!==2)throw Error('Expected factory white front and back');
 fs.mkdirSync('public/images/products/verified',{recursive:true});const rows=[];
 for(const url of urls){const hash=createHash('sha256').update(url).digest('hex').slice(0,24);const file=`/images/products/verified/${hash}.png`;if(!fs.existsSync(`public${file}`)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Photo ${r.status}`);fs.writeFileSync(`public${file}`,Buffer.from(await r.arrayBuffer()));}const m=await sharp(`public${file}`).metadata();rows.push({source:page,sourceTitle:'HONOR 600 Pro Golden White',url,file,width:m.width,height:m.height});}
 fs.writeFileSync(`${dir}/candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
const sources=[['600-pro','https://www.honor.com/uk/phones/honor-600-pro/'],['600-pro-buy','https://www.honor.com/uk/phones/honor-600-pro/buy/'],['400','https://www.honor.com/global/phones/honor-400/'],['500-pro','https://www.honor.com/cn/phones/honor-500-pro/'],['x8d','https://www.honor.com/global/phones/honor-x8d/']];
sources.push(['400-by','https://www.honor.com/by-ru/phones/honor-400/'],['x7e','https://www.honor.com/global/phones/honor-x7e/'],['x6e','https://www.honor.com/eurasia/phones/honor-x6e/']);
sources.push(['x7e-spec','https://www.honor.com/global/phones/honor-x7e/spec/'],['x6e-spec','https://www.honor.com/eurasia/phones/honor-x6e/spec/'],['x8d-spec','https://www.honor.com/global/phones/honor-x8d/spec/'],['600-pro-spec','https://www.honor.com/uk/phones/honor-600-pro/spec/']);
for(const [key,url] of sources){
 const file=`${dir}/${key}.html`;if(!fs.existsSync(file)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`HTTP ${r.status}`);fs.writeFileSync(file,await r.text());}
 const html=fs.readFileSync(file,'utf8');const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);fs.writeFileSync(`${dir}/${key}-images.json`,JSON.stringify(tags,null,2));console.log(key,html.length,tags.length);
}
