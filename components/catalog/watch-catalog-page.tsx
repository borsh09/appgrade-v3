'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import { ChevronDown, Grid2X2, List, MapPin } from 'lucide-react';
import {
  watchCatalog,
  watchModels,
  type WatchCatalogSku,
} from '@/data/watch-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
const colorHex: Record<string, string> = {
  'Глянцевый чёрный': '#171719',
  'Розовое золото': '#d7a894',
  Серебристый: '#d8d9da',
  'Серый космос': '#68696d',
  'Чёрный титан': '#242426',
  'Тёмная ночь': '#24262c',
  'Сияющая звезда': '#e4dac5',
  'Натуральный титан': '#c5bcae',
};
function Card({ sku, view }: { sku: WatchCatalogSku; view: 'grid' | 'list' }) {
  const href = `/catalog/${sku.modelSlug}?size=${encodeURIComponent(sku.size)}&color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: sku.id,
    name: `${sku.model} ${sku.size}`,
    configuration: `${sku.color} · ${sku.connectivity}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media watch-product-media">
        <Link href={href}>
          <Image
            className="card-product-photo"
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
              {sku.model} {sku.size}
            </h2>
          </Link>
          <span
            className="retail-color-dot"
            style={{ background: colorHex[sku.color] }}
          />
        </div>
        <p className="retail-product-color">
          {sku.color} · {sku.connectivity}
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
          <span />
          Сегодня в магазине
        </p>
      </div>
    </article>
  );
}
export function WatchCatalogPage() {
  const { city } = useCity();
  const [model, setModel] = useState(''),
    [size, setSize] = useState(''),
    [view, setView] = useState<'grid' | 'list'>('grid'),
    [sort, setSort] = useState('popular');
  const products = useMemo(
    () =>
      watchCatalog
        .filter(
          (s) =>
            (!model || s.modelSlug === model) && (!size || s.size === size),
        )
        .sort((a, b) =>
          sort === 'desc' ? b.price - a.price : a.price - b.price,
        ),
    [model, size, sort],
  );
  return (
    <main className="retail-catalog-page watch-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Apple Watch</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>APPLE · WATCH</p>
          <h1>Apple Watch</h1>
          <button>
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <section className="retail-model-selector watch-model-selector">
          <button
            className={!model ? 'is-active' : ''}
            onClick={() => setModel('')}
          >
            <span>Все часы</span>
            <small>{watchCatalog.length} вариантов</small>
          </button>
          {watchModels.map((m) => (
            <button
              className={model === m.slug ? 'is-active' : ''}
              onClick={() => setModel(model === m.slug ? '' : m.slug)}
              key={m.slug}
            >
              <span>{m.name.replace('Apple Watch ', '')}</span>
              <small>
                от{' '}
                {money.format(
                  Math.min(
                    ...watchCatalog
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
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Любой размер</option>
              {['40 мм', '42 мм', '44 мм', '46 мм', '49 мм'].map((v) => (
                <option key={v}>{v}</option>
              ))}
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
                aria-label="Показывать плиткой"
                aria-pressed={view === 'grid'}
              >
                <Grid2X2 size={17} />
              </button>
              <button
                className={view === 'list' ? 'is-active' : ''}
                onClick={() => setView('list')}
                aria-label="Показывать списком"
                aria-pressed={view === 'list'}
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
