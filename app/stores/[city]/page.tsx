import { notFound } from 'next/navigation';
import Link from '@/components/shared/safe-link';
import { STORE_LIST, STORES, type StoreId } from '@/config/stores';
import { catalogCategories } from '@/data/catalog-navigation';
import { breadcrumbs, pageMetadata, storeStructuredData } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

type Props = { params: Promise<{ city: string }> };
function storeFor(city: string) {
  if (!Object.hasOwn(STORES, city)) notFound();
  return STORES[city as StoreId];
}
export function generateStaticParams() { return STORE_LIST.map(store => ({ city: store.id })); }
export async function generateMetadata({ params }: Props) {
  const store = storeFor((await params).city);
  return pageMetadata(`Техника в городе ${store.city} — адрес и контакты`,
    `Магазин APPGRADE: ${store.city}${store.address ? `, ${store.address}` : ''}. ${store.schedule ? `${store.schedule}. ` : ''}Смартфоны, компьютеры, аксессуары и Trade-In. Контакты и каталог.`, `/stores/${store.id}`);
}
export default async function StorePage({ params }: Props) {
  const store = storeFor((await params).city);
  return <main className="container seo-store-page">
    <JsonLd data={breadcrumbs([{ name: 'Главная', path: '/' }, { name: 'Магазины', path: '/stores' }, { name: store.city, path: `/stores/${store.id}` }])} />
    <JsonLd data={storeStructuredData(store)} />
    <nav aria-label="Хлебные крошки"><Link href="/">Главная</Link> / <Link href="/stores">Магазины</Link> / {store.city}</nav>
    <h1>APPGRADE — магазин техники, {store.city}</h1>
    <p>В APPGRADE можно выбрать смартфон, компьютер, планшет, наушники и аксессуары. Откройте каталог и выберите город «{store.city}», чтобы проверить цену и наличие нужной конфигурации.</p>
    <section className="seo-store-card" aria-label="Контакты магазина">
      <h2>Адрес и часы работы</h2>
      <p>{store.address ?? 'Адрес и контакты магазина уточняются. Проверяйте обновления на этой странице.'}</p>
      {store.schedule && <p>{store.schedule}</p>}
      {store.phone && <p>Телефон: <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`}>{store.phone}</a></p>}
      {store.routeUrl && <p><a href={store.routeUrl} target="_blank" rel="noopener noreferrer">Построить маршрут в Яндекс Картах</a></p>}
      {store.twoGisUrl && <p><a href={store.twoGisUrl} target="_blank" rel="noopener noreferrer">Открыть магазин в 2ГИС</a></p>}
    </section>
    <h2>Каталог техники</h2>
    <ul className="seo-model-links">{catalogCategories.map(category => <li key={category.id}><Link href={category.href}>{category.title}</Link></li>)}</ul>
    <h2>Обмен смартфона по Trade-In</h2>
    <p><Link href="/trade-in">Оцените устройство для Trade-In</Link> по модели, памяти и состоянию. Расчёт на сайте предварительный; итоговую сумму определяют после проверки устройства.</p>
    <p><Link href="/stores">Адреса других магазинов APPGRADE</Link></p>
  </main>;
}
