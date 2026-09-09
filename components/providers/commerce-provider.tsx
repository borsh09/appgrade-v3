'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePriceResolver } from './price-provider';
import { catalogItems } from '@/lib/catalog-registry';

export type CommerceProduct = {
  id: string;
  name: string;
  configuration: string;
  price: number;
  image: string;
  href: string;
};

type CartLine = CommerceProduct & { quantity: number };
type CommerceContextValue = {
  ready: boolean;
  cart: CartLine[];
  favorites: CommerceProduct[];
  cartCount: number;
  favoriteCount: number;
  addToCart: (product: CommerceProduct) => void;
  removeFromCart: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  toggleFavorite: (product: CommerceProduct) => void;
  isInCart: (id: string) => boolean;
  isFavorite: (id: string) => boolean;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const STORAGE_KEY = 'appgrade-commerce-v1';

function restoreProducts(values: unknown[]): CartLine[] {
  return values.flatMap(value => {
    if (!value || typeof value !== 'object') return [];
    const item = value as CartLine;
    if (![item.id, item.name, item.configuration, item.image, item.href].every(v => typeof v === 'string') || !Number.isFinite(item.price)) return [];
    let sku = catalogItems.find(s => s.id === item.id);
    if (!sku && item.id.startsWith('/catalog/')) {
      const url = new URL(item.id, 'https://appgrade.invalid');
      const matches = catalogItems.filter(s => url.pathname === `/catalog/${s.modelSlug}` &&
        [...url.searchParams].every(([key, value]) => key in s && s[key as keyof typeof s] === value));
      if (matches.length === 1) sku = matches[0];
    }
    if (!sku) return [];
    return [{ ...item, id: sku.id, quantity: Number.isInteger(item.quantity) ? Math.max(1, Math.min(99, item.quantity)) : 1 }];
  }).filter((item, index, all) => all.findIndex(other => other.id === item.id) === index);
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const resolvePrice = usePriceResolver();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<CommerceProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        if (Array.isArray(saved.cart)) setCart(restoreProducts(saved.cart));
        if (Array.isArray(saved.favorites)) setFavorites(restoreProducts(saved.favorites));
      } catch {
        /* Ignore damaged local data. */
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, favorites }));
    } catch { /* Keep the cart usable when browser storage is unavailable. */ }
  }, [cart, favorites, ready]);

  const value = useMemo<CommerceContextValue>(
    () => ({
      ready,
      cart: cart.map(resolvePrice),
      favorites: favorites.map(resolvePrice),
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      favoriteCount: favorites.length,
      addToCart: (product) =>
        setCart((current) =>
          current.some((item) => item.id === product.id)
            ? current
            : [...current, { ...product, quantity: 1 }],
        ),
      removeFromCart: (id) =>
        setCart((current) => current.filter((item) => item.id !== id)),
      setQuantity: (id, quantity) =>
        setCart((current) =>
          quantity < 1
            ? current.filter((item) => item.id !== id)
            : current.map((item) =>
                item.id === id && Number.isFinite(quantity) ? { ...item, quantity: Math.max(1, Math.min(99, Math.trunc(quantity))) } : item,
              ),
        ),
      toggleFavorite: (product) =>
        setFavorites((current) =>
          current.some((item) => item.id === product.id)
            ? current.filter((item) => item.id !== product.id)
            : [...current, product],
        ),
      isInCart: (id) => cart.some((item) => item.id === id),
      isFavorite: (id) => favorites.some((item) => item.id === id),
    }),
    [cart, favorites, resolvePrice, ready],
  );

  return (
    <CommerceContext.Provider value={value}>
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context)
    throw new Error('useCommerce must be used inside CommerceProvider');
  return context;
}
