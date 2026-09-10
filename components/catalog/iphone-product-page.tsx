'use client';
import { ProductVariants } from './product-variants';
import { usePriceResolver, usePricedCatalog } from '@/components/providers/price-provider';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { IphoneCatalogSku } from '@/data/iphone-catalog';
import { getIphoneDetails } from '@/data/iphone-details';
import { AddToCartButton } from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');

type IphoneProductPageProps = {
  model: string;
  modelSlug: string;
  variants: IphoneCatalogSku[];
  selected: IphoneCatalogSku;
};

export function IphoneProductPage({
  model,
  modelSlug,
  variants: baseVariants,
  selected: baseSelected,
}: IphoneProductPageProps) {
  const resolvePrice = usePriceResolver();
  const selected = resolvePrice(baseSelected);
  const variants = usePricedCatalog(baseVariants);
  const gallery = [...new Set(selected.gallery?.length ? selected.gallery : [selected.image])]
    .map((src, index) => ({ src, view: `angle-${index + 1}` }));
  const [activePhoto, setActivePhoto] = useState(0);
  const currentPhoto = gallery[activePhoto] ?? gallery[0];
  const details = getIphoneDetails(model);
  const isPreorder = model.includes('18 Pro') || model.includes('Duo');
  const wideCanvas = /iphone-(13|14|15|16)-(?!pro)/.test(
    currentPhoto.src,
  );

  const hrefFor = (key: 'storage' | 'color' | 'sim', value: string) => {
    const query = new URLSearchParams({
      storage: selected.storage,
      color: selected.color,
      sim: selected.sim,
    });
    query.set(key, value);
    return `/catalog/${modelSlug}?${query.toString()}`;
  };
  const product = {
    id: selected.id,
    name: `${model} ${selected.storage}`,
    configuration: `${selected.color} · ${selected.sim}`,
    price: selected.price,
    image: selected.image,
    href: hrefFor('color', selected.color),
  };

  return (
    <main className="iphone-product-page">
      <div className="container">
        <Link href="/catalog/iphones" className="product-back">
          <ArrowLeft size={16} /> Вернуться к iPhone
        </Link>
        <div className="product-layout">
          <section className="product-gallery" aria-label={`Фото ${model}`}>
            <div
              className={`product-gallery-frame product-gallery-view-${currentPhoto.view} ${wideCanvas ? 'product-gallery-wide-source' : 'product-gallery-tight-source'}`}
            >
              <Image
                src={currentPhoto.src}
                alt={`${model} ${selected.color}, фото ${activePhoto + 1}`}
                fill
                priority
                quality={100}
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>
            {gallery.length > 1 && (
              <div
                className="product-gallery-thumbs"
                aria-label="Фотографии товара"
              >
                {gallery.map((photo, index) => (
                  <button
                    type="button"
                    key={`${photo.src}-${index}`}
                    className={index === activePhoto ? 'active' : ''}
                    onClick={() => setActivePhoto(index)}
                    aria-label={`Фото ${index + 1}`}
                  >
                    <Image
                      className={`thumb-${photo.view} ${/iphone-(13|14|15|16)-(?!pro)/.test(photo.src) ? 'thumb-wide-source' : 'thumb-tight-source'}`}
                      src={photo.src}
                      alt=""
                      fill
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="product-gallery-note">
              <span>APPGRADE</span>
              <span>Оригинальная техника</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">APPLE · IPHONE</p>
            <h1>{model}</h1>
            <p className="product-lead">
              {isPreorder
                ? 'Оформите предзаказ — менеджер подтвердит сроки поставки и комплектацию.'
                : 'Выберите конфигурацию — цена обновится автоматически. Товар в наличии.'}
            </p>
            <div className="product-price-line">
              <strong>{money.format(selected.price)} ₽</strong>
              <span>
                <Check size={14} /> {isPreorder ? 'Предзаказ' : 'В наличии'}
              </span>
            </div>
            <ProductVariants selectedId={selected.id} />
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/iphones">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Гарантия</span>
                <strong>12 месяцев</strong>
              </div>
              <div>
                <span>Самовывоз</span>
                <strong>После подтверждения</strong>
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
