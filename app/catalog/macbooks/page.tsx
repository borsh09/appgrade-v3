import type { Metadata } from 'next';
import { MacbookCatalogPage } from '@/components/catalog/macbook-catalog-page';

export const metadata: Metadata = { title: 'MacBook — APPGRADE', description: 'Каталог MacBook Air и MacBook Neo с выбором памяти, цвета и конфигурации.' };

export default function MacbooksPage() { return <MacbookCatalogPage />; }
