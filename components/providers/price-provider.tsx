'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Prices = Record<string, number | null>;
const PriceContext = createContext<Prices>({});
export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Prices>({});
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
          snapshot.revision !== revision
        ) {
          revision = snapshot.revision;
          setPrices(snapshot.prices);
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
    <PriceContext.Provider value={prices}>{children}</PriceContext.Provider>
  );
}
export function usePriceResolver() {
  const prices = useContext(PriceContext);
  return useCallback(
    <T extends { id: string; price: number | null }>(item: T): T => {
      const price = prices[item.id];
      return typeof price === 'number' ? { ...item, price } : item;
    },
    [prices],
  );
}
export function usePricedCatalog<
  T extends { id: string; price: number | null },
>(catalog: T[]): T[] {
  const resolve = usePriceResolver();
  return useMemo(() => catalog.map(resolve), [catalog, resolve]);
}
