import styles from './discount-price.module.css';
const money = new Intl.NumberFormat('ru-RU');
export function DiscountPrice({ price, oldPrice, unavailable = false }: { price: number | null; oldPrice?: number; unavailable?: boolean }) {
  return <div className={styles.price}>
    {!unavailable && price !== null && oldPrice !== undefined && oldPrice > price && <del className={styles.old} aria-label={`Обычная цена ${money.format(oldPrice)} рублей`}>{money.format(oldPrice)} ₽</del>}
    <strong>{unavailable ? 'Нет в продаже' : price === null ? 'Цена уточняется' : `${money.format(price)} ₽`}</strong>
  </div>;
}
