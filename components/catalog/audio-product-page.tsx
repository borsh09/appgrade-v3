'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { AudioCatalogSku } from '@/data/audio-catalog';
import { getAudioDetails } from '@/data/audio-details';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
const unique = <T,>(items: T[]) => [...new Set(items)];
export function AudioProductPage({
  model,
  modelSlug,
  variants,
  selected,
}: {
  model: string;
  modelSlug: string;
  variants: AudioCatalogSku[];
  selected: AudioCatalogSku;
}) {
  const [photo, setPhoto] = useState(0);
  const colors = unique(variants.map((v) => v.color)),
    details = getAudioDetails(model, selected.brand, selected.kind);
  const hrefFor = (color: string) =>
    `/catalog/${modelSlug}?color=${encodeURIComponent(color)}`;
  const product = {
    id: selected.id,
    name: model,
    configuration: `${selected.color} · ${selected.brand}`,
    price: selected.price ?? 0,
    image: selected.image,
    href: hrefFor(selected.color),
  };
  return (
    <main className="iphone-product-page audio-product-page">
      <div className="container">
        <Link href="/catalog/audio" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к аудио
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame audio-gallery-frame">
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
            <p className="catalog-overline">
              {selected.brand.toUpperCase()} · {selected.kind.toUpperCase()}
            </p>
            <h1>{model}</h1>
            <p className="product-lead">
              Выберите цвет — фотографии и конфигурация обновятся автоматически.
            </p>
            <div className="product-price-line">
              <strong>
                {selected.price
                  ? `${money.format(selected.price)} ₽`
                  : 'Цена по запросу'}
              </strong>
              <span>
                <Check size={14} />В наличии
              </span>
            </div>
            {colors.length > 1 && (
              <div className="product-options">
                <div className="product-option">
                  <div className="product-option-head">
                    <span>Цвет</span>
                    <b>{selected.color}</b>
                  </div>
                  <div className="product-option-values color-values">
                    {colors.map((v) => (
                      <Link
                        className={v === selected.color ? 'selected' : ''}
                        href={hrefFor(v)}
                        key={v}
                      >
                        <i data-color={v} />
                        {v}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/audio">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Комплектация</span>
                <strong>Устройство, кабель зарядки, документация</strong>
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
                  <dt>Бренд</dt>
                  <dd>{selected.brand}</dd>
                </div>
                <div>
                  <dt>Категория</dt>
                  <dd>{selected.kind}</dd>
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
