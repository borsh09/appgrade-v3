'use client';

import { SamsungPhoto } from './samsung-photo';
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
  samsungCatalog,
  samsungModels,
  type SamsungCatalogSku,
} from '@/data/samsung-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest';
const seriesRank = (model: string) =>
  model.includes('S26')
    ? 60
    : model.includes('Fold 8 Ultra')
      ? 58
      : model.includes('Fold 8')
        ? 57
        : model.includes('Flip 8')
          ? 56
          : model.includes('S25')
            ? 50
            : model.includes('S24')
              ? 40
              : model.includes('A57')
                ? 30
                : model.includes('A37')
                  ? 20
                  : 10;
const colorHex = (color: string) => {
  const value = color.toLowerCase();
  if (
    value.includes('black') ||
    value.includes('graphite') ||
    value.includes('charcoal')
  )
    return '#292b30';
  if (
    value.includes('white') ||
    value.includes('cream') ||
    value.includes('silver')
  )
    return '#e5e4df';
  if (value.includes('blue') || value.includes('navy'))
    return value.includes('navy') ? '#34445f' : '#9fb9cf';
  if (value.includes('violet') || value.includes('lavender')) return '#a59aba';
  if (
    value.includes('mint') ||
    value.includes('green') ||
    value.includes('pistachio')
  )
    return '#aebfae';
  if (
    value.includes('coral') ||
    value.includes('pink') ||
    value.includes('yellow')
  )
    return '#d9a49c';
  return '#969795';
};

function SamsungCard({
  sku,
  view,
}: {
  sku: SamsungCatalogSku;
  view: 'grid' | 'list';
}) {
  const href = `/catalog/${sku.modelSlug}?storage=${encodeURIComponent(sku.storage)}&color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: sku.id,
    name: `${sku.model} ${sku.ram} / ${sku.storage}`,
    configuration: `${sku.color} · ${sku.sim}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media samsung-product-media">
        <Link
          href={href}
          aria-label={`${sku.model}, ${sku.storage}, ${sku.color}`}
        >
          <SamsungPhoto
            src={sku.image}
            alt={`${sku.model} ${sku.color}`}
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
              {sku.model.replace('Samsung ', '')} {sku.ram} / {sku.storage}
            </h2>
          </Link>
          <span
            className="retail-color-dot"
            style={{ background: colorHex(sku.color) }}
            title={sku.color}
          />
        </div>
        <p className="retail-product-color">{sku.color}</p>
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

export function SamsungCatalogPage() {
  const { city } = useCity();
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortKey>('popular');
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const modelCards = useMemo(
    () =>
      samsungModels
        .map((model) => {
          const variants = samsungCatalog.filter(
            (sku) => sku.modelSlug === model.slug,
          );
          return {
            ...model,
            minPrice: Math.min(...variants.map((sku) => sku.price)),
          };
        })
        .sort((a, b) => seriesRank(b.name) - seriesRank(a.name)),
    [],
  );
  const storageOptions = useMemo(
    () => [...new Set(samsungCatalog.map((sku) => sku.storage))],
    [],
  );
  const products = useMemo(
    () =>
      samsungCatalog
        .filter(
          (sku) =>
            (!models.length || models.includes(sku.modelSlug)) &&
            (!storages.length || storages.includes(sku.storage)) &&
            (!series.length ||
              series.some((item) => sku.model.includes(`Galaxy ${item}`))),
        )
        .sort((a, b) =>
          sort === 'price-asc'
            ? a.price - b.price
            : sort === 'price-desc'
              ? b.price - a.price
              : seriesRank(b.model) - seriesRank(a.model) || a.price - b.price,
        ),
    [models, storages, series, sort],
  );
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
  const activeFilters = models.length + storages.length + series.length;
  const resetFilters = () => {
    setModels([]);
    setStorages([]);
    setSeries([]);
  };
  return (
    <main className="retail-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Samsung</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>SAMSUNG</p>
          <h1>Samsung Galaxy</h1>
          <button type="button">
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <section
          className="retail-model-selector samsung-series-selector"
          aria-label="Серии Samsung"
        >
          <button
            type="button"
            className={!series.length ? 'is-active' : ''}
            onClick={() => setSeries([])}
          >
            <span>Все серии</span>
            <small>{samsungCatalog.length} вариантов</small>
          </button>
          {['S', 'A', 'Z'].map((item) => (
            <button
              type="button"
              className={series.includes(item) ? 'is-active' : ''}
              onClick={() => setSeries(series.includes(item) ? [] : [item])}
              key={item}
            >
              <span>Galaxy {item}</span>
              <small>
                {
                  new Set(
                    samsungCatalog
                      .filter((sku) => sku.model.includes(`Galaxy ${item}`))
                      .map((sku) => sku.model),
                  ).size
                }{' '}
                моделей
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
            <button type="button" onClick={resetFilters}>
              Сбросить всё <X size={14} />
            </button>
          </div>
        )}
        <section className={`retail-products retail-products-${view}`}>
          {products.map((sku) => (
            <SamsungCard sku={sku} view={view} key={sku.id} />
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
          <h3>Серия</h3>
          {['S', 'A', 'Z'].map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={series.includes(item)}
                onChange={() => toggle(item, series, setSeries)}
              />
              <i />
              <span>Galaxy {item}</span>
            </label>
          ))}
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
              <span>{model.name.replace('Samsung ', '')}</span>
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
        <div className="retail-filter-actions">
          <button type="button" onClick={() => setFilterOpen(false)}>
            Показать {products.length}
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
