import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';
import { popularProducts } from '@/data/popular-products';
import { ProductCard } from './product-card';
import styles from './popular-products.module.css';

export function PopularProducts() {
  return (
    <section id="каталог" className="appgrade-popular" aria-labelledby="popular-products-title">
      <div className="container">
        <div className="appgrade-popular-heading">
          <div>
            <span>Выбор APPGRADE</span>
            <h2 id="popular-products-title">Подборка техники.</h2>
            <p className={styles.description}>Флагманские модели и актуальные конфигурации в разных категориях.</p>
          </div>
          <div className="appgrade-popular-heading-actions">
            <Link href="/catalog">Смотреть всё <ArrowRight size={16} /></Link>
          </div>
        </div>
        <div className={styles.grid}>
          {popularProducts.map((product, index) => (
            <ProductCard key={product.sku.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
