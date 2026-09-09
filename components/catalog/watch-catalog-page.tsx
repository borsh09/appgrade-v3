'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import { UnifiedCatalog } from './unified-catalog';
export function WatchCatalogPage(){const { city }=useCity();return (<main className="retail-catalog-page watch-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Apple Watch</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>APPLE · WATCH</p>
          <h1>Apple Watch</h1>
          <button>
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <UnifiedCatalog category="watches" /></div></main>);}
