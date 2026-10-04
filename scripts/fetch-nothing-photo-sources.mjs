import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
async function factoryFetch(url){let last;for(let i=0;i<4;i++){try{return await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0'}});}catch(error){last=error;}}throw last;}
mkdirSync('.tmp-qa/nothing',{recursive:true});
const pages={phone3:'https://us.nothing.tech/products/phone-3',phone3alite:'https://intl.nothing.tech/products/phone-3a-lite',phone4apro:'https://us.nothing.tech/products/phone-4a-pro',phone4b:'https://intl.nothing.tech/products/phone-4b?Capacity=8%2B128GB&Colour=Blue'};
const candidates=[];
if(process.argv.includes('--cmf-download')){
 for(const [key,model,source,pattern] of [
  ['cmf2a','CMF Buds 2a','https://us.nothing.tech/products/cmf-buds-2a?Colour=Orange',/CMFBuds2a-1352x1352-(DarkGrey|LightGrey|Orange)-Open_/],
  ['cmfpro2','CMF Buds Pro 2','https://in.nothing.tech/products/cmf-buds-pro-2?Colour=Blue',/CMF-Buds-Pro-2_Blue_[1-4]\.png/]
 ]){
  const html=readFileSync(`.tmp-qa/nothing/${key}.html`,'utf8');
  for(const url of JSON.parse(readFileSync(`.tmp-qa/nothing/${key}-urls.json`,'utf8')).filter(u=>pattern.test(u))){
   const color=key==='cmfpro2'?'Blue':url.includes('DarkGrey')?'Dark Gray':url.includes('LightGrey')?'Light Gray':'Orange';
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok||new URL(r.url).hostname!=='cdn.shopify.com')throw Error('CMF original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89)throw Error('Invalid CMF PNG');writeFileSync('public'+image,bytes);}
   candidates.push({model,color,source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,image});console.log(model,color,image);
  }
 }
 writeFileSync('.tmp-qa/nothing/cmf-candidates.json',JSON.stringify(candidates,null,2)+'\n');process.exit(0);
}
if(process.argv.includes('--cmf-inspect')){
 for(const [key,source] of Object.entries({cmf2a:'https://us.nothing.tech/products/cmf-buds-2a?Colour=Orange',cmfpro2:'https://in.nothing.tech/products/cmf-buds-pro-2?Colour=Blue'})){
  const r=await factoryFetch(source);if(!r.ok)throw Error('CMF source unavailable');const html=await r.text();writeFileSync(`.tmp-qa/nothing/${key}.html`,html);
  const chunks=[];for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)){const data=m[1].match(/^window\.__reactRouterContext\.streamController\.enqueue\(([\s\S]*)\);$/);if(data){const value=JSON.parse(data[1]);if(typeof value==='string')chunks.push(value);}}
  const urls=[...new Set([...chunks.join('\n').matchAll(/https:\/\/cdn\.shopify\.com\/[^\s"<>\\]+/g)].map(m=>m[0]))];writeFileSync(`.tmp-qa/nothing/${key}-urls.json`,JSON.stringify(urls,null,2)+'\n');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1],urls.filter(u=>/primary|hero|thumbnail|grey|gray|blue|orange/i.test(u)));
 }
 process.exit(0);
}
for(const [key,source] of Object.entries(pages)){
 const file=`.tmp-qa/nothing/${key}.html`;
 if(!existsSync(file)){const r=await factoryFetch(source);if(!r.ok||new URL(r.url).hostname!==new URL(source).hostname)throw Error('Nothing factory page unavailable');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8'),images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
 writeFileSync(`.tmp-qa/nothing/${key}-images.json`,JSON.stringify(images,null,2)+'\n');console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1]);
 if(process.argv.includes('--download')){
  const expected={phone3:{model:'Nothing Phone 3',files:{Black:'Arbok-Primary-Black.png',White:'Arbok-Primary-White.png'}},phone3alite:{model:'Nothing Phone 3a Lite',files:{White:'BulbT-White.png'}},phone4apro:{model:'Nothing Phone 4a Pro',files:{Black:'Phone-4a-Pro-Black.png'}},phone4b:{model:'Nothing Phone 4b',files:{Black:'product-thumbnail-black.webp',Blue:'product-thumbnail-blue.webp',White:'product-thumbnail-white.webp'}}}[key];
  const chunks=[];for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)){const data=m[1].match(/^window\.__reactRouterContext\.streamController\.enqueue\(([\s\S]*)\);$/);if(data){const text=JSON.parse(data[1]);if(typeof text==='string')chunks.push(text);}}
  const urls=[...new Set([...chunks.join('\n').matchAll(/https:\/\/cdn\.shopify\.com\/[^\s"<>\\]+/g)].map(m=>m[0]))];
  for(const [color,name] of Object.entries(expected.files)){
   const options=urls.filter(url=>new URL(url).pathname.split('/').at(-1)===name);if(options.length!==1)throw Error('Published Nothing color original missing or ambiguous');
   const url=options[0];if(new URL(url).searchParams.has('width'))throw Error('Nothing original is resized');
   const ext=name.endsWith('.webp')?'webp':'png',image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.${ext}`;
   if(!existsSync('public'+image)){const r=await factoryFetch(url);if(!r.ok||new URL(r.url).hostname!=='cdn.shopify.com')throw Error('Invalid Nothing factory original');const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000||!(bytes[0]===0x89||bytes.toString('ascii',0,4)==='RIFF'))throw Error('Invalid Nothing image');writeFileSync('public'+image,bytes);}
   candidates.push({source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],model:expected.model,color,url,image});console.log(color,image);
  }
 }else console.log(images.filter(t=>/black|white|blue|gallery|phone/i.test(t)).slice(0,6).join('\n'));
}
if(process.argv.includes('--download'))writeFileSync('.tmp-qa/nothing/candidates.json',JSON.stringify(candidates,null,2)+'\n');
