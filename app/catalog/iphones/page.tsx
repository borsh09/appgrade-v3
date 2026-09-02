import type { Metadata } from 'next';
import { IphoneCatalogPage } from '@/components/catalog/iphone-catalog-page';

export const metadata: Metadata = {
  title: 'iPhone — каталог APPGRADE',
  description: 'Каталог iPhone APPGRADE с конфигурациями памяти, цветов и вариантов SIM.',
};

export default function IphonesRoute() {
  return <IphoneCatalogPage />;
}
