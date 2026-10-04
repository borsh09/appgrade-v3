import Link from '@/components/shared/safe-link';
import { STORE_LIST } from '@/config/stores';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata = pageMetadata('Магазины техники — адреса и контакты', 'Адреса, телефоны и часы работы APPGRADE в Магнитогорске, Белорецке, Троицке и Сибае. Контакты магазинов и выбор техники в каталоге.', '/stores');
export default function StoresPage() {
  return <main className="container seo-store-page">
    <JsonLd data={breadcrumbs([{ name: 'Главная', path: '/' }, { name: 'Магазины', path: '/stores' }])} />
    <nav aria-label="Хлебные крошки"><Link href="/">Главная</Link> / Магазины</nav>
    <h1>Магазины APPGRADE — адреса и контакты</h1>
    <p>Выберите свой город, чтобы узнать адрес, часы работы и контакты магазина. Цены и наличие техники проверяйте в каталоге после выбора города.</p>
    <div className="seo-store-grid">{STORE_LIST.map(store => <article className="seo-store-card" key={store.id}>
      <h2><Link href={`/stores/${store.id}`}>APPGRADE — {store.city}</Link></h2>
      <p>{store.address ?? 'Адрес магазина уточняется.'}</p>
      {store.schedule && <p>{store.schedule}</p>}
      {store.phone && <p><a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`}>{store.phone}</a></p>}
      <Link href={`/stores/${store.id}`}>Контакты и как добраться</Link>
    </article>)}</div>
    <Link href="/catalog">Перейти в каталог техники</Link>
  </main>;
}
