'use client';
import Link from '@/components/shared/safe-link';
import { catalogItems, normalizeProductName } from '@/lib/catalog-registry';
import { optionHref, variantFields } from '@/lib/product-selection';
const labels = {storage:'Память',ram:'Оперативная память',color:'Цвет',sim:'SIM',size:'Размер',connectivity:'Связь',configuration:'Версия'};
export function ProductVariants({ selectedId }: { selectedId: string }) {
  const selected = catalogItems.find(item=>item.id===selectedId);
  if(!selected) return null;
  const variants=catalogItems.filter(item=>item.modelSlug===selected.modelSlug);
  return <div className="product-options">{variantFields.map(key=> {
    const values=[...new Map(variants.filter(item=>item[key] && item[key]!=='—').map(item=>[normalizeProductName(item[key]!),item[key]!])).values()];
    if(!values.length) return null;
    return <div className="product-option" key={key}><div className="product-option-head"><span>{labels[key]}</span><b>{selected[key] || 'Не указан'}</b></div><div className="product-option-values">{values.map(value=> <Link key={value} href={optionHref(variants,selected,key,value)!} className={normalizeProductName(value)===normalizeProductName(selected[key]??'')?'selected':''}>{value}</Link>)}</div></div>;
  })}</div>;
}
