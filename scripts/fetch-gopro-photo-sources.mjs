import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
const dir='.tmp-qa/gopro';fs.mkdirSync(dir,{recursive:true});
const sources=[['hero13','https://gopro.com/en/us/shop/cameras/buy/hero13black/CHDHX-131-master.html'],['mini11','https://gopro.com/en/us/shop/cameras/hero11-black-mini/CHDHF-111-master.html'],['mission','https://gopro.com/en/us/shop/cameras/buy/mission-1-pro/CHDHW-011-master.html'],['max2','https://gopro.com/en/us/shop/cameras/buy/max2/CHDHZ-311-master.html?option-id=CHDFZ-311-master']];
sources.push(['hero12','https://gopro.com/en/us/shop/cameras/hero12-black/CHDHX-121-master.html'],['max2-camera','https://gopro.com/en/us/shop/cameras/buy/max2/CHDHZ-311-master.html']);
if(process.argv.includes('--download')){
 const candidates=[];
 for(const [key,source] of sources){
  const h=fs.readFileSync(`${dir}/${key}.html`,'utf8');
  if(key==='mission'){
   const d=JSON.parse(h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
   for(const m of d.props.pageProps.pageModules[0].baseModelsSection.baseModels.slice(0,2)){const p=m.baseModelOption.product;const a=p.imageGroups.find(g=>g.viewType==='hi-res').images[0];candidates.push({key:p.id==='CHDHW-001-master'?'mission1':'mission1pro',sku:p.id,source:`${source}?option-id=${p.id}`,alt:a.alt,url:a.link});}continue;
  }
  const alt=key==='hero13'?'GoPro HERO13 Black Action Camera':key==='hero12'?'GoPro HERO12 Black':key==='mini11'?'GoPro HERO11 Mini Black Action Camera':key==='max2'?'MAX2 Starter Bundle':'MAX2';
  const tags=JSON.parse(fs.readFileSync(`${dir}/${key}-images.json`));
  const images=tags.map(t=>({alt:t.match(/alt="([^"]*)"/)?.[1]??'',url:t.match(/\bsrc="(https:[^"]+)"/)?.[1]?.split('?')[0]})).filter(a=>a.url&&a.alt.startsWith(alt)&&a.url.endsWith('.png')&&!/thumb|dropdown|award/.test(a.url));
  const unique=[...new Map(images.map(a=>[a.url,a])).values()].slice(0,key==='max2'?1:key==='max2-camera'?3:2);
  for(const a of unique)candidates.push({key,source,...a});
 }
 fs.mkdirSync('public/images/products/verified',{recursive:true});
 for(const a of candidates){const url=new URL(a.url);if(!['static.gopro.com','gopro.com'].includes(url.hostname))throw Error('Unexpected factory host');const hash=createHash('sha256').update(a.url).digest('hex').slice(0,24);a.file=`/images/products/verified/${hash}.png`;if(!fs.existsSync('public'+a.file)){const r=await fetch(a.url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Photo ${r.status}`);const b=Buffer.from(await r.arrayBuffer());if(b[0]!==137||b[1]!==80)throw Error('Expected native PNG');fs.writeFileSync('public'+a.file,b);}const m=await sharp('public'+a.file).metadata();a.width=m.width;a.height=m.height;}
 fs.writeFileSync(`${dir}/candidates.json`,JSON.stringify(candidates,null,2)+'\n');console.log(candidates);process.exit(0);
}
for(const [key,url] of sources){const f=`${dir}/${key}.html`;if(!fs.existsSync(f)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`${key}: HTTP ${r.status}`);fs.writeFileSync(f,await r.text());}const h=fs.readFileSync(f,'utf8');console.log(key,h.length);fs.writeFileSync(`${dir}/${key}-images.json`,JSON.stringify([...h.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]),null,2));}
