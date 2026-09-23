'use client';
import Link from '@/components/shared/safe-link';
import { UnifiedCatalog } from './unified-catalog';
import { CategoryPromoHero } from './category-promo-hero';
export function GoogleCatalogPage(){return <main className="retail-catalog-page"><div className="container"><nav className="retail-breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>•</span><Link href="/catalog">Каталог</Link><span>•</span><span>Google</span></nav><CategoryPromoHero category="google"/><UnifiedCatalog category="google"/></div></main>}
