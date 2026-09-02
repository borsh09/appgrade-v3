'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowLeft, Check } from 'lucide-react';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
import type { XiaomiCatalogSku } from '@/data/xiaomi-catalog';

const money = new Intl.NumberFormat('ru-RU');
const unique = (items: string[]) => [...new Set(items)];
const specs: Record<string, string[][]> = {
  'Xiaomi 15 Ultra': [
    ['Экран', '6,73″ WQHD+ AMOLED, 1–120 Гц'],
    ['Процессор', 'Snapdragon 8 Elite'],
    ['Камеры', 'Leica 1″ + телефото 200 МП'],
    ['Защита', 'IP68'],
  ],
  'Xiaomi 15': [
    ['Экран', '6,36″ CrystalRes AMOLED, 1–120 Гц'],
    ['Процессор', 'Snapdragon 8 Elite'],
    ['Камеры', 'Тройная камера Leica'],
    ['Аккумулятор', '5240 мА·ч'],
  ],
  'Redmi Note 14 Pro+ 5G': [
    ['Экран', '6,67″ CrystalRes AMOLED, 120 Гц'],
    ['Процессор', 'Snapdragon 7s Gen 3'],
    ['Камера', '200 МП с OIS'],
    ['Защита', 'IP68'],
  ],
  'Poco X7 Pro': [
    ['Экран', '6,67″ CrystalRes AMOLED, 120 Гц'],
    ['Процессор', 'Dimensity 8400-Ultra'],
    ['Камера', '50 МП с OIS'],
    ['Аккумулятор', '6000 мА·ч'],
  ],
};

export function XiaomiProductPage({
  modelSlug,
  variants,
  selected,
}: {
  modelSlug: string;
  variants: XiaomiCatalogSku[];
  selected: XiaomiCatalogSku;
}) {
  const colors = unique(variants.map((sku) => sku.color));
  const href = `/catalog/${modelSlug}?storage=${encodeURIComponent(selected.storage)}&color=${encodeURIComponent(selected.color)}`;
  const product = {
    id: selected.id,
    name: `${selected.model} ${selected.storage}`,
    configuration: `${selected.ram} · ${selected.color}`,
    price: selected.price,
    image: selected.image,
    href,
  };
  return (
    <main className="iphone-product-page xiaomi-product-page">
      <div className="container">
        <Link href="/catalog/xiaomi" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к Xiaomi
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame xiaomi-gallery-frame">
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
              <span>XIAOMI</span>
              <span>Оригинальная техника</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">XIAOMI · HYPEROS</p>
            <h1>{selected.model}</h1>
            <p className="product-lead">
              Флагманские технологии, выразительная камера и быстрая HyperOS в
              сбалансированном корпусе.
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
                  <b>
                    {selected.ram} / {selected.storage}
                  </b>
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
                        href={`/catalog/${modelSlug}?storage=${encodeURIComponent(selected.storage)}&color=${encodeURIComponent(color)}`}
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
              <Link href="/catalog/xiaomi">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Система</span>
                <strong>Xiaomi HyperOS</strong>
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
        </nav>
        <section className="product-story" id="about">
          <div className="product-section-kicker">О товаре</div>
          <div>
            <p className="catalog-overline">{selected.model.toUpperCase()}</p>
            <h2>Технологии, которые работают на впечатление.</h2>
            <p>
              Яркий AMOLED-дисплей, производительная платформа и
              интеллектуальная обработка камеры помогают быстрее решать задачи и
              создавать выразительные кадры.
            </p>
          </div>
        </section>
        <section className="product-highlights">
          <div>
            <strong>120 Гц</strong>
            <span>плавный AMOLED</span>
          </div>
          <div>
            <strong>{selected.chip.includes('Elite') ? '3 нм' : '5G'}</strong>
            <span>высокая скорость</span>
          </div>
          <div>
            <strong>HyperOS</strong>
            <span>система Xiaomi</span>
          </div>
          <div>
            <strong>NFC</strong>
            <span>бесконтактная оплата</span>
          </div>
        </section>
        <section className="product-specifications" id="specs">
          <div className="product-section-kicker">Характеристики</div>
          <div className="product-spec-groups">
            <div className="product-spec-group">
              <h3>Основные параметры</h3>
              <dl>
                {specs[selected.model].map(([term, value]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="product-spec-group">
              <h3>Конфигурация</h3>
              <dl>
                <div>
                  <dt>Модель</dt>
                  <dd>{selected.model}</dd>
                </div>
                <div>
                  <dt>Память</dt>
                  <dd>
                    {selected.ram} / {selected.storage}
                  </dd>
                </div>
                <div>
                  <dt>Цвет</dt>
                  <dd>{selected.color}</dd>
                </div>
                <div>
                  <dt>Связь</dt>
                  <dd>5G, Wi-Fi, Bluetooth, NFC</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
