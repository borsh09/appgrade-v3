'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';

import {
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCommerce } from '@/components/providers/commerce-provider';
import { useCity } from '@/components/providers/city-provider';

import { searchIndex } from '@/data/search-index';

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

function getCategoryHref(item: string) {
  if (item === 'iPhone') {
    return '/catalog/iphones';
  }

  if (item === 'Samsung') {
    return '/catalog/samsung';
  }

  if (item === 'Xiaomi') {
    return '/catalog/xiaomi';
  }

  if (item === 'Google Pixel') {
    return '/catalog/google';
  }

  if (item === 'MacBook и iMac') {
    return '/catalog/macbooks';
  }

  if (item === 'iPad') {
    return '/catalog/ipads';
  }

  if (item === 'Наушники и аудио') {
    return '/catalog/audio';
  }

  if (item === 'Смарт-часы') {
    return '/catalog/watches';
  }

  if (item === 'Игровые приставки') {
    return '/catalog/playstation';
  }

  if (item === 'Dyson') {
    return '/catalog/dyson';
  }

  if (item === 'Фотоаппараты') {
    return '/catalog/cameras';
  }

  return `/catalog?category=${encodeURIComponent(item)}`;
}

export function Header() {
  const searchRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const [mobileCatalogOpen, setMobileCatalogOpen] =
    useState(false);

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    cartCount,
    favoriteCount,
  } = useCommerce();

  const {
    currentStore,
    openCitySelector,
  } = useCity();

  const results = useMemo(() => {
    const q = query
      .trim()
      .toLocaleLowerCase('ru');

    if (q.length < 2) {
      return [];
    }

    const found = searchIndex.filter((item) => {
      const searchString =
        `${item.name} ${item.detail}`.toLocaleLowerCase('ru');

      return searchString.includes(q);
    });

    return [
      ...new Map(
        found.map((item) => [
          item.name,
          item,
        ]),
      ).values(),
    ].slice(0, 6);
  }, [query]);

  useEffect(() => {
    const closeSearch = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node,
        )
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      closeSearch,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        closeSearch,
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="appgrade-header">
      <div className="container appgrade-header-inner">
        <div className="appgrade-header-left">

          {/* LOGO */}

          <Link
            href="/"
            className="appgrade-header-logo appgrade-header-logo-real"
            aria-label="APPGRADE — на главную"
          >
            <Image
              src="/images/appgrade-logo-white.png"
              alt="APPGRADE"
              width={190}
              height={54}
              priority
            />
          </Link>

          {/* CATALOG */}

          <button
            type="button"
            className={`appgrade-catalog-button ${
              catalogOpen
                ? 'is-open'
                : ''
            }`}
            onClick={() =>
              setCatalogOpen(
                (value) => !value,
              )
            }
            aria-expanded={catalogOpen}
          >
            Каталог

            <ChevronDown size={16} />
          </button>
        </div>

        {/* SEARCH */}

        <div
          className="appgrade-header-search-wrap"
          ref={searchRef}
        >
          <label className="appgrade-header-search">
            <span className="sr-only">
              Поиск по каталогу
            </span>

            <input
              value={query}
              onChange={(event) => {
                setQuery(
                  event.target.value,
                );

                setSearchOpen(true);
              }}
              onFocus={() =>
                setSearchOpen(true)
              }
              type="search"
              placeholder="Поиск по каталогу"
            />

            <Search size={19} />
          </label>

          {searchOpen &&
            query.trim().length >= 2 && (
              <div className="appgrade-search-results">

                {results.length > 0 ? (
                  results.map((item) => (
                    <Link
                      href={item.href}
                      key={item.id}
                      onClick={() => {
                        setSearchOpen(
                          false,
                        );

                        setQuery('');
                      }}
                    >
                      <span className="appgrade-search-image">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          unoptimized
                          sizes="48px"
                        />
                      </span>

                      <span className="appgrade-search-copy">
                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          {item.detail}
                        </small>
                      </span>

                      <b>
                        {money.format(
                          item.price,
                        )}{' '}
                        ₽
                      </b>
                    </Link>
                  ))
                ) : (
                  <p className="appgrade-search-empty">
                    Ничего не найдено
                  </p>
                )}

              </div>
            )}
        </div>

        {/* RIGHT */}

        <div className="appgrade-header-right">

          {/* CURRENT CITY */}

          <button
            type="button"
            className="appgrade-header-city-button"
            onClick={openCitySelector}
            aria-label="Изменить город"
          >
            <MapPin size={15} />

            <span>
              {currentStore?.city ??
                'Выберите город'}
            </span>

            <ChevronDown size={14} />
          </button>

          {/* FAVORITES */}

          <Link
            href="/favorites"
            className="appgrade-header-icon appgrade-header-favorite"
            aria-label="Избранное"
          >
            <Heart size={20} />

            {favoriteCount > 0 && (
              <span>
                {favoriteCount}
              </span>
            )}
          </Link>

          {/* CART */}

          <Link
            href="/cart"
            className="appgrade-header-icon"
            aria-label="Корзина"
          >
            <ShoppingBag size={20} />

            {cartCount > 0 && (
              <span>
                {cartCount}
              </span>
            )}
          </Link>

          {/* MOBILE MENU */}

          <button
            type="button"
            className="appgrade-header-icon appgrade-menu-trigger"
            onClick={() =>
              setMenuOpen(
                (value) => !value,
              )
            }
            aria-label={
              menuOpen
                ? 'Закрыть меню'
                : 'Открыть меню'
            }
          >
            {menuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>
      </div>

      {/* DESKTOP CATALOG DROPDOWN */}

      <div
        className={`appgrade-catalog-dropdown ${
          catalogOpen
            ? 'is-open'
            : ''
        }`}
      >
        <div className="container appgrade-catalog-dropdown-inner">
          <div className="appgrade-catalog-heading">
            <span>Каталог</span>

            <h2>
              Выберите категорию
            </h2>
          </div>

          <div className="appgrade-catalog-grid">
            {menuCategories.map(
              (item) => (
                <Link
                  key={item}
                  href={getCategoryHref(
                    item,
                  )}
                  onClick={() =>
                    setCatalogOpen(
                      false,
                    )
                  }
                >
                  {item}

                  <span>
                    ↗
                  </span>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}

      <div
        className={`appgrade-mobile-menu ${
          menuOpen
            ? 'is-open'
            : ''
        }`}
      >
        <div className="appgrade-mobile-menu-inner">

          <div className="appgrade-mobile-menu-top">
            <span>
              Меню
            </span>

            <button
              type="button"
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Закрыть меню"
            >
              <X size={22} />
            </button>
          </div>

          {/* MOBILE SEARCH */}

          <label className="appgrade-mobile-search">
            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              type="search"
              placeholder="Найти товар"
            />

            <Search size={18} />
          </label>

          {/* MOBILE CITY */}

          <button
            type="button"
            className="appgrade-mobile-city-button"
            onClick={() => {
              setMenuOpen(false);

              openCitySelector();
            }}
          >
            <span className="appgrade-mobile-city-button-icon">
              <MapPin size={18} />
            </span>

            <span className="appgrade-mobile-city-button-copy">
              <small>
                Ваш город
              </small>

              <strong>
                {currentStore?.city ??
                  'Выбрать город'}
              </strong>
            </span>

            <ChevronDown size={17} />
          </button>

          {/* MOBILE NAVIGATION */}

          <nav className="appgrade-mobile-links">

            <button
              type="button"
              className="appgrade-mobile-catalog-toggle"
              onClick={() =>
                setMobileCatalogOpen(
                  (value) => !value,
                )
              }
            >
              Каталог

              <ChevronDown
                size={18}
                style={{
                  transform:
                    mobileCatalogOpen
                      ? 'rotate(180deg)'
                      : undefined,
                }}
              />
            </button>

            {mobileCatalogOpen && (
              <div className="appgrade-mobile-categories">

                {menuCategories.map(
                  (item) => (
                    <Link
                      key={item}
                      href={getCategoryHref(
                        item,
                      )}
                      onClick={() => {
                        setMenuOpen(
                          false,
                        );

                        setMobileCatalogOpen(
                          false,
                        );
                      }}
                    >
                      {item}
                    </Link>
                  ),
                )}

              </div>
            )}

            <Link
              href="/trade-in"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Trade-In
            </Link>

            <Link
              href="/catalog"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Новинки
            </Link>

            <Link
              href="/#контакты"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Магазин
            </Link>

            <Link
              href="/#reviews"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Отзывы
            </Link>

            <Link
              href="/#контакты"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Контакты
            </Link>

          </nav>
        </div>
      </div>
    </header>
  );
}