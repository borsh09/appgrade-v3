import { readFile, writeFile } from 'node:fs/promises';
const categories = {iphone:'iphones',samsung:'samsung',ipad:'ipads',watch:'watches',xiaomi:'xiaomi',playstation:'playstation'};
for (const [name,category] of Object.entries(categories)) {
  const path=`components/catalog/${name}-catalog-page.tsx`;
  const text=await readFile(path,'utf8');
  if(text.includes("import { UnifiedCatalog }")) continue;
  const component=text.match(/export function (\w+)\(/)[1];
  const start=text.indexOf('<main',text.indexOf(`export function ${component}`));
  const selector=text.slice(start).match(/<section\s+className="retail-model-selector/);
  const end=selector ? start+selector.index : -1;
  if(start<0||end<0) throw new Error(`Cannot preserve hero in ${path}`);
  const hero=text.slice(start,end);
  await writeFile(path,`'use client';\nimport Image from 'next/image';\nimport Link from '@/components/shared/safe-link';\nimport { ChevronDown, MapPin } from 'lucide-react';\nimport { useCity } from '@/components/providers/city-provider';\nimport { UnifiedCatalog } from './unified-catalog';\nexport function ${component}(){const { city }=useCity();return (${hero}<UnifiedCatalog category="${category}" /></div></main>);}\n`);
  const route=`app/catalog/${category}/page.tsx`;
  let source=await readFile(route,'utf8');
  source=source.replace(/import \{ AdditionalProducts \}[^\n]+\n/,'').replace(/<AdditionalProducts[^>]+\/>/g,'');
  await writeFile(route,source);
}
const route='app/catalog/[model]/page.tsx';
let text=await readFile(route,'utf8');
text=`import { selectProduct } from '@/lib/product-selection';\n`+text;
text=text.replace('    storage?: string;', '    sku?: string;\n    configuration?: string;\n    connectivity?: string;\n    storage?: string;');
const start=text.indexOf('  const additional =');
const end=text.indexOf('  const xiaomiVariants',start);
text=text.slice(0,start)+`  const legacy = additionalCatalog.find(item => item.legacySlug === params.model && item.legacySlug !== item.modelSlug);
  const candidates = catalogItems.filter(item => item.modelSlug === (legacy?.modelSlug ?? params.model));
  const target = selectProduct(candidates, legacy ? { ...searchParams, sku: searchParams.sku ?? legacy.id } : searchParams);
  if (!target) notFound();
  if (target.priceAlias) return <AdditionalProductPage selected={target} variants={candidates} />;
`+text.slice(end);
text=text.replace(/(\w+)\.find\([\s\S]*?\) \?\? \1\[0\]/g,(match,list)=> {
  // Only route selection expressions, never catalog metadata/legacy lookup.
  return list.endsWith('Variants')||list==='variants' ? `${list}.find(sku => sku.id === target.id)!` : match;
});
await writeFile(route,text);
