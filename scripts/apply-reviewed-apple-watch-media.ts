import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import raw from '../data/new-price-catalog.json';
import {presentCatalogItem} from '../lib/catalog-presentation';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';
import type {ProductMedia} from '../lib/catalog-media';

type Candidate={ids:string[];image:string;source:string;sourceTitle:string;title?:string;path?:string;catalogSourceTitle?:string};
const candidates=JSON.parse(readFileSync(process.argv.includes('--refurb')?'.tmp-qa/apple-refurb/watch-photo-candidates.json':'.tmp-qa/apple-phones/watch-photo-candidates.json','utf8')) as Candidate[];
const reviewed=JSON.parse(readFileSync('data/apple-watch-reviewed-photo-assets.json','utf8')) as string[];
const items=raw.map(item=>presentCatalogItem(item as CatalogItem));
const file='data/verified-product-media.json';
const manual=JSON.parse(readFileSync(file,'utf8')) as Record<string,ProductMedia>;
let count=0;
for(const c of candidates){
 if(!reviewed.includes(c.image)||!existsSync(`public${c.image}`))continue;
 if(new URL(c.source).hostname!=='www.apple.com'||(c.title?!c.sourceTitle.startsWith(c.title):!c.sourceTitle.startsWith('Refurbished Apple Watch')))throw Error('Unconfirmed source');
 for(const id of c.ids){
  const item=items.find(i=>i.id===id);if(!item)throw Error(`Unknown watch: ${id}`);
  if(c.catalogSourceTitle&&c.catalogSourceTitle!==item.sourceTitle)throw Error(`Changed source configuration: ${id}`);
  const title=c.title??c.sourceTitle;
  const size=item.size?.match(/\d+/)?.[0];
  const factoryModel=item.model.replace(/\bSE(\d+)\b/,'SE $1');
  if(!size||!title.includes(`${size}mm`)||!title.includes(factoryModel))throw Error(`Watch identity mismatch: ${id}`);
  const configuration=item.configuration??'';
  const titanium=/\bTi\b/.test(configuration);
  const ultra=item.sourceTitle?.match(/^Ultra \d+ 49mm (Natural|Black) Ti (Gray|Black|Blue|Desert|Burgundy|Natural|Sand) (Ocean Band|Alpine Loop|Milanese Loop|Trail Loop)(?: (Small|Medium|Large|S\/M|M\/L))?$/);
  const finish=ultra?`${ultra[1]} Titanium`:item.sourceTitle?.includes('Jet Black')?'Jet Black Aluminum':titanium?(configuration.includes('Natural')?'Natural Titanium':'Radiant Gold Titanium'):({Gold:'Light Gold Aluminum',Black:'Black Aluminum','Space Gray':'Space Gray Aluminum','Rose Gold':'Rose Gold Aluminum',Silver:'Silver Aluminum',Midnight:'Midnight Aluminum',Starlight:'Starlight Aluminum'} as Record<string,string>)[item.color]??(configuration.includes('Bronze')?'Dark Bronze Aluminum':'');
  if(!finish||!title.includes(finish))throw Error(`Watch finish mismatch: ${id}`);
  for(const length of ['S/M','M/L','Small','Medium','Large'])if(configuration.includes(length)&&!title.endsWith(` - ${length}`)&&!title.includes(`Case with ${length} `))throw Error(`Watch band length mismatch: ${id}`);
  if(ultra){const [, ,color,type]=ultra;const oceanColor=item.model.endsWith(' 3')?(color==='Blue'?'Anchor Blue':color):`Translucent ${color}`;const factoryBand=type==='Ocean Band'?`${oceanColor} ${type}`:type==='Milanese Loop'?`${color} Titanium ${type}`:`${color} ${type}`;if(!title.includes(factoryBand))throw Error(`Ultra band finish mismatch: ${id}`);}
  const band=['Milanese Loop','Sport Band','Ocean Band','Alpine Loop','Trail Loop'].find(b=>configuration.includes(b))??'';
  if(!band||!title.includes(band))throw Error(`Watch band mismatch: ${id}`);
  manual[id]={image:c.image,gallery:[c.image],status:'verified',referenceModel:item.model,referenceColor:item.color,referenceAppearance:mediaAppearance(item),source:c.source,sourceTitle:c.sourceTitle};count++;
 }
}
writeFileSync(file,JSON.stringify(manual,null,2)+'\n');console.log(count,'reviewed watch configurations applied');
