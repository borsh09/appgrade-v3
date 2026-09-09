'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { Heart } from 'lucide-react';
import { useCommerce } from '@/components/providers/commerce-provider';
import { usePriceResolver } from '@/components/providers/price-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
export function FavoritesPage() {
  const { favorites, ready } = useCommerce();
  const resolvePrice = usePriceResolver();
  return (
    <main className="commerce-page">
      <div className="container">
        <p className="catalog-overline">СОХРАНЁННОЕ</p>
        <h1>Избранное</h1>
        {!ready ? <p aria-live="polite">Загружаем избранное…</p> : !favorites.length ? (
          <div className="commerce-empty">
            <Heart size={38} />
            <h2>Здесь пока пусто</h2>
            <p>Нажмите на сердечко в карточке товара, чтобы сохранить его.</p>
            <Link href="/catalog">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((item) => {
              const pricedItem = resolvePrice(item);
              return (
              <article className="favorite-card" key={item.id}>
                <div className="favorite-image">
                  <Link href={pricedItem.href}>
                    <Image
                      src={pricedItem.image}
                      alt={pricedItem.name}
                      fill
                      unoptimized
                      sizes="(max-width:600px) 100vw, 30vw"
                    />
                  </Link>
                  <FavoriteButton product={item} />
                </div>
                <Link href={item.href}>
                  <h2>{pricedItem.name}</h2>
                </Link>
                <p>{pricedItem.configuration}</p>
                <div>
                  <strong>{pricedItem.price > 0 ? `${money.format(pricedItem.price)} ₽` : 'Цена уточняется'}</strong>
                  <AddToCartButton product={pricedItem} />
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
