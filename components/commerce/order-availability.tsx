'use client';

import { useCity } from '@/components/providers/city-provider';
import { STORES } from '@/config/stores';

export function OrderAvailability({ available }: { available: boolean | null }) {
  const { currentStore } = useCity();
  if (available !== false) return null;
  return (
    <div className="order-availability" aria-live="polite">
      <strong>Оформление на сайте временно недоступно</strong>
      <p>Корзина сохранена. Свяжитесь с магазином — менеджер поможет оформить покупку.</p>
      <a href={currentStore?.telegram ?? STORES.magnitogorsk.telegram} target="_blank" rel="noreferrer">Написать в Telegram →</a>
      {currentStore?.phone && <a href={`tel:${currentStore.phone.replace(/[^+\d]/g, '')}`}>Позвонить в магазин</a>}
    </div>
  );
}
