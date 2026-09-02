'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import {
  ChevronDown,
  Grid2X2,
  List,
  MapPin,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  macbookCatalog,
  macbookModels,
  type MacbookCatalogSku,
} from '@/data/macbook-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest';
const rank = (model: string) =>
  model.includes('M5') ? 30 : model.includes('Neo') ? 20 : 10;
const colorHex = (color: string) =>
  ({
    'space gray': '#77777a',
    silver: '#dadbdc',
    gold: '#d7c3a3',
    blush: '#e6b9b8',
    citrus: '#d9d66d',
    indigo: '#424e78',
    'sky blue': '#a9bdca',
    midnight: '#303743',
    starlight: '#e7dfcf',
  })[color.toLowerCase()] ?? '#aaa';

function MacbookCard({
  sku,
  view,
}: {
  sku: MacbookCatalogSku;
  view: 'grid' | 'list';
}) {
  const href = `/catalog/${sku.modelSlug}?storage=${encodeURIComponent(sku.storage)}&ram=${encodeURIComponent(sku.ram)}&color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: sku.id,
    name: `${sku.model} ${sku.ram} / ${sku.storage}`,
    configuration: `${sku.color} · Apple ${sku.chip}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media macbook-product-media">
        <Link
          href={href}
          aria-label={`${sku.model}, ${sku.ram}, ${sku.storage}, ${sku.color}`}
        >
          <Image
            className="card-product-photo macbook-product-photo"
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
        </div>
      </div>
      <div className="retail-product-info">
        <div className="retail-product-title-row">
          <Link href={href}>
            <h2>
              {sku.model} {sku.ram} / {sku.storage}
            </h2>
          </Link>
          <span
            className="retail-color-dot"
            style={{ background: colorHex(sku.color) }}
            title={sku.color}
          />
        </div>
        <p className="retail-product-color">
          {sku.color} · Apple {sku.chip}
        </p>
        <div className="retail-product-purchase">
          <div>
            <strong>{money.format(sku.price)} ₽</strong>
            <span>
              от {money.format(Math.ceil(sku.price / 120) * 10)} ₽/мес.
            </span>
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

export function MacbookCatalogPage() {
  const { city } = useCity();
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortKey>('popular');
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const storageOptions = useMemo(
    () => [...new Set(macbookCatalog.map((sku) => sku.storage))],
    [],
  );
  const products = useMemo(
    () =>
      macbookCatalog
        .filter(
          (sku) =>
            (!models.length || models.includes(sku.modelSlug)) &&
            (!storages.length || storages.includes(sku.storage)) &&
            (!sizes.length ||
              sizes.some((size) => sku.model.includes(` ${size} `))),
        )
        .sort((a, b) =>
          sort === 'price-asc'
            ? a.price - b.price
            : sort === 'price-desc'
              ? b.price - a.price
              : rank(b.model) - rank(a.model) || a.price - b.price,
        ),
    [models, storages, sizes, sort],
  );
  const toggle = (
    value: string,
    selected: string[],
    setter: (values: string[]) => void,
  ) =>
    setter(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  const activeFilters = models.length + storages.length + sizes.length;
  const reset = () => {
    setModels([]);
    setStorages([]);
    setSizes([]);
  };
  return (
    <main className="retail-catalog-page macbook-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>MacBook</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>APPLE · MAC</p>
          <h1>MacBook</h1>
          <button type="button">
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <section
          className="retail-model-selector samsung-series-selector"
          aria-label="Линейки MacBook"
        >
          <button
            type="button"
            className={!models.length ? 'is-active' : ''}
            onClick={() => setModels([])}
          >
            <span>Все MacBook</span>
            <small>{macbookCatalog.length} вариантов</small>
          </button>
          {macbookModels.map((model) => (
            <button
              type="button"
              className={models.includes(model.slug) ? 'is-active' : ''}
              onClick={() =>
                setModels(models.includes(model.slug) ? [] : [model.slug])
              }
              key={model.slug}
            >
              <span>{model.name}</span>
              <small>
                от{' '}
                {money.format(
                  Math.min(
                    ...macbookCatalog
                      .filter((sku) => sku.modelSlug === model.slug)
                      .map((sku) => sku.price),
                  ),
                )}{' '}
                ₽
              </small>
            </button>
          ))}
        </section>
        <section className="retail-toolbar">
          <div className="retail-toolbar-left">
            <button
              className="retail-filter-button"
              type="button"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal size={17} />
              Фильтры{activeFilters > 0 && <b>{activeFilters}</b>}
            </button>
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
            <button type="button" onClick={reset}>
              Сбросить всё <X size={14} />
            </button>
          </div>
        )}
        <section className={`retail-products retail-products-${view}`}>
          {products.map((sku) => (
            <MacbookCard sku={sku} view={view} key={sku.id} />
          ))}
        </section>
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
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>
        <div className="retail-filter-section">
          <h3>Диагональ</h3>
          {['13', '15'].map((size) => (
            <label key={size}>
              <input
                type="checkbox"
                checked={sizes.includes(size)}
                onChange={() => toggle(size, sizes, setSizes)}
              />
              <i />
              <span>{size} дюймов</span>
            </label>
          ))}
        </div>
        <div className="retail-filter-section">
          <h3>Модель</h3>
          {macbookModels.map((model) => (
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
          <h3>Накопитель</h3>
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
        <div className="retail-filter-actions">
          <button type="button" onClick={() => setFilterOpen(false)}>
            Показать {products.length}
          </button>
          <button type="button" onClick={reset} disabled={!activeFilters}>
            Сбросить
          </button>
        </div>
      </aside>
    </main>
  );
}
