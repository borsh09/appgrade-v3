'use client';
import Link from '@/components/shared/safe-link';
import {
  ArrowRight,
  Check,
  RefreshCcw,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { featuredProducts } from '@/data/catalog';
import { CITY_LIST } from '@/config/cities';
import { useCity } from '@/components/providers/city-provider';
import { ProductCard } from './product-card';
import { HeroSection } from './hero-section';
import { BrandStrip, CategoryShowcase, PromoMosaic } from './retail-sections';
import { ProductDay } from './product-day';
import { RevealEffects } from './reveal-effects';
export function HomePage() {
  const { cityId, setCityId } = useCity();
  return (
    <main>
      <RevealEffects />
      <HeroSection />
      <CategoryShowcase />
      <ProductDay />
      <section id="каталог" className="products-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Сейчас выбирают</h2>
            </div>
            <Link href="/catalog">
              Перейти в каталог <ArrowRight size={17} />
            </Link>
          </div>
          <div className="product-grid">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.sku.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
      <PromoMosaic />
      <section id="trade-in" className="trade-section">
        <div className="container trade-grid">
          <div>
            <h2>Старый iPhone может стоить больше, чем кажется.</h2>
            <p>Оценим устройство за пару минут. Вы доплатите только разницу.</p>
            <Link className="button button-light" href="#контакты">
              Оценить устройство <ArrowRight size={17} />
            </Link>
          </div>
          <div className="trade-flow">
            <div>
              <span>ВАШ СЕЙЧАС</span>
              <strong>iPhone</strong>
            </div>
            <ArrowRight />
            <div className="trade-price">
              <span>ДО</span>
              <strong>54 000 ₽</strong>
              <small>в зачёт покупки</small>
            </div>
            <ArrowRight />
            <div>
              <span>ВАШ СЛЕДУЮЩИЙ</span>
              <strong>iPhone</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="benefits container">
        <div className="section-heading">
          <div>
            <h2>Почему APPGRADE</h2>
          </div>
        </div>
        <div className="benefit-list">
          <div>
            <ShieldCheck />
            <h3>Оригинальная техника</h3>
            <p>Только новые устройства с гарантией.</p>
          </div>
          <div>
            <Check />
            <h3>Честная цена</h3>
            <p>Помогаем выбрать, не навязывая лишнего.</p>
          </div>
          <div>
            <RefreshCcw />
            <h3>Выгодный Trade-In</h3>
            <p>Старое устройство работает на новую покупку.</p>
          </div>
          <div>
            <Store />
            <h3>Три города</h3>
            <p>Покупайте там, где вам удобно.</p>
          </div>
        </div>
      </section>
      <BrandStrip />
      <section id="контакты" className="cities-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>APPGRADE в трёх городах</h2>
            </div>
            <p>
              Выберите ближайший магазин.
              <br />
              Цены и наличие в каталоге обновятся для выбранного города.
            </p>
          </div>
          <div className="city-grid">
            {CITY_LIST.map((city, index) => (
              <button
                key={city.id}
                onClick={() => setCityId(city.id)}
                className={cityId === city.id ? 'active' : ''}
                type="button"
                aria-pressed={cityId === city.id}
              >
                <span>0{index + 1}</span>
                <strong>{city.name}</strong>
                <small>
                  {cityId === city.id ? 'Выбранный город' : 'Выбрать город'}
                </small>
                <ArrowRight />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
