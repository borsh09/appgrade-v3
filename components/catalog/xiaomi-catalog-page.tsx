'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import { ChevronDown, Grid2X2, List, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';
import {
  xiaomiCatalog,
  xiaomiModels,
  type XiaomiCatalogSku,
} from '@/data/xiaomi-catalog';

const money = new Intl.NumberFormat('ru-RU');
const colors: Record<string, string> = {
  'Silver Chrome': '#c8c8c6',
  Green: '#dce8d8',
  'Frost Blue': '#b9cede',
  'Midnight Black': '#292a2d',
  Yellow: '#edc727',
  'Black / Yellow': '#d9b719',
};

function Card({ sku, view }: { sku: XiaomiCatalogSku; view: 'grid' | 'list' }) {
  const href = `/catalog/${sku.modelSlug}?storage=${encodeURIComponent(sku.storage)}&color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: sku.id,
    name: `${sku.model} ${sku.storage}`,
    configuration: `${sku.ram} · ${sku.color}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media xiaomi-product-media">
        <Link href={href}>
          <Image
            className="card-product-photo xiaomi-product-photo"
            src={sku.image}
            alt={`${sku.model} ${sku.color}`}
            fill
            priority
            unoptimized
            sizes="(max-width:700px) 50vw,33vw"
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
              {sku.model} {sku.storage}
            </h2>
          </Link>
          <span
            className="retail-color-dot"
            style={{ background: colors[sku.color] }}
          />
        </div>
        <p className="retail-product-color">
          {sku.ram} · {sku.color}
        </p>
        <div className="retail-product-purchase">
          <div>
            <strong>{money.format(sku.price)} ₽</strong>
            <span>
              от {money.format(Math.ceil(sku.price / 12 / 10) * 10)} ₽/мес.
            </span>
          </div>
          <AddToCartButton product={product} />
        </div>
        <p className="retail-stock">
          <span />
          Сегодня в магазине
        </p>
      </div>
    </article>
  );
}

export function XiaomiCatalogPage() {
  const { city } = useCity();
  const [model, setModel] = useState('');
  const [series, setSeries] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('popular');
  const products = useMemo(
    () =>
      xiaomiCatalog
        .filter((sku) => !model || sku.modelSlug === model)
        .filter((sku) => !series || sku.model.startsWith(series))
        .sort((a, b) =>
          sort === 'asc'
            ? a.price - b.price
            : sort === 'desc'
              ? b.price - a.price
              : 0,
        ),
    [model, series, sort],
  );
  return (
    <main className="retail-catalog-page xiaomi-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Xiaomi</span>
        </nav>
        <header className="retail-catalog-hero xiaomi-catalog-hero">
          <div className="xiaomi-hero-copy">
            <p>LEICA · HYPEROS · 5G</p>
            <h1>Xiaomi</h1>
            <h2>Флагманская камера. Скорость без компромиссов.</h2>
            <div className="xiaomi-hero-actions">
              <Link href="/catalog/xiaomi-15-ultra">
                Смотреть Xiaomi 15 Ultra
              </Link>
              <button type="button">
                <MapPin size={15} />
                {city.name}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <Link
            className="xiaomi-hero-product"
            href="/catalog/xiaomi-15-ultra"
            aria-label="Xiaomi 15 Ultra"
          >
            <span>Xiaomi 15 Ultra</span>
            <Image
              src="/images/products/xiaomi/15-ultra-main.png"
              alt="Xiaomi 15 Ultra"
              fill
              priority
              unoptimized
              sizes="(max-width: 700px) 80vw, 42vw"
            />
          </Link>
        </header>
        <section className="retail-model-selector">
          <button
            type="button"
            className={!model ? 'is-active' : ''}
            onClick={() => setModel('')}
          >
            <span>Все Xiaomi</span>
            <small>
              {xiaomiModels.length} модели · {xiaomiCatalog.length} вариантов
            </small>
          </button>
          {xiaomiModels.map((item) => (
            <button
              type="button"
              className={model === item.slug ? 'is-active' : ''}
              onClick={() => setModel(model === item.slug ? '' : item.slug)}
              key={item.slug}
            >
              <span>{item.name}</span>
              <small>
                от{' '}
                {money.format(
                  Math.min(
                    ...xiaomiCatalog
                      .filter((sku) => sku.modelSlug === item.slug)
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
            <div className="xiaomi-series-filter" aria-label="Фильтр по серии">
              {['', 'Xiaomi', 'Redmi', 'Poco'].map((item) => (
                <button
                  type="button"
                  className={series === item ? 'is-active' : ''}
                  aria-pressed={series === item}
                  onClick={() => {
                    setSeries(item);
                    setModel('');
                  }}
                  key={item || 'all'}
                >
                  {item || 'Все'}
                </button>
              ))}
            </div>
          </div>
          <p>{products.length} вариантов</p>
          <div className="retail-toolbar-right">
            <label>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="popular">Сначала популярные</option>
                <option value="asc">Сначала дешевле</option>
                <option value="desc">Сначала дороже</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <div className="retail-view-toggle">
              <button
                type="button"
                className={view === 'grid' ? 'is-active' : ''}
                onClick={() => setView('grid')}
                aria-label="Плитка"
                aria-pressed={view === 'grid'}
              >
                <Grid2X2 size={17} />
              </button>
              <button
                type="button"
                className={view === 'list' ? 'is-active' : ''}
                onClick={() => setView('list')}
                aria-label="Список"
                aria-pressed={view === 'list'}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </section>
        <section className={`retail-products retail-products-${view}`}>
          {products.map((sku) => (
            <Card sku={sku} view={view} key={sku.id} />
          ))}
        </section>
      </div>
    </main>
  );
}
