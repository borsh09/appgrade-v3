import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';

const categoryTiles = [
  {
    title: 'iPhone',
    image: '/images/king-category-iphone.webp',
    href: '/catalog/iphones',
  },
  {
    title: 'Samsung',
    image: '/images/king-category-smartphones.webp',
    href: '/catalog/samsung',
  },
  {
    title: 'MacBook',
    image: '/images/king-category-computers.webp',
    href: '/catalog/macbooks',
  },
  {
    title: 'Планшеты',
    image: '/images/king-category-tablets.webp',
    href: '/catalog/ipads',
  },
  {
    title: 'Смарт-часы',
    image: '/images/king-category-watches.webp',
    href: '/catalog/watches',
  },
  {
    title: 'Наушники и аудио',
    image: '/images/king-category-headphones.webp',
    href: '/catalog/audio',
  },
  {
    title: 'PlayStation',
    image: '/images/king-category-gaming.webp',
    href: '/catalog/playstation',
  },
  {
    title: 'Dyson',
    image: '/images/king-category-dyson.webp',
    href: '/catalog/dyson',
  },
  {
    title: 'Аксессуары',
    image: '/images/king-category-accessories.webp',
    href: '/catalog?category=Аксессуары',
  },
  {
    title: 'Фотоаппараты',
    image: '/images/king-category-gadgets.webp',
    href: '/catalog/cameras',
  },
];

const offerRail = [
  { title: 'Розыгрыш BMW 3', image: '/images/king-discount-day.webp', href: '/catalog' },
  { title: 'iPhone 17 Pro', image: '/images/king-banner-product.webp', href: '/catalog/iphones' },
  { title: 'Подарки при покупке', image: '/images/king-gifts.webp', href: '/catalog' },
  { title: 'Наши клиенты', image: '/images/king-review-poster.webp', href: '/catalog' },
  { title: 'Кэшбэк с покупок', image: '/images/king-cashback.webp', href: '/catalog' },
  { title: 'Рассрочка без %', image: '/images/king-promo-codes.webp', href: '/catalog' },
  { title: 'Trade-in', image: '/images/king-trade-in.webp', href: '#trade-in' },
  { title: 'Гарантия низкой цены', image: '/images/king-lifetime-warranty.webp', href: '/catalog' },
];

export function OfferRail() {
  return (
    <section className="offer-rail-section" aria-label="Акции и предложения">
      <div className="container offer-rail">
        {offerRail.map((item) => (
          <Link href={item.href} className="offer-rail-item" key={item.title}>
            <span className="offer-rail-image"><Image src={item.image} alt="" fill unoptimized sizes="92px" /></span>
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CategoryShowcase() {
  return (
    <section
      className="retail-categories container"
      aria-labelledby="retail-categories-title"
    >
      <div className="retail-section-head">
        <div>
          <h2 id="retail-categories-title">Техника для каждого дня</h2>
        </div>
        <Link href="/catalog">
          Все категории <ArrowRight size={16} />
        </Link>
      </div>
      <div className="categories-review-layout">
        <div className="category-mosaic">
          {categoryTiles.map((item) => (
            <Link href={item.href} key={item.title}>
              <div>
                <h3>{item.title}</h3>
              </div>
              <Image
                src={item.image}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 768px) 90vw, 33vw"
              />
            </Link>
          ))}
        </div>
        <Link href="/catalog" className="category-review">
          <div>
            <span>ВЫБОР APPGRADE</span>
            <h3>
              Техника,
              <br />
              которую выбирают
              <br />
              сейчас.
            </h3>
          </div>
          <Image
            src="/images/king-review-poster.webp"
            alt="Подборка техники APPGRADE"
            fill
            unoptimized
            sizes="316px"
          />
        </Link>
      </div>
    </section>
  );
}

export function PromoMosaic() {
  return (
    <section
      className="promo-showcase container"
      aria-labelledby="offers-title"
    >
      <div className="retail-section-head">
        <div>
          <h2 id="offers-title">Выгода без мелкого шрифта</h2>
        </div>
      </div>
      <div className="promo-mosaic">
        <Link href="/#trade-in" className="offer-tile offer-trade">
          <div>
            <span>TRADE-IN</span>
            <h3>
              Обновиться проще,
              <br />
              чем кажется.
            </h3>
            <p>Оценим старое устройство и зачтём стоимость в новую покупку.</p>
          </div>
          <strong>
            Узнать стоимость <ArrowRight size={18} />
          </strong>
        </Link>
        <Link href="/catalog/macbooks" className="offer-tile offer-device">
          <div>
            <span>MACBOOK AIR</span>
            <h3>
              Лёгкий.
              <br />
              По-настоящему мощный.
            </h3>
          </div>
          <Image
            src="/images/king-category-computers.webp"
            alt="MacBook Air"
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Link>
        <Link href="/#контакты" className="offer-tile offer-city">
          <div>
            <span>APPGRADE РЯДОМ</span>
            <h3>
              Три города.
              <br />
              Один уровень сервиса.
            </h3>
            <p>Магнитогорск · Белорецк · Троицк</p>
          </div>
          <ArrowRight size={22} />
        </Link>
      </div>
    </section>
  );
}

export function BrandStrip() {
  return (
    <section className="brand-strip" aria-label="Бренды">
      <div className="container">
        <span>APPLE</span>
        <span>SAMSUNG</span>
        <span>DYSON</span>
        <span>SONY</span>
        <span>JBL</span>
        <span>PLAYSTATION</span>
      </div>
    </section>
  );
}
