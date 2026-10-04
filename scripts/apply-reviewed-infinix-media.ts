import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={model:string;color:string;source:string;sourceTitle:string;variantId:number;variantTitle:string;url:string;image:string;width:number;height:number};
const candidates=JSON.parse(readFileSync('.tmp-qa/tecno-infinix/edge-candidates.json','utf8')) as Asset[];
const reviews=[
 {id:'P-41164176',color:'Blue',label:'Stellar Blue',variantId:51945575219476,hash:'1b403cdc6cfb69f5470b08e3'},
 {id:'P-21605405',color:'Green',label:'Silk Green',variantId:51945575350548,hash:'4d9135e274d108be153e489d'},
 {id:'P-22413738',color:'Titanium',label:'Lunar Titanium',variantId:51945575285012,hash:'3e560235806067e00375baa9'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const a=candidates.find(a=>a.image===`/images/products/verified/${review.hash}.png`);
 if(!a||a.model!=='Infinix Note Edge'||a.color!==review.color||a.variantId!==review.variantId||a.variantTitle!==`${review.label} / 8GB/128GB`||!a.sourceTitle.includes('Note Edge')||new URL(a.source).hostname!=='infinixmobiles.in'||new URL(a.source).searchParams.get('variant')!==String(review.variantId)||new URL(a.url).hostname!=='infinixmobiles.in'||a.width!==2000||a.height!==2000||!existsSync('public'+a.image))throw Error('Reviewed Infinix original changed');
 const row=raw.find(row=>row.id===review.id);if(!row)throw Error('Infinix SKU missing');const item=presentCatalogItem(row as CatalogItem);
 const finish=item.color||(item.configuration==='Titanium'?'Titanium':'');
 if(item.model!=='Infinix Note Edge'||finish!==review.color)throw Error('Infinix identity changed');
 media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};assets.push(a);console.log(item.id,item.model,finish);
}
writeFileSync('data/infinix-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
