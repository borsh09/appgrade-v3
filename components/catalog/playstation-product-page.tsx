'use client';
import { ProductSpecifications } from './product-specifications';
import { DiscountPrice } from '@/components/shared/discount-price';
import type { ProductDetailContent } from '@/lib/product-details';
import { ProductVariants } from './product-variants';
import { usePriceResolver } from '@/components/providers/price-provider';
import Image from '@/components/shared/product-photo';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { PlaystationCatalogSku } from '@/data/playstation-catalog';
import { AddToCartButton } from '@/components/shared/commerce-buttons';



export function PlaystationProductPage({
  specifications,
  selected: baseSelected,
}: {
  specifications: ProductDetailContent;
  selected: PlaystationCatalogSku;
  variants: PlaystationCatalogSku[];
}) {
  const resolvePrice = usePriceResolver();
  const selected = resolvePrice(baseSelected);
  const [photo, setPhoto] = useState(0);
  const isConsole = selected.kind === 'Консоли';
  
  const href = `/catalog/${selected.modelSlug}?color=${encodeURIComponent(selected.color)}`;
  const product = {
    id: selected.id,
    name: selected.model,
    configuration: `${selected.configuration} · ${selected.color}`,
    price: selected.price,
    image: selected.image,
    href,
  };
  return (
    <main className="iphone-product-page playstation-product-page">
      <div className="container">
        <Link href="/catalog/playstation" className="product-back">
          <ArrowLeft size={16} />
          Вернуться в PlayStation
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame playstation-gallery-frame">
              <Image
                src={selected.gallery[photo]}
                alt={`${selected.model}, фото ${photo + 1}`}
                fill
                preload
                sizes="(max-width:768px) 100vw,58vw"
              />
            </div>
            <div className="product-gallery-thumbs">
              {selected.gallery.map((src, index) => (
                <button
                  className={photo === index ? 'active' : ''}
                  onClick={() => setPhoto(index)}
                  key={src}
                  type="button"
                  aria-label={`Фото ${index + 1}`}
                  aria-pressed={photo === index}
                >
                  <Image src={src} alt="" fill sizes="66px" />
                </button>
              ))}
            </div>
            <div className="product-gallery-note">
              <span>SONY</span>
              <span>Оригинальная техника</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">
              PLAYSTATION · {selected.kind.toUpperCase()}
            </p>
            <h1>{selected.model}</h1>
            <p className="product-lead">
              {selected.configuration}. Официальная игровая система Sony с
              гарантией и проверкой перед выдачей.
            </p>
            <div className="product-price-line">
              <DiscountPrice price={selected.price} oldPrice={selected.oldPrice} />
              <span>
                <Check size={14} />В наличии
              </span>
            </div>
            <ProductVariants selectedId={selected.id} />
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/playstation">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Комплектация</span>
                <strong>
                  {isConsole
                    ? 'Консоль, DualSense, кабели, документация'
                    : 'Устройство, документация'}
                </strong>
              </div>
              <div>
                <span>Самовывоз</span>
                <strong>После подтверждения</strong>
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
            <p className="catalog-overline">SONY PLAYSTATION</p>
            <h2>
              {isConsole
                ? 'Игры нового поколения'
                : 'Всё для полного погружения'}
            </h2>
            <p>
              {isConsole
                ? 'Высокоскоростная загрузка, реалистичная графика и тактильная отдача DualSense объединяются в цельную игровую систему.'
                : 'Оригинальный аксессуар Sony создан для экосистемы PlayStation 5 и полностью совместим с консолью.'}
            </p>
          </div>
        </section>
        <section className="product-highlights">
          {(isConsole
            ? [
                ['4K', 'игровое разрешение'],
                ['120 Гц', 'плавное изображение'],
                ['SSD', 'быстрая загрузка'],
                ['3D Audio', 'объёмный звук'],
              ]
            : [
                ['PS5', 'полная совместимость'],
                ['Sony', 'оригинальный аксессуар'],
                ['12 мес.', 'гарантия'],
                ['Сегодня', 'самовывоз'],
              ]
          ).map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>
        <ProductSpecifications details={specifications} />
        <section className="product-delivery" id="delivery">
          <div className="product-section-kicker">Покупка</div>
          <div>
            <h2>Доставка и гарантия</h2>
            <div className="product-delivery-grid">
              <article>
                <h3>Получение</h3>
                <p>Самовывоз из магазина или доставка по выбранному городу.</p>
              </article>
              <article>
                <h3>Оплата</h3>
                <p>Наличными, картой, переводом, в кредит или рассрочку.</p>
              </article>
              <article>
                <h3>Гарантия</h3>
                <p>
                  12 месяцев. Проверим устройство и комплектность перед выдачей.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
