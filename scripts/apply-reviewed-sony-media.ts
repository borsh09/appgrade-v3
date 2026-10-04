import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';
const candidates=['candidates','wf-native-candidates','extra-native-candidates','remaining-us-candidates','remaining-two-candidates','cameras-candidates'].flatMap(key=>JSON.parse(readFileSync(`.tmp-qa/sony/${key}.json`,'utf8'))) as {key:string;source:string;sourceTitle:string;url:string;file:string}[];
const reviews=[
 {id:'P-31193043',key:'wh6-pink',model:'Sony WH-1000XM6',color:'Pink',hash:'d6fd2973b32ffd98eb84ce19',ext:'webp',title:'Sand Pink',host:'electronics.sony.com'},
 {id:'P-36191416',key:'pulse-elite-black',model:'Sony Pulse Elite',color:'Black',hash:'5adb0f03e9540629f8f7f143',ext:'png',title:'Midnight Black',host:'www.playstation.com'},
 {id:'P-15920861',key:'pulse-elite-white',model:'Sony Pulse Elite',color:'White',hash:'c59d106f8c650fb5e9c2d1a6',ext:'png',title:'PULSE Elite',host:'www.playstation.com'},
 {id:'P-63445891',key:'wf5-pink',model:'Sony WF-1000XM5',color:'Pink',hash:'a888d596690b553dc6816539',ext:'png',title:'Smoky Pink',host:'www.sony.co.uk'},
 {id:'P-90098588',key:'wf5-silver',model:'Sony WF-1000XM5',color:'Silver',hash:'e1767dc58c44eef8be27dfeb',ext:'png',title:'Platinum Silver',host:'www.sony.co.uk'},
 {id:'P-73703809',key:'ult-white',model:'Sony WH-ULT900N',color:'White',hash:'10c706d4c8db54167dfe07b9',ext:'png',title:'Off White',host:'www.sony.co.uk'},
 {id:'P-29323609',key:'wf5-black',model:'Sony WF-1000XM5',color:'Black',hash:'c0e868d713cc70cc9350cfc8',ext:'webp',title:'Black',host:'electronics.sony.com'},
 {id:'P-73714677',key:'wh4-silver',model:'Sony WH-1000XM4',color:'Silver',hash:'bf8a8687c9e09b44b0b2304b',ext:'webp',title:'Silver',host:'electronics.sony.com'},
 {id:'P-81687744',key:'wh5-blue-us',model:'Sony WH-1000XM5',color:'Blue',hash:'c9fa9e2dbdbb77b6e8f17a7a',ext:'webp',title:'Midnight Blue',host:'electronics.sony.com'},
 {id:'P-27179231',key:'ult-black',model:'Sony WH-ULT900N',color:'Black',hash:'5b366141975588d47d8f168c',ext:'webp',title:'Black',host:'electronics.sony.com'},
 {id:'P-67947206',key:'ult-gray',model:'Sony WH-ULT900N',color:'Gray',hash:'4d8b05f84166511795774849',ext:'webp',title:'Forest Gray',host:'electronics.sony.com'},
 {id:'P-67876882',key:'wf6-silver',model:'Sony WF-1000XM6',color:'Silver',hash:'402f9c0a0e75bda1b1ed6cba',ext:'webp',title:'Platinum Silver',host:'electronics.sony.com'},
 {id:'P-60930163',key:'pulse3-black',model:'Sony Pulse 3D',color:'Black',hash:'98b238cbb5db99ef30c8fbdf',ext:'png',title:'Black PS5',host:'direct.playstation.com'},
 {id:'P-61821182',key:'a7iv-body',model:'Sony A7 IV Body',color:'Black',hash:'55a0ba05d91d17f2c9b69b0f',ext:'webp',title:'Alpha 7 IV',host:'electronics.sony.com',category:'Sony Photo'},
 {id:'P-95584001',key:'a7iii-body',model:'Sony A7 III Body',color:'Black',hash:'64bb5c3baa221f07e8c99dae',ext:'webp',title:'Alpha 7 III',host:'electronics.sony.com',category:'Sony Photo'},
 {id:'P-48195364',key:'a7c-body',model:'Sony A7C Body',color:'Black',hash:'1d8720c3b96df32b5a9c4b08',ext:'webp',title:'Alpha 7C',host:'electronics.sony.com',category:'Sony Photo'},
 {id:'P-59787343',key:'xperia7-black',model:'Sony Xperia 1 VII',color:'Black',hash:'2017f0bf45b53746aa385492',ext:'png',title:'Slate Black',host:'www.sony.co.uk',category:'Sony Phone'},
];
const file='data/verified-product-media.json';const media=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
const assets=[];
for(const r of reviews){
 const row=raw.find(p=>p.id===r.id);if(!row)throw Error('Sony SKU missing');
 const item=presentCatalogItem(row as CatalogItem);
 if(item.model!==r.model||item.color!==r.color||item.sourceCategory!==(r.category??'Sony Headphones'))throw Error('Sony identity changed: '+JSON.stringify(item));
 const a=candidates.find(a=>a.key===r.key);
 if(!a||a.file!==`.tmp-qa/sony/${r.hash}.${r.host==='www.sony.co.uk'||r.host==='direct.playstation.com'?'png':'img'}`||new URL(a.source).hostname!==r.host||!a.sourceTitle.includes(r.title))throw Error('Reviewed Sony original missing');
 if(r.key.startsWith('pulse-elite')&&!a.url.includes(`PulseEliteHeadset-${r.color==='Black'?'MidnightBlack':'White'}-01-16x9-`))throw Error('Pulse finish mismatch');
 const image=`/images/products/verified/${r.hash}.${r.ext}`;
 copyFileSync(a.file,'public'+image);
 media[item.id]={image,gallery:[image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:a.source,sourceTitle:a.sourceTitle};
 assets.push({...a,image,model:item.model,color:item.color});
 console.log(item.id,item.model,item.color,'reviewed original');
}
writeFileSync('data/sony-reviewed-photo-assets.json',JSON.stringify(assets,null,2)+'\n');
writeFileSync(file,JSON.stringify(media,null,2)+'\n');
