'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ChevronDown, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import { UnifiedCatalog } from './unified-catalog';
export function SamsungCatalogPage(){const { city }=useCity();return (<main className="retail-catalog-page">
      <div className="container">
        <nav className="retail-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>•</span>
          <Link href="/catalog">Каталог</Link>
          <span>•</span>
          <span>Samsung</span>
        </nav>
        <header className="retail-catalog-hero">
          <p>SAMSUNG</p>
          <h1>Samsung Galaxy</h1>
          <button type="button">
            <MapPin size={15} />
            {city.name}
            <ChevronDown size={14} />
          </button>
        </header>
        <UnifiedCatalog category="samsung" /></div></main>);}
