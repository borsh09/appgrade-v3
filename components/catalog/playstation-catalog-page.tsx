'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useMemo, useState } from 'react';
import { ChevronDown, Gamepad2, Grid2X2, List, MapPin } from 'lucide-react';
import {
  playstationCatalog,
  type PlaystationKind,
  type PlaystationCatalogSku,
} from '@/data/playstation-catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
const colorHex: Record<string, string> = {
  Белый: '#f4f4f2',
  Чёрный: '#17181c',
  Красный: '#a9293c',
  Розовый: '#e96b9c',
};

function Card({
  sku,
  view,
}: {
  sku: PlaystationCatalogSku;
  view: 'grid' | 'list';
}) {
  const href = `/catalog/${sku.modelSlug}?color=${encodeURIComponent(sku.color)}`;
  const product = {
    id: sku.id,
    name: sku.model,
    configuration: `${sku.configuration} · ${sku.color}`,
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <article className={`retail-product-card retail-product-card-${view}`}>
      <div className="retail-product-media playstation-product-media">
        <Link href={href}>
          <Image
            className="card-product-photo"
            src={sku.image}
            alt={sku.model}
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
          {sku.configuration} · {sku.color}
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

export function PlaystationCatalogPage() {
  const { city } = useCity();
  const [kind, setKind] = useState<PlaystationKind | ''>('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('popular');
  const products = useMemo(
    () =>
      playstationCatalog
        .filter((sku) => !kind || sku.kind === kind)
        .sort((a, b) =>
          sort === 'asc'
            ? a.price - b.price
            : sort === 'desc'
              ? b.price - a.price
              : 0,
        ),
    [kind, sort],
  );
  const count = (value?: PlaystationKind) =>
    playstationCatalog.filter((sku) => !value || sku.kind === value).length;
  return (
    <main className="retail-catalog-page playstation-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>PlayStation</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>SONY · PLAY HAS NO LIMITS</p>
          <h1>PlayStation</h1>
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
            <span>Всё PlayStation</span>
            <small>{count()} товаров</small>
          </button>
          {(['Консоли', 'Аксессуары'] as PlaystationKind[]).map((value) => (
            <button
              className={kind === value ? 'is-active' : ''}
              onClick={() => setKind(kind === value ? '' : value)}
              key={value}
            >
              <span>{value}</span>
              <small>{count(value)} товаров</small>
            </button>
          ))}
        </section>
        <section className="retail-toolbar">
          <div className="retail-toolbar-left">
            <span className="playstation-toolbar-label">
              <Gamepad2 size={17} /> Оригинальная техника Sony
            </span>
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
