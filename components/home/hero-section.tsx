'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { heroSlides } from '@/data/hero-slides';

const benefits = [
  { label: 'Trade-In', detail: 'Выгодная оценка', icon: RefreshCcw },
  { label: 'Гарантия', detail: 'На всю технику', icon: ShieldCheck },
  { label: 'Самовывоз сегодня', detail: 'Из магазина', icon: Store },
  { label: '3 города', detail: 'Мы рядом', icon: MapPin },
];

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = heroSlides[activeIndex];
  const changeSlide = (direction: number) =>
    setActiveIndex(
      (current) =>
        (current + direction + heroSlides.length) % heroSlides.length,
    );
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => changeSlide(1), 6500);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused]);
  return (
    <>
      <section
        className="hero"
        aria-labelledby="hero-title"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <div className="hero-product" aria-hidden="true">
          <Image
            key={slide.id}
            src={slide.image}
            alt=""
            fill
            unoptimized
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 62vw"
          />
        </div>
        <div className="container hero-layout">
          <div className="hero-copy-block" aria-live="polite">
            <h1 id="hero-title">
              {slide.product.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="hero-headline">{slide.headline}</p>
            <p className="hero-price">{slide.price}</p>
            <div className="hero-actions">
              <Link className="button button-dark" href={slide.primaryCta.href}>
                {slide.primaryCta.label}
                <ArrowRight size={17} />
              </Link>
              <Link
                className="button button-ghost"
                href={slide.secondaryCta.href}
              >
                {slide.secondaryCta.label}
              </Link>
            </div>
          </div>
          <div className="hero-controls" aria-label="Промо-слайды">
            <span>
              <strong>{String(activeIndex + 1).padStart(2, '0')}</strong> /{' '}
              {String(heroSlides.length).padStart(2, '0')}
            </span>
            <div
              className={`hero-progress${paused ? ' is-paused' : ''}`}
              aria-label="Время до следующего слайда"
            >
              <i key={activeIndex} />
            </div>
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Предыдущий слайд"
            >
              <ArrowLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Следующий слайд"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <aside className="hero-benefits" aria-label="Преимущества APPGRADE">
        <div className="container">
          {benefits.map(({ label, detail, icon: Icon }) => (
            <div key={label}>
              <Icon size={19} strokeWidth={1.5} />
              <span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
