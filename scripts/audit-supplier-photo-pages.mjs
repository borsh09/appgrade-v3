import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync, existsSync, statSync} from 'node:fs';

const audit=JSON.parse(readFileSync('.tmp-qa/photo-source-audit.json','utf8'));
const inventory=JSON.parse(readFileSync('data/parser-store-links.json','utf8'));
const sources=[...new Map(audit.flatMap(item=>[...item.exact,...item.candidates]).map(source=>[source.url,source])).values()];
const hosts=new Set(inventory.map(source=>new URL(source.url).hostname));
mkdirSync('.tmp-qa/supplier-pages',{recursive:true});
const records=[];let cursor=0,done=0;
async function worker(){while(cursor<sources.length){
 const source=sources[cursor++];
 const file=`.tmp-qa/supplier-pages/${createHash('sha256').update(source.url).digest('hex').slice(0,24)}.html`;
 try{
  let html;
  if(existsSync(file)&&Date.now()-statSync(file).mtimeMs<86400000)html=readFileSync(file,'utf8');
  else{
   const response=await fetch(source.url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'Mozilla/5.0'}});
   if(!response.ok||!hosts.has(new URL(response.url).hostname))throw new Error(`HTTP ${response.status} or redirected host`);
   html=await response.text();if(html.length>5000000)throw new Error('Oversized product page');
   writeFileSync(file,html);
  }
  const heading=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g,'').replaceAll('&amp;','&').replaceAll('&quot;','"').trim();
  records.push({...source,pageTitle:heading,file});
 }catch(error){records.push({...source,error:String(error.message??error)});}
 done++;
 if(done%25===0||done===sources.length){writeFileSync('.tmp-qa/supplier-page-audit.json',JSON.stringify(records,null,2)+'\n');console.log(`${done}/${sources.length}; readable ${records.filter(row=>row.pageTitle).length}`);}
}}
console.log(`Checking ${sources.length} linked product pages`);
await Promise.all(Array.from({length:4},worker));
