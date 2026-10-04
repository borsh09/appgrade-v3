import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={source:string;sourceTitle:string;model:string;color:string;angle:string;image:string;url:string;connectivity?:string};
const ipad=process.argv.includes('--ipad');
const assets=JSON.parse(readFileSync(ipad?'data/apple-ipad-reviewed-photo-assets.json':'data/apple-accessory-reviewed-photo-assets.json','utf8')) as Asset[];
if(!Array.isArray(assets)||assets.some(a=>!a.model||!a.url||!a.image||!a.source))throw Error('Invalid reviewed asset manifest');
const file='data/verified-product-media.json';
const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
let count=0;
for(const record of raw){
 const item=presentCatalogItem(record as CatalogItem);
 if(item.sourceCategory!==(ipad?'iPad':'AirPods'))continue;
 const basic=item.sourceTitle==='AirPods 5';
 const pro=item.sourceTitle==='AirPods Pro 3';
 if(ipad?!/^iPad (?:Air (11|13) M[234]|Pro (11|13) M5|Mini 7|11) \d+(GB|TB) (Blue|Purple|Pink|Yellow|Starlight|Space Gray|Space Black|Silver) (Wi-Fi|LTE)$/.test(item.sourceTitle??''):!basic&&!pro&&!/^AirPods Max 2 (Midnight|Starlight|Orange|Blue|Purple)$/.test(item.sourceTitle??''))continue;
 const connection=/LTE|Cellular|5G/i.test(item.connectivity??'')?'Cellular':'Wi-Fi';
 const selected=assets.filter(a=>a.model===item.model&&a.color===(basic?'':item.color)&&(!ipad||a.connectivity===connection));
 selected.sort((a,b)=>Number(a.angle!=='Main')-Number(b.angle!=='Main'));
 if(!selected.length)continue;
 if(selected[0].angle!=='Main')throw Error(`Missing reviewed main: ${item.id}`);
 for(const a of selected){
  const air=item.model.match(/^iPad Air (11|13) (M[23])$/);
  const titleMatches=ipad?(
    item.model.endsWith('M4')&&a.sourceTitle.startsWith('Shop iPad Air; M4 chip')&&a.source==='https://www.apple.com/shop/buy-ipad/ipad-air'
    ||item.model.endsWith('M5')&&a.sourceTitle==='Shop iPad Pro; M5 chip'&&a.source==='https://www.apple.com/shop/buy-ipad/ipad-pro'
    ||item.model==='iPad Mini 7'&&a.sourceTitle.startsWith('Refurbished iPad Mini (A17 Pro) Wi-Fi ')
    ||item.model==='iPad 11 A16'&&a.sourceTitle==='Buy iPad; A16 chip'&&a.source==='https://www.apple.com/shop/buy-ipad/ipad'
    ||Boolean(air&&a.sourceTitle.startsWith(`Refurbished ${air[1]}-inch iPad Air (${air[2]}) Wi-Fi `))
  ):a.sourceTitle===`Buy ${item.model} - Apple`;
  if(new URL(a.source).hostname!=='www.apple.com'||new URL(a.url).hostname!=='store.storeimages.cdn-apple.com'||!titleMatches||!existsSync(`public${a.image}`))throw Error(`Invalid reviewed source: ${item.id}`);
  if(basic&&!a.source.endsWith('/without-wireless-charging-case'))throw Error('Charging case not selected');
 }
 manual[item.id]={image:selected[0].image,gallery:selected.map(a=>a.image),status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:selected[0].source,sourceTitle:`${selected[0].sourceTitle}; ${basic?'standard Charging Case (USB-C)':ipad?`${item.model}; ${item.color}; ${connection}`:item.color}`};
 console.log(item.id,item.sourceTitle);count++;
}
writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log(count,'reviewed Apple configurations applied');
