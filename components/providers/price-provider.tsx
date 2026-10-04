'use client';
import basePriceRows from '@/data/client-base-prices.json';
import { useCity } from './city-provider';
import { PRICE_UPDATE_KEY, PRICE_UPDATE_CHANNEL } from '@/lib/price-updates';
import { discountPrice } from '@/lib/discount-price';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Prices = Record<string, number | null>;
const basePrices: Prices = basePriceRows;
const PriceContext = createContext<Prices>(basePrices);
const CityPriceContext=createContext<Record<string,Record<string,number>>>({});
const StockContext=createContext<Record<string,Record<string,number>>>({});
const DiscountContext=createContext<Record<string,Record<string,number>>>({});
export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Prices>(basePrices);
  const [inventory,setInventory]=useState<Record<string,Record<string,number>>>({});
  const [cityPrices,setCityPrices]=useState<Record<string,Record<string,number>>>({});
  const [discounts,setDiscounts]=useState<Record<string,Record<string,number>>>({});
  useEffect(() => {
    let active = true;
    let inFlight = false;
    let refreshPending = false;
    let revision = '';
    const controller = new AbortController();
    const refresh = async () => {
      if (document.hidden) return;
      if (inFlight) { refreshPending = true; return; }
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
          setDiscounts(snapshot.discounts??{});
        }
      } catch {
        /* Retain the last successfully loaded prices during an outage. */
      } finally {
        inFlight = false;
        if (active && refreshPending) { refreshPending = false; void refresh(); }
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 5_000);
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(PRICE_UPDATE_CHANNEL) : null;
    if (channel) channel.onmessage = () => void refresh();
    const onStorage = (event: StorageEvent) => { if (event.key === PRICE_UPDATE_KEY) void refresh(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('appgrade-prices-refresh', refresh);
    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
      channel?.close();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('appgrade-prices-refresh', refresh);
    };
  }, []);
  return (
    <PriceContext.Provider value={prices}><CityPriceContext.Provider value={cityPrices}><DiscountContext.Provider value={discounts}><StockContext.Provider value={inventory}>{children}</StockContext.Provider></DiscountContext.Provider></CityPriceContext.Provider></PriceContext.Provider>
  );
}
export function usePriceResolver() {
  const prices = useContext(PriceContext);
  const cityPrices = useContext(CityPriceContext);
  const discounts = useContext(DiscountContext);
  const {city}=useCity();
  return useCallback(
    <T extends { id: string; price: number | null }>(item: T): T & { oldPrice?: number } => {
      const base = cityPrices[item.id]?.[city.id] ?? prices[item.id];
      const resolved = discountPrice(base, discounts[item.id]?.[city.id]);
      return Object.hasOwn(prices, item.id) ? { ...item, price: resolved.price ?? null, oldPrice: resolved.oldPrice } : item;
    },
    [prices, cityPrices, discounts, city.id],
  );
}
export function useStock(){const inventory=useContext(StockContext);const {city}=useCity();return useCallback((id:string)=>inventory[id]?.[city.id],[inventory,city.id]);}
export function usePricedCatalog<
  T extends { id: string; price: number | null },
>(catalog: T[]): (T & { oldPrice?: number })[] {
  const resolve = usePriceResolver();
  return useMemo(() => catalog.map(resolve), [catalog, resolve]);
}
