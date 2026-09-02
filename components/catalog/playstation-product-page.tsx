'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { PlaystationCatalogSku } from '@/data/playstation-catalog';
import { AddToCartButton } from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
const consoleSpecs = [
  ['Разрешение', 'До 4K, 120 Гц'],
  ['Накопитель', 'Высокоскоростной SSD'],
  ['Графика', 'Ray Tracing, HDR'],
  ['Звук', 'Tempest 3D AudioTech'],
];

export function PlaystationProductPage({
  selected,
  variants,
}: {
  selected: PlaystationCatalogSku;
  variants: PlaystationCatalogSku[];
}) {
  const [photo, setPhoto] = useState(0);
  const isConsole = selected.kind === 'Консоли';
  const specs = isConsole
    ? consoleSpecs
    : selected.model.includes('Charging')
      ? [
          ['Совместимость', 'DualSense для PS5'],
          ['Зарядка', 'До двух контроллеров'],
          ['Подключение', 'Док-станция'],
          ['Цвет', selected.color],
        ]
      : [
          ['Подключение', 'Bluetooth, USB-C'],
          ['Функции', 'Haptic Feedback'],
          ['Триггеры', 'Адаптивные L2/R2'],
          ['Микрофон', 'Встроенный'],
        ];
  const colors = [...new Set(variants.map((variant) => variant.color))];
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
                priority
                unoptimized
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
                  <Image src={src} alt="" fill unoptimized sizes="66px" />
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
              <strong>{money.format(selected.price)} ₽</strong>
              <span>
                <Check size={14} />В наличии
              </span>
            </div>
            <div className="product-options">
              <div className="product-option">
                <div className="product-option-head">
                  <span>Комплектация</span>
                  <b>{selected.configuration}</b>
                </div>
              </div>
              {colors.length > 1 && (
                <div className="product-option">
                  <div className="product-option-head">
                    <span>Цвет</span>
                    <b>{selected.color}</b>
                  </div>
                  <div className="product-option-values color-values">
                    {colors.map((color) => (
                      <Link
                        className={color === selected.color ? 'selected' : ''}
                        href={`/catalog/${selected.modelSlug}?color=${encodeURIComponent(color)}`}
                        key={color}
                      >
                        {color}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
        <section className="product-specifications" id="specs">
          <div className="product-section-kicker">Характеристики</div>
          <div className="product-spec-groups">
            <div className="product-spec-group">
              <h3>Основные параметры</h3>
              <dl>
                {specs.map(([term, value]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
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
                  <dt>Категория</dt>
                  <dd>{selected.kind}</dd>
                </div>
                <div>
                  <dt>Версия</dt>
                  <dd>{selected.configuration}</dd>
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
