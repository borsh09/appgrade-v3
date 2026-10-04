import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('.tmp-qa/plaud',{recursive:true});
async function factoryFetch(url){let last;for(let i=0;i<4;i++){try{return await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});}catch(e){last=e;}}throw last;}
if(process.argv.includes('--download')){
 const candidates=[];
 for(const [key,source] of Object.entries({pro:'https://global.plaud.ai/products/plaud-note-pro',note:'https://global.plaud.ai/products/plaud-note-ai-voice-recorder',starlight:'https://marketing.plaud.ai/products/plaud-note-ai-note-taker',silver:'https://marketing.plaud.ai/products/plaud-note-ai-note-taker'})){
  const product=JSON.parse(readFileSync(`.tmp-qa/plaud/${key}-product.json`,'utf8'));
  if(product.title!==(key==='pro'?'Plaud Note Pro':'Plaud Note'))throw Error('Plaud source model changed');
  for(const variant of product.variants){
   const asset=variant.featured_image;if(!asset||!asset.variant_ids.includes(variant.id))throw Error('Plaud own variant photo missing');
   const url=new URL(asset.src.startsWith('//')?'https:'+asset.src:asset.src);if(!['global.plaud.ai','marketing.plaud.ai'].includes(url.hostname)||url.searchParams.has('width'))throw Error('Unexpected Plaud original');
   const ext=url.pathname.split('.').at(-1);if(!['png','webp'].includes(ext))throw Error('Unknown Plaud image format');
   const image=`/images/products/verified/${createHash('sha256').update(url.href).digest('hex').slice(0,24)}.${ext}`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok)throw Error('Plaud native image unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(!(bytes[0]===0x89||bytes.toString('ascii',0,4)==='RIFF'))throw Error('Invalid Plaud original');writeFileSync('public'+image,bytes);}
   const own=new URL(source);own.searchParams.set('variant',variant.id);
   candidates.push({model:product.title,color:variant.title==='Navy Blue'?'Blue':variant.title,manufacturerColor:variant.title,source:own.href,sourceTitle:product.title,url:url.href,image,width:asset.width,height:asset.height});console.log(product.title,variant.title,image);
  }
 }
 writeFileSync('.tmp-qa/plaud/candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
const pages=process.argv.includes('--legacy')?{starlight:'https://marketing.plaud.ai/products/plaud-note-ai-note-taker?variant=46887533674668',silver:'https://marketing.plaud.ai/products/plaud-note-ai-note-taker?variant=46887533707436'}:{pro:'https://global.plaud.ai/products/plaud-note-pro?variant=51235046818085',note:'https://global.plaud.ai/products/plaud-note-ai-voice-recorder'};
for(const [key,source] of Object.entries(pages)){
 const file=`.tmp-qa/plaud/${key}.html`;
 if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error(`Plaud source ${r.status}`);writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/plaud/${key}-images.json`,JSON.stringify(images,null,2)+'\n');
 const products=[...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{return null;}}).filter(Boolean);
 const selected=products.find(p=>!Array.isArray(p)&&p.featured_image&&p.title);
 const product=products.find(p=>!Array.isArray(p)&&p.variants&&p.images)??(selected?{title:'Plaud Note',variants:[selected],images:[selected.featured_image.src]}:null);if(!product)throw Error('Plaud product data missing');
 writeFileSync(`.tmp-qa/plaud/${key}-product.json`,JSON.stringify(product,null,2)+'\n');console.log(product.title,product.variants.map(v=>({title:v.title,featured_image:v.featured_image})));
}
