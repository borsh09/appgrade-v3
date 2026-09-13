export function OrderAvailability({ available }: { available: boolean | null }) {
  if (available !== false) return null;
  return (
    <div className="order-availability" aria-live="polite">
      <strong>Спасибо! Заявка принята</strong>
      <p>Ожидайте звонка — менеджер скоро свяжется с вами.</p>
    </div>
  );
}
