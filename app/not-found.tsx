import Link from '@/components/shared/safe-link';

export default function NotFound() {
  return (
    <main className="catalog-page">
      <div className="container">
        <div className="catalog-heading">
          <div><p className="catalog-overline">Ошибка 404</p><h1>Страница не найдена</h1></div>
          <p>Возможно, адрес изменился. Найдите нужную модель в каталоге.</p>
        </div>
        <Link href="/catalog">Перейти в каталог →</Link>
      </div>
    </main>
  );
}
