'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CreditCard, RefreshCcw, Wrench } from 'lucide-react';
import Link from '@/components/shared/safe-link';

const slides = [
  { id: 'trade-in', title: 'Ваше устройство может стоить до 54 000 ₽', description: 'Оценим технику и зачтём стоимость при покупке новой.', action: 'Оценить устройство', href: '/trade-in', icon: RefreshCcw },
  { id: 'installment', title: 'Покупайте сейчас — оплачивайте частями', description: 'Подберём удобный вариант рассрочки при оформлении покупки.', action: 'Выбрать технику', href: '/catalog', icon: CreditCard },
  { id: 'service', title: 'Поможем настроить вашу технику', description: 'Перенесём данные, подключим сервисы и ответим на вопросы.', action: 'Связаться с магазином', href: '/#контакты', icon: Wrench },
] as const;

export function TradeInBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => setActive((current) => (current + direction + slides.length) % slides.length);

  return (
    <section className="appgrade-promo-carousel-section" aria-label="Предложения магазина">
      <div className="container">
        <div className="appgrade-promo-carousel">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <article key={slide.id} className={`appgrade-promo-slide appgrade-promo-slide-${slide.id} ${index === active ? 'is-active' : ''}`} aria-hidden={index !== active} inert={index !== active}>
                <div className="appgrade-promo-slide-copy">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                  <Link href={slide.href}>{slide.action}<ArrowRight size={16} /></Link>
                </div>
                <Icon className="appgrade-promo-slide-icon" aria-hidden="true" />
              </article>
            );
          })}
          <div className="appgrade-promo-carousel-controls">
            <button type="button" onClick={() => move(-1)} aria-label="Предыдущий баннер"><ArrowLeft size={17} /></button>
            <div className="appgrade-promo-carousel-dots" aria-label="Выбрать баннер">
              {slides.map((slide, index) => <button type="button" key={slide.id} className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`Баннер ${index + 1}`} aria-pressed={index === active} />)}
            </div>
            <button type="button" onClick={() => move(1)} aria-label="Следующий баннер"><ArrowRight size={17} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
