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
import type { CameraCatalogSku } from '@/data/camera-catalog';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
export function CameraProductPage({
  specifications,
  selected: baseSelected,
}: {
  specifications: ProductDetailContent;
  selected: CameraCatalogSku;
  variants: CameraCatalogSku[];
}) {
  const resolvePrice = usePriceResolver();
  const selected = resolvePrice(baseSelected);
  const [photo, setPhoto] = useState(0);
  const href = `/catalog/${selected.modelSlug}?color=${encodeURIComponent(selected.color)}`,
    product = {
      id: selected.id,
      name: selected.model,
      configuration: `${selected.kind} · ${selected.color}`,
      price: selected.price,
      image: selected.image,
      href,
    };
  return (
    <main className="iphone-product-page camera-product-page">
      <div className="container">
        <Link href="/catalog/cameras" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к фотоаппаратам
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame camera-gallery-frame">
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
              <span>FUJIFILM INSTAX</span>
              <span>Моментальная печать</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">
              INSTAX · {selected.kind.toUpperCase()}
            </p>
            <h1>{selected.model}</h1>
            <p className="product-lead">
              Камера для живых кадров и настоящих отпечатков, которые можно
              держать в руках.
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
              <Link href="/catalog/cameras">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Формат</span>
                <strong>Instax Mini</strong>
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
        <section className="product-story" id="about">
          <div className="product-section-kicker">О товаре</div>
          <div>
            <p className="catalog-overline">CAPTURE · PRINT · SHARE</p>
            <h2>Снимок превращается в воспоминание за несколько секунд</h2>
            <p>
              {selected.kind === 'Гибридная'
                ? 'Предпросмотр на экране, творческие эффекты и выбор кадров перед печатью.'
                : 'Автоматическая экспозиция, простое управление и моментальные фотографии формата Instax Mini.'}
            </p>
          </div>
        </section>
        <ProductSpecifications details={specifications} />
      </div>
    </main>
  );
}
