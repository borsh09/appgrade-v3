'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { StoreId } from '@/config/stores';
import { STORES } from '@/config/stores';

type CityContextValue = {
  cityId: StoreId | null;
  citySelected: boolean;

  setCityId: (cityId: StoreId) => void;

  openCitySelector: () => void;
  closeCitySelector: () => void;

  citySelectorOpen: boolean;

  currentStore:
    | (typeof STORES)[StoreId]
    | null;
};

const CityContext = createContext<CityContextValue | null>(null);

const STORAGE_KEY = 'appgrade-city';

export function CityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cityId, setCityIdState] =
    useState<StoreId | null>(null);

  const [citySelectorOpen, setCitySelectorOpen] =
    useState(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedCity = window.localStorage.getItem(
      STORAGE_KEY,
    ) as StoreId | null;

    if (savedCity && STORES[savedCity]) {
      setCityIdState(savedCity);
    } else {
      setCitySelectorOpen(true);
    }

    setHydrated(true);
  }, []);

  const setCityId = (nextCityId: StoreId) => {
    setCityIdState(nextCityId);

    window.localStorage.setItem(
      STORAGE_KEY,
      nextCityId,
    );

    setCitySelectorOpen(false);
  };

  const currentStore = useMemo(() => {
    if (!cityId) {
      return null;
    }

    return STORES[cityId];
  }, [cityId]);

  const value = useMemo(
    () => ({
      cityId,

      citySelected: cityId !== null,

      setCityId,

      citySelectorOpen,

      openCitySelector: () =>
        setCitySelectorOpen(true),

      closeCitySelector: () =>
        setCitySelectorOpen(false),

      currentStore,
    }),
    [cityId, citySelectorOpen, currentStore],
  );

  if (!hydrated) {
    return null;
  }

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);

  if (!context) {
    throw new Error(
      'useCity must be used inside CityProvider',
    );
  }

  return context;
}