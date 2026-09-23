'use client';
import Link from '@/components/shared/safe-link';
import { UnifiedCatalog } from './unified-catalog';
import { CategoryPromoHero } from './category-promo-hero';
export function WatchCatalogPage(){return (<main className="retail-catalog-page watch-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Apple Watch</span>
        </nav>
        <CategoryPromoHero category="watches" />
        <UnifiedCatalog category="watches" /></div></main>);}
