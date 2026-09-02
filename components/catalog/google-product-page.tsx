'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { GoogleCatalogSku } from '@/data/google-catalog';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
const unique = <T,>(items: T[]) => [...new Set(items)];
const specs: Record<string, string[][]> = {
  'Google Pixel 10 Pro XL': [
    ['Экран', '6,8″ Super Actua LTPO OLED, 1–120 Гц'],
    ['Процессор', 'Google Tensor G5'],
    ['Камеры', '50 МП + 48 МП + 48 МП'],
    ['Аккумулятор', '5200 мА·ч'],
    ['Защита', 'IP68'],
    ['Система', 'Android 16'],
  ],
  'Google Pixel 10': [
    ['Экран', '6,3″ Actua OLED, 60–120 Гц'],
    ['Процессор', 'Google Tensor G5'],
    ['Камеры', '48 МП + 13 МП + 10,8 МП'],
    ['Аккумулятор', '4970 мА·ч'],
    ['Защита', 'IP68'],
    ['Система', 'Android 16'],
  ],
  'Google Pixel 9 Pro XL': [
    ['Экран', '6,8″ Super Actua LTPO OLED, 1–120 Гц'],
    ['Процессор', 'Google Tensor G4'],
    ['Камеры', '50 МП + 48 МП + 48 МП'],
    ['Аккумулятор', '5060 мА·ч'],
    ['Защита', 'IP68'],
    ['Система', 'Android'],
  ],
};
export function GoogleProductPage({
  modelSlug,
  variants,
  selected,
}: {
  modelSlug: string;
  variants: GoogleCatalogSku[];
  selected: GoogleCatalogSku;
}) {
  const [photo, setPhoto] = useState(0);
  const colors = unique(variants.map((v) => v.color));
  const href = `/catalog/${modelSlug}?storage=${encodeURIComponent(selected.storage)}&color=${encodeURIComponent(selected.color)}`;
  const product = {
    id: selected.id,
    name: `${selected.model} ${selected.storage}`,
    configuration: selected.color,
    price: selected.price,
    image: selected.image,
    href,
  };
  return (
    <main className="iphone-product-page google-product-page">
      <div className="container">
        <Link href="/catalog/google" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к Google Pixel
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame google-gallery-frame">
              <Image
                src={selected.gallery[photo]}
                alt={`${selected.model} ${selected.color}, фото ${photo + 1}`}
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
              <span>GOOGLE</span>
              <span>Pixel с Gemini</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">GOOGLE · PIXEL</p>
            <h1>{selected.model}</h1>
            <p className="product-lead">
              Смартфон Google с камерой Pixel, встроенным Gemini и длительной
              поддержкой обновлений.
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
              </div>
              <div className="product-option">
                <div className="product-option-head">
                  <span>Цвет</span>
                  <b>{selected.color}</b>
                </div>
                <div className="product-option-values color-values">
                  {colors.map((color) => (
                    <Link
                      className={color === selected.color ? 'selected' : ''}
                      href={`/catalog/${modelSlug}?storage=${encodeURIComponent(selected.storage)}&color=${encodeURIComponent(color)}`}
                      key={color}
                    >
                      {color}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/google">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Комплектация</span>
                <strong>Смартфон, кабель USB-C, документация</strong>
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
            <p className="catalog-overline">PIXEL · GEMINI</p>
            <h2>Создан Google. Усилен искусственным интеллектом.</h2>
            <p>
              Камера Pixel помогает получать качественные кадры в любых
              условиях, а Gemini упрощает поиск, общение и повседневные задачи.
            </p>
          </div>
        </section>
        <section className="product-highlights">
          {[
            ['7 лет', 'обновлений'],
            ['120 Гц', 'плавный экран'],
            ['IP68', 'защита корпуса'],
            ['Gemini', 'встроенный AI'],
          ].map(([v, l]) => (
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
                {specs[selected.model].map(([t, v]) => (
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
                  <dd>{selected.model}</dd>
                </div>
                <div>
                  <dt>Память</dt>
                  <dd>{selected.storage}</dd>
                </div>
                <div>
                  <dt>Цвет</dt>
                  <dd>{selected.color}</dd>
                </div>
                <div>
                  <dt>Связь</dt>
                  <dd>5G, Wi‑Fi, Bluetooth, NFC</dd>
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
                <p>Самовывоз из магазина или доставка по выбранному городу.</p>
              </article>
              <article>
                <h3>Оплата</h3>
                <p>Наличными, картой, переводом, в кредит или рассрочку.</p>
              </article>
              <article>
                <h3>Гарантия</h3>
                <p>
                  12 месяцев. Проверим смартфон и комплектность перед выдачей.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
