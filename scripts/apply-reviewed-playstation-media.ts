import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';

type Asset={source:string;alt:string;url:string;image:string};
const assets=JSON.parse(readFileSync('data/playstation-reviewed-photo-assets.json','utf8')) as Asset[];
// Exact manufacturer finishes and individually reviewed studio photographs.
const finishes:Record<string,string>={
 'Techno Red':'dualsense-techno-red-screenshot-', 'Rhythm Blue':'dualsense-rhythm-blue-screenshot-',
 'Chroma Teal':'dualsense-teal-screenshot-', 'Chroma Pearl':'dualsense-pearl-screenshot-',
 'Chroma Indigo':'dualsense-indigo-screenshot-', 'Sterling Silver':'dualsense-sterling-silver-screenshot-',
 'Cobalt Blue':'dualsense-cobalt-blue-screenshot-', 'Galactic Purple':'dualsense-galactic-purple-screenshot-',
 'Starlight Blue':'dualsense-starlight-blue-screenshot-', 'Cosmic Red':'dualsense-cosmic-red-screenshot-',
 'Midnight Black':'dualsense-midnight-black-screenshot-', 'White':'dualsense-white-screenshot-',
 'Camouflage':'dualsense-gray-camo-screenshot-',
 '007 First Light Limited Edition':'007-First-Light-LE-DualSense-image-block-',
 'Genshin Impact Limited Edition':'Genshin-Impact-LE-DualSense-image-block-',
};
const file='data/verified-product-media.json';
const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
let count=0;
for(const record of raw){
 const item=presentCatalogItem(record as CatalogItem);
 if(item.sourceCategory!=='PlayStation')continue;
 const title=item.sourceTitle??'';
 const finish=title.match(/^PS5 DualSense (.+)$/)?.[1]??(title==='PS5 DualSense Cobalt Blue'?'Cobalt Blue':undefined);
 let selected:Asset[]=[];
 if(title==='PS5 DualSense Edge White')selected=assets.filter(a=>a.url.includes('/DualSense-Edge-image-block-02-en-24aug22?'));
 else if(title==='PS5 DualSense Edge Midnight Black')selected=assets.filter(a=>a.url.includes('/DualsenseEdge-MidnightBlack-')&&!a.url.includes('-1x1-'));
 else if(title==='PS Portal White')selected=assets.filter(a=>a.url.includes('/ps-portal-remote-player-image-block-01-en-22aug23?'));
 else if(title==='PS Portal Black')selected=assets.filter(a=>a.url.includes('/ps-portal-remote-player-midnight-ui-image-block-02-en-24jan25?'));
 else if(finish&&finishes[finish])selected=assets.filter(a=>a.url.includes(`/`+finishes[finish]));
 if(!selected.length)continue;
 // Front views are primary. Reject promotional backgrounds and unrelated accessories.
 selected.sort((a,b)=>Number(!a.url.includes('screenshot-01'))-Number(!b.url.includes('screenshot-01')));
 if(finish==='White'){
  const front=assets.find(a=>a.url.includes('/dualsense-controller-image-block-01-ps5-26jun20?'));
  if(front)selected.unshift(front);
 }
 for(const a of selected)if(new URL(a.source).hostname!=='www.playstation.com'||new URL(a.url).hostname!=='gmedia.playstation.com'||/keyart|charging|hero/i.test(a.url)||!existsSync(`public${a.image}`))throw Error(`Unreviewed PlayStation asset: ${a.url}`);
 const gallery=selected.map(a=>a.image);
 manual[item.id]={image:gallery[0],gallery,status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:selected[0].source,sourceTitle:`${title}; official studio images: ${selected.map(a=>a.alt).join('; ')}`};
 console.log(item.id,title,gallery.length);count++;
}
writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log(count,'reviewed PlayStation configurations applied');
