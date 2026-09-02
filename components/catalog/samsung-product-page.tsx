'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { SamsungCatalogSku } from '@/data/samsung-catalog';
import { getSamsungDetails } from '@/data/samsung-details';
import { AddToCartButton } from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
const unique = (values: string[]) => [...new Set(values)];

type SamsungProductPageProps = {
  model: string;
  modelSlug: string;
  variants: SamsungCatalogSku[];
  selected: SamsungCatalogSku;
};

export function SamsungProductPage({
  model,
  modelSlug,
  variants,
  selected,
}: SamsungProductPageProps) {
  const storages = unique(variants.map((variant) => variant.storage));
  const colors = unique(variants.map((variant) => variant.color));
  const rams = unique(variants.map((variant) => variant.ram));
  const gallery = selected.gallery.slice(0, 3);
  const [activePhoto, setActivePhoto] = useState(0);
  const details = getSamsungDetails(model);

  const hrefFor = (key: 'storage' | 'color' | 'ram', value: string) => {
    const query = new URLSearchParams({
      storage: selected.storage,
      color: selected.color,
      ram: selected.ram,
    });
    query.set(key, value);
    return `/catalog/${modelSlug}?${query.toString()}`;
  };
  const product = {
    id: selected.id,
    name: `${model} ${selected.ram} / ${selected.storage}`,
    configuration: `${selected.color} · ${selected.sim}`,
    price: selected.price,
    image: selected.image,
    href: hrefFor('color', selected.color),
  };

  return (
    <main className="iphone-product-page samsung-product-page">
      <div className="container">
        <Link href="/catalog/samsung" className="product-back">
          <ArrowLeft size={16} /> Вернуться к Samsung
        </Link>
        <div className="product-layout">
          <section className="product-gallery" aria-label={`Фото ${model}`}>
            <div className="product-gallery-frame samsung-gallery-frame">
              <Image
                src={gallery[activePhoto]}
                alt={`${model} ${selected.color}, фото ${activePhoto + 1}`}
                fill
                priority
                quality={100}
                unoptimized
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>
            <div
              className="product-gallery-thumbs"
              aria-label="Фотографии товара"
            >
              {gallery.map((photo, index) => (
                <button
                  type="button"
                  key={`${photo}-${index}`}
                  className={index === activePhoto ? 'active' : ''}
                  onClick={() => setActivePhoto(index)}
                  aria-label={`Фото ${index + 1}`}
                >
                  <Image src={photo} alt="" fill unoptimized sizes="66px" />
                </button>
              ))}
            </div>
            <div className="product-gallery-note">
              <span>APPGRADE</span>
              <span>Оригинальная техника</span>
            </div>
          </section>

          <section className="product-info">
            <p className="catalog-overline">SAMSUNG · GALAXY</p>
            <h1>{model.replace('Samsung ', '')}</h1>
            <p className="product-lead">
              Выберите конфигурацию — цена, цвет и доступные фотографии
              обновятся автоматически.
            </p>
            <div className="product-price-line">
              <strong>{money.format(selected.price)} ₽</strong>
              <span>
                <Check size={14} /> В наличии
              </span>
            </div>
            <div className="product-options">
              <div className="product-option">
                <div className="product-option-head">
                  <span>Память</span>
                  <b>{selected.storage}</b>
                </div>
                <div className="product-option-values">
                  {storages.map((value) => (
                    <Link
                      className={value === selected.storage ? 'selected' : ''}
                      href={hrefFor('storage', value)}
                      key={value}
                    >
                      {value}
                    </Link>
                  ))}
                </div>
              </div>
              {rams.length > 1 && (
                <div className="product-option">
                  <div className="product-option-head">
                    <span>Оперативная память</span>
                    <b>{selected.ram}</b>
                  </div>
                  <div className="product-option-values">
                    {rams.map((value) => (
                      <Link
                        className={value === selected.ram ? 'selected' : ''}
                        href={hrefFor('ram', value)}
                        key={value}
                      >
                        {value}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="product-option">
                <div className="product-option-head">
                  <span>Цвет</span>
                  <b>{selected.color}</b>
                </div>
                <div className="product-option-values color-values">
                  {colors.map((value) => (
                    <Link
                      className={value === selected.color ? 'selected' : ''}
                      href={hrefFor('color', value)}
                      key={value}
                    >
                      <i data-color={value} />
                      {value}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/samsung">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Гарантия</span>
                <strong>12 месяцев</strong>
              </div>
              <div>
                <span>Самовывоз</span>
                <strong>Сегодня в магазине</strong>
              </div>
              <div>
                <span>Конфигураций</span>
                <strong>{variants.length}</strong>
              </div>
            </div>
          </section>
        </div>

        <nav className="product-section-nav" aria-label="Разделы страницы">
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
        <section
          className="product-highlights"
          aria-label="Ключевые преимущества"
        >
          {details.highlights.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>
        <section className="product-specifications" id="specs">
          <div className="product-section-kicker">Характеристики</div>
          <div className="product-spec-groups">
            {details.groups.map((group) => (
              <div className="product-spec-group" key={group.title}>
                <h3>{group.title}</h3>
                <dl>
                  {group.rows.map(([term, value]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <div className="product-spec-group">
              <h3>Выбранная конфигурация</h3>
              <dl>
                <div>
                  <dt>Оперативная память</dt>
                  <dd>{selected.ram}</dd>
                </div>
                <div>
                  <dt>Накопитель</dt>
                  <dd>{selected.storage}</dd>
                </div>
                <div>
                  <dt>Цвет</dt>
                  <dd>{selected.color}</dd>
                </div>
                <div>
                  <dt>SIM</dt>
                  <dd>{selected.sim}</dd>
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
                  Самовывоз из магазина в выбранном городе — бесплатно. Наличие
                  нужной конфигурации подтвердит менеджер.
                </p>
              </article>
              <article>
                <h3>Оплата</h3>
                <p>
                  Наличными, банковской картой или переводом. Доступны кредит и
                  рассрочка.
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
