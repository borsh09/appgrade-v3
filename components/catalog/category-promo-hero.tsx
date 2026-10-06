'use client';

import Image from '@/components/shared/product-photo';
import Link from '@/components/shared/safe-link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import {searchIndex} from '@/data/search-index';
import {catalogPromoPhoto} from '@/lib/catalog-promo-photo';
import styles from './category-promo-hero.module.css';

export type PromoCategory = 'iphones' | 'samsung' | 'macbooks' | 'ipads' | 'watches' | 'audio' | 'playstation' | 'google' | 'xiaomi' | 'cameras' | 'dyson';

const promos = {
  iphones: { eyebrow: 'APPLE · PRO', title: 'Apple iPhone', tagline: 'Максимальная мощность. Новый уровень мобильной фотографии.', product: 'iPhone 18 Pro Max' },
  samsung: { eyebrow: 'GALAXY AI · ULTRA', title: 'Samsung Galaxy', tagline: 'Флагманская камера и интеллект нового поколения.', product: 'Samsung Galaxy S26 Ultra' },
  macbooks: { eyebrow: 'APPLE · M5', title: 'MacBook', tagline: 'Большой экран. Тонкий корпус. Производительность на весь день.', product: 'MacBook Air 15 M5' },
  ipads: { eyebrow: 'APPLE · IPAD', title: 'iPad', tagline: 'Тонкий, быстрый и готов к любым идеям.', product: 'iPad Air 13 M4' },
  watches: { eyebrow: 'APPLE · WATCH', title: 'Apple Watch', tagline: 'Приключения, здоровье и связь — прямо на запястье.', product: 'Apple Watch Series 11' },
  audio: { eyebrow: 'APPLE · SPATIAL AUDIO', title: 'Наушники и аудио', tagline: 'Чистый звук, комфорт и музыка без проводов.', product: 'AirPods Pro 3' },
  playstation: { eyebrow: 'SONY · PLAY HAS NO LIMITS', title: 'PlayStation', tagline: 'Максимум впечатлений от каждой игры.', product: 'Sony DualSense' },
  google: { eyebrow: 'PIXEL · GEMINI', title: 'Google Pixel', tagline: 'Флагманская камера и полезный ИИ в чистом Android.', product: 'Google Pixel 10 Pro' },
  xiaomi: { eyebrow: 'LEICA · HYPEROS · 5G', title: 'Xiaomi', tagline: 'Флагманская камера. Скорость без компромиссов.', product: 'Xiaomi 17 Ultra' },
  cameras: { eyebrow: 'INSTAX · МОМЕНТАЛЬНЫЕ СНИМКИ', title: 'Фотоаппараты', tagline: 'Живые кадры и готовые фотографии в один момент.', product: 'Instax Mini Evo' },
  dyson: { eyebrow: 'DYSON · HAIR CARE', title: 'Dyson', tagline: 'Профессиональная укладка и бережный уход каждый день.', product: 'Dyson Airwrap Long HS09' },
} satisfies Record<PromoCategory, { eyebrow: string; title: string; tagline: string; product: string }>;

const promoModels:Partial<Record<PromoCategory,string[]>>={
  dyson:['Dyson HS09 Long'],
  cameras:['Fujifilm Instax Mini Evo'],
  playstation:['Sony DualSense'],
};

export function CategoryPromoHero({ category }: { category: PromoCategory }) {
  const { city, openCitySelector } = useCity();
  const promo = promos[category];
  const campaign = campaigns[category];
  const item=catalogPromoPhoto(searchIndex,promoModels[category]??[promo.product]);
  if(!item)return <header><h1>{promo.title}</h1></header>;
  const href=item.href;
  const product=item.model;
  return (
    <header className={`${styles.hero} ${styles[category]}`}>
      <div className={styles.copy}>
        <div className={styles.topline}><h1>{promo.title}</h1><span>Выбор APPGRADE</span></div>
        <p className={styles.headline}>{campaign.headline}<em>{campaign.accent}</em></p>
        <p className={styles.description}>{campaign.description}</p>
        <div className={styles.actions}>
          <Link className={styles.cta} href={href}>Выбрать модель <ArrowUpRight size={19} aria-hidden="true" /></Link>
          <button className={styles.city} type="button" onClick={openCitySelector} aria-label={`Выбрать город. Сейчас: ${city.name}`}><MapPin size={14} aria-hidden="true" />{city.name}</button>
        </div>
        <p className={styles.detail}>{campaign.detail}</p>
      </div>
      <div className={styles.visual}>
        <span className={styles.wordmark} aria-hidden="true">{campaign.word}</span>
        <Link className={styles.product} href={href} aria-label={`Подробнее о ${product}`}>
          <Image src={item.image} alt={product} fill preload unoptimized sizes="(max-width: 700px) 95vw, 58vw" />
        </Link>
        <Link href={href} className={styles.caption}><span><small>В центре внимания</small>{product}</span><ArrowUpRight size={22} aria-hidden="true" /></Link>
      </div>
    </header>
  );
}

const campaigns: Record<PromoCategory, { headline: string; accent: string; description: string; detail: string; word: string }> = {
  iphones: { headline: 'Новый взгляд', accent: 'на Pro.', description: 'iPhone 18 Pro и Pro Max. Выберите свою модель, цвет и конфигурацию.', detail: 'iPhone 18 · В наличии', word: 'Pro' },
  samsung: { headline: 'Ваш масштаб.', accent: 'Уровень Ultra.', description: 'Galaxy S26 Ultra — для ярких кадров, смелых идей и дел, которые не ждут.', detail: 'Найдите свою конфигурацию Galaxy', word: 'Ultra' },
  macbooks: { headline: 'Лёгкость.', accent: 'С большим запасом.', description: 'MacBook Air 15 M5. Пространство для работы, творчества и следующей большой идеи.', detail: 'Подберите память и цвет корпуса', word: 'Air' },
  ipads: { headline: 'Идеям нужен', accent: 'большой экран.', description: 'iPad Air 13 M4. Рисуйте, учитесь и создавайте — в своём ритме и где удобно.', detail: 'Выберите свой iPad Air', word: 'Create' },
  watches: { headline: 'За пределами', accent: 'привычного.', description: 'Apple Watch Series 11. Выразительная деталь вашего стиля и спутник активного дня.', detail: 'Откройте модель и варианты исполнения', word: 'Watch' },
  audio: { headline: 'Весь мир.', accent: 'В вашем ритме.', description: 'AirPods Pro 3. Любимые треки, важные разговоры и маленькие паузы только для себя.', detail: 'Посмотрите модель и её характеристики', word: 'Sound' },
  playstation: { headline: 'Почувствуйте', accent: 'каждое движение.', description: 'Sony DualSense. Больше эмоций, точности и погружения в любимые игры.', detail: 'Выберите свой цвет геймпада', word: 'PLAY' },
  google: { headline: 'Красота момента.', accent: 'В деталях.', description: 'Google Pixel 10 Pro. Для спонтанных кадров, свежих идей и вашего взгляда на мир.', detail: 'Найдите свой оттенок Pixel', word: 'Pixel' },
  xiaomi: { headline: 'В каждом кадре —', accent: 'ваш почерк.', description: 'Xiaomi 17 Ultra. Фотография становится поводом замечать больше каждый день.', detail: 'Познакомьтесь с флагманом Xiaomi', word: 'Leica' },
  cameras: { headline: 'Моменты, которые', accent: 'остаются.', description: 'Instax Mini Evo. Снимайте, выбирайте любимые кадры и превращайте их в фотографии.', detail: 'Выберите камеру для своей истории', word: 'Memories' },
  dyson: { headline: 'Ваш стиль.', accent: 'Красиво каждый день.', description: 'Dyson Airwrap Long HS09. Откройте новые варианты укладки и найдите свой образ.', detail: 'Посмотрите цвета и комплектацию', word: 'Beauty' },
};

