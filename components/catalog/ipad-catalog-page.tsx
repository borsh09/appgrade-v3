'use client';
import Link from '@/components/shared/safe-link';
import { UnifiedCatalog } from './unified-catalog';
import { CategoryPromoHero } from './category-promo-hero';
export function IpadCatalogPage(){return (<main className="retail-catalog-page ipad-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>iPad</span>
        </nav>
        <CategoryPromoHero category="ipads" />
        <UnifiedCatalog category="ipads" /></div></main>);}
