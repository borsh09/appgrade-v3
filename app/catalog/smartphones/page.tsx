import type { Metadata } from 'next';
import { UnifiedCatalog } from '@/components/catalog/unified-catalog';

export const metadata: Metadata = {
  title: 'Другие смартфоны — APPGRADE',
  description: 'Смартфоны Nothing, OnePlus, Honor и других брендов в APPGRADE.',
};

export default function SmartphonesRoute() {
  return <main className="retail-catalog-page"><div className="container"><h1>Другие смартфоны</h1><UnifiedCatalog category="smartphones" /></div></main>;
}
