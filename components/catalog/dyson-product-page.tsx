'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowLeft, Check } from 'lucide-react';
import type { DysonCatalogSku } from '@/data/dyson-catalog';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
export function DysonProductPage({
  selected,
  variants,
}: {
  selected: DysonCatalogSku;
  variants: DysonCatalogSku[];
}) {
  const href = `/catalog/${selected.modelSlug}?color=${encodeURIComponent(selected.color)}`;
  const product = {
    id: href,
    name: selected.model,
    configuration: `${selected.kind} · ${selected.color}`,
    price: selected.price,
    image: selected.image,
    href,
  };
  const isAirwrap = selected.model.includes('Airwrap'),
    isDryer = selected.model.includes('Supersonic');
  return (
    <main className="iphone-product-page dyson-product-page">
      <div className="container">
        <Link href="/catalog/dyson" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к Dyson
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame dyson-gallery-frame">
              <Image
                src={selected.image}
                alt={`${selected.model} ${selected.color}`}
                fill
                priority
                unoptimized
                sizes="(max-width:768px) 100vw,58vw"
              />
            </div>
            <div className="product-gallery-note">
              <span>DYSON</span>
              <span>Оригинальная техника</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">
              DYSON · {selected.kind.toUpperCase()}
            </p>
            <h1>{selected.model}</h1>
            <p className="product-lead">
              Профессиональная укладка и уход за волосами с точным контролем
              температуры.
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
                  <span>Цвет</span>
                  <b>{selected.color}</b>
                </div>
                <div className="product-option-values color-values">
                  {variants.map((variant) => (
                    <Link
                      className={
                        variant.color === selected.color ? 'selected' : ''
                      }
                      href={`/catalog/${selected.modelSlug}?color=${encodeURIComponent(variant.color)}`}
                      key={variant.id}
                    >
                      {variant.color}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="product-option">
                <div className="product-option-head">
                  <span>Оплата картой / QR / рассрочка</span>
                  <b>{money.format(selected.cashlessPrice)} ₽</b>
                </div>
              </div>
            </div>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/dyson">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Назначение</span>
                <strong>{selected.kind}</strong>
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
            <p className="catalog-overline">DYSON HAIR CARE</p>
            <h2>
              {isAirwrap
                ? 'Сушка и укладка потоком воздуха.'
                : isDryer
                  ? 'Быстрая сушка с интеллектуальным контролем нагрева.'
                  : 'Выпрямление влажных волос без горячих пластин.'}
            </h2>
            <p>
              Технология Dyson помогает создавать аккуратную укладку, сохраняя
              естественный блеск волос и снижая воздействие экстремальных
              температур.
            </p>
          </div>
        </section>
        <section className="product-highlights">
          <div>
            <strong>3</strong>
            <span>скорости воздуха</span>
          </div>
          <div>
            <strong>3–4</strong>
            <span>режима нагрева</span>
          </div>
          <div>
            <strong>Cold shot</strong>
            <span>фиксация укладки</span>
          </div>
          <div>
            <strong>Dyson</strong>
            <span>цифровой мотор</span>
          </div>
        </section>
        <section className="product-specifications" id="specs">
          <div className="product-section-kicker">Характеристики</div>
          <div className="product-spec-groups">
            <div className="product-spec-group">
              <h3>Основные параметры</h3>
              <dl>
                <div>
                  <dt>Модель</dt>
                  <dd>{selected.model}</dd>
                </div>
                <div>
                  <dt>Тип</dt>
                  <dd>{selected.kind}</dd>
                </div>
                <div>
                  <dt>Цвет</dt>
                  <dd>{selected.color}</dd>
                </div>
                <div>
                  <dt>Контроль температуры</dt>
                  <dd>Интеллектуальный</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
