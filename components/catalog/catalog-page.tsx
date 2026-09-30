import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';
import { catalogCategoryGroups } from '@/data/catalog-navigation';

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
        <section className="catalog-category-groups" aria-label="Категории каталога">
          {catalogCategoryGroups.map(group => (
            <section className="catalog-category-group" key={group.title}>
              <h2>{group.title}</h2>
              <div className="catalog-category-grid">
                {group.categories.map(category => (
                  <Link className={`catalog-category-card catalog-category-card-${category.id}`} href={category.href} key={category.id}>
                    <div className="catalog-category-copy">
                      <h3>{category.title}</h3>
                      <p>{category.description}</p>
                    </div>
                    <Image src={category.image} alt="" fill unoptimized sizes="(max-width: 700px) 50vw, (max-width: 1100px) 50vw, 33vw" />
                    <ArrowRight className="catalog-category-arrow" size={18} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </section>
        <section className="catalog-coming-soon">
          <p>Не нашли нужную модель?</p>
          <span>
            Напишите менеджеру — проверим наличие, подберём конфигурацию и
            предложим альтернативы в вашем городе.
          </span>
          <Link href="/#контакты">Связаться с магазином →</Link>
        </section>
      </div>
    </main>
  );
}
