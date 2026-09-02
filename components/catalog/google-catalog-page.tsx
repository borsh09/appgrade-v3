'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import { ChevronDown, Grid2X2, List, MapPin } from 'lucide-react';
import { googleCatalog, type GoogleCatalogSku } from '@/data/google-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
const colorHex: Record<string, string> = {
  Обсидиан: '#25272a',
  Фарфор: '#eee9df',
  'Лунный камень': '#8f98ae',
  Нефрит: '#c9dba9',
  Индиго: '#416bc5',
  Лаймовый: '#d9f077',
  Морозный: '#dfe8f5',
  'Розовый кварц': '#e8c3cd',
  'Серо-зелёный': '#89928b',
};
function Card({ sku, view }: { sku: GoogleCatalogSku; view: 'grid' | 'list' }) {
  const href = `/catalog/${sku.modelSlug}?storage=${encodeURIComponent(sku.storage)}&color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: href,
    name: sku.model,
    configuration: `${sku.storage} · ${sku.color}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media google-product-media">
        <Link href={href}>
          <Image
            className="card-product-photo"
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
            <h2>{sku.model}</h2>
          </Link>
          <span
            className="retail-color-dot"
            style={{ background: colorHex[sku.color] }}
          />
        </div>
        <p className="retail-product-color">
          {sku.storage} · {sku.color}
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
export function GoogleCatalogPage() {
  const { city } = useCity();
  const [model, setModel] = useState(''),
    [view, setView] = useState<'grid' | 'list'>('grid'),
    [sort, setSort] = useState('popular');
  const products = useMemo(
    () =>
      googleCatalog
        .filter((s) => !model || s.modelSlug === model)
        .sort((a, b) =>
          sort === 'asc'
            ? a.price - b.price
            : sort === 'desc'
              ? b.price - a.price
              : 0,
        ),
    [model, sort],
  );
  const models = [
    ...new Map(googleCatalog.map((s) => [s.modelSlug, s.model])).entries(),
  ];
  return (
    <main className="retail-catalog-page google-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Google</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>PIXEL · GEMINI · ANDROID</p>
          <h1>Google Pixel</h1>
          <button>
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <section className="retail-model-selector audio-kind-selector">
          <button
            className={!model ? 'is-active' : ''}
            onClick={() => setModel('')}
          >
            <span>Все Pixel</span>
            <small>{googleCatalog.length} вариантов</small>
          </button>
          {models.map(([slug, name]) => (
            <button
              className={model === slug ? 'is-active' : ''}
              onClick={() => setModel(model === slug ? '' : slug)}
              key={slug}
            >
              <span>{name}</span>
              <small>
                {googleCatalog.filter((s) => s.modelSlug === slug).length} цвета
              </small>
            </button>
          ))}
        </section>
        <section className="retail-toolbar">
          <div className="retail-toolbar-left">
            <span className="google-toolbar-label">
              Google Tensor · Gemini AI
            </span>
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
                aria-label="Плитка"
              >
                <Grid2X2 size={17} />
              </button>
              <button
                className={view === 'list' ? 'is-active' : ''}
                onClick={() => setView('list')}
                aria-label="Список"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </section>
        <section className={`retail-products retail-products-${view}`}>
          {products.map((s) => (
            <Card sku={s} view={view} key={s.id} />
          ))}
        </section>
      </div>
    </main>
  );
}
