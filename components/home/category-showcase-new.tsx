'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';
import { catalogCategoryGroups } from '@/data/catalog-navigation';
import styles from './category-showcase-new.module.css';

const categories = [
  {
    title: 'iPhone',
    subtitle: 'Смартфоны Apple',
    href: '/catalog/iphones',
    image: '/images/king-category-iphone.webp',
    className: 'is-large is-dark',
  },
  {
    title: 'Samsung',
    subtitle: 'Смартфоны Galaxy',
    href: '/catalog/samsung',
    image: '/images/king-category-smartphones.webp',
    className: 'is-light',
  },
  {
    title: 'MacBook',
    subtitle: 'Для работы и учёбы',
    href: '/catalog/macbooks',
    image: '/images/king-category-computers.webp',
    className: 'is-light',
  },
  {
    title: 'AirPods',
    subtitle: 'Наушники и колонки',
    href: '/catalog/audio',
    image: '/images/king-category-headphones.webp',
    className: 'is-light',
  },
  {
    title: 'Dyson',
    subtitle: 'Красота и уход',
    href: '/catalog/dyson',
    image: '/images/king-category-dyson.webp',
    className: 'is-dark-small',
  },
];

export function CategoryShowcaseNew() {
  return (
    <section className="appgrade-categories">
      <div className="container">
        <div className="appgrade-categories-heading">
          <div>
            <span>Каталог</span>
            <h2>Выбирайте своё</h2>
          </div>

          <Link href="/catalog">
            Смотреть всё
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="appgrade-categories-grid">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className={`appgrade-category-card ${category.className}`}
            >
              <div className="appgrade-category-copy">
                <span>{category.subtitle}</span>

                <h3>{category.title}</h3>

                <div className="appgrade-category-link">
                  Смотреть
                  <ArrowRight size={15} />
                </div>
              </div>

              <div className="appgrade-category-image">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 40vw"
                  className="appgrade-category-product"
                  preload={category.title === 'iPhone'}
                />
              </div>
            </Link>
          ))}
        </div>
        <nav className={styles.links} aria-label="Все категории товаров">
          {catalogCategoryGroups.flatMap(group => group.categories).map(category => (
            <Link key={category.id} href={category.href}>{category.title}<ArrowRight size={14} aria-hidden="true" /></Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
