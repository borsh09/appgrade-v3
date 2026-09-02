'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { IpadCatalogSku } from '@/data/ipad-catalog';
import { getIpadDetails } from '@/data/ipad-details';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
const unique = (v: string[]) => [...new Set(v)];
export function IpadProductPage({
  model,
  modelSlug,
  variants,
  selected,
}: {
  model: string;
  modelSlug: string;
  variants: IpadCatalogSku[];
  selected: IpadCatalogSku;
}) {
  const [photo, setPhoto] = useState(0);
  const storages = unique(variants.map((v) => v.storage)),
    colors = unique(variants.map((v) => v.color)),
    details = getIpadDetails(model);
  const hrefFor = (key: 'storage' | 'color', value: string) => {
    const q = new URLSearchParams({
      storage: selected.storage,
      color: selected.color,
    });
    q.set(key, value);
    return `/catalog/${modelSlug}?${q}`;
  };
  const product = {
    id: selected.id,
    name: `${model} ${selected.storage}`,
    configuration: `${selected.color} · ${selected.connectivity}`,
    price: selected.price,
    image: selected.image,
    href: hrefFor('color', selected.color),
  };
  return (
    <main className="iphone-product-page ipad-product-page">
      <div className="container">
        <Link href="/catalog/ipads" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к iPad
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame ipad-gallery-frame">
              <Image
                src={selected.gallery[photo]}
                alt={`${model} ${selected.color}, фото ${photo + 1}`}
                fill
                priority
                quality={100}
                unoptimized
                sizes="(max-width:768px) 100vw,58vw"
              />
            </div>
            <div className="product-gallery-thumbs">
              {selected.gallery.map((src, i) => (
                <button
                  className={photo === i ? 'active' : ''}
                  onClick={() => setPhoto(i)}
                  key={src}
                  type="button"
                  aria-label={`Фото ${i + 1}`}
                  aria-pressed={photo === i}
                >
                  <Image src={src} alt="" fill unoptimized sizes="66px" />
                </button>
              ))}
            </div>
            <div className="product-gallery-note">
              <span>APPGRADE</span>
              <span>Оригинальная техника</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">APPLE · IPAD</p>
            <h1>{model}</h1>
            <p className="product-lead">
              Выберите память и цвет — цена и фотографии обновятся
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
                  <span>Память</span>
                  <b>{selected.storage}</b>
                </div>
                <div className="product-option-values">
                  {storages.map((v) => (
                    <Link
                      className={v === selected.storage ? 'selected' : ''}
                      href={hrefFor('storage', v)}
                      key={v}
                    >
                      {v}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="product-option">
                <div className="product-option-head">
                  <span>Цвет</span>
                  <b>{selected.color}</b>
                </div>
                <div className="product-option-values color-values">
                  {colors.map((v) => (
                    <Link
                      className={v === selected.color ? 'selected' : ''}
                      href={hrefFor('color', v)}
                      key={v}
                    >
                      <i data-color={v} />
                      {v}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/ipads">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Комплектация</span>
                <strong>iPad, кабель USB‑C, адаптер 20 Вт</strong>
              </div>
              <div>
                <span>Самовывоз</span>
                <strong>Сегодня в магазине</strong>
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
          <a href="#delivery">Доставка и гарантия</a>
        </nav>
        <section className="product-story" id="about">
          <div className="product-section-kicker">О товаре</div>
          <div>
            <p className="catalog-overline">{model.toUpperCase()}</p>
            <h2>{details.eyebrow}</h2>
            <p>{details.lead}</p>
          </div>
        </section>
        <section className="product-highlights">
          {details.highlights.map(([v, l]) => (
            <div key={l}>
              <strong>{v}</strong>
              <span>{l}</span>
            </div>
          ))}
        </section>
        <section className="product-specifications" id="specs">
          <div className="product-section-kicker">Характеристики</div>
          <div className="product-spec-groups">
            <div className="product-spec-group">
              <h3>Основные параметры</h3>
              <dl>
                {details.specs.map(([t, v]) => (
                  <div key={t}>
                    <dt>{t}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="product-spec-group">
              <h3>Выбранная конфигурация</h3>
              <dl>
                <div>
                  <dt>Модель</dt>
                  <dd>{model}</dd>
                </div>
                <div>
                  <dt>Память</dt>
                  <dd>{selected.storage}</dd>
                </div>
                <div>
                  <dt>Связь</dt>
                  <dd>{selected.connectivity}</dd>
                </div>
                <div>
                  <dt>Цвет</dt>
                  <dd>{selected.color}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
        <section className="product-delivery" id="delivery">
          <div className="product-section-kicker">Покупка</div>
          <div>
            <h2>Доставка и гарантия</h2>
            <div className="product-delivery-grid">
              <article>
                <h3>Получение</h3>
                <p>
                  Бесплатный самовывоз из магазина в выбранном городе. Наличие
                  подтвердит менеджер.
                </p>
              </article>
              <article>
                <h3>Оплата</h3>
                <p>
                  Наличными, картой или переводом. Доступны кредит и рассрочка.
                </p>
              </article>
              <article>
                <h3>Гарантия</h3>
                <p>
                  Гарантия 12 месяцев. Проверим устройство и комплектность перед
                  выдачей.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
