'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<CommerceProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        if (Array.isArray(saved.cart)) setCart(saved.cart);
        if (Array.isArray(saved.favorites)) setFavorites(saved.favorites);
      } catch {
        /* Ignore damaged local data. */
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, favorites }));
  }, [cart, favorites, ready]);

  const value = useMemo<CommerceContextValue>(
    () => ({
      cart,
      favorites,
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
                item.id === id ? { ...item, quantity } : item,
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
    [cart, favorites],
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
