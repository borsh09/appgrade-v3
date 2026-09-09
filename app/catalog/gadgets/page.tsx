import { UnifiedCatalog } from '@/components/catalog/unified-catalog';
export const metadata = { title: 'Гаджеты — APPGRADE' };
export default function Page() {
  return (
    <main className="retail-catalog-page">
      <div className="container"><header className="retail-catalog-hero"><h1>Гаджеты и умные колонки</h1></header><UnifiedCatalog category="gadgets" /></div>
    </main>
  );
}
