'use client';

import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from '@/components/shared/safe-link';
import { ProductCard } from '@/components/home/product-card';
import { preorderModels } from '@/lib/catalog-order';
import type { FeaturedProduct } from '@/types/catalog';
import styles from './product-recommendations.module.css';

export function ProductRecommendations({ products }: { products: FeaturedProduct[] }) {
  const rail = useRef<HTMLDivElement>(null);
  if (!products.length) return null;
  const scroll = (direction: number) => {
    const node = rail.current;
    if (node) node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <section className={styles.section} aria-labelledby="related-products-title">
      <div className="container">
        <div className={styles.heading}>
          <div><span className={styles.kicker}>Продолжите выбор</span><h2 id="related-products-title">С этим товаром смотрят</h2><p>Другие модели и техника, которая дополнит вашу покупку.</p></div>
          <div className={styles.actions}>
            <Link href="/catalog">Весь каталог <ArrowRight size={16} /></Link>
            <div className={styles.arrows}><button type="button" aria-label="Предыдущие товары" aria-controls="related-products-rail" onClick={() => scroll(-1)}><ArrowLeft size={19} /></button><button type="button" aria-label="Следующие товары" aria-controls="related-products-rail" onClick={() => scroll(1)}><ArrowRight size={19} /></button></div>
          </div>
        </div>
        <div ref={rail} id="related-products-rail" className={styles.rail}>
          {products.map((product, index) => <ProductCard key={product.sku.id} product={product} index={index} status={preorderModels.has(product.model.name) ? 'Предзаказ' : 'В наличии'} />)}
        </div>
      </div>
    </section>
  );
}
