import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
const report=JSON.parse(readFileSync('.tmp-qa/catalog-photo-quality.json','utf8'));
const owners=new Map();
for(const p of report.products)for(const [angle,a] of p.images.entries()){
 const row=owners.get(a.image)??{...a,owners:[]};row.owners.push({id:p.id,model:p.model,color:p.color,configuration:p.configuration,source:p.source,angle:angle+1});owners.set(a.image,row);
}
const rows=[...owners.values()];
const folder='.tmp-qa/full-photo-review';mkdirSync(folder,{recursive:true});
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(let offset=0;offset<rows.length;offset+=20){
 const composites=[];
 for(const [i,row] of rows.slice(offset,offset+20).entries()){
  const owner=row.owners[0],left=i%5*300,top=Math.floor(i/5)*310;
  const preview=await sharp(`public${row.image}`).resize(280,210,{fit:'contain',background:'#fafafa'}).png().toBuffer();composites.push({input:preview,left:left+10,top});
  const lines=[`${offset+i+1}. ${owner.model}`,`${owner.color} | view ${owner.angle} | ${row.width}x${row.height}`,owner.configuration,`${owner.id} (${row.owners.length} SKUs)`,row.image.split('/').at(-1)];
  const label=Buffer.from(`<svg width="300" height="100"><rect width="300" height="100" fill="#eee"/>${lines.map((s,j)=>`<text x="6" y="${17+j*17}" font-family="Arial" font-size="11">${esc(s).slice(0,68)}</text>`).join('')}</svg>`);
  composites.push({input:label,left,top:top+210});
 }
 const page=offset/20+1;
 await sharp({create:{width:1500,height:1240,channels:3,background:'#fafafa'}}).composite(composites).jpeg({quality:94}).toFile(`${folder}/page-${String(page).padStart(2,'0')}.jpg`);
}
writeFileSync(`${folder}/inventory.json`,JSON.stringify({total:report.total,available:report.available,missing:report.missing,rows},null,2)+'\n');
console.log(`${rows.length} original photos; ${Math.ceil(rows.length/20)} review pages. Catalog and originals unchanged.`);
