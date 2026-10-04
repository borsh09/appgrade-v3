import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={source:string;sourceTitle:string;model:string;color:string;finish:string;angle:string;image:string;url:string};
const assets=JSON.parse(readFileSync('data/beats-reviewed-photo-assets.json','utf8')) as Asset[];
const reviews=[
 {id:'P-20243676',model:'Beats Powerbeats Pro 2',color:'Sand',finish:'Quick Sand',part:'MX733',count:4},
 {id:'P-80718734',model:'Beats Powerbeats Pro 2',color:'Purple',finish:'Hyper Purple',part:'MX753',count:4},
 {id:'P-90320676',model:'Beats Powerbeats Pro 2',color:'Orange',finish:'Electric Orange',part:'MX743',count:4},
 {id:'P-43704483',model:'Beats Solo 4',color:'Pink',finish:'Cloud Pink',part:'MUW33',count:5},
];
const file='data/verified-product-media.json';const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
for(const r of reviews){
 const row=raw.find(p=>p.id===r.id);if(!row)throw Error('Reviewed Beats SKU missing');
 const item=presentCatalogItem(row as CatalogItem);
 if(item.sourceCategory!=='Beats Headphones'||item.model!==r.model||item.color!==r.color)throw Error('Beats model or finish mapping changed');
 const selected=assets.filter(a=>a.model===r.model&&a.color===r.color).sort((a,b)=>(a.angle==='Main'?-1:b.angle==='Main'?1:a.angle.localeCompare(b.angle)));
 if(selected.length!==r.count||selected[0].angle!=='Main')throw Error('Reviewed studio gallery incomplete');
 for(const a of selected){
  const allowed=r.model==='Beats Solo 4'?['Main','Detail 2','Detail 3','Detail 5','Detail 6']:['Main','Detail 2','Detail 3','Detail 5'];
  if(!allowed.includes(a.angle)||a.finish!==r.finish||!a.sourceTitle.includes(r.finish)||new URL(a.source).hostname!=='www.apple.com'||!new URL(a.source).pathname.toUpperCase().includes(r.part+'LL/A')||new URL(a.url).hostname!=='store.storeimages.cdn-apple.com'||!new URL(a.url).pathname.split('/').at(-1)?.startsWith(r.part)||!existsSync('public'+a.image))throw Error('Unreviewed or wrong-finish Beats original');
 }
 media[item.id]={image:selected[0].image,gallery:selected.map(a=>a.image),status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:selected[0].source,sourceTitle:selected[0].sourceTitle};
 console.log(item.id,item.model,item.color,selected.length,'reviewed originals');
}
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
