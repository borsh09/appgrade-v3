'use client';

import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from '@/components/shared/safe-link';
import { searchIndex as baseSearchIndex } from '@/data/search-index';
import { usePricedCatalog } from '@/components/providers/price-provider';
import { getGroupedCatalogSearchResults } from '@/lib/catalog-search';
import styles from './mobile-home-search.module.css';

const money = new Intl.NumberFormat('ru-RU');
const searchExamples = ['iPhone 17 Pro Max', 'Samsung Galaxy Fold', 'AirPods Pro', 'MacBook Air', 'Marshall колонка'];

export function MobileHomeSearch() {
  const searchIndex = usePricedCatalog(baseSearchIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('Найти нужную модель');
  const results = useMemo(() => getGroupedCatalogSearchResults(searchIndex, query), [searchIndex, query]);
  const showResults = focused && query.trim().length >= 2;

  useEffect(() => {
    if (focused || query || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let wordIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer = 0;
    const tick = () => {
      const word = searchExamples[wordIndex];
      characterIndex += deleting ? -1 : 1;
      setAnimatedPlaceholder(word.slice(0, characterIndex));
      let delay = deleting ? 42 : 82;
      if (!deleting && characterIndex === word.length) { deleting = true; delay = 1450; }
      if (deleting && characterIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % searchExamples.length; delay = 380; }
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, [focused, query]);

  return <div className={styles.root} ref={rootRef} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  }}>
    {showResults && <div className={styles.results} aria-live="polite">
      {results.length ? results.map(item => <Link className={styles.result} key={`${item.category}:${item.modelSlug}`} href={`/catalog/${item.modelSlug}`}>
        <span className={styles.image}><Image src={item.image} alt="" fill unoptimized sizes="48px"/></span>
        <span className={styles.copy}><strong>{item.model}</strong><small>{item.searchCount} конфигураций</small></span>
        <b>{item.searchMinPrice ? `от ${money.format(item.searchMinPrice)} ₽` : 'Уточнить'}</b>
      </Link>) : <p className={styles.empty}>Ничего не найдено</p>}
    </div>}
    <label className={styles.glass}>
      <Search size={20}/>
      <input type="search" value={query} onFocus={() => setFocused(true)} onChange={event => setQuery(event.target.value)} placeholder={animatedPlaceholder} aria-label="Поиск товаров на главной"/>
      {query && <button type="button" className={styles.clear} onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={17}/></button>}
    </label>
  </div>;
}
