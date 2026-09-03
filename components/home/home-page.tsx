'use client';

import { HeroSection } from './hero-section';
import { BrandMarquee } from './brand-marquee';
import { CategoryShowcaseNew } from './category-showcase-new';
import { PopularProducts } from './popular-products';
import { TradeInBanner } from './trade-in-banner';
import { PromoBento } from './promo-bento';
import { ServiceStrip } from './service-strip';
import { AvitoReviews } from './avito-reviews';
import { StoreLocations } from './store-locations';
import { RevealEffects } from './reveal-effects';

export function HomePage() {
  return (
    <main>
      <RevealEffects />

      <HeroSection />

      <BrandMarquee />

      <CategoryShowcaseNew />

      <PopularProducts />

      <TradeInBanner />

      <PromoBento />

      <ServiceStrip />

      <AvitoReviews />

      <StoreLocations />
    </main>
  );
}