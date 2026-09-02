'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CITIES, DEFAULT_CITY_ID, type CityId } from '@/config/cities';

const STORAGE_KEY = 'appgrade:city';
interface CityContextValue {
  cityId: CityId;
  city: (typeof CITIES)[CityId];
  setCityId: (id: CityId) => void;
}
const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [cityId, setCityIdState] = useState<CityId>(DEFAULT_CITY_ID);
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in CITIES)
      queueMicrotask(() => setCityIdState(saved as CityId));
  }, []);
  const setCityId = (id: CityId) => {
    setCityIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };
  const value = { cityId, city: CITIES[cityId], setCityId };
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const value = useContext(CityContext);
  if (!value) throw new Error('useCity must be used inside CityProvider');
  return value;
}
