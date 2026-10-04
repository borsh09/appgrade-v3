import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
type Asset={key:string;source:string;url:string;file:string;width:number;height:number};
const candidates=JSON.parse(readFileSync('.tmp-qa/honor/cmf-candidates.json','utf8')) as Asset[];
const reviews=[
 {ids:['P-10614867','P-95326251','P-20289297'],model:'Honor 400',color:'Black',label:'Midnight Black',key:'400',hashes:['13391e3fb25e02ace2ac9b58'],factoryColor:'black'},
 {ids:['P-81685040'],model:'Honor 400',color:'Blue',label:'Tidal Blue',key:'400',hashes:['4b3153f6ef64808fba8fd94f'],factoryColor:'blue'},
 {ids:['P-74408700'],model:'Honor 400',color:'Gold',label:'Desert Gold',key:'400',hashes:['3864b865140b5d55448cffcf'],factoryColor:'gold'},
 {ids:['P-84292004','P-91955905'],model:'Honor 400',color:'Gray',label:'Космический серый',key:'400',hashes:['63ca3c90f3e9dcfd1753777b'],factoryColor:'silver'},
 {ids:['P-16479137'],model:'Honor 500 Pro',color:'Black',label:'曜石黑',key:'500-pro',hashes:['f2e65397c255bb76b5bac167','cddd1036c8a7327f36286c51'],factoryColor:'black'},
 {ids:['P-73041458'],model:'Honor 500 Pro',color:'Silver',label:'月光银',key:'500-pro',hashes:['e38ec7987a23b79506011199','ad5623ef0dd6aa88e8b64c09'],factoryColor:'white'},
 {ids:['P-92831632'],model:'Honor 500 Pro',color:'Blue',label:'海蓝宝',key:'500-pro',hashes:['3d7693941707c67e76071e18','ee4be05cc79d847fd40fa34e'],factoryColor:'blue'},
 {ids:['P-26391841'],model:'Honor 500 Pro',color:'Pink',label:'星光粉',key:'500-pro',hashes:['d8478555298b1c37ef53edb4','8033a259f19fe3332799489b'],factoryColor:'pink'},
];
const file='data/verified-product-media.json',media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>,assets:Asset[]=[];
for(const review of reviews){
 const gallery:string[]=[];
 for(const [i,hash] of review.hashes.entries()){
  const a=candidates.find(a=>a.file===`/images/products/verified/${hash}.png`);
  const source=`https://www.honor.com/${review.key==='400'?'global':'cn'}/phones/honor-${review.key}/`;
  const name=review.key==='400'?`honor400-cmf-phone-${review.factoryColor}@2x.png`:`honor500series-cmf-phone-${review.factoryColor}-${i+1}@2x.png`;
  if(!a||a.key!==review.key||a.source!==source||new URL(a.url).hostname!=='www-file.honor.com'||!new URL(a.url).pathname.includes(`/honor-${review.key}/`)||!a.url.endsWith(`/section-cmf/${name}`)||createHash('sha256').update(a.url).digest('hex').slice(0,24)!==hash||!existsSync('public'+a.file))throw Error('Reviewed Honor source changed');
  const m=await sharp('public'+a.file).metadata();const expected=review.key==='400'?[['Blue','Gray'].includes(review.color)?601:600,1644]:i===0?[1220,1817]:[review.color==='Pink'?294:292,794];
  if(m.width!==expected[0]||m.height!==expected[1]||a.width!==m.width||a.height!==m.height)throw Error('Honor native dimensions changed');
  gallery.push(a.file);assets.push(a);
 }
 for(const id of review.ids){const r=raw.find(r=>r.id===id);if(!r)throw Error('Honor SKU missing');const item=presentCatalogItem(r as CatalogItem);if(item.model!==review.model||item.color!==review.color||item.configuration)throw Error('Honor configuration changed');
  let source=assets.at(-1)!.source;
  if(review.color==='Gray'){const h=readFileSync('.tmp-qa/honor/400-by.html','utf8');if(!h.includes(assets.at(-1)!.url)||!h.includes('alt="Космический серый - 1"'))throw Error('Factory Russian grey identity missing');source='https://www.honor.com/by-ru/phones/honor-400/';}
  media[id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source,sourceTitle:`${review.model} ${review.label}`};console.log(id,item.model,item.color);
 }
}
const white600=JSON.parse(readFileSync('.tmp-qa/honor/600-candidates.json','utf8')) as Asset[];
const factory600=JSON.parse(readFileSync('.tmp-qa/honor/600-gallery.json','utf8')).data;
const whiteSku=factory600.sbomList.find((s:{gbomAttrList:{attrName:string;attrValue:string}[]})=>s.gbomAttrList.some(a=>a.attrName==='Colour'&&a.attrValue==='Golden White'));
if(factory600.name!=='HONOR 600 Pro'||!whiteSku)throw Error('Honor 600 Pro factory identity changed');
const gallery600:string[]=[];
for(const hash of ['d4347290611be329de602150','83992ee968687daca24f5deb']){
 const a=white600.find(a=>a.file===`/images/products/verified/${hash}.png`);
 if(!a||a.source!=='https://www.honor.com/uk/phones/honor-600-pro/buy/'||new URL(a.url).hostname!=='img02.honorfile.com'||createHash('sha256').update(a.url).digest('hex').slice(0,24)!==hash||!whiteSku.groupPhotoList.some((p:{photoPath:string;photoName:string;altText:string})=>factory600.imageHost+p.photoPath+'800_800_'+p.photoName===a.url&&/front view|rear view/.test(p.altText)))throw Error('Reviewed Honor 600 Pro source changed');
 const m=await sharp('public'+a.file).metadata();if(m.width!==800||m.height!==800||!m.hasAlpha)throw Error('Honor 600 Pro native photo changed');gallery600.push(a.file);assets.push(a);
}
for(const id of ['P-46961512','P-80935279']){
 const r=raw.find(r=>r.id===id);if(!r)throw Error('Honor 600 Pro SKU missing');const item=presentCatalogItem(r as CatalogItem);if(item.model!=='Honor 600 Pro'||item.color!=='White'||item.configuration)throw Error('Honor 600 Pro configuration changed');
 media[id]={image:gallery600[0],gallery:gallery600,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:white600[0].source,sourceTitle:'HONOR 600 Pro Golden White'};console.log(id,item.model,item.color);
}
writeFileSync('data/honor-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');writeFileSync(file,JSON.stringify(media,null,2)+'\n');
