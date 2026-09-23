'use client';

import Image from '@/components/shared/product-photo';
import Link from '@/components/shared/safe-link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import styles from './category-promo-hero.module.css';

export type PromoCategory = 'iphones' | 'samsung' | 'macbooks' | 'ipads' | 'watches' | 'audio' | 'playstation' | 'google' | 'xiaomi' | 'cameras' | 'dyson';

const promos = {
  iphones: { eyebrow: 'APPLE · PRO', title: 'Apple iPhone', tagline: 'Максимальная мощность. Новый уровень мобильной фотографии.', product: 'iPhone 18 Pro Max', href: '/catalog/iphone-18-pro-max', image: '/images/products/apple-2027/clean/iphone-18-pro-max.png' },
  samsung: { eyebrow: 'GALAXY AI · ULTRA', title: 'Samsung Galaxy', tagline: 'Флагманская камера и интеллект нового поколения.', product: 'Samsung Galaxy S26 Ultra', href: '/catalog/samsung-galaxy-s26-ultra', image: '/images/products/gallery/samsung-galaxy-s26-ultra-cobalt-violet/view-1.jpg' },
  macbooks: { eyebrow: 'APPLE · M5', title: 'MacBook', tagline: 'Большой экран. Тонкий корпус. Производительность на весь день.', product: 'MacBook Air 15 M5', href: '/catalog/macbook-air-15-m5', image: '/images/products/art-directed/macbook-air-15-m5-sky-blue-v2.png' },
  ipads: { eyebrow: 'APPLE · IPAD', title: 'iPad', tagline: 'Тонкий, быстрый и готов к любым идеям.', product: 'iPad Air 13 M4', href: '/catalog/ipad-air-13-m4', image: '/images/products/gallery/ipad-air-13-m4-blue/view-1.jpg' },
  watches: { eyebrow: 'APPLE · WATCH', title: 'Apple Watch', tagline: 'Приключения, здоровье и связь — прямо на запястье.', product: 'Apple Watch Ultra 4', href: '/catalog/apple-watch-ultra-4', image: '/images/products/apple-2027/clean/watch-ultra-4.png' },
  audio: { eyebrow: 'APPLE · SPATIAL AUDIO', title: 'Наушники и аудио', tagline: 'Чистый звук, комфорт и музыка без проводов.', product: 'AirPods 5', href: '/catalog/airpods-5-with-wireless-charging-case', image: '/images/products/apple-2027/clean/airpods-5.png' },
  playstation: { eyebrow: 'SONY · PLAY HAS NO LIMITS', title: 'PlayStation', tagline: 'Максимум производительности для игр нового поколения.', product: 'PlayStation 5 Pro', href: '/catalog/playstation-5-pro', image: '/images/home/ps5-pro.png' },
  google: { eyebrow: 'PIXEL · GEMINI', title: 'Google Pixel', tagline: 'Флагманская камера и полезный ИИ в чистом Android.', product: 'Google Pixel 10 Pro XL', href: '/catalog/google-pixel-10-pro-xl', image: '/images/products/gallery/pixel10proxl-moonstone/view-1.jpg' },
  xiaomi: { eyebrow: 'LEICA · HYPEROS · 5G', title: 'Xiaomi', tagline: 'Флагманская камера. Скорость без компромиссов.', product: 'Xiaomi 15 Ultra', href: '/catalog/xiaomi-15-ultra', image: '/images/products/xiaomi/15-ultra-main.png' },
  cameras: { eyebrow: 'INSTAX · МОМЕНТАЛЬНЫЕ СНИМКИ', title: 'Фотоаппараты', tagline: 'Живые кадры и готовые фотографии в один момент.', product: 'Instax Mini Evo', href: '/catalog/instax-mini-evo', image: '/images/products/cameras/evo-black.png' },
  dyson: { eyebrow: 'DYSON · HAIR CARE', title: 'Dyson', tagline: 'Профессиональная укладка и бережный уход каждый день.', product: 'Dyson Airwrap Long HS09', href: '/catalog/dyson-airwrap-long-hs09', image: '/images/products/art-directed/dyson-airwrap-hs09-jasper-plum-v2.png' },
} satisfies Record<PromoCategory, { eyebrow: string; title: string; tagline: string; product: string; href: string; image: string }>;

export function CategoryPromoHero({ category }: { category: PromoCategory }) {
  const { city, openCitySelector } = useCity();
  const promo = promos[category];
  const campaign = campaigns[category];
  return (
    <header className={`${styles.hero} ${styles[category]}`}>
      <div className={styles.copy}>
        <div className={styles.topline}><h1>{promo.title}</h1><span>Выбор APPGRADE</span></div>
        <p className={styles.headline}>{campaign.headline}<em>{campaign.accent}</em></p>
        <p className={styles.description}>{campaign.description}</p>
        <div className={styles.actions}>
          <Link className={styles.cta} href={promo.href}>Выбрать модель <ArrowUpRight size={19} aria-hidden="true" /></Link>
          <button className={styles.city} type="button" onClick={openCitySelector} aria-label={`Выбрать город. Сейчас: ${city.name}`}><MapPin size={14} aria-hidden="true" />{city.name}</button>
        </div>
        <p className={styles.detail}>{campaign.detail}</p>
      </div>
      <div className={styles.visual}>
        <span className={styles.wordmark} aria-hidden="true">{campaign.word}</span>
        <Link className={styles.product} href={promo.href} aria-label={`Подробнее о ${promo.product}`}>
          <Image src={promo.image} alt={promo.product} fill preload unoptimized sizes="(max-width: 700px) 95vw, 58vw" />
        </Link>
        <Link href={promo.href} className={styles.caption}><span><small>В центре внимания</small>{promo.product}</span><ArrowUpRight size={22} aria-hidden="true" /></Link>
      </div>
    </header>
  );
}

const campaigns: Record<PromoCategory, { headline: string; accent: string; description: string; detail: string; word: string }> = {
  iphones: { headline: 'Больше, чем', accent: 'впечатление.', description: 'iPhone 18 Pro Max. Выразительный дизайн и большой экран для всего, что вам важно.', detail: 'Выберите цвет, память и версию SIM', word: 'Pro.' },
  samsung: { headline: 'Ваш масштаб.', accent: 'Уровень Ultra.', description: 'Galaxy S26 Ultra — для ярких кадров, смелых идей и дел, которые не ждут.', detail: 'Найдите свою конфигурацию Galaxy', word: 'Ultra' },
  macbooks: { headline: 'Лёгкость.', accent: 'С большим запасом.', description: 'MacBook Air 15 M5. Пространство для работы, творчества и следующей большой идеи.', detail: 'Подберите память и цвет корпуса', word: 'Air' },
  ipads: { headline: 'Идеям нужен', accent: 'большой экран.', description: 'iPad Air 13 M4. Рисуйте, учитесь и создавайте — в своём ритме и где удобно.', detail: 'Выберите свой iPad Air', word: 'Create' },
  watches: { headline: 'За пределами', accent: 'привычного.', description: 'Apple Watch Ultra 4. Выразительная деталь вашего стиля и спутник активного дня.', detail: 'Откройте модель и варианты исполнения', word: 'Ultra' },
  audio: { headline: 'Весь мир.', accent: 'В вашем ритме.', description: 'AirPods 5. Любимые треки, важные разговоры и маленькие паузы только для себя.', detail: 'Посмотрите модель и её характеристики', word: 'Sound' },
  playstation: { headline: 'Вечер начинается', accent: 'с Play.', description: 'PlayStation 5 Pro. Погрузитесь в новые миры и вернитесь к любимым играм.', detail: 'Откройте комплектацию консоли', word: 'PLAY' },
  google: { headline: 'Красота момента.', accent: 'В деталях.', description: 'Google Pixel 10 Pro XL. Для спонтанных кадров, свежих идей и вашего взгляда на мир.', detail: 'Найдите свой оттенок Pixel', word: 'Pixel' },
  xiaomi: { headline: 'В каждом кадре —', accent: 'ваш почерк.', description: 'Xiaomi 15 Ultra. Фотография становится поводом замечать больше каждый день.', detail: 'Познакомьтесь с флагманом Xiaomi', word: 'Leica' },
  cameras: { headline: 'Моменты, которые', accent: 'остаются.', description: 'Instax Mini Evo. Снимайте, выбирайте любимые кадры и превращайте их в фотографии.', detail: 'Выберите камеру для своей истории', word: 'Memories' },
  dyson: { headline: 'Ваш стиль.', accent: 'Красиво каждый день.', description: 'Dyson Airwrap Long HS09. Откройте новые варианты укладки и найдите свой образ.', detail: 'Посмотрите цвета и комплектацию', word: 'Beauty' },
};
