import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';

const pages:Record<string,string>={iphone17:'https://www.apple.com/shop/buy-iphone/iphone-17',iphone18pro:'https://www.apple.com/us-edu/shop/buy-iphone/iphone-18-pro',iphone16:'https://www.apple.com/shop/buy-iphone/iphone-16'};
const items=raw.filter(item=>item.sourceCategory==='iPhone'&&!/Active/i.test(item.priceAlias??'')).map(item=>presentCatalogItem(item as CatalogItem));
const file='data/verified-product-media.json';const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
mkdirSync('public/images/products/verified',{recursive:true});
const photos=new Map<string,{urls:{url:string;angle:string}[];source:string;model:string;color:string}>();
for(const [key,source] of Object.entries(pages)){
 const html=readFileSync(`.tmp-qa/apple-phones/${key}.html`,'utf8');
 if(!/<title[^>]*>[^<]*iPhone/i.test(html))throw new Error('Unexpected Apple product page');
 const urls=JSON.parse(readFileSync(`.tmp-qa/apple-phones/${key}-urls.json`,'utf8')) as string[];
 for(const url of urls){
  const match=url.match(/\/is\/(iphone-\d+(?:-pro(?:-max)?|-plus)?)-(?:finish-select-)?([a-z]+)-(?:select-)?(\d{6})(_AV[23]|_GEO_US)?\?/);
  if(!match||url.includes('\\'))continue;
  const model=match[1].replace('iphone','iPhone').replaceAll('-',' ').replace(/\bpro\b/g,'Pro').replace(/\bmax\b/g,'Max').replace(/\bplus\b/g,'Plus');
  const normalized=new URL(url.replaceAll('&amp;','&'));if(normalized.hostname!=='store.storeimages.cdn-apple.com')throw new Error('Unexpected photo host');
  const width=Number(normalized.searchParams.get('wid')),height=Number(normalized.searchParams.get('hei'));
  if(width<400||height<400)continue;
  const identity=`${model}|${match[2]}`;
  const group=photos.get(identity)??{urls:[],source,model,color:match[2]};
  const original=url.replaceAll('&amp;','&');if(!group.urls.some(photo=>photo.url===original))group.urls.push({url:original,angle:match[4]??''});
  photos.set(identity,group);
 }
}
for(const [key,photo] of photos){try{
 const matches=items.filter(item=>`${item.model}|${item.color.toLowerCase().replaceAll(' ','')}`===key);
 if(!matches.length)continue;
 if(!photo.urls.some(photo=>!photo.angle.startsWith('_AV')))continue;
 const gallery:string[]=[];
 const urls=photo.urls.sort((a,b)=>Number(a.angle.startsWith('_AV'))-Number(b.angle.startsWith('_AV'))).slice(0,3);
 for(const {url} of urls){
 const hash=createHash('sha256').update(url).digest('hex').slice(0,24);
 let image=['jpg','png','webp'].map(ext=>`/images/products/verified/${hash}.${ext}`).find(image=>existsSync(`public${image}`));
 if(!image){const response=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!response.ok||new URL(response.url).hostname!=='store.storeimages.cdn-apple.com')throw new Error(`Photo HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());const ext=bytes[0]===0xff?'jpg':bytes[0]===0x89?'png':bytes.toString('ascii',0,4)==='RIFF'?'webp':undefined;
  if(!ext||bytes.length<1000||bytes.length>15000000)throw new Error('Invalid original photo');image=`/images/products/verified/${hash}.${ext}`;writeFileSync(`public${image}`,bytes);}
 gallery.push(image);
 }
 for(const item of matches)manual[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,source:photo.source,sourceTitle:`${item.model}, ${item.color}`};
 writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log(photo.model,matches[0].color,matches.length,'articles');
}catch(error){console.log(key,error instanceof Error?error.message:String(error));}}
