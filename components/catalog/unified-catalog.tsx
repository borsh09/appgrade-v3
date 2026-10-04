'use client';

import { useEffect, useMemo, useState } from 'react';
import cardStyles from '@/components/shared/store-card.module.css';
import { HoverProductPhoto } from '@/components/shared/hover-product-photo';
import Link from '@/components/shared/safe-link';
import { catalogItems, itemConfiguration, parserUnavailableIds } from '@/lib/catalog-registry';
import { getFilterDefinitions, matchesSelection, sanitizeSelection, type FilterKey, type FilterSelection } from '@/lib/catalog-filters';
import { matchesCatalogSearch } from '@/lib/catalog-search';
import { productHref } from '@/lib/product-selection';
import { merchandiseCatalog, preorderModels } from '@/lib/catalog-order';
import { usePricedCatalog } from '@/components/providers/price-provider';
import { AddToCartButton, FavoriteButton } from '@/components/shared/commerce-buttons';
import { CatalogControls } from './catalog-controls';
import { seoCategories } from '@/data/seo-categories';
import { DiscountPrice } from '@/components/shared/discount-price';


export function UnifiedCatalog({ category }: { category: string }) {
  const catalog = usePricedCatalog(catalogItems);
  const [selection, setSelection] = useState<FilterSelection>({});
  const [query, setQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [visibleCount, setVisibleCount] = useState(48);
  const items = useMemo(() => {
    const items = catalog.filter(item => item.category === category);
    return merchandiseCatalog(items);
  }, [catalog, category]);
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
    setVisibleCount(48);
    setSelection(current => {
      const values = current[key] ?? [];
      const nextValues = key === 'model'
        ? (values.includes(value) ? [] : [value])
        : (values.includes(value) ? values.filter(entry => entry !== value) : [...values, value]);
      return sanitizeSelection(items, { ...current, [key]: nextValues });
    });
  };
  const reset = () => { setSelection({}); setPriceMin(''); setPriceMax(''); setVisibleCount(48); };

  const seo = seoCategories[category];
  const models = [...new Map(items.map(item => [item.modelSlug, item])).values()];
  const seenNames = new Set<string>();
  const repeatedNames = new Set<string>();
  for (const item of models) {
    if (seenNames.has(item.model)) repeatedNames.add(item.model);
    seenNames.add(item.model);
  }
  return <>
    <CatalogControls items={items} definitions={definitions} selection={selection} query={query} priceMin={priceMin} priceMax={priceMax} resultCount={filtered.length} onQuery={(value) => { setQuery(value); setVisibleCount(48); }} onToggle={toggleFilter} onPriceMin={(value) => { setPriceMin(value); setVisibleCount(48); }} onPriceMax={(value) => { setPriceMax(value); setVisibleCount(48); }} onReset={reset}/>
    <section className={`retail-products retail-products-grid ${cardStyles.grid}`} aria-label="Товары">{filtered.slice(0, visibleCount).map(item => {
      const product = { id: item.id, name: item.model, configuration: itemConfiguration(item), price: item.price ?? 0, image: item.image, href: productHref(item) };
      const unavailable = item.price === null && parserUnavailableIds.has(item.id);
      const status = unavailable ? 'Нет в продаже' : item.price === null ? 'Уточнить наличие' : preorderModels.has(item.model) ? 'Предзаказ' : 'В наличии';
      return <article className={`retail-product-card retail-product-card-grid ${cardStyles.card}`} key={item.id}>
        <div className="retail-product-media"><Link href={product.href}><HoverProductPhoto image={item.image} gallery={item.gallery} alt={`${item.model} ${item.color}`} sizes="(max-width:700px) 50vw,33vw" className="card-product-photo" /></Link><span className="retail-product-badge">{status}</span><div className="retail-card-tools"><FavoriteButton product={product}/></div></div>
        <div className="retail-product-info"><Link href={product.href}><h2>{item.model}</h2></Link><p className="retail-product-color">{product.configuration || 'Стандартная комплектация'}</p><div className="retail-product-purchase"><DiscountPrice price={item.price} oldPrice={item.oldPrice} unavailable={unavailable} />{unavailable ? null : item.price === null ? <Link href="/#контакты">Уточнить цену</Link> : <AddToCartButton product={product} compact/>}</div><p className="retail-stock"><span/>{status}</p></div>
      </article>;
    })}</section>
    {filtered.length > visibleCount && <button className="catalog-load-more" type="button" onClick={() => setVisibleCount((count) => count + 48)}>Показать ещё {Math.min(48, filtered.length - visibleCount)}</button>}
    {!filtered.length && <p className="catalog-empty-state">Ничего не найдено. Измените запрос или сбросьте фильтры.</p>}
    {seo && <section className="seo-catalog-content" aria-labelledby="catalog-advice-title">
      <h2 id="catalog-advice-title">{seo.heading}</h2>
      <p>{seo.text}</p>
      <p>Контакты и адреса для покупки: <Link href="/stores">магазины APPGRADE</Link>. Также можно <Link href="/trade-in">оценить смартфон для Trade-In</Link>.</p>
      <details><summary>Все модели и конфигурации ({models.length})</summary><ul className="seo-model-links">{models.map(item => <li key={item.modelSlug}><Link href={`/catalog/${item.modelSlug}`}>{item.model}{repeatedNames.has(item.model) && itemConfiguration(item) ? ` · ${itemConfiguration(item)}` : ''}</Link></li>)}</ul></details>
    </section>}
  </>;
}
