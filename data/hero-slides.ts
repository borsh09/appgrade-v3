export interface HeroSlide {
  id: string;
  eyebrow: string;
  product: string;
  headline: string;
  price: string;
  image: string;
  imageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'iphone-17-pro',
    eyebrow: 'НОВИНКА В APPGRADE',
    product: 'iPhone 17 Pro\nи 17 Pro Max',
    headline: 'Шаг к новым возможностям',
    price: 'от 99 990 ₽',
    image: '/images/king-banner-product.webp',
    imageAlt: 'Оранжевые iPhone 17 Pro и iPhone 17 Pro Max',
    primaryCta: { label: 'Купить', href: '#каталог' },
    secondaryCta: { label: 'Подробнее', href: '/catalog/iphone-17-pro' },
  },
  {
    id: 'macbook-air',
    eyebrow: 'MACBOOK AIR',
    product: 'MacBook Air',
    headline: 'Легче. Быстрее. Для больших планов.',
    price: 'от 99 990 ₽',
    image: '/images/king-category-computers.webp',
    imageAlt: 'MacBook Air',
    primaryCta: { label: 'Выбрать MacBook', href: '#каталог' },
    secondaryCta: { label: 'Подробнее', href: '#каталог' },
  },
  {
    id: 'trade-in',
    eyebrow: 'TRADE-IN В APPGRADE',
    product: 'Обновиться\nпроще.',
    headline: 'Старое устройство — часть новой покупки.',
    price: 'Оценка за пару минут',
    image: '/images/hero-iphone-orange.png',
    imageAlt: 'Trade-In в APPGRADE',
    primaryCta: { label: 'Оценить устройство', href: '#trade-in' },
    secondaryCta: { label: 'Как это работает', href: '#trade-in' },
  },
];
