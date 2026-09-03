'use client';

import Image from 'next/image';
import {
  ArrowRight,
  MapPin,
  X,
} from 'lucide-react';

import {
  STORE_LIST,
  type StoreId,
} from '@/config/stores';

import { useCity } from '@/components/providers/city-provider';

export function CityGate() {
  const {
    cityId,
    citySelectorOpen,
    setCityId,
    closeCitySelector,
  } = useCity();

  if (!citySelectorOpen) {
    return null;
  }

  return (
    <div className="appgrade-city-gate">
      <div
        className="appgrade-city-gate-backdrop"
        onClick={() => {
          if (cityId) {
            closeCitySelector();
          }
        }}
      />

      <div className="appgrade-city-gate-card">
        {cityId && (
          <button
            type="button"
            className="appgrade-city-gate-close"
            onClick={closeCitySelector}
            aria-label="Закрыть"
          >
            <X size={19} />
          </button>
        )}

        <div className="appgrade-city-gate-logo">
          <Image
            src="/images/appgrade-logo-white.png"
            alt="APPGRADE"
            width={210}
            height={70}
            priority
          />
        </div>

        <span className="appgrade-city-gate-kicker">
          Ваш город
        </span>

        <h2>
          Где вы
          <br />
          находитесь?
        </h2>

        <p>
          Покажем актуальные цены, наличие
          и ближайший магазин.
        </p>

        <div className="appgrade-city-gate-list">
          {STORE_LIST.map((store) => (
            <button
              key={store.id}
              type="button"
              onClick={() =>
                setCityId(store.id as StoreId)
              }
            >
              <MapPin size={17} />

              <strong>
                {store.city}
              </strong>

              <ArrowRight
                size={17}
                className="appgrade-city-gate-arrow"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}