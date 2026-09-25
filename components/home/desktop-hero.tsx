'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Pause, Play } from 'lucide-react';
import Link from '@/components/shared/safe-link';
import styles from './desktop-hero.module.css';

const slides = [
  {
    name: 'iPhone 18',
    theme: 'iphone',
    title: 'iPhone 18 уже в APPGRADE',
    description: 'Доступен в рассрочку 0/0/36 без % и переплат',
    action: 'iPhone 18 Pro',
    href: '/catalog/iphone-18-pro',
    secondaryAction: 'iPhone 18 Pro Max',
    secondaryHref: '/catalog/iphone-18-pro-max',
    image: '/images/home/iphone-18-pro-hero.png',
    alt: 'iPhone 18 Pro и iPhone 18 Pro Max',
    imageStyle: 'cover',
  },
  {
    name: 'Гарантия 5 лет',
    theme: 'warranty',
    title: 'Техника с гарантией 5 лет',
    description: 'Будьте уверены в надёжности устройства',
    action: 'В каталог',
    href: '/catalog',
    image: '/images/king-lifetime-warranty.webp',
    alt: 'Несколько моделей iPhone',
    imageStyle: 'contain',
  },
  {
    name: 'Trade-In',
    theme: 'trade',
    title: 'Выгодный Trade-In',
    description: 'Сдай старое устройство и получи скидку на новое',
    action: 'Оценить онлайн',
    href: '/trade-in',
    image: '/images/home/trade-in-silver-graphite.png',
    alt: 'Два iPhone для программы Trade-In',
    imageStyle: 'cover',
  },
  {
    name: 'Низкая цена',
    theme: 'price',
    title: 'Гарантия низкой цены',
    description: 'Нашли дешевле? Предложим ещё выгоднее',
    action: 'Подобрать устройство',
    href: '/catalog',
    image: '/images/hero-kingstore-product.webp',
    alt: 'Оранжевый iPhone',
    imageStyle: 'contain',
  },
  {
    name: 'Кешбэк и Алиса',
    theme: 'cashback',
    title: 'Кешбэк с каждой покупки и возможность забрать Алису',
    description: 'Получай кешбэк с каждой покупки и получи возможность забрать Яндекс Станцию при покупке iPhone',
    action: 'Выбрать iPhone',
    href: '/catalog/iphones',
    image: '/images/products/completed/station-mini-3.png',
    alt: 'Яндекс Станция с Алисой',
    imageStyle: 'contain',
  },
] as const;

export function DesktopHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setActive(current => (current + 1) % slides.length);
      }
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [active, paused]);

  return (
    <section
      className={`${styles.hero} ${styles[slides[active].theme]}`}
      aria-label="Предложения APPGRADE"
      aria-roledescription="карусель"
      onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchEnd={event => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const deltaX = event.changedTouches[0].clientX - start.x;
        const deltaY = event.changedTouches[0].clientY - start.y;
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
          setActive(current => (current + (deltaX < 0 ? 1 : slides.length - 1)) % slides.length);
          setPaused(true);
        }
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.name}
          id={`home-promo-${index}`}
          className={`${styles.slide} ${styles[`${slide.theme}Slide`]} ${index === active ? styles.active : ''}`}
          inert={index !== active}
          aria-hidden={index !== active}
          aria-roledescription="слайд"
          aria-label={`${index + 1} из ${slides.length}: ${slide.name}`}
        >
          <div className={styles.visual}>
            <Image src={slide.image} alt={slide.alt} fill priority={index === 0} loading={index === 0 ? undefined : 'eager'} unoptimized sizes="(max-width: 768px) 100vw, 65vw" className={slide.imageStyle === 'cover' ? styles.coverImage : styles.containImage} />
          </div>
          <div className={styles.copy}>
            <h2>{slide.title}</h2>
            <p className={styles.description}>{slide.description}</p>
            <div className={styles.actions}>
              <Link className={styles.cta} href={slide.href}>{slide.action}<ArrowRight size={18} /></Link>
              {'secondaryHref' in slide && <Link className={`${styles.cta} ${styles.secondaryCta}`} href={slide.secondaryHref}>{slide.secondaryAction}<ArrowRight size={18} /></Link>}
            </div>
          </div>
        </div>
      ))}
      <div className={styles.controls}>
        <div className={styles.selectors}>
          {slides.map((slide, index) => (
            <button type="button" key={slide.name} aria-controls={`home-promo-${index}`} aria-label={`Слайд ${index + 1}: ${slide.name}`} aria-pressed={index === active} onClick={() => { setActive(index); setPaused(true); }}>
              <span>0{index + 1}</span><span className={styles.selectorName}>{slide.name}</span>
            </button>
          ))}
        </div>
        <button className={styles.pause} type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Включить смену слайдов' : 'Приостановить смену слайдов'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
      </div>
    </section>
  );
}
