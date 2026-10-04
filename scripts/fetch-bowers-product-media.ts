import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';

type Picture={title:string;alt:string;absURL:string};
type Variation={product:{productName:string;images:{dynamic:Picture[]};variationAttributes:{id:string;displayValue:string;values:{id:string;displayValue:string;selected:boolean}[]}[]};productUrl:string};
const roots:Record<string,{file:string;id:string}>={Pi8:{file:'pi8',id:'300965'},Pi6:{file:'pi6',id:'300966'},'Px7 S2e':{file:'px7s2e',id:'300866'},'Px7 S3':{file:'px7s3',id:'301020'},Px8:{file:'px8',id:'300494'}};
const finishes:Record<string,string>={'Pi8|Black':'Anthracite Black','Pi8|White':'Dove White','Pi8|Blue':'Midnight Blue',
 'Pi6|Storm Gray':'Storm Grey','Pi6|Cloud Gray':'Cloud Grey','Pi6|Green':'Forest Green','Pi6|Blue':'Glacier Blue',
 'Px7 S2e|Black':'Anthracite Black','Px7 S2e|Gray':'Cloud Grey','Px7 S2e|Red':'Ruby Red',
 'Px7 S3|Black':'Anthracite Black','Px7 S3|White':'Canvas White','Px7 S3|Indigo Blue':'Indigo Blue',
 'Px8|Black':'Black','Px8|Tan':'Tan','Px8|Royal Burgundy':'Royal Burgundy'};
const file='data/verified-product-media.json';
const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
mkdirSync('public/images/products/verified',{recursive:true});
const inventories=new Map<string,{endpoint:URL;values:{id:string;displayValue:string}[]}>();
async function get(url:string):Promise<Response>{if(new URL(url).hostname!=='www.bowerswilkins.com')throw new Error('Unexpected source host');const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok||new URL(r.url).hostname!=='www.bowerswilkins.com')throw new Error(`HTTP ${r.status}`);return r;}
for(const item of raw.filter(item=>item.sourceCategory==='B&W Headphones').map(item=>presentCatalogItem(item as CatalogItem))){
 try{
  const model=item.model.replace(/^Bowers & Wilkins /,'');const root=roots[model];if(!root)throw new Error('Unknown exact model');
  const finish=finishes[`${model}|${item.color}`];if(!finish)throw new Error('Unknown factory finish');
  if(manual[item.id]?.referenceModel===item.model&&manual[item.id]?.referenceColor===item.color&&manual[item.id]?.source?.includes('bowerswilkins.com'))continue;
  let inventory=inventories.get(model);
  if(!inventory){
   const html=readFileSync(`.tmp-qa/bw/${root.file}.html`,'utf8');
   const endpoint=html.match(/data-url="([^"]+Product-Variation\?[^"]*color=[A-Z][^"]*)"/)?.[1]?.replaceAll('&amp;','&');if(!endpoint)throw new Error('No public variation endpoint');
   const data=await (await get(endpoint)).json() as Variation;
   inventory={endpoint:new URL(endpoint),values:data.product.variationAttributes.find(attribute=>attribute.id==='color')?.values??[]};inventories.set(model,inventory);
  }
  const value=inventory.values.find(value=>value.displayValue===finish);if(!value)throw new Error('Factory finish unavailable');
  const url=new URL(inventory.endpoint);url.searchParams.set(`dwvar_${root.id}_color`,value.id);
  const data=await (await get(url.href)).json() as Variation;
  if(data.product.productName!==model||data.product.variationAttributes.find(attribute=>attribute.id==='color')?.displayValue!==finish)throw new Error('Different model or selected finish');
  // The API's product.images belongs to this selected variant; surrounding
  // recommendations and lifestyle photos are outside this product field.
  const pictures=data.product.images.dynamic.slice(0,3);
  if(!pictures.length)throw new Error('No exact variant product photos');
  const gallery:string[]=[];
  for(const picture of pictures){
   const hash=createHash('sha256').update(picture.absURL).digest('hex').slice(0,24);
   let local=['png','jpg','webp'].map(ext=>`/images/products/verified/${hash}.${ext}`).find(path=>existsSync(`public${path}`));
   if(!local){const r=await get(picture.absURL);const bytes=Buffer.from(await r.arrayBuffer());const ext=bytes[0]===0x89?'png':bytes[0]===0xff?'jpg':bytes.toString('ascii',0,4)==='RIFF'?'webp':undefined;
    if(!ext||bytes.length<1000||bytes.length>15000000)throw new Error('Invalid factory photo');local=`/images/products/verified/${hash}.${ext}`;writeFileSync(`public${local}`,bytes);}
   gallery.push(local);
  }
  manual[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,source:data.productUrl,sourceTitle:`Bowers & Wilkins ${model}, ${finish}`};
  writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log(model,finish,gallery.length,'photos');
 }catch(error){console.log(item.id,error instanceof Error?error.message:String(error));}
}
