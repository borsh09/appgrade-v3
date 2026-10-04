import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';

// Explicit factory variants reviewed in the official store's product data.
// The first display is its studio product/kit image, not the lifestyle carousel.
const sources:[string,string,number,string][]=[
 ['P-21369421','x3',2118,'Paquete Estándar || No incluye microSD card'],
 ['P-20762972','x4',2994,'Paquete Estándar || No incluye microSD card'],
 ['P-35317103','x5',3885,'Negro medianoche || Paquete Estándar || No incluye microSD card'],
 ['P-16146874','x5',6116,'Blanco Satinado (Edición Limitada) || Paquete Estándar || No incluye microSD card'],
 ['P-87964145','x5',3886,'Negro medianoche || Paquete básico || No incluye microSD card'],
 ['P-67148720','x6',6921,'Negro medianoche || Paquete Estándar || No incluye microSD card'],
 ['P-35200406','x6',6922,'Negro medianoche || Paquete básico || No incluye microSD card'],
 ['P-98251528','ace-pro-2',3611,'Negro medianoche || Doble batería || Paquete Estándar'],
 ['P-37727638','go-ultra',6133,'Blanco ártico || Paquete de Creador || No incluye microSD card'],
 ['P-94480519','go-ultra',6119,'Cósmico Negro || Paquete de Creador || No incluye microSD card'],
 ['P-17609295','go-ultra',6132,'Blanco ártico || Paquete Estándar || No incluye microSD card'],
 ['P-86803284','go-ultra',6118,'Cósmico Negro || Paquete Estándar || No incluye microSD card'],
 ['P-24460912','go-3s',3130,'Cósmico Negro || 128 GB || Paquete Estándar'],
 ['P-94442640','go-3s',3135,'Blanco ártico || 128 GB || Paquete Estándar'],
 ['P-25403306','luna-series',6827,'Luna Ultra || Blanco Estelar || Paquete de Luz de Relleno'],
 ['P-57178400','luna-series',6828,'Luna Pro || Cósmico Negro || Paquete de Luz de Relleno'],
 ['P-23460961','luna-series',6767,'Luna Ultra || Cósmico Negro || Paquete Estándar'],
 ['P-23301663','luna-series',6810,'Luna Ultra || Blanco Estelar || Paquete Estándar'],
 ['P-36397601','luna-series',6817,'Luna Ultra || Blanco Estelar || Paquete de Creador'],
 ['P-30082307','link-2',3401,'Insta360 Link 2 || Negro grafito || Paquete Estándar'],
 ['P-80866531','link-2',6241,'Insta360 Link 2 || Blanco ártico || Paquete Estándar'],
 ['P-34284696','link-2',3403,'Insta360 Link 2C || Negro grafito || Paquete Estándar'],
 ['P-67973837','link-2',3863,'Insta360 Link 2C || Blanco ártico || Paquete Estándar'],
];
type Product={info:{name:string};commodities:{id:number;info:{name:string};displays:{urlL:string;url:string}[]}[]};
const file='data/verified-product-media.json';const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
mkdirSync('public/images/products/verified',{recursive:true});
for(const [id,key,commodityId,expectedName] of sources){try{
 const source=raw.find(item=>item.id===id);if(!source||source.sourceCategory!=='Экшн-камеры Insta360')throw new Error('Unknown catalog article');
 const item=presentCatalogItem(source as CatalogItem);
 if(id!=='P-36397601'&&manual[id]?.source?.includes('store.insta360.com')&&manual[id].referenceModel===item.model&&manual[id].referenceColor===item.color)continue;
 const product=JSON.parse(readFileSync(`.tmp-qa/insta/${key}.json`,'utf8')) as Product;
 const variant=product.commodities.find(variant=>variant.id===commodityId);
 if(variant?.info.name!==expectedName)throw new Error('Factory variant changed');
 // The full-size Creator layer omits the camera; use its complete factory composite.
 const url=id==='P-36397601'?variant.displays[0]?.url:variant.displays[0]?.urlL;
 if(!url||!['res.insta360.com','wassets.insta360.com'].includes(new URL(url).hostname))throw new Error('Missing original studio photo');
 const hash=createHash('sha256').update(url).digest('hex').slice(0,24);
 let image=['png','jpg','webp'].map(ext=>`/images/products/verified/${hash}.${ext}`).find(image=>existsSync(`public${image}`));
 if(!image){const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw new Error(`HTTP ${r.status}`);const bytes=Buffer.from(await r.arrayBuffer());
  const ext=bytes[0]===0x89?'png':bytes[0]===0xff?'jpg':bytes.toString('ascii',0,4)==='RIFF'?'webp':undefined;if(!ext||bytes.length<1000||bytes.length>15000000)throw new Error('Invalid original image');
  image=`/images/products/verified/${hash}.${ext}`;writeFileSync(`public${image}`,bytes);}
 manual[id]={image,gallery:[image],status:'verified',referenceModel:item.model,referenceColor:item.color,source:`https://store.insta360.com/product/${key}?c=${commodityId}`,sourceTitle:`${product.info.name}: ${variant.info.name}`};
 writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log(id,item.model,item.color);
 }catch(error){console.log(id,error instanceof Error?error.message:String(error));}}
