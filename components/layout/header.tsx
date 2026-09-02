'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Home as HomeIcon,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CitySelect } from '@/components/shared/city-select';
import { useCommerce } from '@/components/providers/commerce-provider';
import { searchIndex } from '@/data/search-index';

const nav = [
  'Новинки',
  'Акции',
  'Trade-In',
  'Магазины',
  'Доставка',
  'Контакты',
];
const menuCategories = [
  'iPhone',
  'Samsung',
  'Xiaomi',
  'Google Pixel',
  'MacBook и iMac',
  'iPad',
  'Наушники и аудио',
  'Смарт-часы',
  'Игровые приставки',
  'Dyson',
  'Фотоаппараты',
  'Аксессуары',
];
const money = new Intl.NumberFormat('ru-RU');

export function Header() {
  const searchRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false),
    [catalogOpen, setCatalogOpen] = useState(false),
    [mobileCatalogOpen, setMobileCatalogOpen] = useState(false),
    [query, setQuery] = useState(''),
    [searchOpen, setSearchOpen] = useState(false),
    [scrolled, setScrolled] = useState(false);
  const { cartCount, favoriteCount } = useCommerce();
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ru');
    if (q.length < 2) return [];
    const found = searchIndex.filter((item) =>
      `${item.name} ${item.detail}`.toLocaleLowerCase('ru').includes(q),
    );
    return [...new Map(found.map((item) => [item.name, item])).values()].slice(
      0,
      6,
    );
  }, [query]);
  useEffect(() => {
    const closeSearch = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', closeSearch);
    return () => document.removeEventListener('mousedown', closeSearch);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 56);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="header-utility">
        <div className="container">
          <div className="utility-left">
            <CitySelect compact />
            <Link href="/#контакты">Сервис и поддержка</Link>
          </div>
          <nav aria-label="Дополнительная навигация">
            {nav.map((item) => (
              <Link
                key={item}
                href={
                  item === 'Trade-In'
                    ? '/#trade-in'
                    : item === 'Контакты' || item === 'Магазины'
                      ? '/#контакты'
                      : '/catalog'
                }
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="utility-contact">
            <span>Магнитогорск · Белорецк · Троицк</span>
            <Link href="/#контакты">Написать нам</Link>
          </div>
        </div>
      </div>
      <div className="header-commerce">
        <div className="container commerce-inner">
          <Link href="/" className="logo" aria-label="APPGRADE — на главную">
            <span>APP</span>GRADE
          </Link>
          <button
            type="button"
            className={`catalog-trigger${catalogOpen ? ' is-open' : ''}`}
            aria-expanded={catalogOpen}
            onClick={() => setCatalogOpen(!catalogOpen)}
          >
            Каталог <ChevronDown size={15} />
          </button>
          <div className="header-search-wrap" ref={searchRef}>
            <label className="header-search">
              <span className="sr-only">Поиск по каталогу</span>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                type="search"
                placeholder="Найти смартфон, ноутбук или аксессуар"
              />
              <Search size={20} />
            </label>
            {searchOpen && query.trim().length >= 2 && (
              <div className="search-suggestions">
                {results.length ? (
                  results.map((item) => (
                    <Link
                      href={item.href}
                      key={item.id}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery('');
                      }}
                    >
                      <span className="search-suggestion-image">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          unoptimized
                          sizes="48px"
                        />
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.detail}</small>
                      </span>
                      <b>{money.format(item.price)} ₽</b>
                    </Link>
                  ))
                ) : (
                  <p>Ничего не найдено</p>
                )}
              </div>
            )}
          </div>
          <div className="header-actions">
            <Link
              className="icon-button desktop-only"
              aria-label="Избранное"
              href="/favorites"
            >
              <Heart size={20} />
              {favoriteCount > 0 && <span>{favoriteCount}</span>}
            </Link>
            <Link className="icon-button bag" aria-label="Корзина" href="/cart">
              <ShoppingBag size={20} />
              <span>{cartCount}</span>
            </Link>
            <button
              className="icon-button menu-button"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`catalog-dropdown${catalogOpen ? ' is-open' : ''}`}
        aria-hidden={!catalogOpen}
      >
        <div className="container catalog-dropdown-inner">
          <div>
            <p>КАТАЛОГ</p>
            <h2>Выберите категорию</h2>
          </div>
          <nav>
            {menuCategories.map((item) => (
              <Link
                key={item}
                href={
                  item === 'iPhone'
                    ? '/catalog/iphones'
                    : item === 'Samsung'
                      ? '/catalog/samsung'
                      : item === 'Xiaomi'
                        ? '/catalog/xiaomi'
                        : item === 'Google Pixel'
                          ? '/catalog/google'
                          : item === 'MacBook и iMac'
                            ? '/catalog/macbooks'
                            : item === 'iPad'
                              ? '/catalog/ipads'
                              : item === 'Наушники и аудио'
                                ? '/catalog/audio'
                                : item === 'Смарт-часы'
                                  ? '/catalog/watches'
                                  : item === 'Игровые приставки'
                                    ? '/catalog/playstation'
                                    : item === 'Dyson'
                                      ? '/catalog/dyson'
                                      : item === 'Фотоаппараты'
                                        ? '/catalog/cameras'
                                        : `/catalog?category=${encodeURIComponent(item)}`
                }
                onClick={() => setCatalogOpen(false)}
              >
                {item}
                <span>↗</span>
              </Link>
            ))}
          </nav>
          <Link
            className="catalog-dropdown-all"
            href="/catalog"
            onClick={() => setCatalogOpen(false)}
          >
            Весь каталог <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div
        className={`mobile-menu ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        <div className="container">
          <label className="mobile-search">
            <span className="sr-only">Поиск по каталогу</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Найти товар"
            />
            <Search size={18} aria-hidden="true" />
          </label>
          <CitySelect />
          <nav>
            <button
              className="mobile-catalog-toggle"
              type="button"
              aria-expanded={mobileCatalogOpen}
              onClick={() => setMobileCatalogOpen((value) => !value)}
            >
              <span>Каталог</span>
              <ChevronDown size={18} aria-hidden="true" />
            </button>
            <div className={`mobile-catalog-links${mobileCatalogOpen ? ' is-open' : ''}`} aria-label="Категории каталога">
              {menuCategories.map((item) => {
                const href = item === 'iPhone' ? '/catalog/iphones' : item === 'Samsung' ? '/catalog/samsung' : item === 'Xiaomi' ? '/catalog/xiaomi' : item === 'Google Pixel' ? '/catalog/google' : item === 'MacBook Рё iMac' ? '/catalog/macbooks' : item === 'iPad' ? '/catalog/ipads' : item === 'РќР°СѓС€РЅРёРєРё Рё Р°СѓРґРёРѕ' ? '/catalog/audio' : item === 'РЎРјР°СЂС‚-С‡Р°СЃС‹' ? '/catalog/watches' : item === 'РРіСЂРѕРІС‹Рµ РїСЂРёСЃС‚Р°РІРєРё' ? '/catalog/playstation' : item === 'Dyson' ? '/catalog/dyson' : item === 'Р¤РѕС‚РѕР°РїРїР°СЂР°С‚С‹' ? '/catalog/cameras' : `/catalog?category=${encodeURIComponent(item)}`;
                return <Link key={`mobile-${item}`} onClick={() => setOpen(false)} href={href}>{item}<span>↗</span></Link>;
              })}
            </div>
            <Link onClick={() => setOpen(false)} href="/favorites">
              Избранное ({favoriteCount})<span>↗</span>
            </Link>
            <Link onClick={() => setOpen(false)} href="/cart">
              Корзина ({cartCount})<span>↗</span>
            </Link>
            {nav.map((item) => (
              <Link
                onClick={() => setOpen(false)}
                key={item}
                href={
                  item === 'Trade-In'
                    ? '/#trade-in'
                    : item === 'Контакты' || item === 'Магазины'
                      ? '/#контакты'
                      : '/catalog'
                }
              >
                {item}
                <span>↗</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Основная навигация">
        <Link href="/" aria-label="Главная"><HomeIcon size={19} /><span>Главная</span></Link>
        <Link href="/favorites" aria-label="Избранное"><Heart size={19} /><span>Избранное</span>{favoriteCount > 0 && <b>{favoriteCount}</b>}</Link>
        <button type="button" className="mobile-bottom-menu" onClick={() => setOpen(!open)} aria-label={open ? 'Закрыть меню' : 'Открыть меню'}>
          {open ? <X size={21} /> : <Menu size={21} />}<span>Меню</span>
        </button>
        <Link href="/#контакты" aria-label="Магазины"><MapPin size={19} /><span>Магазины</span></Link>
        <Link href="/cart" aria-label="Корзина"><ShoppingBag size={19} /><span>Корзина</span>{cartCount > 0 && <b>{cartCount}</b>}</Link>
      </nav>
    </header>
  );
}
