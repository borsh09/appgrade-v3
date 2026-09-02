'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import { ChevronDown, Grid2X2, List, MapPin } from 'lucide-react';
import {
  dysonCatalog,
  type DysonCatalogSku,
  type DysonKind,
} from '@/data/dyson-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
function Card({ sku, view }: { sku: DysonCatalogSku; view: 'grid' | 'list' }) {
  const href = `/catalog/${sku.modelSlug}?color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: href,
    name: sku.model,
    configuration: `${sku.kind} · ${sku.color}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media dyson-product-media">
        <Link href={href}>
          <Image
            className="card-product-photo dyson-product-photo"
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
        <Link href={href}>
          <h2>{sku.model}</h2>
        </Link>
        <p className="retail-product-color">
          {sku.color} · {sku.kind}
        </p>
        <div className="retail-product-purchase">
          <div>
            <strong>{money.format(sku.price)} ₽</strong>
            <span>по карте {money.format(sku.cashlessPrice)} ₽</span>
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
export function DysonCatalogPage() {
  const { city } = useCity();
  const [kind, setKind] = useState<DysonKind | ''>('');
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const products = useMemo(
    () =>
      dysonCatalog
        .filter((s) => !kind || s.kind === kind)
        .sort((a, b) =>
          sort === 'asc'
            ? a.price - b.price
            : sort === 'desc'
              ? b.price - a.price
              : 0,
        ),
    [kind, sort],
  );
  return (
    <main className="retail-catalog-page dyson-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Dyson</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>AIRWRAP · SUPERSONIC · AIRSTRAIT</p>
          <h1>Dyson</h1>
          <button>
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <section className="retail-model-selector audio-kind-selector">
          <button
            className={!kind ? 'is-active' : ''}
            onClick={() => setKind('')}
          >
            <span>Вся техника</span>
            <small>{dysonCatalog.length} вариантов</small>
          </button>
          {(['Стайлер', 'Фен', 'Выпрямитель'] as DysonKind[]).map((value) => (
            <button
              className={kind === value ? 'is-active' : ''}
              onClick={() => setKind(kind === value ? '' : value)}
              key={value}
            >
              <span>{value}</span>
              <small>
                {dysonCatalog.filter((s) => s.kind === value).length} вариантов
              </small>
            </button>
          ))}
        </section>
        <section className="retail-toolbar">
          <div className="retail-toolbar-left">
            <span className="google-toolbar-label">
              Укладка без экстремального нагрева
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
                type="button"
                aria-pressed={view === 'grid'}
              >
                <Grid2X2 size={17} />
              </button>
              <button
                className={view === 'list' ? 'is-active' : ''}
                onClick={() => setView('list')}
                aria-label="Список"
                type="button"
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
