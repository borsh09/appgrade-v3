'use client';

import { ArrowUpRight, Clock3, MapPin, Send } from 'lucide-react';
import { BrandWordmark } from '@/components/shared/brand-wordmark';
import Link from '@/components/shared/safe-link';
import { useCity } from '@/components/providers/city-provider';
import { STORES } from '@/config/stores';
import styles from './footer.module.css';

const catalogLinks = [
  ['Смартфоны', '/catalog/smartphones'],
  ['MacBook', '/catalog/macbooks'],
  ['iPad', '/catalog/ipads'],
  ['Наушники и колонки', '/catalog/audio'],
  ['Смарт-часы', '/catalog/watches'],
  ['Весь каталог', '/catalog'],
] as const;
const buyerLinks = [
  ['Trade-in', '/trade-in'],
  ['Избранное', '/favorites'],
  ['Корзина', '/cart'],
  ['Наши магазины', '/stores'],
] as const;

export function Footer() {
  const { currentStore, openCitySelector } = useCity();
  const store = currentStore ?? STORES.magnitogorsk;
  const telegram = store.telegram ?? STORES.magnitogorsk.telegram!;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.main}`}>
        <div className={styles.brand}>
          <Link href="/" aria-label="APPGRADE — на главную" className={styles.logo}><BrandWordmark /></Link>
          <p>Техника, которую хочется.<br />Люди, которым доверяешь.</p>
          <div className={styles.socials}>
            <a href={telegram} target="_blank" rel="noreferrer" aria-label="Telegram APPGRADE" title="Telegram" className={styles.telegram}><Send size={21} aria-hidden="true" /></a>
            <a href={store.vk ?? STORES.magnitogorsk.vk} target="_blank" rel="noreferrer" aria-label="VK APPGRADE" title="ВКонтакте" className={styles.vk}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.9 19c-7.3 0-11.4-5-11.6-13.3H5c.1 6.1 2.8 8.7 4.9 9.2V5.7h3.5V11c2.1-.2 4.2-2.6 4.9-5.3h3.5c-.5 3.3-2.8 5.7-4.4 6.7 1.6.8 4.2 2.9 5.2 6.6h-3.9c-.8-2.5-2.7-4.5-5.3-4.8V19h-.5Z" /></svg>
            </a>
            <a href={store.instagram ?? STORES.magnitogorsk.instagram} target="_blank" rel="noreferrer" aria-label="Instagram APPGRADE" title="Instagram" className={styles.instagram}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
          </div>
        </div>
        <nav className={styles.column} aria-label="Каталог в футере">
          <h2>Каталог</h2>
          {catalogLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <nav className={styles.column} aria-label="Покупателям">
          <h2>Покупателям</h2>
          {buyerLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          <a href={telegram} target="_blank" rel="noreferrer">Помощь с выбором <ArrowUpRight size={13} aria-hidden="true" /></a>
        </nav>
        <div className={styles.contacts}>
          <h2>Всегда на связи</h2>
          <button type="button" onClick={openCitySelector} className={styles.city}>{store.city}<ArrowUpRight size={15} aria-hidden="true" /></button>
          {store.phone && <a className={styles.phone} href={`tel:${store.phone.replace(/[^+\d]/g, '')}`}>{store.phone}</a>}
          {store.address && <p><MapPin size={15} aria-hidden="true" /><span>{store.address}</span></p>}
          {store.schedule && <p><Clock3 size={15} aria-hidden="true" /><span>{store.schedule}</span></p>}
          <a className={styles.message} href={telegram} target="_blank" rel="noreferrer">Написать нам <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© 2026 APPGRADE</span>
        <Link href="/privacy">Политика конфиденциальности</Link>
        <a href="https://t.me/borschtsch09" target="_blank" rel="noreferrer" className={styles.made} aria-label="Разработано студией БОРЩ">Разработано <strong>БОРЩ.</strong></a>
      </div>
    </footer>
  );
}

