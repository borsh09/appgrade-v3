'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { Heart } from 'lucide-react';
import { useCommerce } from '@/components/providers/commerce-provider';
import {
  AddToCartButton,
  FavoriteButton,
} from '@/components/shared/commerce-buttons';
const money = new Intl.NumberFormat('ru-RU');
export function FavoritesPage() {
  const { favorites } = useCommerce();
  return (
    <main className="commerce-page">
      <div className="container">
        <p className="catalog-overline">СОХРАНЁННОЕ</p>
        <h1>Избранное</h1>
        {!favorites.length ? (
          <div className="commerce-empty">
            <Heart size={38} />
            <h2>Здесь пока пусто</h2>
            <p>Нажмите на сердечко в карточке товара, чтобы сохранить его.</p>
            <Link href="/catalog">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((item) => (
              <article className="favorite-card" key={item.id}>
                <div className="favorite-image">
                  <Link href={item.href}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      sizes="(max-width:600px) 100vw, 30vw"
                    />
                  </Link>
                  <FavoriteButton product={item} />
                </div>
                <Link href={item.href}>
                  <h2>{item.name}</h2>
                </Link>
                <p>{item.configuration}</p>
                <div>
                  <strong>{money.format(item.price)} ₽</strong>
                  <AddToCartButton product={item} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
