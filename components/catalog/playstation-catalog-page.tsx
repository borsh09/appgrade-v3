'use client';
import Link from '@/components/shared/safe-link';
import { UnifiedCatalog } from './unified-catalog';
import { CategoryPromoHero } from './category-promo-hero';
export function PlaystationCatalogPage(){return (<main className="retail-catalog-page playstation-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>PlayStation</span>
        </nav>
        <CategoryPromoHero category="playstation" />
        <UnifiedCatalog category="playstation" /></div></main>);}
