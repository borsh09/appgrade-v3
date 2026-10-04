import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sources={
 'xiaomi-17-pro-max':'https://www.mi.com/prod/xiaomi-17-pro-max',
 'xiaomi-17-pro':'https://www.mi.com/prod/xiaomi-17-pro?spmref=MiShop_PC.mihomepage.mtl_68d0931c799ab50001357c84.1',
 'redmi-note-17':'https://www.mi.com/global/product/redmi-note-17/',
};
mkdirSync('.tmp-qa/xiaomi-additional',{recursive:true});
if(process.argv.includes('--pro-retail')){
 // Product ID observed on the indexed manufacturer buy page, not inferred
 // from the Pro landing page's currently incorrect Pro Max product link.
 const source='https://www.mi.com/shop/buy/detail?product_id=21214';
 const page=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!page.ok)throw Error('Pro retail page unavailable');
 const html=await page.text();writeFileSync('.tmp-qa/xiaomi-additional/pro-retail.html',html);
 if(!html.includes('Xiaomi 17 Pro立即购买'))throw Error('Pro retail title mismatch');
 const r=await fetch('https://api2.order.mi.com/product/view?product_id=21214&version=2',{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0',Referer:source}});if(!r.ok)throw Error('Pro retail data unavailable');
 const d=await r.json();writeFileSync('.tmp-qa/xiaomi-additional/pro-retail-data.json',JSON.stringify(d,null,2)+'\n');
 if(d.code!==200||d.data?.product_info?.name!=='Xiaomi 17 Pro')throw Error('Pro API model mismatch');
 const names={'黑色':'Black','白色':'White','冷烟紫':'Purple','森野绿':'Green'},seen=new Set(),candidates=[];
 for(const row of d.data.goods_list){const g=row.goods_info,finish=Object.keys(names).find(c=>g.name.endsWith(' '+c));if(!finish||seen.has(finish))continue;
 if(g.product_id!==21214||!g.name.startsWith('Xiaomi 17 Pro '))throw Error('Pro SKU model mismatch');seen.add(finish);
 const url=new URL(g.img_url,source).href;if(new URL(url).hostname!=='cdn.cnbj1.fds.api.mi-img.com')throw Error('Unexpected Pro CDN');
 const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Pro original unavailable');const bytes=Buffer.from(await response.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000)throw Error('Invalid Pro original');writeFileSync('public'+image,bytes);
 candidates.push({model:'Xiaomi 17 Pro',color:names[finish],source,sourceTitle:g.name,sku:g.sku,url,image,angle:'Main'});
 }
 if(candidates.length!==4)throw Error('Incomplete Pro colors');writeFileSync('.tmp-qa/xiaomi-additional/pro-retail-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log('Four Pro originals awaiting review');process.exit(0);
}
if(process.argv.includes('--retail-download')){
 const d=JSON.parse(readFileSync('.tmp-qa/xiaomi-additional/cn-retail-data.json','utf8'));if(d.code!==200||d.data?.product_info?.name!=='Xiaomi 17 Pro Max')throw Error('Retail model mismatch');const candidates=[];const seen=new Set();const names={'黑色':'Black','白色':'White','冷烟紫':'Purple','森野绿':'Green'};
 for(const row of d.data.goods_list){const g=row.goods_info;const finish=Object.keys(names).find(c=>g.name.endsWith(' '+c));if(!finish||seen.has(finish))continue;seen.add(finish);if(g.product_id!==d.data.product_info.product_id||!g.name.startsWith('Xiaomi 17 Pro Max '))throw Error('Different model in gallery');
  // The family gallery is shared between finishes. Only the selected SKU's
  // own img_url is colour-specific; never label that shared gallery as a finish.
  for(const [index,url] of [new URL(g.img_url,'https://www.mi.com').href].entries()){
   if(new URL(url).hostname!=='cdn.cnbj1.fds.api.mi-img.com')throw Error('Unexpected CDN');const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
   if(!existsSync('public'+image)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='cdn.cnbj1.fds.api.mi-img.com')throw Error('Retail original unavailable');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000||bytes.length>15000000)throw Error('Invalid retail PNG');writeFileSync('public'+image,bytes);}
   candidates.push({model:'Xiaomi 17 Pro Max',color:names[finish],factoryColor:finish,angle:index===0?'Main':'Detail '+index,source:'https://www.mi.com/shop/buy/detail?product_id='+g.product_id,sourceTitle:g.name,sku:g.sku,url,image});
  }
 }
 if(seen.size!==4||candidates.length!==4||new Set(candidates.map(a=>a.image)).size!==4)throw Error('Incomplete or shared four-color retail gallery');writeFileSync('.tmp-qa/xiaomi-additional/retail-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'retail originals awaiting visual review');process.exit(0);
}
if(process.argv.includes('--cn-script')){
 const html=readFileSync('.tmp-qa/xiaomi-additional/xiaomi-17-pro-max.html','utf8');
 const src=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).find(u=>u.includes('prod-template/index.'));
 if(!src)throw Error('Observed product script missing');const url=new URL(src,'https://www.mi.com').href;
 const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Product SDK unavailable');writeFileSync('.tmp-qa/xiaomi-additional/cn-product-sdk.js',await r.text());console.log('Cached actual product SDK');process.exit(0);
}
if(process.argv.includes('--buy-sdk')){
 const html=readFileSync('.tmp-qa/xiaomi-additional/xiaomi-17-pro-max-buy.html','utf8');const src=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]).find(u=>u.includes('/js/buy/detail.'));if(!src)throw Error('Actual buy SDK missing');const r=await fetch(new URL(src,'https://www.mi.com'),{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('SDK unavailable');writeFileSync('.tmp-qa/xiaomi-additional/cn-buy-sdk.js',await r.text());console.log('Cached actual retail product SDK');process.exit(0);
}
if(process.argv.includes('--retail-data')){
 const sdk=readFileSync('.tmp-qa/xiaomi-additional/cn-buy-sdk.js','utf8');if(!sdk.includes('"/product/view"')||!sdk.includes('orderApi:"https://api2.order.mi.com"'))throw Error('Public product API route changed');
 const html=readFileSync('.tmp-qa/xiaomi-additional/xiaomi-17-pro-max.html','utf8');const id=html.match(/"product_info":\{"product_id":"(\d+)"/)?.[1];if(!id)throw Error('Product ID missing');const url=`https://api2.order.mi.com/product/view?product_id=${id}&version=2`;
 const r=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.mi.com/shop/buy/detail?product_id='+id}});if(!r.ok||new URL(r.url).hostname!=='api2.order.mi.com')throw Error('Public product data unavailable: HTTP '+r.status);const json=await r.json();writeFileSync('.tmp-qa/xiaomi-additional/cn-retail-data.json',JSON.stringify(json,null,2)+'\n');console.log('Manufacturer public product data',json.code,Object.keys(json.data??{}));process.exit(0);
}
for(const [key,source] of Object.entries(sources)){
 const file=`.tmp-qa/xiaomi-additional/${key}.html`;
 if(!existsSync(file)){const r=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='www.mi.com')throw Error('Invalid manufacturer page');writeFileSync(file,await r.text());}
 const html=readFileSync(file,'utf8');
 const tags=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>({tag:m[0],context:html.slice(Math.max(0,m.index-400),m.index+m[0].length+400)}));
 writeFileSync(`.tmp-qa/xiaomi-additional/${key}-pictures.json`,JSON.stringify(tags,null,2)+'\n');
 console.log(key,html.match(/<title[^>]*>([^<]+)/)?.[1],tags.length);
 if(process.argv.includes('--cn-buy')&&key.startsWith('xiaomi-17-pro')){
  const id=html.match(/"product_info":\{"product_id":"(\d+)"/)?.[1];if(!id)throw Error('Manufacturer product ID missing');
  const url='https://www.mi.com/shop/buy/detail?product_id='+id,target=`.tmp-qa/xiaomi-additional/${key}-buy.html`;
  if(!existsSync(target)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='www.mi.com')throw Error('Invalid buy page');writeFileSync(target,await r.text());}
  const buy=readFileSync(target,'utf8');console.log(key,'buy page',buy.match(/<title[^>]*>([^<]+)/)?.[1],buy.length);
 }
 if((process.argv.includes('--cn-content')||process.argv.includes('--cn-assets')||process.argv.includes('--cn-download'))&&key.startsWith('xiaomi-17-pro')){
  const sdk=readFileSync('.tmp-qa/xiaomi-additional/cn-product-sdk.js','utf8');const base=sdk.match(/https:\/\/mishop-pc\.cnbj1\.mi-fds\.com\/mishop-pc\/production\/mishop_pc\/src\/pages/)?.[0];if(!base)throw Error('Published content route missing');
  const url=base+new URL(source).pathname.replace('/prod','')+'/index.html';const target=`.tmp-qa/xiaomi-additional/${key}-content.html`;
  if(!existsSync(target)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='mishop-pc.cnbj1.mi-fds.com')throw Error('Manufacturer content unavailable');writeFileSync(target,await r.text());}
  const content=readFileSync(target,'utf8');writeFileSync(`.tmp-qa/xiaomi-additional/${key}-content-pictures.json`,JSON.stringify([...content.matchAll(/<img\b[^>]*>/g)].map(m=>({tag:m[0],context:content.slice(Math.max(0,m.index-400),m.index+m[0].length+400)})),null,2)+'\n');console.log(key,'native product content',content.length);
  if(process.argv.includes('--cn-assets')||process.argv.includes('--cn-download')){
   const resources=[...content.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(u=>u.includes(`/${key}/`)&&/\.(js|css)$/.test(u));
   const records=[];
   for(const resource of resources){const name=resource.split('/').at(-1),file=`.tmp-qa/xiaomi-additional/${key}-${name}`;if(!existsSync(file)){const r=await fetch(resource,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='mishop-pc.cnbj1.mi-fds.com')throw Error('Resource unavailable');writeFileSync(file,await r.text());}records.push({source,url:resource,file});}
   writeFileSync(`.tmp-qa/xiaomi-additional/${key}-resources.json`,JSON.stringify(records,null,2)+'\n');console.log(key,records.length,'actual style and gallery resources');
   if(process.argv.includes('--cn-download')){
    const js=readFileSync(records.find(r=>r.file.endsWith('.js')).file,'utf8');const base=js.match(/prod:"(https:\/\/cdn\.cnbj1\.fds\.api\.mi-img\.com\/product-images\/new-product-images\/[^" ]+)"/)?.[1];if(!base)throw Error('Factory image prefix missing');
    const expected=key.endsWith('-max')?{img_133:['Black','Main'],img_134:['Black','Detail'],img_138:['White','Main'],img_139:['White','Detail'],img_143:['Purple','Main'],img_144:['Purple','Detail'],img_148:['Green','Main'],img_149:['Green','Detail']}:{};
    const candidates=[];let count=0;
    for(const m of js.matchAll(/imgPath\+"([^" ]+)",class:"(img_\d+)"/g)){
     let finish=expected[m[2]];
     if(!key.endsWith('-max')&&['img_2761','img_2762'].includes(m[2])){finish=[['Green','Purple','White','Black'][Math.floor(count/2)],m[2]==='img_2762'?'Main':'Detail'];count++;}
     if(!finish)continue;const url=base+m[1],image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;
     if(!existsSync('public'+image)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='cdn.cnbj1.fds.api.mi-img.com')throw Error('Unpublished image');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000||bytes.length>15000000)throw Error('Invalid PNG');writeFileSync('public'+image,bytes);}
     candidates.push({model:key.endsWith('-max')?'Xiaomi 17 Pro Max':'Xiaomi 17 Pro',color:finish[0],angle:finish[1],source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,image,element:m[2]});
    }
    if(candidates.length!==8)throw Error('Expected eight exact manufacturer gallery images');writeFileSync(`.tmp-qa/xiaomi-additional/${key}-candidates.json`,JSON.stringify(candidates,null,2)+'\n');console.log(key,candidates.length,'originals awaiting visual review');
   }
  }
 }
 if(process.argv.includes('--download-note')&&key==='redmi-note-17'){
  const candidates=[];
  for(const p of tags){const url=p.tag.match(/data-src="([^"]+)"/)?.[1];if(!url||!/icon-screen05-slider-[123]\.png$/.test(url)||candidates.some(a=>a.url===url))continue;
   const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok||new URL(r.url).hostname!=='i02.appmifile.com')throw Error('Invalid original');const bytes=Buffer.from(await r.arrayBuffer());if(bytes[0]!==0x89||bytes.length<1000)throw Error('Not a native PNG');
   const image=`/images/products/verified/${createHash('sha256').update(url).digest('hex').slice(0,24)}.png`;writeFileSync('public'+image,bytes);candidates.push({source,sourceTitle:html.match(/<title[^>]*>([^<]+)/)?.[1],url,image});
  }
  writeFileSync('.tmp-qa/xiaomi-additional/note-candidates.json',JSON.stringify(candidates,null,2)+'\n');console.log(candidates.length,'native slider images awaiting review');
 }
}
