'use client';

import { useRef } from 'react';
import Link from '@/components/shared/safe-link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { featuredProducts } from '@/data/catalog';

import { ProductCard } from './product-card';

export function PopularProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;

    if (!container) return;

    const amount = container.clientWidth * 0.82;

    container.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="каталог"
      className="appgrade-popular"
    >
      <div className="container">
        <div className="appgrade-popular-heading">
          <div>
            <span>Популярное</span>

            <h2>Сейчас выбирают.</h2>
          </div>

          <div className="appgrade-popular-heading-actions">
            <div className="appgrade-popular-arrows">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Предыдущие товары"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Следующие товары"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            <Link href="/catalog">
              Смотреть всё
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="appgrade-popular-track"
        >
          {featuredProducts.map((product, index) => (
            <div
              key={product.sku.id}
              className="appgrade-popular-item"
            >
              <ProductCard
                product={product}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}