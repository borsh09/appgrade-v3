'use client';

import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { CatalogItem } from '@/lib/catalog-registry';
import { activeFilterCount, type FilterDefinition, type FilterKey, type FilterSelection, getFacetOptions } from '@/lib/catalog-filters';
import styles from './catalog-controls.module.css';

type Props = {
  items: CatalogItem[]; definitions: FilterDefinition[]; selection: FilterSelection;
  query: string; priceMin: string; priceMax: string; resultCount: number;
  onQuery: (value: string) => void; onToggle: (key: FilterKey, value: string) => void;
  onPriceMin: (value: string) => void; onPriceMax: (value: string) => void; onReset: () => void;
};

export function CatalogControls(props: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = activeFilterCount(props.selection, props.priceMin, props.priceMax);
  const openDrawer = () => dialogRef.current?.showModal();
  const closeDrawer = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const closeOnBackdrop = (event: MouseEvent) => { if (event.target === dialog) closeDrawer(); };
    dialog.addEventListener('click', closeOnBackdrop);
    return () => dialog.removeEventListener('click', closeOnBackdrop);
  }, []);

  const filterOptions = (definition: FilterDefinition) => getFacetOptions(props.items, props.selection, definition.key);
  const priceInputs = (mobile = false) => <div className={mobile ? styles.mobilePrice : styles.price}>
    <input type="number" inputMode="numeric" min="0" value={props.priceMin} onChange={event => props.onPriceMin(event.target.value)} placeholder="Цена от" aria-label="Минимальная цена" />
    <input type="number" inputMode="numeric" min="0" value={props.priceMax} onChange={event => props.onPriceMax(event.target.value)} placeholder="до" aria-label="Максимальная цена" />
  </div>;

  return <section className={styles.controls} aria-label="Поиск и фильтры">
    <div className={styles.topline}>
      <label className={styles.search}><Search size={18}/><input type="search" value={props.query} onChange={event => props.onQuery(event.target.value)} placeholder="Найти модель в этой категории" aria-label="Поиск по категории" />{props.query && <button type="button" className={styles.clearSearch} onClick={() => props.onQuery('')} aria-label="Очистить поиск"><X size={16}/></button>}</label>
      <button type="button" className={styles.mobileButton} onClick={openDrawer}><SlidersHorizontal size={17}/>Фильтры{count > 0 && <span className={styles.count}>{count}</span>}</button>
    </div>
    <div className={styles.bar}>
      {props.definitions.map(definition => {
        const selected = props.selection[definition.key] ?? [];
        return <details className={styles.filter} key={definition.key}><summary>{definition.label}{selected.length > 0 && <span>{selected.length}</span>}<ChevronDown size={14}/></summary><div className={styles.menu}>{filterOptions(definition).map(value => <button type="button" key={value} className={`${styles.option} ${selected.includes(value) ? styles.active : ''}`} onClick={() => props.onToggle(definition.key, value)}><span className={styles.check}>{selected.includes(value) && <Check size={13}/>}</span>{value}</button>)}</div></details>;
      })}
      {priceInputs()}
      {count > 0 && <button type="button" className={styles.reset} onClick={props.onReset}>Сбросить</button>}
    </div>
    <p className={styles.summary}>Найдено товаров: {props.resultCount}{count > 0 ? ` · активно фильтров: ${count}` : ''}</p>
    <dialog ref={dialogRef} className={styles.drawer} aria-label="Фильтры каталога">
      <div className={styles.drawerPanel}>
        <div className={styles.drawerHeader}><h2>Фильтры{count > 0 ? ` · ${count}` : ''}</h2><button type="button" className={styles.iconButton} onClick={closeDrawer} aria-label="Закрыть фильтры"><X size={19}/></button></div>
        <div className={styles.drawerBody}>
          {props.definitions.map(definition => { const selected = props.selection[definition.key] ?? []; return <section className={styles.section} key={definition.key}><h3>{definition.label}</h3><div className={styles.chips}>{filterOptions(definition).map(value => <button type="button" key={value} className={`${styles.chip} ${selected.includes(value) ? styles.active : ''}`} onClick={() => props.onToggle(definition.key, value)}>{value}</button>)}</div></section>; })}
          <section className={styles.section}><h3>Цена</h3>{priceInputs(true)}</section>
        </div>
        <div className={styles.drawerFooter}><button type="button" className={styles.reset} onClick={props.onReset} disabled={count === 0}>Сбросить</button><button type="button" className={styles.apply} onClick={closeDrawer}>Показать · {props.resultCount}</button></div>
      </div>
    </dialog>
  </section>;
}
