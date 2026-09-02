import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';
import { catalogCategories } from '@/data/catalog-navigation';

export function CatalogPage() {
  return (
    <main className="catalog-page">
      <div className="container">
        <nav className="catalog-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>—</span>
          <span>Каталог</span>
        </nav>
        <div className="catalog-heading">
          <div>
            <p className="catalog-overline">APPGRADE</p>
            <h1>Каталог</h1>
          </div>
          <p>Выберите категорию, чтобы посмотреть доступную технику.</p>
        </div>
        <section
          className="catalog-category-grid"
          aria-label="Категории каталога"
        >
          {catalogCategories.map((category) => (
            <Link
              className={`catalog-category-card catalog-category-card-${category.id}`}
              href={
                category.id === 'iphone'
                  ? '/catalog/iphones'
                  : category.id === 'samsung'
                    ? '/catalog/samsung'
                    : category.id === 'xiaomi'
                      ? '/catalog/xiaomi'
                      : category.id === 'macbook'
                        ? '/catalog/macbooks'
                        : category.id === 'ipad'
                          ? '/catalog/ipads'
                          : category.id === 'audio'
                            ? '/catalog/audio'
                            : category.id === 'watches'
                              ? '/catalog/watches'
                              : category.id === 'gaming'
                                ? '/catalog/playstation'
                                : category.id === 'google'
                                  ? '/catalog/google'
                                  : category.id === 'dyson'
                                    ? '/catalog/dyson'
                                    : category.id === 'cameras'
                                      ? '/catalog/cameras'
                                      : `/catalog?category=${category.id}`
              }
              key={category.id}
            >
              <div className="catalog-category-copy">
                <h2>{category.title}</h2>
              </div>
              <Image
                src={category.image}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
              <ArrowRight className="catalog-category-arrow" size={18} />
            </Link>
          ))}
        </section>
        <section className="catalog-coming-soon">
          <p>Не нашли нужную модель?</p>
          <span>
            Напишите менеджеру — проверим наличие, подберём конфигурацию и
            предложим альтернативы в вашем городе.
          </span>
        </section>
      </div>
    </main>
  );
}
