'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  GitCompareArrows,
  Grid2X2,
  List,
  MapPin,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  iphoneCatalog,
  iphoneModels,
  type IphoneCatalogSku,
} from '@/data/iphone-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest';
const modelRank = (model: string) =>
  Number(
    model.match(/iPhone\s+(\d+)/i)?.[1] ?? (model.includes('Air') ? 16.5 : 0),
  );
const hasWideCanvas = (image: string) =>
  /iphone-(13|14|15|16)-(?!pro)/.test(image);
const imageClass = (image: string, placement: 'card' | 'rail') =>
  `${placement}-product-photo ${hasWideCanvas(image) ? 'is-wide-canvas' : 'is-tight-crop'}`;
const colorHex = (color: string) => {
  const value = color.toLowerCase();
  if (value.includes('black') || value.includes('midnight')) return '#292b2f';
  if (
    value.includes('white') ||
    value.includes('starlight') ||
    value.includes('silver')
  )
    return '#e9e8e1';
  if (value.includes('blue')) return '#89a9c8';
  if (value.includes('orange') || value.includes('gold')) return '#d9894f';
  if (value.includes('pink')) return '#e5b7ba';
  if (
    value.includes('green') ||
    value.includes('sage') ||
    value.includes('teal')
  )
    return '#789a89';
  if (value.includes('purple') || value.includes('lavender')) return '#aaa0c5';
  if (value.includes('red')) return '#b84040';
  return '#b8b8b3';
};

function ProductCard({
  sku,
  view,
}: {
  sku: IphoneCatalogSku;
  view: 'grid' | 'list';
}) {
  const [compared, setCompared] = useState(false);
  const href = `/catalog/${sku.modelSlug}?storage=${encodeURIComponent(sku.storage)}&color=${encodeURIComponent(sku.color)}&sim=${encodeURIComponent(sku.sim)}`;
  const product = {
    id: sku.id,
    name: `${sku.model} ${sku.storage}`,
    configuration: `${sku.color} · ${sku.sim}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  const installment = Math.ceil(sku.price / 12 / 10) * 10;
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media">
        <Link
          href={href}
          aria-label={`${sku.model}, ${sku.storage}, ${sku.color}`}
        >
          <Image
            className={imageClass(sku.image, 'card')}
            src={sku.image}
            alt={`${sku.model} ${sku.color}`}
            fill
            unoptimized
            sizes={view === 'list' ? '280px' : '(max-width: 700px) 50vw, 33vw'}
          />
        </Link>
        <span className="retail-product-badge">В наличии</span>
        <div className="retail-card-tools">
          <FavoriteButton product={product} />
          <button
            className={compared ? 'is-active' : ''}
            type="button"
            onClick={() => setCompared(!compared)}
            aria-label="Сравнить"
            aria-pressed={compared}
          >
            <GitCompareArrows size={18} />
          </button>
        </div>
      </div>
      <div className="retail-product-info">
        <div className="retail-product-title-row">
          <Link href={href}>
            <h2>
              {sku.model} {sku.storage} {sku.sim !== '—' ? sku.sim : ''}
            </h2>
          </Link>
          <span
            className="retail-color-dot"
            style={{ background: colorHex(sku.color) }}
            title={sku.color}
          />
        </div>
        <p className="retail-product-color">
          {sku.color !== '—' ? sku.color : 'Доступные цвета'}
        </p>
        <div className="retail-product-purchase">
          <div>
            <strong>{money.format(sku.price)} ₽</strong>
            <span>от {money.format(installment)} ₽/мес.</span>
          </div>
          <AddToCartButton product={product} />
        </div>
        <p className="retail-stock">
          <span /> Сегодня в магазине
        </p>
      </div>
    </article>
  );
}

export function IphoneCatalogPage() {
  const { city } = useCity();
  const [filterOpen, setFilterOpen] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortKey>('popular');
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<string[]>([]);
  const [sims, setSims] = useState<string[]>([]);
  const modelCards = useMemo(
    () =>
      iphoneModels
        .map((model) => {
          const variants = iphoneCatalog.filter(
            (sku) => sku.modelSlug === model.slug,
          );
          return {
            ...model,
            minPrice: Math.min(...variants.map((sku) => sku.price)),
          };
        })
        .sort((a, b) => modelRank(b.name) - modelRank(a.name)),
    [],
  );
  const storageOptions = useMemo(
    () => [...new Set(iphoneCatalog.map((sku) => sku.storage))],
    [],
  );
  const simOptions = useMemo(
    () => [
      ...new Set(
        iphoneCatalog.map((sku) => sku.sim).filter((value) => value !== '—'),
      ),
    ],
    [],
  );
  const products = useMemo(() => {
    const filtered = iphoneCatalog.filter(
      (sku) =>
        (!models.length || models.includes(sku.modelSlug)) &&
        (!storages.length || storages.includes(sku.storage)) &&
        (!sims.length || sims.includes(sku.sim)),
    );
    return [...filtered].sort((a, b) =>
      sort === 'price-asc'
        ? a.price - b.price
        : sort === 'price-desc'
          ? b.price - a.price
          : sort === 'newest'
            ? modelRank(b.model) - modelRank(a.model)
            : modelRank(b.model) - modelRank(a.model) || a.price - b.price,
    );
  }, [models, storages, sims, sort]);
  const toggle = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void,
  ) =>
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  const activeFilters = models.length + storages.length + sims.length;
  const resetFilters = () => {
    setModels([]);
    setStorages([]);
    setSims([]);
  };
  return (
    <main className="retail-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Apple</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>APPLE</p>
          <h1>Apple iPhone</h1>
          <button type="button">
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <section className="retail-model-selector" aria-label="Серии iPhone">
          <button
            type="button"
            className={!models.length ? 'is-active' : ''}
            onClick={() => setModels([])}
          >
            <span>Все модели</span>
            <small>{iphoneCatalog.length} вариантов</small>
          </button>
          {modelCards.map((model) => (
            <button
              type="button"
              className={models.includes(model.slug) ? 'is-active' : ''}
              onClick={() =>
                setModels(models.includes(model.slug) ? [] : [model.slug])
              }
              key={model.slug}
            >
              <span>{model.name.replace('iPhone ', '')}</span>
              <small>от {money.format(model.minPrice)} ₽</small>
            </button>
          ))}
        </section>
        <section className="retail-toolbar" aria-label="Настройки каталога">
          <div className="retail-toolbar-left">
            <button
              className="retail-filter-button"
              type="button"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal size={17} />
              Фильтры{activeFilters > 0 && <b>{activeFilters}</b>}
            </button>
            <label className="retail-switch">
              <input
                type="checkbox"
                checked={todayOnly}
                onChange={(event) => setTodayOnly(event.target.checked)}
              />
              <i />
              <span>Забрать сегодня</span>
            </label>
          </div>
          <p>{products.length} товаров</p>
          <div className="retail-toolbar-right">
            <label>
              <span className="sr-only">Сортировка</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                <option value="popular">Сначала популярные</option>
                <option value="newest">Сначала новые</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <div className="retail-view-toggle">
              <button
                className={view === 'grid' ? 'is-active' : ''}
                type="button"
                onClick={() => setView('grid')}
                aria-label="Плитка"
              >
                <Grid2X2 size={17} />
              </button>
              <button
                className={view === 'list' ? 'is-active' : ''}
                type="button"
                onClick={() => setView('list')}
                aria-label="Список"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </section>
        {activeFilters > 0 && (
          <div className="retail-active-filters">
            <span>Выбрано фильтров: {activeFilters}</span>
            <button type="button" onClick={resetFilters}>
              Сбросить всё <X size={14} />
            </button>
          </div>
        )}
        <section
          className={`retail-products retail-products-${view}`}
          aria-label="Товары каталога"
        >
          {products.map((sku) => (
            <ProductCard sku={sku} view={view} key={sku.id} />
          ))}
        </section>
        {!products.length && (
          <div className="retail-empty">
            <h2>Ничего не найдено</h2>
            <p>Попробуйте изменить параметры фильтра.</p>
            <button type="button" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          </div>
        )}
        {products.length > 0 && (
          <div className="retail-catalog-end">
            <span>
              Показано {products.length} из {products.length}
            </span>
            <i />
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label="Закрыть фильтры"
        className={`retail-filter-overlay ${filterOpen ? 'is-open' : ''}`}
        onClick={() => setFilterOpen(false)}
      />
      <aside
        className={`retail-filter-drawer ${filterOpen ? 'is-open' : ''}`}
        aria-hidden={!filterOpen}
      >
        <div className="retail-filter-head">
          <div>
            <span>Фильтры</span>
            <b>{products.length} товаров</b>
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(false)}
            aria-label="Закрыть фильтры"
          >
            <X size={22} />
          </button>
        </div>
        <div className="retail-filter-section">
          <h3>Модель</h3>
          {modelCards.map((model) => (
            <label key={model.slug}>
              <input
                type="checkbox"
                checked={models.includes(model.slug)}
                onChange={() => toggle(model.slug, models, setModels)}
              />
              <i />
              <span>{model.name}</span>
            </label>
          ))}
        </div>
        <div className="retail-filter-section">
          <h3>Память</h3>
          <div className="retail-filter-chips">
            {storageOptions.map((storage) => (
              <button
                className={storages.includes(storage) ? 'is-active' : ''}
                type="button"
                onClick={() => toggle(storage, storages, setStorages)}
                key={storage}
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
        <div className="retail-filter-section">
          <h3>Тип SIM</h3>
          {simOptions.map((sim) => (
            <label key={sim}>
              <input
                type="checkbox"
                checked={sims.includes(sim)}
                onChange={() => toggle(sim, sims, setSims)}
              />
              <i />
              <span>{sim}</span>
            </label>
          ))}
        </div>
        <div className="retail-filter-actions">
          <button type="button" onClick={() => setFilterOpen(false)}>
            Показать {products.length} <ArrowRight size={17} />
          </button>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!activeFilters}
          >
            Сбросить
          </button>
        </div>
      </aside>
    </main>
  );
}
