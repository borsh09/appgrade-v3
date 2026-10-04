import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('.tmp-qa/oneplus',{recursive:true});
async function factoryFetch(url){let last;for(let i=0;i<3;i++){try{return await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});}catch(e){last=e;}}throw last;}
if(process.argv.includes('--15t-inspect')){
 const source=process.argv.includes('--specs')?'https://www.oneplus.com/cn/15t/specs':'https://www.oneplus.com/cn/15t',key=process.argv.includes('--specs')?'phone15tspecs':'phone15t',file=`.tmp-qa/oneplus/${key}.html`;
 if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error('OnePlus 15T source unavailable');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const dsl=html.match(/window\.pageDsl\s*=\s*(\{[^\n]+\})\s*;?/);if(dsl){const data=JSON.parse(dsl[1]);writeFileSync(`.tmp-qa/oneplus/${key}-pageDsl.json`,JSON.stringify(data,null,2)+'\n');console.log([...JSON.stringify(data).matchAll(/"webLink":"([^"]+)"/g)].map(m=>m[1]));console.log([...JSON.stringify(data).matchAll(/[^"\s]+(?:png|webp|jpg)[^"\s]*/g)].map(m=>m[0]).slice(0,8));}
 console.log([...new Set([...html.matchAll(/(?:href|src|data-src)="([^"]+)"/g)].map(m=>m[1]))].filter(u=>/specs|store|opposhop|param/i.test(u)).slice(0,12));process.exit(0);
}
if(process.argv.includes('--download')||process.argv.includes('--download-more')){
 const more=process.argv.includes('--download-more');
 const candidates=more?JSON.parse(readFileSync('.tmp-qa/oneplus/candidates.json','utf8')):[];
 if(more){
  const source='https://www.oneplus.com/us/oneplus-buds-pro-3/specs',html=readFileSync('.tmp-qa/oneplus/budspro3.html','utf8');
  const paths=[...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1]))].filter(u=>/buds-pro-3\/(?:specs-black\.png|specs\/Gauss-blue\.png)$/.test(u));
  if(paths.length!==2)throw Error('OnePlus Buds Pro 3 exact original changed');
  for(const path of paths){const url='https:'+path,color=path.includes('specs-black')?'Midnight':'Blue',image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok)throw Error('OnePlus Buds Pro 3 original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Invalid original PNG');writeFileSync('public'+image,bytes);}
   if(!candidates.some(a=>a.image===image))candidates.push({source,sourceTitle:'OnePlus Buds Pro 3 Specs',model:'OnePlus Buds Pro 3',color,url,image});console.log('OnePlus Buds Pro 3',color,image);
  }
 }
 const targets=more?[
  ['nordbuds4pro','https://www.oneplus.com/eg/oneplus-nord-buds-4-pro/specs','OnePlus Nord Buds 4 Pro'],
  ['ce5','https://www.oneplus.com/il/nord-ce5/specs','OnePlus Nord CE5'],
  ['phone15','https://www.oneplus.com/ae/15/specs','OnePlus 15'],
  ['nord5','https://www.oneplus.com/be_nl/nord-5/specs','OnePlus Nord 5'],
  ['nord6specs','https://www.oneplus.com/no/nord-6/specs','OnePlus Nord 6'],
  ['phone15tspecs','https://www.oneplus.com/cn/15t/specs','OnePlus 15T']
 ]:[
  ['buds4','https://www.oneplus.com/us/oneplus-buds-4/specs','OnePlus Buds 4'],
  ['phone13sspecs','https://www.oneplus.in/13s/specs','OnePlus 13S'],
  ['pad4specs','https://www.oneplus.com/sg/pad-4/specs','OnePlus Pad 4'],
  ['ce6','https://www.oneplus.com/ru/nord-ce6/specs','OnePlus Nord CE6']
 ];
 for(const [key,source,model] of targets){
  const dsl=JSON.parse(readFileSync(`.tmp-qa/oneplus/${key}-pageDsl.json`,'utf8'));
  const entries=Object.values(dsl.byId).flatMap(c=>[
   ...(c.attr?.spuData?.parameterData??[]).flatMap(g=>g.nameDetailList??[]),
   ...(c.attr?.parameterCn?.parameterList??[]).flatMap(g=>(g.list??[]).map(e=>({name:e.propertycode,content:e.propertyvalue})))
  ]);
  const row=entries.find(e=>e.name==='PRODUCT_IMAGE');if(!row)throw Error('OnePlus exact product images missing');
  for(const path of row.content.split(/[\r\n]+/).filter(Boolean)){
   const name=path.split('/').at(-1);const color=key==='phone15tspecs'?(name.includes('_white_')?'White':name.includes('_green_')?'Green':name.includes('_brown_')?'Brown':null):key==='phone15'?(/-sand-/.test(name)?'Sand':null):key==='nord5'?(name.endsWith('-black.png')?'Gray':null):key==='nord6specs'?(/_Mint/.test(name)?'Mint':'Black'):/Zen_Green|Green-Silk/.test(name)?'Green':/Storm_Gray|Radiant-Gray/.test(name)?'Gray':/Black/.test(name)?'Black':/Dune-Glow/.test(name)?'Dune Glow':/Sage-Mist/.test(name)?'Sage Mist':/Prado_Mint/.test(name)?'Blue':/Marble_Mist/.test(name)?'Marble Mist':null;if(!color)continue;
   const url=new URL(path,source);if(!/\/specs?\//.test(url.pathname)||!name.endsWith('.png'))throw Error('OnePlus native specification photo changed');
   const image=`/images/products/verified/${createHash('sha256').update(url.href).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok)throw Error('OnePlus native photo unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Invalid OnePlus PNG');writeFileSync('public'+image,bytes);}
   if(!candidates.some(a=>a.image===image))candidates.push({source,sourceTitle:readFileSync(`.tmp-qa/oneplus/${key}.html`,'utf8').match(/<title[^>]*>([^<]+)/)?.[1]?.trim(),model,color,url:url.href,image});console.log(model,color,image);
  }
 }
 writeFileSync('.tmp-qa/oneplus/candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
const pages=process.argv.includes('--nord6-specs')?{nord6specs:'https://www.oneplus.com/no/nord-6/specs'}:process.argv.includes('--remaining-phones')?{phone15:'https://www.oneplus.com/ae/15/specs',nord5:'https://www.oneplus.com/be_nl/nord-5/specs',nord6:'https://www.oneplus.com/no/nord-6'}:process.argv.includes('--audio-ce5')?{budspro3:'https://www.oneplus.com/us/oneplus-buds-pro-3/specs',nordbuds4pro:'https://www.oneplus.com/eg/oneplus-nord-buds-4-pro/specs',ce5:'https://www.oneplus.com/il/nord-ce5/specs'}:process.argv.includes('--more-specs')?{phone13sspecs:'https://www.oneplus.in/13s/specs',pad4specs:'https://www.oneplus.com/sg/pad-4/specs'}:{buds4:'https://www.oneplus.com/us/oneplus-buds-4/specs',pad4:'https://www.oneplus.com/sg/pad-4',phone13s:'https://www.oneplus.in/13s',ce6:'https://www.oneplus.com/ru/nord-ce6/specs'};
for(const [key,source] of Object.entries(pages)){
 const file=`.tmp-qa/oneplus/${key}.html`;if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error(`OnePlus source ${r.status}`);writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const dsl=html.match(/window\.pageDsl\s*=\s*(\{[^\n]+\})\s*;?/);if(dsl){const data=JSON.parse(dsl[1]);writeFileSync(`.tmp-qa/oneplus/${key}-pageDsl.json`,JSON.stringify(data,null,2)+'\n');const str=JSON.stringify(data);console.log([...str.matchAll(/[^"\s]+(?:png|webp|jpg)[^"\s]*/g)].map(m=>m[0]).slice(0,8));}
 const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/oneplus/${key}-images.json`,JSON.stringify(images,null,2)+'\n');console.log(images.filter(t=>/gray|green|black|white|dune|sage|color/i.test(t)).slice(0,8).map(t=>t.slice(0,400)).join('\n'));
 const urls=[...new Set([...html.matchAll(/(?:src|href)=["']([^"']+\.js(?:\?[^"']*)?)["']/g)].map(m=>new URL(m[1],source).href))];writeFileSync(`.tmp-qa/oneplus/${key}-scripts.json`,JSON.stringify(urls,null,2)+'\n');console.log('images',images.length,'scripts',urls.length);
}
