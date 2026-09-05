'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';

const promos = [
  {
    eyebrow: 'PlayStation',
    title: 'Играй без компромиссов.',
    text: 'PlayStation 5 и аксессуары.',
    href: '/catalog/playstation',
    image: '/images/home/ps5-pro.png',
    className: 'is-playstation',
  },
  {
    eyebrow: 'Marshall',
    title: 'Звук с характером.',
    text: 'Наушники и акустика Marshall.',
    href: '/catalog/audio',
    image:
      '/images/products/gallery/marshall-major-5-black/view-1.jpg',
    className: 'is-marshall',
  },
  {
    eyebrow: 'Xiaomi',
    title: 'Больше возможностей.',
    text: 'Смартфоны Xiaomi и Redmi.',
    href: '/catalog/xiaomi',
    image: '/images/products/xiaomi/15-ultra-main.png',
    className: 'is-xiaomi',
  },
];

export function PromoBento() {
  return (
    <section className="appgrade-editorial-promos">
      <div className="container">
        <div className="appgrade-editorial-heading">
          <div>
            <span>Ещё больше техники</span>
            <h2>Не только Apple.</h2>
          </div>

          <Link href="/catalog">
            Весь каталог
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="appgrade-editorial-track">
          {promos.map((promo) => (
            <Link
              key={promo.eyebrow}
              href={promo.href}
              className={`appgrade-editorial-card ${promo.className}`}
            >
              <div className="appgrade-editorial-copy">
                <span>{promo.eyebrow}</span>

                <h3>{promo.title}</h3>

                <p>{promo.text}</p>

                <div className="appgrade-editorial-link">
                  Смотреть
                  <ArrowRight size={15} />
                </div>
              </div>

              <div className="appgrade-editorial-image">
                <Image
                  src={promo.image}
                  alt={promo.eyebrow}
                  fill
                  sizes="(max-width: 439px) calc(82vw - 46px), (max-width: 768px) 300px, (max-width: 1000px) 28vw, 300px"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
