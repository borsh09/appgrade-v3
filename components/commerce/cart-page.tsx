'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCommerce } from '@/components/providers/commerce-provider';
const money = new Intl.NumberFormat('ru-RU');
const productWord = (count: number) => {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'товаров';
  if (mod10 === 1) return 'товар';
  if (mod10 >= 2 && mod10 <= 4) return 'товара';
  return 'товаров';
};
export function CartPage() {
  const { cart, removeFromCart, setQuantity } = useCommerce();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <main className="commerce-page">
      <div className="container">
        <p className="catalog-overline">ВАШ ЗАКАЗ</p>
        <h1>Корзина</h1>
        {!cart.length ? (
          <div className="commerce-empty">
            <ShoppingBag size={38} />
            <h2>Корзина пока пуста</h2>
            <p>Добавьте устройство из каталога — оно сохранится здесь.</p>
            <Link href="/catalog">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {cart.map((item) => (
                <article className="cart-line" key={item.id}>
                  <Link href={item.href} className="cart-image">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      unoptimized
                      sizes="120px"
                    />
                  </Link>
                  <div className="cart-description">
                    <Link href={item.href}>
                      <h2>{item.name}</h2>
                    </Link>
                    <p>{item.configuration}</p>
                    <strong>{money.format(item.price)} ₽</strong>
                  </div>
                  <div className="quantity-control">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      aria-label="Уменьшить"
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      aria-label="Увеличить"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    className="cart-remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Удалить"
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
            <aside className="cart-summary">
              <span>Итого</span>
              <strong>{money.format(total)} ₽</strong>
              <p>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                {productWord(
                  cart.reduce((sum, item) => sum + item.quantity, 0),
                )}
              </p>
              <Link href="/#контакты">Оформить с менеджером</Link>
              <small>Менеджер подтвердит наличие и способ получения.</small>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
