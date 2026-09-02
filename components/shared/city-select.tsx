'use client';

import { MapPin } from 'lucide-react';
import { CITY_LIST, type CityId } from '@/config/cities';
import { useCity } from '@/components/providers/city-provider';

export function CitySelect({ compact = false }: { compact?: boolean }) {
  const { cityId, setCityId } = useCity();
  return (
    <label className="city-select">
      <MapPin size={16} strokeWidth={1.7} />
      <span className="sr-only">Город</span>
      <select
        aria-label="Выберите город"
        value={cityId}
        onChange={(e) => setCityId(e.target.value as CityId)}
      >
        {CITY_LIST.map((city) => (
          <option key={city.id} value={city.id}>
            {compact ? city.shortName : city.name}
          </option>
        ))}
      </select>
    </label>
  );
}
