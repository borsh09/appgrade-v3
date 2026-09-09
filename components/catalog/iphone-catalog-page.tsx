'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import { UnifiedCatalog } from './unified-catalog';
export function IphoneCatalogPage(){const { city }=useCity();return (<main className="retail-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Apple</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>APPLE</p>
          <h1>Apple iPhone</h1>
          <button type="button">
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <UnifiedCatalog category="iphones" /></div></main>);}
