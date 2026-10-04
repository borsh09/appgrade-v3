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
import { MobileHomeSearch } from './mobile-home-search';

export function HomePage() {
  return (
    <main>
      <h1 className="sr-only">APPGRADE — магазин техники в Магнитогорске, Белорецке, Троицке и Сибае</h1>
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
      <MobileHomeSearch />
    </main>
  );
}
