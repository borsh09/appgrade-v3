'use client';

import { useEffect, useMemo, useState } from 'react';
import cardStyles from '@/components/shared/store-card.module.css';
import { HoverProductPhoto } from '@/components/shared/hover-product-photo';
import Link from '@/components/shared/safe-link';
import { catalogItems, itemConfiguration } from '@/lib/catalog-registry';
import { getFilterDefinitions, matchesSelection, sanitizeSelection, type FilterKey, type FilterSelection } from '@/lib/catalog-filters';
import { matchesCatalogSearch } from '@/lib/catalog-search';
import { productHref } from '@/lib/product-selection';
import { usePricedCatalog } from '@/components/providers/price-provider';
import { AddToCartButton, FavoriteButton } from '@/components/shared/commerce-buttons';
import { CatalogControls } from './catalog-controls';

const money = new Intl.NumberFormat('ru-RU');
const preorderModels = new Set(['iPhone 18 Pro Max', 'iPhone Duo', 'iPhone 18 Pro', 'Apple Watch Series 12', 'Apple Watch Ultra 4', 'AirPods 5 with Wireless Charging Case']);

export function UnifiedCatalog({ category }: { category: string }) {
  const catalog = usePricedCatalog(catalogItems);
  const [selection, setSelection] = useState<FilterSelection>({});
  const [query, setQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const items = useMemo(() => catalog.filter(item => item.category === category), [catalog, category]);
  const definitions = useMemo(() => getFilterDefinitions(items, category), [items, category]);

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get('q');
    if (!initialQuery) return;
    const timer = window.setTimeout(() => setQuery(initialQuery), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => items.filter(item => {
    if (!matchesSelection(item, selection) || !matchesCatalogSearch(item, query)) return false;
    if (item.price !== null && priceMin && item.price < Number(priceMin)) return false;
    if (item.price !== null && priceMax && item.price > Number(priceMax)) return false;
    return true;
  }), [items, selection, query, priceMin, priceMax]);

  const toggleFilter = (key: FilterKey, value: string) => {
    setSelection(current => {
      const values = current[key] ?? [];
      const nextValues = key === 'model'
        ? (values.includes(value) ? [] : [value])
        : (values.includes(value) ? values.filter(entry => entry !== value) : [...values, value]);
      return sanitizeSelection(items, { ...current, [key]: nextValues });
    });
  };
  const reset = () => { setSelection({}); setPriceMin(''); setPriceMax(''); };

  return <>
    <CatalogControls items={items} definitions={definitions} selection={selection} query={query} priceMin={priceMin} priceMax={priceMax} resultCount={filtered.length} onQuery={setQuery} onToggle={toggleFilter} onPriceMin={setPriceMin} onPriceMax={setPriceMax} onReset={reset}/>
    <section className={`retail-products retail-products-grid ${cardStyles.grid}`} aria-label="Товары">{filtered.map(item => {
      const product = { id: item.id, name: item.model, configuration: itemConfiguration(item), price: item.price ?? 0, image: item.image, href: productHref(item) };
      const status = preorderModels.has(item.model) ? 'Предзаказ' : 'В наличии';
      return <article className={`retail-product-card retail-product-card-grid ${cardStyles.card}`} key={item.id}>
        <div className="retail-product-media"><Link href={product.href}><HoverProductPhoto image={item.image} gallery={item.gallery} alt={`${item.model} ${item.color}`} sizes="(max-width:700px) 50vw,33vw" className="card-product-photo" /></Link><span className="retail-product-badge">{status}</span><div className="retail-card-tools"><FavoriteButton product={product}/></div></div>
        <div className="retail-product-info"><Link href={product.href}><h2>{item.model}</h2></Link><p className="retail-product-color">{product.configuration || 'Стандартная комплектация'}</p><div className="retail-product-purchase"><strong>{item.price === null ? 'Цена уточняется' : `${money.format(item.price)} ₽`}</strong>{item.price === null ? <Link href="/#контакты">Уточнить цену</Link> : <AddToCartButton product={product} compact/>}</div><p className="retail-stock"><span/>{status}</p></div>
      </article>;
    })}</section>
    {!filtered.length && <p className="catalog-empty-state">Ничего не найдено. Измените запрос или сбросьте фильтры.</p>}
  </>;
}
