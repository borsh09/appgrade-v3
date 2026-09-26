'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Link from '@/components/shared/safe-link';
import styles from './desktop-hero.module.css';

const slides = [
  {
    name: 'iPhone 18',
    theme: 'iphone',
    title: ['iPhone 18', 'уже в APPGRADE'],
    description: 'Доступен в рассрочку 0/0/36 без % и переплат',
    action: 'iPhone 18 Pro',
    href: '/catalog/iphone-18-pro',
    secondaryAction: 'iPhone 18 Pro Max',
    secondaryHref: '/catalog/iphone-18-pro-max',
    image: '/images/home/iphone-18-pro-dark-cherry.jpg',
    alt: 'Крупный план бургундового iPhone 18 Pro',
  },
  {
    name: 'Гарантия 5 лет',
    theme: 'warranty',
    title: ['Техника с гарантией', '5 лет'],
    description: 'Будьте уверены в надёжности устройства',
    action: 'В каталог',
    href: '/catalog',
    image: '/images/home/warranty-campaign-v2.png',
    alt: 'Объёмная стеклянная цифра пять',
  },
  {
    name: 'Trade-In',
    theme: 'trade',
    title: ['Выгодный', 'Trade-In'],
    description: 'Сдай старое устройство и получи скидку на новое',
    action: 'Оценить онлайн',
    href: '/trade-in',
    image: '/images/home/trade-in-campaign-v2.png',
    alt: 'Графитовый и бургундовый смартфоны',
  },
  {
    name: 'Низкая цена',
    theme: 'price',
    title: ['Гарантия', 'низкой цены'],
    description: 'Нашли дешевле? Предложим ещё выгоднее',
    action: 'Подобрать устройство',
    href: '/catalog',
    image: '/images/products/apple-2027/clean/iphone-18-pro-banner.png',
    alt: 'iPhone в графитовом цвете',
  },
  {
    name: 'Кешбэк и Алиса',
    theme: 'cashback',
    title: ['Кешбэк с каждой покупки', 'и возможность забрать Алису'],
    description: 'Получай кешбэк с каждой покупки и получи возможность забрать Яндекс Станцию при покупке iPhone',
    action: 'Выбрать iPhone',
    href: '/catalog/iphones',
    image: '/images/products/completed/station-mini-3.png',
    alt: 'Яндекс Станция с Алисой',
  },
] as const;

export function DesktopHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setActive(current => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [active, paused]);

  return (
    <section
      className={`${styles.hero} ${paused ? styles.rotationPaused : styles.rotating}`}
      aria-label="Предложения APPGRADE"
      aria-roledescription="карусель"
      onPointerMove={event => {
        if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--drift-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 24}px`);
        event.currentTarget.style.setProperty('--drift-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 16}px`);
        event.currentTarget.style.setProperty('--light-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
        event.currentTarget.style.setProperty('--light-y', `${(event.clientY - bounds.top) / bounds.height * 100}%`);
      }}
      onPointerLeave={event => {
        event.currentTarget.style.setProperty('--drift-x', '0px');
        event.currentTarget.style.setProperty('--drift-y', '0px');
      }}
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
            {slide.theme === 'iphone' ? (
              <Image src={slide.image} alt={slide.alt} fill priority loading="eager" unoptimized sizes="100vw" className={styles.coverImage} />
            ) : <>
              {slide.theme === 'price' && <span className={styles.priceOrbit} aria-hidden="true">₽</span>}
              {slide.theme === 'cashback' && <span className={styles.aliceOrbit} aria-hidden="true" />}
              <Image src={slide.image} alt={slide.alt} fill loading="eager" unoptimized={slide.theme === 'price' || slide.theme === 'cashback'} sizes={slide.theme === 'warranty' || slide.theme === 'trade' ? '100vw' : '(max-width: 768px) 100vw, 65vw'} className={slide.theme === 'warranty' || slide.theme === 'trade' ? styles.coverImage : styles.containImage} />
            </>}
          </div>
          <div className={styles.copy}>
            <h2 aria-label={slide.title.join(' ')}>{slide.title.map((line, lineIndex) => <span key={line} className={lineIndex === 1 ? styles.titleFinish : undefined}>{line}</span>)}</h2>
            <p className={styles.description}>{slide.description}</p>
            <div className={styles.actions}>
              <Link className={styles.cta} href={slide.href}>{slide.action}<ArrowRight size={18} /></Link>
              {'secondaryHref' in slide && <Link className={`${styles.cta} ${styles.secondaryCta}`} href={slide.secondaryHref}>{slide.secondaryAction}<ArrowRight size={18} /></Link>}
            </div>
          </div>
        </div>
      ))}
      <div className={styles.controls}>
        <button className={styles.step} type="button" aria-label="Предыдущий слайд" onClick={() => { setActive(current => (current + slides.length - 1) % slides.length); setPaused(true); }}><ChevronLeft size={18} /></button>
        <div className={styles.selectors}>
          {slides.map((slide, index) => <button type="button" key={slide.name} aria-controls={`home-promo-${index}`} aria-label={`Слайд ${index + 1}: ${slide.name}`} aria-pressed={index === active} onClick={() => { setActive(index); setPaused(true); }}><span>0{index + 1}</span><span className={styles.selectorName}>{slide.name}</span></button>)}
        </div>
        <button className={styles.step} type="button" aria-label="Следующий слайд" onClick={() => { setActive(current => (current + 1) % slides.length); setPaused(true); }}><ChevronRight size={18} /></button>
        <button className={styles.pause} type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Включить смену слайдов' : 'Приостановить смену слайдов'}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
      </div>
    </section>
  );
}
