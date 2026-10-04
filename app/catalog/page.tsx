import { pageMetadata } from '@/lib/seo';
import { CatalogPage } from '@/components/catalog/catalog-page';

export const metadata = pageMetadata('Каталог техники и аксессуаров', 'Смартфоны, компьютеры, планшеты, аудио, часы и другая техника в APPGRADE. Сравните модели и характеристики, выберите город и оформите заказ.', '/catalog');

export default function CatalogRoute() {
  return <CatalogPage />;
}
