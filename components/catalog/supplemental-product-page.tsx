'use client';
import { ProductSpecifications } from './product-specifications';
import { DiscountPrice } from '@/components/shared/discount-price';

import Image from '@/components/shared/product-photo';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { itemConfiguration, parserUnavailableIds, type CatalogItem } from '@/lib/catalog-registry';
import { productHref } from '@/lib/product-selection';
import { usePriceResolver } from '@/components/providers/price-provider';
import { AddToCartButton, FavoriteButton } from '@/components/shared/commerce-buttons';
import { ProductVariants } from './product-variants';
import type { ProductDetailContent } from '@/lib/product-details';


export function AdditionalProductPage({ selected, details }: { selected: CatalogItem; details: ProductDetailContent }) {
  const resolve = usePriceResolver();
  const sku = resolve(selected);
  const unavailable = sku.price === null && parserUnavailableIds.has(sku.id);
  const [photo, setPhoto] = useState(0);
  const gallery = [...new Set(sku.gallery?.length ? sku.gallery : [sku.image])];
  const product = {
    id: sku.id,
    name: sku.model,
    configuration: itemConfiguration(sku),
    price: sku.price ?? 0,
    image: sku.image,
    href: productHref(sku),
  };

  return (
    <main className="iphone-product-page">
      <div className="container">
        <Link className="product-back" href={`/catalog/${sku.category}`}>← Вернуться в каталог</Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame">
              <Image src={gallery[photo] ?? sku.image} alt={[sku.model, itemConfiguration(sku)].filter(Boolean).join(' · ')} fill sizes="(max-width:768px) 100vw,58vw" />
            </div>
            {gallery.length > 1 && <div className="product-gallery-thumbs">
              {gallery.map((src, index) => <button key={src} onClick={() => setPhoto(index)} aria-label={`Фото ${index + 1}`} aria-pressed={index === photo}>
                <Image src={src} alt="" width={72} height={72} />
              </button>)}
            </div>}
            {sku.photoMissing && <p className="product-photo-note">Фото этой модели и цвета пока не добавлено.</p>}
          </section>
          <section className="product-info">
            <p className="catalog-overline">APPGRADE</p>
            <h1>{sku.model}</h1>
            {sku.article && <p className="product-lead">Артикул: {sku.article}</p>}
            <p className="product-lead">{details.lead}</p>
            <div className="product-price-line">
              <DiscountPrice price={sku.price} oldPrice={sku.oldPrice} unavailable={unavailable} />
              <span>{unavailable ? 'Недоступен для заказа' : sku.price === null ? 'Уточнить наличие' : 'В наличии'}</span>
            </div>
            <ProductVariants selectedId={sku.id} />
            <div className="product-actions">
              {unavailable ? null : sku.price === null
                ? <Link href="/#контакты">Уточнить цену у менеджера</Link>
                : <AddToCartButton product={product} />}
              <FavoriteButton product={product} />
            </div>
            <div className="product-meta-list"><div><span>Самовывоз</span><strong>После подтверждения менеджером</strong></div></div>
          </section>
        </div>
        <nav className="product-section-nav" aria-label="Разделы страницы">
          <a href="#about">О товаре</a>
          <a href="#specs">Характеристики</a>
        </nav>
        <section className="product-story" id="about">
          <div className="product-section-kicker">О товаре</div>
          <div>
            <p className="catalog-overline">{sku.model}</p>
            <h2>Описание</h2>
            <p>{details.description}</p>
          </div>
        </section>
        <ProductSpecifications details={details} />
      </div>
    </main>
  );
}
