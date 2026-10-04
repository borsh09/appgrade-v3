import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('.tmp-qa/bose',{recursive:true});
const source='https://www.bose.com/p/headphones/bose-quietcomfort-ultra-headphones-2nd-gen/QCUH2-HEADPHONEARN.html?dwvar_QCUH2-HEADPHONEARN_color=DESERT+GOLD';
const file='.tmp-qa/bose/ultra2.html';
if(!existsSync(file)){const r=await fetch(source,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Bose source ${r.status}`);writeFileSync(file,await r.text());}
const html=readFileSync(file,'utf8');console.log(html.match(/<title[^>]*>([^<]+)/)?.[1]);
if(process.argv.includes('--colors')){
 const links=[...html.matchAll(/(?:href|data-url)="([^"]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(u=>/QCUH2.*(?:VIOLET|SMOKE)/i.test(u));console.log([...new Set(links)]);process.exit(0);
}
if(process.argv.includes('--download')){
 const candidates=[];
 for(const [color,value] of [['Gold','DESERT GOLD'],['Violet','MIDNIGHT VIOLET'],['White','WHITE']]){
  const own=new URL(source);own.searchParams.set('dwvar_QCUH2-HEADPHONEARN_color',value);const page=`.tmp-qa/bose/${color}-${value.replaceAll(' ','-')}.html`;
  if(!existsSync(page)){const r=await fetch(own,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Bose color unavailable');writeFileSync(page,await r.text());}
  const text=readFileSync(page,'utf8'),tags=[...text.matchAll(/<img\b[^>]*class="bynder__image"[^>]*>/g)].map(m=>m[0]);
  const urls=[...new Set(tags.map(t=>t.match(/src="([^"]+)"/)?.[1]).filter(Boolean).map(u=>u.replaceAll('&amp;','&')))];
  for(const publishedUrl of urls.slice(0,3)){
   const expected=color==='Gold'?'DesertGold':color==='Violet'?'MidnightViolet':'WhiteSmoke';
   if(!publishedUrl.includes(expected)||!publishedUrl.includes('QCUHII'))throw Error('Bose returned another model or color');
   const url=new URL(publishedUrl);url.search='?format=png';if(url.hostname!=='assets.bosecreative.com')throw Error('Unexpected Bose CDN');
   const image=`/images/products/verified/${createHash('sha256').update(url.href).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Bose asset unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Bose asset not PNG');writeFileSync('public'+image,bytes);}
   candidates.push({model:'Bose Headphones QC Ultra 2',color,source:own.href,sourceTitle:text.match(/<title[^>]*>([^<]+)/)?.[1]?.trim(),publishedUrl,url:url.href,image});console.log(color,url.pathname.split('/').at(-1),image);
  }
 }
 writeFileSync('.tmp-qa/bose/candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync('.tmp-qa/bose/images.json',JSON.stringify(images,null,2)+'\n');
console.log(images.filter(t=>/ultra|QCUH|violet|gold|white/i.test(t)).slice(0,30).join('\n'));
const urls=[...new Set([...html.matchAll(/https?:[^\s"'<>]+/g)].map(m=>m[0]).filter(u=>/bosecreative.*(?:png|jpg|webp|jpeg)/i.test(u)))];writeFileSync('.tmp-qa/bose/urls.json',JSON.stringify(urls,null,2)+'\n');console.log('Image URLs',urls.length);
