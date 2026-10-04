import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={source:string;sourceTitle:string;model:string;storage:string;angle:string;url:string;image:string};
const assets=JSON.parse(readFileSync('data/quest-reviewed-photo-assets.json','utf8')) as Asset[];
const file='data/verified-product-media.json';
const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const record=raw.find(r=>r.id==='P-78723441');
if(!record||record.sourceCategory!=='Oculus Quest')throw Error('Quest 3S SKU not found');
const item=presentCatalogItem(record as CatalogItem);
if(item.model!=='Oculus Quest 3S'||parseInt(item.storage??'',10)!==128||item.configuration)throw Error('Unexpected Quest configuration');
const selected=[...assets].sort((a,b)=>Number(a.angle!=='Main')-Number(b.angle!=='Main'));
if(selected.length!==5||selected[0].angle!=='Main')throw Error('Incomplete reviewed Quest gallery');
for(const a of selected){
 if(a.model!=='Meta Quest 3S'||a.storage!=='128 GB'||a.source!=='https://www.meta.com/quest/quest-3s/buy-now/'||a.sourceTitle!=='Meta Quest 3S; selected 128 GB; factory product carousel'||new URL(a.url).hostname!=='lookaside.fbsbx.com'||!existsSync(`public${a.image}`))throw Error('Unreviewed Quest original');
}
const gallery=selected.map(a=>a.image);
manual[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:selected[0].source,sourceTitle:selected[0].sourceTitle};
writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log(item.id,'exact Quest 3S 128 GB gallery applied');
