'use client';
import Link from '@/components/shared/safe-link';
import { UnifiedCatalog } from './unified-catalog';
import { CategoryPromoHero } from './category-promo-hero';
export function MacbookCatalogPage(){return <main className="retail-catalog-page"><div className="container"><nav className="retail-breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span>•</span><Link href="/catalog">Каталог</Link><span>•</span><span>MacBook</span></nav><CategoryPromoHero category="macbooks"/><UnifiedCatalog category="macbooks"/></div></main>}
