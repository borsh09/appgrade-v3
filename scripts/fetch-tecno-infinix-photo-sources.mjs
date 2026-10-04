import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('.tmp-qa/tecno-infinix',{recursive:true});
async function factoryFetch(url){let last;for(let i=0;i<3;i++){try{return await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});}catch(e){last=e;}}throw last;}
if(process.argv.includes('--edge-variants')){
 const candidates=[];
 for(const [color,id,label] of [['Titanium',51945575285012,'Lunar Titanium'],['Blue',51945575219476,'Stellar Blue'],['Green',51945575350548,'Silk Green']]){
  const source=`https://infinixmobiles.in/products/note-edge?variant=${id}`,file=`.tmp-qa/tecno-infinix/edge-${color}.html`;
  if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error('Infinix variant unavailable');writeFileSync(file,await r.text());}
  const html=readFileSync(file,'utf8');
  const blocks=[...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{return null;}}).filter(Boolean);
  const variant=blocks.find(b=>b.id===id&&b.featured_image);
  if(!variant||variant.title!==`${label} / 8GB/128GB`||!variant.featured_image.variant_ids.includes(id))throw Error('Infinix selected variant mismatch');
  const url=new URL(variant.featured_image.src,'https://infinixmobiles.in').href;
  if(new URL(url).hostname!=='infinixmobiles.in'&&new URL(url).hostname!=='cdn.shopify.com')throw Error('Unexpected Infinix original host');
  const r=await factoryFetch(url);if(!r.ok)throw Error('Infinix original unavailable');const bytes=Buffer.from(await r.arrayBuffer());
  const extension=bytes[0]===0x89&&bytes.subarray(1,4).toString()==='PNG'?'png':bytes[0]===0xff&&bytes[1]===0xd8?'jpg':bytes.subarray(8,12).toString()==='WEBP'?'webp':null;if(!extension)throw Error('Unexpected original format');
  const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${extension}`;
  if(!existsSync('public'+image))writeFileSync('public'+image,bytes);
  candidates.push({model:'Infinix Note Edge',color,source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],variantId:id,variantTitle:variant.title,url,image,width:variant.featured_image.width,height:variant.featured_image.height});
  console.log(color,image,variant.featured_image.width,variant.featured_image.height);
 }
 writeFileSync('.tmp-qa/tecno-infinix/edge-candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
if(process.argv.includes('--edge-store')){
 const source='https://infinixmobiles.in/products/note-edge',file='.tmp-qa/tecno-infinix/edge-store.html';if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error('Infinix factory store unavailable');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const blocks=[...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{return null;}}).filter(Boolean);
 const product=blocks.find(p=>p.variants&&p.images);if(!product){console.log('blocks',blocks.map(b=>Object.keys(b)));process.exit(0);}
 writeFileSync('.tmp-qa/tecno-infinix/edge-store-product.json',JSON.stringify(product,null,2)+'\n');console.log(product.title,product.variants.map(v=>({id:v.id,title:v.title,image:v.featured_image})));
 process.exit(0);
}
if(process.argv.includes('--infinix-bundle')){
 const urls=JSON.parse(readFileSync('.tmp-qa/tecno-infinix/edge-scripts.json','utf8')).filter(u=>u.includes('/pages/global/smartphone/NOTE-Edge.'));if(urls.length!==1)throw Error('Exact Infinix source bundle missing');
 const file='.tmp-qa/tecno-infinix/edge.js';if(!existsSync(file)){const r=await factoryFetch(urls[0]);if(!r.ok)throw Error('Infinix source unavailable');writeFileSync(file,await r.text());}
 const js=readFileSync(file,'utf8');console.log([...new Set([...js.matchAll(/["']([^"']+\.(?:png|webp|jpg))["']/g)].map(m=>m[1]))].slice(0,45));process.exit(0);
}
if(process.argv.includes('--spark50-blue')){
 const source='https://www.tecno-mobile.com/nga/phones/tech-specs/techspecs/spark-50/',file='.tmp-qa/tecno-infinix/spark50nga.html';if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error('Spark 50 source unavailable');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(html.match(/<title[^>]*>([^<]+)/)?.[1]);console.log([...html.matchAll(/<img\b[^>]*class="figure-img"[^>]*>/g)].map(m=>m[0]));process.exit(0);
}
if(process.argv.includes('--download')){
 const candidates=[];
 const bluePage=readFileSync('.tmp-qa/tecno-infinix/spark50nga.html','utf8');
 const blueUrl=[...bluePage.matchAll(/<img\b[^>]*class="figure-img"[^>]*>/g)].map(m=>m[0].match(/src=['"]([^'"]+)/)?.[1]).find(u=>u?.endsWith('/halo-blue.png'));
 if(!blueUrl)throw Error('Published Halo Blue original missing');
 const blueImage=`/images/products/verified/${createHash('sha256').update(blueUrl).digest('hex').slice(0,24)}.png`;
 if(!existsSync('public'+blueImage)){const r=await factoryFetch(blueUrl);if(!r.ok)throw Error('Blue original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Invalid blue PNG');writeFileSync('public'+blueImage,bytes);}
 candidates.push({model:'Tecno Spark 50',color:'Blue',source:'https://www.tecno-mobile.com/nga/phones/tech-specs/techspecs/spark-50/',sourceTitle:bluePage.match(/<title[^>]*>([^<]+)/)?.[1],url:blueUrl,image:blueImage});console.log('Spark 50 Blue',blueImage);
 const pages={camon50specs:{source:'https://www.tecno-mobile.com/phones/tech-specs/techspecs/camon-50/',model:'Tecno Camon 50',files:{'CN5-月影黑.png':'Black','CN5-孔雀石绿.png':'Malachite Green','CN5-星河钛.png':'Titanium','CN5-冷杉绿.png':'Fir Green'}},spark50specs:{source:'https://www.tecno-mobile.com/ph/phones/tech-specs/techspecs/spark-50/',model:'Tecno Spark 50',files:{'Titanium-Grey.png':'Gray','ink-black.png':'Black'}},go3specs:{source:'https://www.tecno-mobile.com/phones/tech-specs/techspecs/spark-go-3/',model:'Tecno Spark Go 3',files:{'KN3-黑色.png':'Black','KN3-钛色.png':'Gray','KN3-淡紫色.png':'Purple','KN3-深蓝色.png':'Blue'}},ultraspecs:{source:'https://www.tecno-mobile.com/phones/tech-specs/techspecs/camon-50-ultra-5g/',model:'Tecno Camon 50 Ultra',files:{'CN7C-月影黑.png':'Black','CN7C-松柏绿.png':'Green','CN7C-星河钛.png':'Titanium'}}};
 for(const [key,p] of Object.entries(pages)){
  const html=readFileSync(`.tmp-qa/tecno-infinix/${key}.html`,'utf8');
  const urls=[...new Set([...html.matchAll(/<img\b[^>]*class="figure-img"[^>]*>/g)].map(m=>m[0].match(/src=['"]([^'"]+)/)?.[1]).filter(Boolean))];
  for(const [name,color] of Object.entries(p.files)){
   const matches=urls.filter(u=>decodeURIComponent(new URL(u).pathname.split('/').at(-1))===name);if(matches.length!==1)throw Error('Exact Tecno original absent');const url=matches[0];if(new URL(url).hostname!=='d13pvy8xd75yde.cloudfront.net')throw Error('Unexpected Tecno CDN');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok)throw Error('Tecno photo unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Invalid original Tecno PNG');writeFileSync('public'+image,bytes);}
   candidates.push({model:p.model,color,source:p.source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,image});console.log(p.model,color,image);
  }
 }
 writeFileSync('.tmp-qa/tecno-infinix/candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
const pages=process.argv.includes('--go3-ultra-specs')?{go3specs:'https://www.tecno-mobile.com/phones/tech-specs/techspecs/spark-go-3/',ultraspecs:'https://www.tecno-mobile.com/phones/tech-specs/techspecs/camon-50-ultra-5g/'}:process.argv.includes('--specs')?{camon50specs:'https://www.tecno-mobile.com/phones/tech-specs/techspecs/camon-50/',spark50specs:'https://www.tecno-mobile.com/ph/phones/tech-specs/techspecs/spark-50/',camon50ultra:'https://www.tecno-mobile.com/phones/product-detail/product/camon-50-ultra-5g/'}:{camon50:'https://www.tecno-mobile.com/phones/product-detail/product/camon-50/',spark50:'https://www.tecno-mobile.com/ph/phones/product-detail/product/spark-50/',edge:'https://www.infinixmobility.com/NOTE-Edge'};
for(const [key,source] of Object.entries(pages)){
 const file=`.tmp-qa/tecno-infinix/${key}.html`;if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error(`Factory source ${r.status}`);writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/tecno-infinix/${key}-images.json`,JSON.stringify(images,null,2)+'\n');console.log(images.filter(t=>/black|green|blue|grey|gray|titanium|color|colour/i.test(t)).slice(0,12).map(t=>t.slice(0,430)).join('\n'));
 const urls=[...new Set([...html.matchAll(/(?:src|href)=["']([^"']+\.js(?:\?[^"']*)?)["']/g)].map(m=>new URL(m[1],source).href))];writeFileSync(`.tmp-qa/tecno-infinix/${key}-scripts.json`,JSON.stringify(urls,null,2)+'\n');console.log('images',images.length,'scripts',urls.length);
}
