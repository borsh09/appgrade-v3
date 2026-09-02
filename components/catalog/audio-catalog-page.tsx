'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import { ChevronDown, Grid2X2, List, MapPin } from 'lucide-react';
import {
  audioCatalog,
  type AudioCatalogSku,
  type AudioKind,
} from '@/data/audio-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
const colorHex: Record<string, string> = {
  White: '#f5f5f3',
  Black: '#252525',
  Blue: '#91b4ce',
  Midnight: '#28303b',
  Purple: '#b7abc8',
  Orange: '#e5a37c',
  Starlight: '#e7dfcf',
};
const popular = [
  'airpods-4',
  'airpods-pro-3',
  'airpods-pro-2',
  'airpods-4-anc',
  'airpods-max-2-2026',
  'airpods-max-2-2024',
  'marshall-major-5',
  'marshall-monitor-3-anc',
  'marshall-stanmore-3',
  'marshall-woburn-3',
];

function Card({ sku, view }: { sku: AudioCatalogSku; view: 'grid' | 'list' }) {
  const href = `/catalog/${sku.modelSlug}?color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: sku.id,
    name: sku.model,
    configuration: `${sku.color} · ${sku.brand}`,
    price: sku.price ?? 0,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media audio-product-media">
        <Link href={href}>
          <Image
            className="card-product-photo audio-product-photo"
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
            style={{ background: colorHex[sku.color] ?? '#777' }}
          />
        </div>
        <p className="retail-product-color">
          {sku.color} · {sku.brand}
        </p>
        <div className="retail-product-purchase">
          <div>
            <strong>
              {sku.price ? `${money.format(sku.price)} ₽` : 'Цена по запросу'}
            </strong>
            {sku.price && (
              <span>
                от {money.format(Math.ceil(sku.price / 12 / 10) * 10)} ₽/мес.
              </span>
            )}
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

export function AudioCatalogPage() {
  const { city } = useCity();
  const [kind, setKind] = useState<AudioKind | ''>('');
  const [brand, setBrand] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('popular');
  const products = useMemo(
    () =>
      audioCatalog
        .filter(
          (sku) =>
            (!kind || sku.kind === kind) && (!brand || sku.brand === brand),
        )
        .sort((a, b) =>
          sort === 'asc'
            ? (a.price ?? Infinity) - (b.price ?? Infinity)
            : sort === 'desc'
              ? (b.price ?? -1) - (a.price ?? -1)
              : (popular.indexOf(a.modelSlug) < 0
                  ? 999
                  : popular.indexOf(a.modelSlug)) -
                  (popular.indexOf(b.modelSlug) < 0
                    ? 999
                    : popular.indexOf(b.modelSlug)) ||
                a.model.localeCompare(b.model) ||
                a.color.localeCompare(b.color),
        ),
    [kind, brand, sort],
  );
  const variantCount = (value?: AudioKind) =>
    audioCatalog.filter((sku) => !value || sku.kind === value).length;
  return (
    <main className="retail-catalog-page audio-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Наушники и аудио</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>AIRPODS · MARSHALL · JBL</p>
          <h1>Наушники и аудио</h1>
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
            <span>Всё аудио</span>
            <small>{variantCount()} вариантов</small>
          </button>
          {(['AirPods', 'Наушники', 'Акустика'] as AudioKind[]).map((value) => (
            <button
              className={kind === value ? 'is-active' : ''}
              onClick={() => setKind(kind === value ? '' : value)}
              key={value}
            >
              <span>{value}</span>
              <small>{variantCount(value)} вариантов</small>
            </button>
          ))}
        </section>
        <section className="retail-toolbar">
          <div className="retail-toolbar-left">
            <select
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              <option value="">Все бренды</option>
              <option>Apple</option>
              <option>Marshall</option>
              <option>JBL</option>
            </select>
          </div>
          <p>{products.length} товаров</p>
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
          {products.map((sku) => (
            <Card key={sku.id} sku={sku} view={view} />
          ))}
        </section>
      </div>
    </main>
  );
}
