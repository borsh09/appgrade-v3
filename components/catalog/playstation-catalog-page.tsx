'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import { UnifiedCatalog } from './unified-catalog';
export function PlaystationCatalogPage(){const { city }=useCity();return (<main className="retail-catalog-page playstation-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>PlayStation</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>SONY · PLAY HAS NO LIMITS</p>
          <h1>PlayStation</h1>
          <button>
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <UnifiedCatalog category="playstation" /></div></main>);}
