'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { catalogItems, itemConfiguration } from '@/lib/catalog-registry';
import { productHref } from '@/lib/product-selection';
import { usePricedCatalog } from '@/components/providers/price-provider';
import { AddToCartButton, FavoriteButton } from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
export function UnifiedCatalog({ category }: { category: string }) {
  const catalog = usePricedCatalog(catalogItems);
  const [model, setModel] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid'|'list'>('grid');
  const items = useMemo(() => catalog.filter(item => item.category === category), [catalog, category]);
  const models = [...new Map(items.map(item => [item.modelSlug, item.model])).entries()];
  const filtered = items.filter(item => (!model || item.modelSlug === model) && `${item.model} ${itemConfiguration(item)}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => {
    if (sort === 'popular') return 0;
    if (a.price === null) return b.price === null ? 0 : 1;
    if (b.price === null) return -1;
    return sort === 'asc' ? a.price - b.price : b.price - a.price;
  });
  return <>
    <section className="retail-model-selector" aria-label="Модели"><button className={!model ? 'is-active' : ''} onClick={() => setModel('')}><span>Все модели</span><small>{items.length} вариантов</small></button>{models.map(([slug,name]) => <button key={slug} className={model===slug ? 'is-active' : ''} onClick={() => setModel(slug)}><span>{name}</span><small>{items.filter(item => item.modelSlug === slug).length} вариантов</small></button>)}</section>
    <section className="retail-toolbar"><label>Поиск <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Модель, память, цвет" /></label><p role="status">{filtered.length} вариантов</p><div className="retail-toolbar-right"><label>Порядок <select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">По умолчанию</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option></select></label><button onClick={()=>setView(view==='grid'?'list':'grid')}>{view==='grid'?'Список':'Плитка'}</button></div></section>
    <section className={`retail-products retail-products-${view}`} aria-label="Товары">{filtered.map(item => {
      const product = {id:item.id,name:item.model,configuration:itemConfiguration(item),price:item.price??0,image:item.image,href:productHref(item)};
      return <article className={`retail-product-card retail-product-card-${view}`} key={item.id}><div className="retail-product-media"><Link href={product.href}><Image src={item.image} alt={`${item.model} ${item.color}`} fill sizes="(max-width:700px) 50vw,33vw" className="card-product-photo" /></Link><span className="retail-product-badge">В наличии</span><div className="retail-card-tools"><FavoriteButton product={product}/></div></div><div className="retail-product-info"><Link href={product.href}><h2>{item.model}</h2></Link><p className="retail-product-color">{product.configuration || 'Стандартная комплектация'}</p><div className="retail-product-purchase"><strong>{item.price === null ? 'Цена уточняется' : `${money.format(item.price)} ₽`}</strong>{item.price === null ? <Link href="/#контакты">Уточнить цену</Link> : <AddToCartButton product={product}/>}</div><p className="retail-stock"><span/>В наличии</p></div></article>;
    })}</section>{!filtered.length && <p>Ничего не найдено. Попробуйте изменить фильтры.</p>}
  </>;
}
