import { readFile, writeFile, readdir } from 'node:fs/promises';
for(const file of await readdir('components/catalog')){
  if(!file.endsWith('-product-page.tsx') || file==='supplemental-product-page.tsx') continue;
  const path=`components/catalog/${file}`;
  let text=await readFile(path,'utf8');
  const start=text.indexOf('<div className="product-options">');
  if(start>=0){
    let depth=0,end=-1;
    const tags=text.slice(start).matchAll(/<div\b[^>]*>|<\/div>/g);
    for(const tag of tags){depth+=tag[0].startsWith('</')?-1:1;if(depth===0){end=start+tag.index+tag[0].length;break;}}
    if(end<0) throw new Error(path);
    text=text.slice(0,start)+'<ProductVariants selectedId={selected.id} />'+text.slice(end);
    text=text.replace("'use client';","'use client';\nimport { ProductVariants } from './product-variants';");
  }
  // Next/Image serves responsive, cached images instead of full-size originals.
  text=text.replace(/\s+unoptimized(?=\s|\/?>)/g,'');
  await writeFile(path,text);
}
let text=await readFile('data/search-index.ts','utf8');
text="import { productHref } from '@/lib/product-selection';\n"+text;
text=text.replace(/href: `\/catalog\/[^`]+`/g,'href: productHref(item)');
await writeFile('data/search-index.ts',text);
