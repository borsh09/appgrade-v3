'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import { ChevronDown, Grid2X2, List, MapPin } from 'lucide-react';
import {
  ipadCatalog,
  ipadModels,
  type IpadCatalogSku,
} from '@/data/ipad-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
const hex = (c: string) =>
  ({
    blue: '#9bb7cd',
    pink: '#e6b6c1',
    yellow: '#e6d58a',
    silver: '#d9dadd',
    purple: '#aaa1c0',
    starlight: '#e8dfcd',
    'space gray': '#6f7176',
  })[c.toLowerCase()] ?? '#aaa';
function Card({ sku, view }: { sku: IpadCatalogSku; view: 'grid' | 'list' }) {
  const href = `/catalog/${sku.modelSlug}?storage=${encodeURIComponent(sku.storage)}&color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: sku.id,
    name: `${sku.model} ${sku.storage}`,
    configuration: `${sku.color} · ${sku.connectivity}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media ipad-product-media">
        <Link href={href}>
          <Image
            className="card-product-photo ipad-product-photo"
            src={sku.image}
            alt={`${sku.model} ${sku.color}`}
            fill
            priority
            unoptimized
            sizes="(max-width:700px) 100vw,33vw"
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
              {sku.model} {sku.storage} {sku.connectivity}
            </h2>
          </Link>
          <span
            className="retail-color-dot"
            style={{ background: hex(sku.color) }}
          />
        </div>
        <p className="retail-product-color">
          {sku.color} · Apple {sku.chip}
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
export function IpadCatalogPage() {
  const { city } = useCity();
  const [model, setModel] = useState(''),
    [storage, setStorage] = useState(''),
    [view, setView] = useState<'grid' | 'list'>('grid'),
    [sort, setSort] = useState('popular');
  const products = useMemo(
    () =>
      ipadCatalog
        .filter(
          (s) =>
            (!model || s.modelSlug === model) &&
            (!storage || s.storage === storage),
        )
        .sort((a, b) =>
          sort === 'asc'
            ? a.price - b.price
            : sort === 'desc'
              ? b.price - a.price
              : b.model.localeCompare(a.model) || a.price - b.price,
        ),
    [model, storage, sort],
  );
  return (
    <main className="retail-catalog-page ipad-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>iPad</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>APPLE · IPAD</p>
          <h1>iPad</h1>
          <button>
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <section className="retail-model-selector ipad-model-selector">
          <button
            className={!model ? 'is-active' : ''}
            onClick={() => setModel('')}
          >
            <span>Все iPad</span>
            <small>{ipadCatalog.length} вариантов</small>
          </button>
          {ipadModels.map((m) => (
            <button
              className={model === m.slug ? 'is-active' : ''}
              onClick={() => setModel(model === m.slug ? '' : m.slug)}
              key={m.slug}
            >
              <span>{m.name}</span>
              <small>
                от{' '}
                {money.format(
                  Math.min(
                    ...ipadCatalog
                      .filter((s) => s.modelSlug === m.slug)
                      .map((s) => s.price),
                  ),
                )}{' '}
                ₽
              </small>
            </button>
          ))}
        </section>
        <section className="retail-toolbar">
          <div className="retail-toolbar-left">
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
            >
              <option value="">Любая память</option>
              <option>128 GB</option>
              <option>256 GB</option>
            </select>
          </div>
          <p>{products.length} товаров</p>
          <div className="retail-toolbar-right">
            <label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="popular">Сначала популярные</option>
                <option value="asc">Сначала дешевле</option>
                <option value="desc">Сначала дороже</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <div className="retail-view-toggle">
              <button
                className={view === 'grid' ? 'is-active' : ''}
                onClick={() => setView('grid')}
                type="button"
                aria-label="Плитка"
                aria-pressed={view === 'grid'}
              >
                <Grid2X2 size={17} />
              </button>
              <button
                className={view === 'list' ? 'is-active' : ''}
                onClick={() => setView('list')}
                type="button"
                aria-label="Список"
                aria-pressed={view === 'list'}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </section>
        <section className={`retail-products retail-products-${view}`}>
          {products.map((s) => (
            <Card key={s.id} sku={s} view={view} />
          ))}
        </section>
      </div>
    </main>
  );
}
