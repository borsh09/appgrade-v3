import {readFileSync,writeFileSync} from 'node:fs';
const report=JSON.parse(readFileSync('.tmp-qa/catalog-photo-quality.json','utf8'));
const file='data/product-media-exclusions.json';
const excluded=JSON.parse(readFileSync(file,'utf8'));
const reviewed=[...new Set(report.products.filter(p=>/^iPad Air (11|13) M4$/.test(p.model)).flatMap(p=>p.images.filter(i=>i.width===400&&i.height===400&&/\/view-[23]\.jpg$/.test(i.image)).map(i=>i.image)))];
if(reviewed.length!==16)throw Error('Reviewed iPad gallery inventory changed; inspect before applying');
for(const image of reviewed)excluded[image]='Quality review: 400x400 secondary angle loses detail in the product gallery. The exact 1400px main photograph is retained; replace this angle only with a reviewed larger manufacturer original.';
for(const image of reviewed){
 const products=report.products.filter(p=>p.images.some(i=>i.image===image));
 if(products.some(p=>p.images[0].image===image||Math.max(p.images[0].width,p.images[0].height)<1000))throw Error('Reviewed iPad main changed');
}
writeFileSync(file,JSON.stringify(excluded,null,2)+'\n');console.log(reviewed.length,'reviewed weak secondary photos excluded without altering originals');
