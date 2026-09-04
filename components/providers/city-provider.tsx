'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  STORES,
  type StoreId,
} from '@/config/stores';

type LegacyCity = {
  id: StoreId;
  name: string;
};

type CityContextValue = {
  /*
   * Новый API.
   *
   * Может быть null только до первого выбора города.
   */
  cityId: StoreId | null;

  /*
   * Старый API.
   *
   * Нужен существующим каталогам:
   *
   * city.id
   * city.name
   */
  city: LegacyCity;

  citySelected: boolean;

  setCityId: (cityId: StoreId) => void;

  citySelectorOpen: boolean;

  openCitySelector: () => void;
  closeCitySelector: () => void;

  currentStore:
    | (typeof STORES)[StoreId]
    | null;
};

const CityContext =
  createContext<CityContextValue | null>(null);

const STORAGE_KEY = 'appgrade-city';

const DEFAULT_CITY: StoreId =
  'magnitogorsk';

export function CityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cityId, setCityIdState] =
    useState<StoreId | null>(null);

  const [
    citySelectorOpen,
    setCitySelectorOpen,
  ] = useState(false);

  const [hydrated, setHydrated] =
    useState(false);

  /*
   * =========================================================
   * LOAD CITY
   * =========================================================
   */

  useEffect(() => {
    let savedCity: StoreId | null = null;

    try {
      savedCity =
        window.localStorage.getItem(
          STORAGE_KEY,
        ) as StoreId | null;
    } catch {
      /* Storage may be unavailable in a restricted browser context. */
    }

    const loadCity = window.setTimeout(() => {
      if (
        savedCity &&
        Object.prototype.hasOwnProperty.call(
          STORES,
          savedCity,
        )
      ) {
        setCityIdState(savedCity);
      } else {
        /*
         * Первый визит.
         * Просим пользователя выбрать город.
         */
        setCitySelectorOpen(true);
      }

      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(loadCity);
  }, []);

  /*
   * =========================================================
   * SET CITY
   * =========================================================
   */

  const setCityId = (
    nextCityId: StoreId,
  ) => {
    setCityIdState(nextCityId);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        nextCityId,
      );
    } catch {
      /* Keep the in-memory city selection working without persistence. */
    }

    setCitySelectorOpen(false);
  };

  /*
   * =========================================================
   * SAFE CITY ID
   * =========================================================
   *
   * Старому каталогу всегда нужен город.
   *
   * Пока пользователь не выбрал его,
   * технически используем Магнитогорск.
   *
   * При этом CityGate всё равно будет открыт.
   */

  const resolvedCityId: StoreId =
    cityId ?? DEFAULT_CITY;

  /*
   * =========================================================
   * LEGACY CITY OBJECT
   * =========================================================
   *
   * Именно такой объект ожидают старые компоненты:
   *
   * city.id
   * city.name
   */

  const city = useMemo<LegacyCity>(
    () => ({
      id: resolvedCityId,

      name:
        STORES[resolvedCityId].city,
    }),
    [resolvedCityId],
  );

  /*
   * =========================================================
   * CURRENT STORE
   * =========================================================
   */

  const currentStore = useMemo(() => {
    if (!cityId) {
      return null;
    }

    return STORES[cityId];
  }, [cityId]);

  /*
   * =========================================================
   * CONTEXT VALUE
   * =========================================================
   */

  const value: CityContextValue = {
        /*
         * Новый API
         */
        cityId,

        /*
         * Старый API
         */
        city,

        citySelected:
          cityId !== null,

        setCityId,

        citySelectorOpen,

        openCitySelector: () =>
          setCitySelectorOpen(true),

        closeCitySelector: () =>
          setCitySelectorOpen(false),

        currentStore,
      };

  /*
   * Не отдаём приложение до чтения localStorage.
   */
  if (!hydrated) {
    return null;
  }

  return (
    <CityContext.Provider
      value={value}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context =
    useContext(CityContext);

  if (!context) {
    throw new Error(
      'useCity must be used inside CityProvider',
    );
  }

  return context;
}
