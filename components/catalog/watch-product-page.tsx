'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { WatchCatalogSku } from '@/data/watch-catalog';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
const unique = (items: string[]) => [...new Set(items)];
export function WatchProductPage({
  modelSlug,
  variants,
  selected,
}: {
  modelSlug: string;
  variants: WatchCatalogSku[];
  selected: WatchCatalogSku;
}) {
  const [photo, setPhoto] = useState(0);
  const sizes = unique(variants.map((v) => v.size)),
    colors = unique(variants.map((v) => v.color));
  const hrefFor = (key: 'size' | 'color', value: string) => {
    const q = new URLSearchParams({
      size: selected.size,
      color: selected.color,
    });
    q.set(key, value);
    return `/catalog/${modelSlug}?${q}`;
  };
  const href = hrefFor('color', selected.color);
  const product = {
    id: selected.id,
    name: `${selected.model} ${selected.size}`,
    configuration: `${selected.color} · ${selected.connectivity}`,
    price: selected.price,
    image: selected.image,
    href,
  };
  return (
    <main className="iphone-product-page watch-product-page">
      <div className="container">
        <Link href="/catalog/watches" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к Apple Watch
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame watch-gallery-frame">
              <Image
                src={selected.gallery[photo]}
                alt={`${selected.model}, фото ${photo + 1}`}
                fill
                priority
                unoptimized
                sizes="(max-width:768px) 100vw,58vw"
              />
            </div>
            <div className="product-gallery-thumbs">
              {selected.gallery.map((src, i) => (
                <button
                  className={photo === i ? 'active' : ''}
                  onClick={() => setPhoto(i)}
                  key={`${src}-${i}`}
                  aria-label={`Фото ${i + 1}`}
                  aria-pressed={photo === i}
                >
                  <Image src={src} alt="" fill unoptimized sizes="66px" />
                </button>
              ))}
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">APPLE · WATCH</p>
            <h1>{selected.model}</h1>
            <p className="product-lead">
              Выберите размер и отделку корпуса — цена и конфигурация обновятся
              автоматически.
            </p>
            <div className="product-price-line">
              <strong>{money.format(selected.price)} ₽</strong>
              <span>
                <Check size={14} />В наличии
              </span>
            </div>
            <div className="product-options">
              <div className="product-option">
                <div className="product-option-head">
                  <span>Размер корпуса</span>
                  <b>{selected.size}</b>
                </div>
                <div className="product-option-values">
                  {sizes.map((v) => (
                    <Link
                      className={v === selected.size ? 'selected' : ''}
                      href={hrefFor('size', v)}
                      key={v}
                    >
                      {v}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="product-option">
                <div className="product-option-head">
                  <span>Цвет корпуса</span>
                  <b>{selected.color}</b>
                </div>
                <div className="product-option-values color-values">
                  {colors.map((v) => (
                    <Link
                      className={v === selected.color ? 'selected' : ''}
                      href={hrefFor('color', v)}
                      key={v}
                    >
                      {v}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/watches">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Комплектация</span>
                <strong>Apple Watch, ремешок, магнитный кабель USB‑C</strong>
              </div>
              <div>
                <span>Связь</span>
                <strong>{selected.connectivity}</strong>
              </div>
              <div>
                <span>Гарантия</span>
                <strong>12 месяцев</strong>
              </div>
            </div>
          </section>
        </div>
        <nav className="product-section-nav">
          <a href="#about">О товаре</a>
          <a href="#specs">Характеристики</a>
        </nav>
        <section className="product-story" id="about">
          <div className="product-section-kicker">О товаре</div>
          <div>
            <p className="catalog-overline">{selected.model.toUpperCase()}</p>
            <h2>Здоровье, тренировки и связь прямо на запястье.</h2>
            <p>
              Следите за активностью и сном, получайте уведомления, отвечайте на
              звонки и запускайте тренировки без лишних действий.
            </p>
          </div>
        </section>
        <section className="product-highlights">
          <div>
            <strong>{selected.size}</strong>
            <span>корпус</span>
          </div>
          <div>
            <strong>OLED</strong>
            <span>Retina</span>
          </div>
          <div>
            <strong>50 м</strong>
            <span>защита от воды</span>
          </div>
          <div>
            <strong>watchOS</strong>
            <span>система Apple</span>
          </div>
        </section>
        <section className="product-specifications" id="specs">
          <div className="product-section-kicker">Характеристики</div>
          <div className="product-spec-groups">
            <div className="product-spec-group">
              <dl>
                <div>
                  <dt>Модель</dt>
                  <dd>{selected.model}</dd>
                </div>
                <div>
                  <dt>Корпус</dt>
                  <dd>
                    {selected.size}, {selected.color}
                  </dd>
                </div>
                <div>
                  <dt>Связь</dt>
                  <dd>{selected.connectivity}</dd>
                </div>
                <div>
                  <dt>Память</dt>
                  <dd>64 GB</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
