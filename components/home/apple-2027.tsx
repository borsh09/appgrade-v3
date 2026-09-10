'use client';

import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from '@/components/shared/safe-link';
import { apple2027Products } from '@/data/apple-2027';
import { ProductCard } from './product-card';

export function Apple2027() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === 'right' ? container.clientWidth * 0.82 : -container.clientWidth * 0.82, behavior: 'smooth' });
  };

  return (
    <section className="appgrade-popular appgrade-apple-2027" aria-labelledby="apple-2027-title">
      <div className="container">
        <div className="appgrade-popular-heading">
          <div>
            <span>НОВИНКИ APPLE</span>
            <h2 id="apple-2027-title">Apple 2027.</h2>
          </div>
          <div className="appgrade-popular-heading-actions">
            <div className="appgrade-popular-arrows">
              <button type="button" onClick={() => scroll('left')} aria-label="Предыдущие новинки">
                <ArrowLeft size={18} />
              </button>
              <button type="button" onClick={() => scroll('right')} aria-label="Следующие новинки">
                <ArrowRight size={18} />
              </button>
            </div>
            <Link href="/catalog/iphones">
              Смотреть новинки
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div ref={scrollRef} className="appgrade-popular-track">
          {apple2027Products.map((product, index) => (
            <div key={product.sku.id} className="appgrade-popular-item">
              <ProductCard product={product} index={index} status="Предзаказ" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
