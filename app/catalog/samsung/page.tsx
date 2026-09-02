import type { Metadata } from 'next';
import { SamsungCatalogPage } from '@/components/catalog/samsung-catalog-page';

export const metadata: Metadata = {
  title: 'Samsung Galaxy — каталог APPGRADE',
  description: 'Каталог смартфонов Samsung Galaxy серий S, A и Z с выбором памяти и цвета.',
};

export default function SamsungRoute() {
  return <SamsungCatalogPage />;
}
