'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { ArrowLeft, Check } from 'lucide-react';
import type { CameraCatalogSku } from '@/data/camera-catalog';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
export function CameraProductPage({
  selected,
  variants,
}: {
  selected: CameraCatalogSku;
  variants: CameraCatalogSku[];
}) {
  const href = `/catalog/${selected.modelSlug}?color=${encodeURIComponent(selected.color)}`,
    product = {
      id: href,
      name: selected.model,
      configuration: `${selected.kind} · ${selected.color}`,
      price: selected.price,
      image: selected.image,
      href,
    };
  return (
    <main className="iphone-product-page camera-product-page">
      <div className="container">
        <Link href="/catalog/cameras" className="product-back">
          <ArrowLeft size={16} />
          Вернуться к фотоаппаратам
        </Link>
        <div className="product-layout">
          <section className="product-gallery">
            <div className="product-gallery-frame camera-gallery-frame">
              <Image
                src={selected.image}
                alt={`${selected.model} ${selected.color}`}
                fill
                priority
                unoptimized
                sizes="(max-width:768px) 100vw,58vw"
              />
            </div>
            <div className="product-gallery-note">
              <span>FUJIFILM INSTAX</span>
              <span>Моментальная печать</span>
            </div>
          </section>
          <section className="product-info">
            <p className="catalog-overline">
              INSTAX · {selected.kind.toUpperCase()}
            </p>
            <h1>{selected.model}</h1>
            <p className="product-lead">
              Камера для живых кадров и настоящих отпечатков, которые можно
              держать в руках.
            </p>
            <div className="product-price-line">
              <strong>{money.format(selected.price)} ₽</strong>
              <span>
                <Check size={14} />В наличии
              </span>
            </div>
            <div className="product-options">
              <div className="product-option">
                <div className="product-option-head">
                  <span>Цвет</span>
                  <b>{selected.color}</b>
                </div>
                {variants.length > 1 && (
                  <div className="product-option-values color-values">
                    {variants.map((v) => (
                      <Link
                        className={v.id === selected.id ? 'selected' : ''}
                        href={`/catalog/${selected.modelSlug}?color=${encodeURIComponent(v.color)}`}
                        key={v.id}
                      >
                        {v.color}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="product-option">
                <div className="product-option-head">
                  <span>Оплата картой / QR / рассрочка</span>
                  <b>{money.format(selected.cashlessPrice)} ₽</b>
                </div>
              </div>
            </div>
            <div className="product-actions">
              <AddToCartButton product={product} />
              <Link href="/catalog/cameras">Все модели</Link>
            </div>
            <div className="product-meta-list">
              <div>
                <span>Формат</span>
                <strong>Instax Mini</strong>
              </div>
              <div>
                <span>Самовывоз</span>
                <strong>Сегодня в магазине</strong>
              </div>
              <div>
                <span>Гарантия</span>
                <strong>12 месяцев</strong>
              </div>
            </div>
          </section>
        </div>
        <section className="product-story" id="about">
          <div className="product-section-kicker">О товаре</div>
          <div>
            <p className="catalog-overline">CAPTURE · PRINT · SHARE</p>
            <h2>Снимок превращается в воспоминание за несколько секунд.</h2>
            <p>
              {selected.kind === 'Гибридная'
                ? 'Предпросмотр на экране, творческие эффекты и выбор кадров перед печатью.'
                : 'Автоматическая экспозиция, простое управление и моментальные фотографии формата Instax Mini.'}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
