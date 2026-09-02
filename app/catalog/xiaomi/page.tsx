import type { Metadata } from 'next';
import { XiaomiCatalogPage } from '@/components/catalog/xiaomi-catalog-page';

export const metadata: Metadata = {
  title: 'Xiaomi — APPGRADE',
  description:
    'Каталог смартфонов Xiaomi, Redmi и Poco с выбором памяти и цвета.',
};

export default function Page() {
  return <XiaomiCatalogPage />;
}
