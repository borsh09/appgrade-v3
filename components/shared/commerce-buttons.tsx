'use client';

import { Check, Heart, ShoppingBag } from 'lucide-react';
import {
  type CommerceProduct,
  useCommerce,
} from '@/components/providers/commerce-provider';

export function AddToCartButton({
  product,
  compact = false,
}: {
  product: CommerceProduct;
  compact?: boolean;
}) {
  const { addToCart, isInCart } = useCommerce();
  const added = isInCart(product.id);
  return (
    <button
      className={added ? 'is-added' : ''}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        addToCart(product);
      }}
      aria-label={
        added
          ? `${product.name} уже в корзине`
          : `Добавить ${product.name} в корзину`
      }
    >
      {added ? <Check size={18} /> : <ShoppingBag size={18} />}
      {!compact && <span>{added ? 'В корзине' : 'В корзину'}</span>}
    </button>
  );
}

export function FavoriteButton({ product }: { product: CommerceProduct }) {
  const { toggleFavorite, isFavorite } = useCommerce();
  const active = isFavorite(product.id);
  return (
    <button
      className={active ? 'is-active' : ''}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        toggleFavorite(product);
      }}
      aria-label={active ? 'Убрать из избранного' : 'В избранное'}
      aria-pressed={active}
    >
      <Heart size={18} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
