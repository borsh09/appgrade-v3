'use client';

import {
  CITY_LIST,
} from '@/config/cities';

import { useCity } from '@/components/providers/city-provider';

import type { StoreId } from '@/config/stores';

export function CitySelect({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    cityId,
    setCityId,
  } = useCity();

  return (
    <label
      className={
        compact
          ? 'city-select compact'
          : 'city-select'
      }
    >
      {!compact && (
        <span>
          Ваш город
        </span>
      )}

      <select
        value={cityId ?? ''}
        onChange={(event) => {
          const nextCity =
            event.target.value as StoreId;

          if (nextCity) {
            setCityId(nextCity);
          }
        }}
        aria-label="Выберите город"
      >
        {!cityId && (
          <option
            value=""
            disabled
          >
            Выберите город
          </option>
        )}

        {CITY_LIST.map((city) => (
          <option
            key={city.id}
            value={city.id}
          >
            {city.name}
          </option>
        ))}
      </select>
    </label>
  );
}