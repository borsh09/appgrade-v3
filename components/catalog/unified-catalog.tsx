'use client';
import { useMemo, useRef, useState } from 'react';
import cardStyles from '@/components/shared/store-card.module.css';
import Image from '@/components/shared/product-photo';
import { HoverProductPhoto } from '@/components/shared/hover-product-photo';
import Link from '@/components/shared/safe-link';
import { catalogItems, itemConfiguration } from '@/lib/catalog-registry';
import { productHref } from '@/lib/product-selection';
import { usePricedCatalog } from '@/components/providers/price-provider';
import { AddToCartButton, FavoriteButton } from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
const preorderModels = new Set(['iPhone 18 Pro Max', 'iPhone Duo', 'iPhone 18 Pro', 'Apple Watch Series 12', 'Apple Watch Ultra 4', 'AirPods 5 with Wireless Charging Case']);
export function UnifiedCatalog({ category }: { category: string }) {
  const catalog = usePricedCatalog(catalogItems);
  const [model, setModel] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid'|'list'>('grid');
  const modelRailRef = useRef<HTMLElement>(null);
  const items = useMemo(() => catalog.filter(item => item.category === category), [catalog, category]);
  const models = [...new Map(items.map(item => [item.modelSlug, item.model])).entries()];
  const modelRepresentatives = new Map<string, (typeof items)[number]>();
  items.forEach(item => {
    if (!modelRepresentatives.has(item.modelSlug)) modelRepresentatives.set(item.modelSlug, item);
  });
  const allModelsImage = items[0]?.image;
  const scrollModels = (direction: number) => modelRailRef.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });
  const filtered = items.filter(item => (!model || item.modelSlug === model) && `${item.model} ${itemConfiguration(item)}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => {
    if (sort === 'popular') return 0;
    if (a.price === null) return b.price === null ? 0 : 1;
    if (b.price === null) return -1;
    return sort === 'asc' ? a.price - b.price : b.price - a.price;
  });
  return <>
    <div className="retail-model-selector-wrap">
      <button type="button" className="retail-model-arrow retail-model-arrow-prev" onClick={() => scrollModels(-1)} aria-label="Назад">&#8592;</button>
      <section ref={modelRailRef} className="retail-model-selector" aria-label="Модели">
        <button type="button" aria-pressed={!model} className={!model ? 'is-active' : ''} onClick={() => { setModel(''); setQuery(''); }}>
          {allModelsImage && <span className="retail-model-selector-thumb"><Image src={allModelsImage} alt="" fill sizes="44px" /></span>}
          <span>Все модели</span>
        </button>
        {models.map(([slug, name]) => {
          const representative = modelRepresentatives.get(slug);
          return <button type="button" key={slug} aria-pressed={model === slug} className={model===slug ? 'is-active' : ''} onClick={() => { setModel(slug); setQuery(''); }}>
            {representative && <span className="retail-model-selector-thumb"><Image src={representative.image} alt="" fill sizes="44px" /></span>}
            <span>{name}</span>
          </button>;
        })}
      </section>
      <button type="button" className="retail-model-arrow retail-model-arrow-next" onClick={() => scrollModels(1)} aria-label="Вперёд">&#8594;</button>
    </div>
    <section className="retail-toolbar"><label>Поиск <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Модель, память, цвет" /></label><div className="retail-toolbar-right"><label>Порядок <select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">По умолчанию</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option></select></label><button type="button" onClick={()=>setView(view==='grid'?'list':'grid')}>{view==='grid'?'Список':'Плитка'}</button></div></section>
    <section className={`retail-products retail-products-${view} ${view === 'grid' ? cardStyles.grid : ''}`} aria-label="Товары">{filtered.map(item => {
      const product = {id:item.id,name:item.model,configuration:itemConfiguration(item),price:item.price??0,image:item.image,href:productHref(item)};
      const status = preorderModels.has(item.model) ? 'Предзаказ' : 'В наличии';
      return <article className={`retail-product-card retail-product-card-${view} ${cardStyles.card}`} key={item.id}><div className="retail-product-media"><Link href={product.href}><HoverProductPhoto image={item.image} gallery={item.gallery} alt={`${item.model} ${item.color}`} sizes="(max-width:700px) 50vw,33vw" className="card-product-photo" /></Link><span className="retail-product-badge">{status}</span><div className="retail-card-tools"><FavoriteButton product={product}/></div></div><div className="retail-product-info"><Link href={product.href}><h2>{item.model}</h2></Link><p className="retail-product-color">{product.configuration || 'Стандартная комплектация'}</p><div className="retail-product-purchase"><strong>{item.price === null ? 'Цена уточняется' : `${money.format(item.price)} ₽`}</strong>{item.price === null ? <Link href="/#контакты">Уточнить цену</Link> : <AddToCartButton product={product} compact/>}</div><p className="retail-stock"><span/>{status}</p></div></article>;
    })}</section>{!filtered.length && <p>Ничего не найдено. Попробуйте изменить фильтры.</p>}
  </>;
}
