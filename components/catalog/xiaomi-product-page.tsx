'use client';
import { ProductSpecifications } from './product-specifications';
import { DiscountPrice } from '@/components/shared/discount-price';
import type { ProductDetailContent } from '@/lib/product-details';
import { ProductVariants } from './product-variants';
import { useState } from 'react';
import { usePriceResolver } from '@/components/providers/price-provider';

import Image from '@/components/shared/product-photo';
import Link from '@/components/shared/safe-link';
import { ArrowLeft, Check } from 'lucide-react';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
import type { XiaomiCatalogSku } from '@/data/xiaomi-catalog';



export function XiaomiProductPage({
  specifications,
  modelSlug,
  selected: baseSelected,
}: {
  specifications: ProductDetailContent;
  modelSlug: string;
  variants: XiaomiCatalogSku[];
  selected: XiaomiCatalogSku;
}) {
  const resolvePrice = usePriceResolver();
  const selected = resolvePrice(baseSelected);
  const [photo, setPhoto] = useState(0);
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
                src={selected.gallery[photo] ?? selected.image}
                alt={`${selected.model} ${selected.color}`}
                fill
                preload
                sizes="(max-width:768px) 100vw,58vw"
              />
            </div>
            <div className="product-gallery-thumbs" aria-label="Ракурсы товара">
              {selected.gallery.slice(0, 3).map((src, index) => (
                <button type="button" className={photo === index ? 'active' : ''} onClick={() => setPhoto(index)} key={`${src}-${index}`} aria-label={`Ракурс ${index + 1}`}>
                  <Image src={src} alt="" width={72} height={72} />
                </button>
              ))}
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
              <DiscountPrice price={selected.price} oldPrice={selected.oldPrice} />
              <span>
                <Check size={14} />В наличии
              </span>
            </div>
            <ProductVariants selectedId={selected.id} />
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
        </nav>
        <section className="product-story" id="about">
          <div className="product-section-kicker">О товаре</div>
          <div>
            <p className="catalog-overline">{selected.model.toUpperCase()}</p>
            <h2>Технологии, которые работают на впечатление</h2>
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
        <ProductSpecifications details={specifications} />
      </div>
    </main>
  );
}
