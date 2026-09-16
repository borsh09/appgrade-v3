export function OrderAvailability({ available }: { available: boolean | null }) {
  if (available !== false) return null;
  return (
    <div className="order-availability" aria-live="polite">
      <strong>Оформление доступно</strong>
      <p>Telegram-уведомления временно недоступны. Заказ всё равно сохранится в админке, а менеджер свяжется с вами по телефону.</p>
    </div>
  );
}
