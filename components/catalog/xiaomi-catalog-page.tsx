'use client';
import Link from '@/components/shared/safe-link';
import { UnifiedCatalog } from './unified-catalog';
import { CategoryPromoHero } from './category-promo-hero';
export function XiaomiCatalogPage(){return (<main className="retail-catalog-page xiaomi-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Xiaomi</span>
        </nav>
        <CategoryPromoHero category="xiaomi" />
        <UnifiedCatalog category="xiaomi" /></div></main>);}
