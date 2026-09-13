'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Pause, Play } from 'lucide-react';
import Link from '@/components/shared/safe-link';
import styles from './desktop-hero.module.css';

const slides = [
  {
    name: 'APPGRADE',
    theme: 'video',
    type: 'video' as const,
    video: '/videos/desktop-promo.mp4',
  },
  {
    name: 'iPhone 18 Pro',
    theme: 'pro',
    type: 'image' as const,
    title: (
      <>
        iPhone 18 Pro.
      </>
    ),
    description:
      'iPhone 18 Pro и 18 Pro Max доступны для предзаказа в APPGRADE.',
    action: 'iPhone 18 Pro',
    href: '/catalog/iphone-18-pro?storage=256&color=Black&sim=eSim',
    secondaryAction: 'iPhone 18 Pro Max',
    secondaryHref: '/catalog/iphone-18-pro-max?storage=256&color=Burgundy&sim=eSim',
    image: '/images/home/iphone-18-pro-hero.png',
    alt: 'iPhone 18 Pro и iPhone 18 Pro Max',
  },
  {
    name: 'iPhone Duo',
    theme: 'duo',
    type: 'image' as const,
    title: (
      <>
        iPhone Duo.
      </>
    ),
    description:
      'Первый складной iPhone с большим внутренним дисплеем и новым форматом работы.',
    action: 'Открыть iPhone Duo',
    href: '/catalog/iphone-duo?storage=256&color=Star%20White&sim=eSim',
    image: '/images/home/iphone-duo-hero.png',
    alt: 'Раскрытый белый iPhone Duo',
  },
  {
    name: 'Trade-In',
    theme: 'trade',
    type: 'image' as const,
    eyebrow: 'APPGRADE TRADE-IN',
    title: (
      <>
        Новый iPhone.
        <span className={styles.finish}>Ближе, чем кажется.</span>
      </>
    ),
    description:
      'Твой iPhone уже имеет ценность. Зачтём её в стоимость нового — останется только доплатить.',
    action: 'Оценить мой iPhone',
    href: '/trade-in',
    image: '/images/home/trade-in-silver-graphite.png',
    caption: 'Оценка устройства → Зачёт стоимости → Новый iPhone',
    alt: 'Графитовый и серебристый iPhone в студийной композиции Trade-In',
  },
  {
    name: 'MacBook',
    theme: 'mac',
    type: 'image' as const,
    eyebrow: 'Для всего, что ты задумал',
    title: (
      <>
        Большие планы.
        <span className={styles.finish}>Лёгкий старт.</span>
      </>
    ),
    description:
      'Работать, учиться, создавать. Найди свой MacBook в APPGRADE.',
    action: 'Выбрать MacBook',
    href: '/catalog/macbooks',
    image: '/images/king-category-computers.webp',
    caption: 'Твоя следующая большая идея начинается здесь.',
    alt: 'Ноутбуки MacBook',
  },
];

export function DesktopHero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 769px)');
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    if (paused) return;

    const delay = active === 0 ? 7000 : 7000;

    const timer = window.setTimeout(() => {
      if (
        desktop.matches &&
        !reducedMotion.matches &&
        !document.hidden
      ) {
        setActive((current) => (current + 1) % slides.length);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [paused, active]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (active === 0) {
      video.currentTime = 0;

      if (!paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    } else {
      video.pause();
    }
  }, [active, paused]);

  const currentSlide = slides[active];

  return (
    <section
      className={`${styles.hero} ${styles[currentSlide.theme]}`}
      aria-label="Предложения APPGRADE"
      aria-roledescription="карусель"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.name}
          id={`desktop-promo-${index}`}
          className={`${styles.slide} ${
            styles[`${slide.theme}Slide`]
          } ${index === active ? styles.active : ''}`}
          inert={index !== active}
          aria-hidden={index !== active}
          aria-roledescription="слайд"
          aria-label={`${index + 1} из ${slides.length}: ${
            slide.name
          }`}
        >
          {slide.type === 'video' ? (
            <video
              ref={videoRef}
              className={styles.promoVideo}
              muted
              autoPlay
              playsInline
              preload="auto"
            >
              <source
                src={slide.video}
                type="video/mp4"
              />
            </video>
          ) : (
            <>
              <div className={styles.copy}>
                <h2>{slide.title}</h2>

                <p className={styles.description}>
                  {slide.description}
                </p>

                <div className={styles.actions}>
                  <Link
                    className={styles.cta}
                    href={slide.href}
                  >
                    {slide.action}
                    <ArrowRight size={18} />
                  </Link>

                  {'secondaryHref' in slide && (
                    <Link
                      className={`${styles.cta} ${styles.secondaryCta}`}
                      href={slide.secondaryHref!}
                    >
                      {slide.secondaryAction}
                      <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>

              <div className={styles.visual}>
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  loading="eager"
                  sizes="(min-width: 769px) 65vw, 1px"
                />
              </div>

            </>
          )}
        </div>
      ))}

      <div className={styles.controls}>
        <div className={styles.selectors}>
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.name}
              aria-controls={`desktop-promo-${index}`}
              aria-pressed={index === active}
              onClick={() => {
                setActive(index);
                setPaused(false);
              }}
            >
              <span>0{index + 1}</span>
              {slide.name}
            </button>
          ))}
        </div>

        <button
          data-rotation-control
          className={styles.pause}
          type="button"
          onClick={() =>
            setPaused((value) => !value)
          }
          aria-label={
            paused
              ? 'Включить смену слайдов'
              : 'Приостановить смену слайдов'
          }
        >
          {paused ? (
            <Play size={16} />
          ) : (
            <Pause size={16} />
          )}
        </button>
      </div>
    </section>
  );
}
