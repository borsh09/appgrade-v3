'use client';
import { basePrices } from '@/lib/catalog-registry';
import { useCity } from './city-provider';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Prices = Record<string, number | null>;
const PriceContext = createContext<Prices>(basePrices);
const CityPriceContext=createContext<Record<string,Record<string,number>>>({});
const StockContext=createContext<Record<string,Record<string,number>>>({});
export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Prices>(basePrices);
  const [inventory,setInventory]=useState<Record<string,Record<string,number>>>({});
  const [cityPrices,setCityPrices]=useState<Record<string,Record<string,number>>>({});
  useEffect(() => {
    let active = true;
    let inFlight = false;
    let revision = '';
    const controller = new AbortController();
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch('/api/prices', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const snapshot = await response.json();
        if (
          active &&
          typeof snapshot.revision === 'string' &&
          snapshot.prices &&
          `${snapshot.revision}:${snapshot.inventoryRevision??''}` !== revision
        ) {
          revision = `${snapshot.revision}:${snapshot.inventoryRevision??''}`;
          setPrices(snapshot.prices);
          setInventory(snapshot.inventory??{});
          setCityPrices(snapshot.cityPrices??{});
        }
      } catch {
        /* Retain the last successfully loaded prices during an outage. */
      } finally {
        inFlight = false;
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('appgrade-prices-refresh', refresh);
    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('appgrade-prices-refresh', refresh);
    };
  }, []);
  return (
    <PriceContext.Provider value={prices}><CityPriceContext.Provider value={cityPrices}><StockContext.Provider value={inventory}>{children}</StockContext.Provider></CityPriceContext.Provider></PriceContext.Provider>
  );
}
export function usePriceResolver() {
  const prices = useContext(PriceContext);
  const cityPrices = useContext(CityPriceContext);
  const {city}=useCity();
  return useCallback(
    <T extends { id: string; price: number | null }>(item: T): T => {
      const price = cityPrices[item.id]?.[city.id] ?? prices[item.id];
      return Object.hasOwn(prices, item.id) ? { ...item, price } : item;
    },
    [prices, cityPrices, city.id],
  );
}
export function useStock(){const inventory=useContext(StockContext);const {city}=useCity();return useCallback((id:string)=>inventory[id]?.[city.id],[inventory,city.id]);}
export function usePricedCatalog<
  T extends { id: string; price: number | null },
>(catalog: T[]): T[] {
  const resolve = usePriceResolver();
  return useMemo(() => catalog.map(resolve), [catalog, resolve]);
}
