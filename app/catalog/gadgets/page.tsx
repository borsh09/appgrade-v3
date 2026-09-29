import type { Metadata } from 'next';
import { UnifiedCatalog } from '@/components/catalog/unified-catalog';

export const metadata: Metadata = {
  title: 'Гаджеты и аксессуары — APPGRADE',
  description: 'Гаджеты, аксессуары и техника из каталога APPGRADE.',
};

export default function GadgetsRoute() {
  return <main className="retail-catalog-page"><div className="container"><h1>Гаджеты и аксессуары</h1><UnifiedCatalog category="gadgets" /></div></main>;
}
