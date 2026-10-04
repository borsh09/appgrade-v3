import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={source:string;sourceTitle:string;model:string;color:string;angle:string;url:string;image:string};
const assets=JSON.parse(readFileSync('data/nintendo-reviewed-photo-assets.json','utf8')) as Asset[];
const manualFile='data/verified-product-media.json';
const manual=JSON.parse(readFileSync(manualFile,'utf8')) as Record<string,ProductMedia>;
let count=0;
for(const record of raw){
 if(record.sourceCategory!=='Console Nintendo')continue;
 const finish=record.sourceTitle==='Nintendo Switch OLED White'?'White':record.sourceTitle==='Nintendo Switch OLED Neon'?'Neon Blue/Neon Red':undefined;
 if(!finish)continue;
 const selected=assets.filter(a=>a.model==='Nintendo Switch OLED'&&a.color===finish).sort((a,b)=>Number(a.angle!=='Main')-Number(b.angle!=='Main'));
 if(selected.length!==4||selected[0].angle!=='Main')throw Error('Incomplete reviewed Nintendo gallery');
 const slug=finish==='White'?'white-set':'neon-blue-neon-red-set';
 for(const a of selected){
  if(a.source!==`https://www.nintendo.com/es-mx/store/products/nintendo-switch-oled-model-${slug}/`||new URL(a.url).hostname!=='assets.nintendo.com'||!a.sourceTitle.startsWith(`Nintendo Switch - OLED Model ${finish} - Hardware`)||/box-?art/.test(a.url)||!existsSync(`public${a.image}`))throw Error(`Unreviewed Nintendo source: ${a.url}`);
 }
 const item=presentCatalogItem(record as CatalogItem);const gallery=selected.map(a=>a.image);
 manual[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:selected[0].source,sourceTitle:`${selected[0].sourceTitle}; ${finish}; standard console, matching dock and Joy-Con controllers`};
 console.log(item.id,record.sourceTitle);count++;
}
if(count!==2)throw Error('Expected both reviewed OLED console finishes');
writeFileSync(manualFile,JSON.stringify(manual,null,2)+'\n');
