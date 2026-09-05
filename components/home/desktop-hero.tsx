'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Pause, Play } from 'lucide-react';
import Link from '@/components/shared/safe-link';
import styles from './desktop-hero.module.css';

const slides = [
  {
    name: 'iPhone 18 Pro', theme: 'launch', eyebrow: 'В предвкушении премьеры',
    title: <>iPhone 18 Pro<span className={styles.finish}>Dark Cherry.</span></>,
    description: 'Новая глубина цвета. Следи за новостями о старте продаж в APPGRADE.',
    action: 'Следить за новинкой', href: 'https://t.me/APPGRADEmgn',
    image: '/images/home/iphone-18-pro-dark-cherry.jpg',
    alt: 'Концепт iPhone 18 Pro Dark Cherry: вишнёвый корпус и крупный план камер',
    caption: 'Концепт по утечкам · Рендер Macworld / Foundry',
    source: 'https://www.macworld.com/article/3116701/iphone-18-pro-colors-revealed-exclusive-look-at-apples-2026-models.html',
  },
  {
    name: 'Trade-In', theme: 'trade', eyebrow: 'APPGRADE TRADE-IN',
    title: <>Новый iPhone.<span className={styles.finish}>Ближе, чем кажется.</span></>,
    description: 'Твой iPhone уже имеет ценность. Зачтём её в стоимость нового — останется только доплатить.',
    action: 'Оценить мой iPhone', href: '/trade-in',
    image: '/images/home/trade-in-silver-graphite.png', caption: 'Оценка устройства → Зачёт стоимости → Новый iPhone',
    alt: 'Графитовый и серебристый iPhone в студийной композиции Trade-In',
  },
  {
    name: 'MacBook', theme: 'mac', eyebrow: 'Для всего, что ты задумал',
    title: <>Большие планы.<span className={styles.finish}>Лёгкий старт.</span></>,
    description: 'Работать, учиться, создавать. Найди свой MacBook в APPGRADE.',
    action: 'Выбрать MacBook', href: '/catalog/macbooks',
    image: '/images/king-category-computers.webp', caption: 'Твоя следующая большая идея начинается здесь.',
    alt: 'Ноутбуки MacBook',
  },
];

export function DesktopHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 769px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (paused) return;
    const timer = window.setInterval(() => {
      if (desktop.matches && !reducedMotion.matches && !document.hidden) {
        setActive((current) => (current + 1) % slides.length);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, active]);

  return (
    <section
      className={`${styles.hero} ${styles[slides[active].theme]}`}
      aria-label="Предложения APPGRADE"
      aria-roledescription="карусель"
    >
      <div className={styles.brand}>APPGRADE <span>SELECTED FOR YOU</span></div>
      {slides.map((slide, index) => (
        <div
          key={slide.name}
          id={`desktop-promo-${index}`}
          className={`${styles.slide} ${styles[`${slide.theme}Slide`]} ${index === active ? styles.active : ''}`}
          inert={index !== active}
          aria-hidden={index !== active}
          aria-roledescription="слайд"
          aria-label={`${index + 1} из ${slides.length}: ${slide.name}`}
        >
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p className={styles.description}>{slide.description}</p>
            <Link className={styles.cta} href={slide.href}>{slide.action}<ArrowRight size={18} /></Link>
          </div>
          <div className={styles.visual}>
            <Image src={slide.image} alt={slide.alt} fill sizes="(min-width: 769px) 65vw, 1px" />
          </div>
          <p className={styles.caption}>{slide.source ? <Link href={slide.source} target="_blank" rel="noreferrer">{slide.caption}</Link> : slide.caption}</p>
        </div>
      ))}
      <div className={styles.controls}>
        <div className={styles.selectors}>
          {slides.map((slide, index) => (
            <button type="button" key={slide.name} aria-controls={`desktop-promo-${index}`} aria-pressed={index === active}
              onClick={() => { setActive(index); setPaused(false); }}>
              <span>0{index + 1}</span>{slide.name}
            </button>
          ))}
        </div>
        <button data-rotation-control className={styles.pause} type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Включить смену слайдов' : 'Приостановить смену слайдов'}>
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>
    </section>
  );
}
