import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={model:string;color:string;source:string;sourceTitle:string;url:string;image:string};
const candidates=JSON.parse(readFileSync('.tmp-qa/oneplus/candidates.json','utf8')) as Asset[];
const reviews=[
 {ids:['P-84018625'],model:'OnePlus Buds 4',color:'Green',hash:'7541e744f4a507c1b7f3e406'},
 {ids:['P-24853785'],model:'OnePlus Buds 4',color:'Gray',hash:'e0e3f91df75698bc96b19597'},
 {ids:['P-17330044','P-56157882'],model:'OnePlus 13S',color:'Green',hash:'e73bc67ff6fce5e67938ec06'},
 {ids:['P-55135873','P-93888117'],model:'OnePlus 13S',color:'Black',hash:'4ae7d9c29f5e6793d8464404'},
 {ids:['P-44928460','P-36413476'],model:'OnePlus Pad 4',color:'Dune Glow',hash:'bfc8a7773a0da4d1ae23941a'},
 {ids:['P-43152462','P-16286541'],model:'OnePlus Pad 4',color:'Sage Mist',hash:'150bc79e5c2d58674f2746aa'},
 {ids:['P-77750663'],model:'OnePlus Nord CE6',color:'Blue',hash:'11d5484cc706fe0680342a52'},
 {ids:['P-93185381'],model:'OnePlus Nord CE6',color:'Black',hash:'7dbd572c455de5199878259e'},
 {ids:['P-15695036'],model:'OnePlus Nord Buds 4 Pro',color:'Black',hash:'3d45e4496f36dc29933c62d1'},
 {ids:['P-11176928'],model:'OnePlus Nord Buds 4 Pro',color:'Gray',hash:'04d58ba427b05b27956cdc12'},
 {ids:['P-44401203'],model:'OnePlus Buds Pro 3',color:'Midnight',hash:'c50808404a4892e8c65b4c4d'},
 {ids:['P-66941046'],model:'OnePlus Buds Pro 3',color:'Blue',hash:'49938fe81632ed109b809b63'},
 {ids:['P-24811810'],model:'OnePlus Nord CE5',color:'Black',hash:'d2590ee992be2847bb5eecfe'},
 {ids:['P-88749856'],model:'OnePlus Nord CE5',color:'Marble Mist',hash:'71905d590830da00dd040344'},
 {ids:['P-99416334'],model:'OnePlus 15',color:'Sand',hash:'248537a1715f1242ebf8fd28'},
 {ids:['P-83351715'],model:'OnePlus Nord 5',color:'Gray',hash:'3db24e2ddb5bf44fafee786e'},
 {ids:['P-90741096'],model:'OnePlus Nord 6',color:'Mint',hash:'a448dd6f2724cb7367f94d42'},
 {ids:['P-61875586'],model:'OnePlus Nord 6',color:'Black',hash:'f7142e8e97682f436c7e0b88'},
 {ids:['P-37450200'],model:'OnePlus 15T',color:'White',hash:'3ef7535e94dbe57a54e60319'},
 {ids:['P-61984375'],model:'OnePlus 15T',color:'Green',hash:'fe793a2ebe034b9e81b05a21'},
 {ids:['P-80652231'],model:'OnePlus 15T',color:'Brown',hash:'2f768cdc0c1e1c70eee8a877'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
// The European slim Nord 5 and the unspecified supplier variant must not share
// a body photo until the latter's exterior is independently confirmed.
if(media['P-10066922']?.image==='/images/products/verified/3db24e2ddb5bf44fafee786e.png')delete media['P-10066922'];
for(const review of reviews){
 const a=candidates.find(a=>a.image===`/images/products/verified/${review.hash}.png`);
 const nativeHost=a&&new URL(a.url).hostname;
 const nativePath=a&&new URL(a.url).pathname;
 const validAsset=a&&(review.model==='OnePlus Buds Pro 3'?nativeHost==='oasis.opstatics.com'&&nativePath?.includes('/oneplus-buds-pro-3/'):nativeHost===new URL(a.source).hostname&&/\/specs?\//.test(nativePath??''));
 const expectedTitle=review.model==='OnePlus 15T'?'一加 15t 参数规格':review.model.toLowerCase()+' specs';
 if(!a||a.model!==review.model||a.color!==review.color||a.sourceTitle.toLowerCase()!==expectedTitle||!['www.oneplus.com','www.oneplus.in'].includes(new URL(a.source).hostname)||!validAsset||!existsSync('public'+a.image))throw Error('Reviewed OnePlus original changed');
 for(const id of review.ids){
  const row=raw.find(row=>row.id===id);if(!row)throw Error('OnePlus SKU missing');const item=presentCatalogItem(row as CatalogItem);
  if(item.model!==review.model||item.color!==review.color)throw Error('OnePlus identity changed');
  media[item.id]={image:a.image,gallery:[a.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};console.log(item.id,item.model,item.color);
 }
 assets.push(a);
}
writeFileSync('data/oneplus-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
