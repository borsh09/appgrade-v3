import type { Metadata } from 'next';
import { CatalogPage } from '@/components/catalog/catalog-page';

export const metadata: Metadata = {
  title: 'Каталог техники — APPGRADE',
  description: 'Категории техники APPGRADE: iPhone, Samsung, MacBook, iPad, аудио, часы, игровые устройства, Dyson и аксессуары.',
};

export default function CatalogRoute() {
  return <CatalogPage />;
}
