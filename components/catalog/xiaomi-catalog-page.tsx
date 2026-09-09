'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import { UnifiedCatalog } from './unified-catalog';
export function XiaomiCatalogPage(){const { city }=useCity();return (<main className="retail-catalog-page xiaomi-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Xiaomi</span>
        </nav>
        <header className="retail-catalog-hero xiaomi-catalog-hero">
          <div className="xiaomi-hero-copy">
            <p>LEICA · HYPEROS · 5G</p>
            <h1>Xiaomi</h1>
            <h2>Флагманская камера. Скорость без компромиссов.</h2>
            <div className="xiaomi-hero-actions">
              <Link href="/catalog/xiaomi-15-ultra">
                Смотреть Xiaomi 15 Ultra
              </Link>
              <button type="button">
                <MapPin size={15} />
                {city.name}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <Link
            className="xiaomi-hero-product"
            href="/catalog/xiaomi-15-ultra"
            aria-label="Xiaomi 15 Ultra"
          >
            <span>Xiaomi 15 Ultra</span>
            <Image
              src="/images/products/xiaomi/15-ultra-main.png"
              alt="Xiaomi 15 Ultra"
              fill
              priority
              unoptimized
              sizes="(max-width: 700px) 80vw, 42vw"
            />
          </Link>
        </header>
        <UnifiedCatalog category="xiaomi" /></div></main>);}
