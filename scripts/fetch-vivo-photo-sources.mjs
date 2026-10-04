import {mkdirSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
mkdirSync('.tmp-qa/vivo',{recursive:true});
async function factoryFetch(url){let last;for(let i=0;i<3;i++){try{return await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(30000)});}catch(e){last=e;}}throw last;}
const pages={fe:'https://www.vivo.com/th/products/param/x300-fe',x300:'https://www.vivo.com.cn/vivo/param/x300',pro:'https://www.vivo.com.cn/vivo/param/x300pro',ultra:'https://www.vivo.com.cn/vivo/param/x300ultra'};
if(process.argv.includes('--download')){
 const candidates=[];
 const selections={fe:{model:'Vivo X300 FE',colors:{'Mist Purple':'Purple','Glow White':'White'}},x300:{model:'Vivo X300',colors:{'纯粹黑':'Black'}},pro:{model:'Vivo X300 Pro',colors:{'纯粹黑':'Black','简单白':'White','旷野棕':'Brown'}},ultra:{model:'Vivo X300 Ultra',colors:{'黑 Ka':'Black'}}};
 for(const [key,p] of Object.entries(selections)){
  const html=readFileSync(`.tmp-qa/vivo/${key}.html`,'utf8');
  for(const [label,color] of Object.entries(p.colors)){
   const tags=[...html.matchAll(/<img\b[^>]*class="no-flip-over"[^>]*>/g)].map(m=>m[0]).filter(t=>t.includes(`(${label})`));if(tags.length!==1)throw Error('Exact Vivo color original missing');
   const url=tags[0].match(/src="([^"]+)"/)?.[1];if(!url||!['asia-exstatic-vivofs.vivo.com','wwwstatic.vivo.com.cn','cn-exstatic-vivofs.iqoo.com'].includes(new URL(url).hostname))throw Error('Unexpected Vivo CDN');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok)throw Error('Vivo original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Vivo original is not PNG');writeFileSync('public'+image,bytes);}
   candidates.push({model:p.model,color,label,source:pages[key],sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],satelliteListed:key==='pro'&&html.includes('卫星通信版'),url,image});console.log(p.model,color,image);
  }
 }
 writeFileSync('.tmp-qa/vivo/candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
for(const [key,source] of Object.entries(pages)){
 const file=`.tmp-qa/vivo/${key}.html`;if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok)throw Error(`Vivo ${key}: ${r.status}`);writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);writeFileSync(`.tmp-qa/vivo/${key}-images.json`,JSON.stringify(images,null,2)+'\n');console.log(images.filter(t=>/alt=|color|colour|param/i.test(t)).slice(0,25).map(t=>t.slice(0,600)).join('\n'));
}
