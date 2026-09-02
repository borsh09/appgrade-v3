'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { featuredProducts } from '@/data/catalog';
import { useCity } from '@/components/providers/city-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';

const money = new Intl.NumberFormat('ru-RU');
export function ProductDay() {
  const { city } = useCity();
  const [activeIndex, setActiveIndex] = useState(0);
  const { model, sku } = featuredProducts[activeIndex];
  const changeProduct = (direction: number) =>
    setActiveIndex(
      (current) =>
        (current + direction + featuredProducts.length) %
        featuredProducts.length,
    );
  const params = new URLSearchParams({
    color: sku.colorSlug,
    ...(sku.storage ? { storage: sku.storage } : {}),
    ...(sku.sim ? { sim: sku.sim } : {}),
  });
  const href = `/catalog/${model.slug}?${params}`;
  const product = {
    id: sku.id,
    name: model.name,
    configuration: [sku.storage, sku.color, sku.sim].filter(Boolean).join(' · '),
    price: sku.price,
    image: sku.image,
    href,
  };
  return (
    <section
      className="product-day container"
      aria-labelledby="product-day-title"
    >
      <div className="retail-section-head">
        <div>
          <h2 id="product-day-title">Товар дня</h2>
        </div>
        <div className="product-day-arrows">
          <button
            type="button"
            onClick={() => changeProduct(-1)}
            aria-label="Предыдущий товар"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => changeProduct(1)}
            aria-label="Следующий товар"
          >
            →
          </button>
        </div>
      </div>
      <article className="product-day-card">
        <div className="product-day-image">
          <Image
            src={sku.image}
            alt={model.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 55vw"
          />
        </div>
        <div className="product-day-info">
          <div className="product-badges">
            <span>НОВИНКА</span>
            <span>ВЫГОДНЫЙ КОМПЛЕКТ</span>
          </div>
          <p className="product-day-brand">APPLE</p>
          <h3>{model.name}</h3>
          <p className="product-day-config">{product.configuration}</p>
          <p className="product-day-stock">В наличии в г. {city.name}</p>
          <div className="product-day-price">
            {sku.oldPrice && <del>{money.format(sku.oldPrice)} ₽</del>}
            <strong>{money.format(sku.price)} ₽</strong>
            <small>
              или от {money.format(Math.ceil(sku.price / 12))} ₽/мес.
            </small>
          </div>
          <div className="product-day-actions">
            <AddToCartButton product={product} />
            <FavoriteButton product={product} />
          </div>
          <Link href={href}>
            Подробнее о модели <ArrowRight size={17} />
          </Link>
        </div>
      </article>
    </section>
  );
}
