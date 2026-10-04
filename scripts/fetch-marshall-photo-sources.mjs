import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
const dir='.tmp-qa/marshall';fs.mkdirSync(dir,{recursive:true});
if(process.argv.includes('--supplier-download')){
 const sources=JSON.parse(fs.readFileSync('data/parser-store-links.json','utf8')).filter(p=>/Marshall (Major 5|Matif 2)/i.test(p.title)),rows=[];
 const results=await Promise.allSettled(sources.map(async p=>{
  const cache='.tmp-qa/supplier-pages/'+createHash('sha256').update(p.url).digest('hex').slice(0,24)+'.html';let h;
  if(fs.existsSync(cache)&&!process.argv.includes('--refresh-supplier'))h=fs.readFileSync(cache,'utf8');else{const r=await fetch(p.url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('Supplier page '+r.status);h=await r.text();fs.writeFileSync(dir+'/supplier-'+p.row+'.html',h);}
  const sourceTitle=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g,'').trim();if(!sourceTitle||!/Marshall/i.test(sourceTitle))throw Error('Supplier title changed');
  const urls=[...new Set([...h.matchAll(/href="([^"<>]+)"[^>]*data-fancybox="gallery"/g)].map(m=>new URL(m[1],p.url).href))].slice(0,3);if(!urls.length)console.log('No gallery',p.row,sourceTitle);
  for(const url of urls){const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('Supplier original '+r.status);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata();if(!['jpeg','png','webp'].includes(m.format))continue;const image='/images/products/verified/'+createHash('sha256').update(url).digest('hex').slice(0,24)+'.'+(m.format==='jpeg'?'jpg':m.format);fs.writeFileSync('public'+image,b);rows.push({source:p.url,sourceTitle,sheet:p.sheet,row:p.row,url,image,width:m.width,height:m.height});}
 }));for(const r of results)if(r.status==='rejected')console.log(r.reason.message);
 fs.writeFileSync(dir+'/supplier-candidates.json',JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--press-major')){
 const source='https://asset-bank.marshall.com/sharedselection/bd0804aa2c5e6ba8ba620fb04c7127e2/marshall',file=`${dir}/major-press.html`;if(!fs.existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Press page ${r.status}`);fs.writeFileSync(file,await r.text());}
 const rows=[];for(const id of ['41529']){const url=`https://asset-bank.marshall.com/sharedselection/bd0804aa2c5e6ba8ba620fb04c7127e2/detail/marshall/${id}/download/16`,r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Published high-res original ${r.status}`);const b=Buffer.from(await r.arrayBuffer()),m=await sharp(b).metadata(),ext=m.format==='png'?'png':m.format==='jpeg'?'jpg':undefined;if(!ext)throw Error('Unsupported factory high-res format');const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;fs.writeFileSync('public'+image,b);rows.push({source,sourceTitle:'marshall_major-V_black_ecom_01.tif; factory High-res rendition',url,image,width:m.width,height:m.height});}
 fs.writeFileSync(`${dir}/press-major-candidates.json`,JSON.stringify(rows,null,2)+'\n');console.log(rows);process.exit(0);
}
if(process.argv.includes('--download')){
 const selections=[
 ['major-v','1006832','Black'],['major-v','1006834','Brown'],['major-v','1006833','Cream'],['major-v','1008144','Midnight Blue'],['major-v','1009165','Pitch Black'],
 ['acton-iii','1006008','Black'],['acton-iii','1006009','Cream'],['acton-iii','1006078','Brown'],['motif-ii-anc','1006450','Black'],
 ];
 const output=[];fs.mkdirSync('public/images/products/verified',{recursive:true});
 for(const [key,sku,color] of selections){
  const variants=JSON.parse(fs.readFileSync(`${dir}/${key}-variants.json`));
  const v=variants.find(v=>v.fields.productId.split('/')[0]===sku);if(!v)throw Error(`Missing factory SKU ${sku}`);
  const assets=v.fields.productImages.map(p=>p.fields.imageDesktop??p.fields.imageMobile).filter(Boolean);
  const unique=[...new Map(assets.map(a=>[a.fields.file.url,a])).values()];
  for(const a of unique){
   const url=new URL(a.fields.file.url,'https://www.marshall.com').href;
   if(new URL(url).hostname!=='images.ctfassets.net')throw Error('Unexpected image host');
   const hash=createHash('sha256').update(url).digest('hex').slice(0,24);const file=`/images/products/verified/${hash}.jpg`;
   if(!fs.existsSync(`public${file}`)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Photo ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==255||bytes[1]!==216)throw Error('Expected native JPEG');fs.writeFileSync(`public${file}`,bytes);}
   const m=await sharp(`public${file}`).metadata();const expected=a.fields.file.details.image;
   if(m.width!==expected.width||m.height!==expected.height)throw Error('Native dimensions changed');
   output.push({key,sku,color,source:`https://www.marshall.com/us/en/product/${key}?pid=${sku}&color=${encodeURIComponent(color.toLowerCase())}`,sourceTitle:v.fields.id,alt:a.fields.title,url,file,width:m.width,height:m.height});
  }
 }
 fs.writeFileSync(`${dir}/candidates.json`,JSON.stringify(output,null,2)+'\n');console.log(output.map(({key,sku,color,alt,file,width,height})=>({key,sku,color,alt,file,width,height})));process.exit(0);
}
const sources=[
 ['major-v','https://www.marshall.com/us/en/product/major-v'],
 ['acton-iii','https://www.marshall.com/us/en/product/acton-iii'],
 ['motif-ii-anc','https://www.marshall.com/us/en/product/motif-ii-anc'],
];
for(const [key,url] of sources){
 const path=`${dir}/${key}.html`;
 if(!fs.existsSync(path)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`${key}: ${r.status}`);fs.writeFileSync(path,await r.text());}
 const html=fs.readFileSync(path,'utf8');
 console.log(key,html.length,html.match(/<title>(.*?)<\/title>/)?.[1]);
 const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);fs.writeFileSync(`${dir}/${key}-images.json`,JSON.stringify(tags,null,2));
 console.log(tags.length,'image tags cached');
}
