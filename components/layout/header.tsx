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
  if (item === 'iPhone') return '/catalog/iphones';
  if (item === 'Samsung') return '/catalog/samsung';
  if (item === 'Xiaomi') return '/catalog/xiaomi';
  if (item === 'Google Pixel') return '/catalog/google';
  if (item === 'MacBook и iMac') return '/catalog/macbooks';
  if (item === 'iPad') return '/catalog/ipads';
  if (item === 'Наушники и аудио') return '/catalog/audio';
  if (item === 'Смарт-часы') return '/catalog/watches';
  if (item === 'Игровые приставки') return '/catalog/playstation';
  if (item === 'Dyson') return '/catalog/dyson';
  if (item === 'Фотоаппараты') return '/catalog/cameras';

  return `/catalog?category=${encodeURIComponent(item)}`;
}

export function Header() {
  const searchRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);

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

  /* =========================================================
     SEARCH
     ========================================================= */

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

  /* =========================================================
     CLOSE SEARCH
     ========================================================= */

  useEffect(() => {
    const closeSearch = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
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

  /* =========================================================
     BODY LOCK
     ========================================================= */

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* =========================================================
     ESC
     ========================================================= */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      setMenuOpen(false);
      setMobileCatalogOpen(false);
      setCatalogOpen(false);
      setSearchOpen(false);
    };

    window.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, []);

  /* =========================================================
     HELPERS
     ========================================================= */

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setMobileCatalogOpen(false);
  };

  const toggleMenu = () => {
    setCatalogOpen(false);
    setSearchOpen(false);

    setMenuOpen((value) => !value);
  };

  return (
    <>
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="appgrade-header">
        <div className="container appgrade-header-inner">

          {/* LEFT */}

          <div className="appgrade-header-left">

            <Link
              href="/"
              className="appgrade-header-logo appgrade-header-logo-real"
              aria-label="APPGRADE — на главную"
              onClick={() => {
                setCatalogOpen(false);
                closeMobileMenu();
              }}
            >
              <Image
                src="/images/appgrade-logo-white.png"
                alt="APPGRADE"
                width={190}
                height={54}
                priority
              />
            </Link>

            <button
              type="button"
              className={`appgrade-catalog-button ${
                catalogOpen ? 'is-open' : ''
              }`}
              onClick={() => {
                setCatalogOpen((value) => !value);
                setSearchOpen(false);
              }}
              aria-expanded={catalogOpen}
            >
              Каталог

              <ChevronDown size={15} />
            </button>

          </div>

          {/* DESKTOP SEARCH */}

          <div
            className="appgrade-header-search-wrap"
            ref={searchRef}
          >
            <label className="appgrade-header-search">
              <Search size={17} />

              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                  setCatalogOpen(false);
                }}
                onFocus={() => {
                  setSearchOpen(true);
                  setCatalogOpen(false);
                }}
                type="search"
                placeholder="Найти технику и аксессуары"
                aria-label="Поиск по каталогу"
              />
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
                        setSearchOpen(false);
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
                        {money.format(item.price)} ₽
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

            <button
              type="button"
              className="appgrade-header-city-button"
              onClick={openCitySelector}
            >
              <MapPin size={14} />

              <span>
                {currentStore?.city ?? 'Город'}
              </span>

              <ChevronDown size={13} />
            </button>

            <Link
              href="/favorites"
              className="appgrade-header-icon appgrade-header-favorite"
              aria-label="Избранное"
            >
              <Heart size={19} />
              <small className="appgrade-header-action-label">Избранное</small>

              {favoriteCount > 0 && (
                <span>
                  {favoriteCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="appgrade-header-icon"
              aria-label="Корзина"
            >
              <ShoppingBag size={19} />
              <small className="appgrade-header-action-label">Корзина</small>

              {cartCount > 0 && (
                <span>
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="appgrade-header-icon appgrade-menu-trigger"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="appgrade-mobile-menu"
              aria-label={
                menuOpen
                  ? 'Закрыть меню'
                  : 'Открыть меню'
              }
            >
              <Menu size={20} />
            </button>

          </div>
        </div>

        {/* ===================================================
            DESKTOP CATALOG
            =================================================== */}

        <div
          className={`appgrade-catalog-dropdown ${
            catalogOpen ? 'is-open' : ''
          }`}
        >
          <div className="container appgrade-catalog-dropdown-inner">

            <div className="appgrade-catalog-heading">
              <span>
                Каталог
              </span>

              <h2>
                Выберите категорию
              </h2>
            </div>

            <div className="appgrade-catalog-grid">
              {menuCategories.map((item) => (
                <Link
                  key={item}
                  href={getCategoryHref(item)}
                  onClick={() => setCatalogOpen(false)}
                >
                  {item}

                  <span>
                    ↗
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE MENU
          ===================================================== */}

      <div
        id="appgrade-mobile-menu"
        className={`appgrade-mobile-menu ${
          menuOpen ? 'is-open' : ''
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="appgrade-mobile-menu-inner">

          {/* TOP */}

          <div className="appgrade-mobile-menu-top">

            <Link
              href="/"
              className="appgrade-mobile-menu-logo"
              onClick={closeMobileMenu}
            >
              <Image
                src="/images/appgrade-logo-white.png"
                alt="APPGRADE"
                width={170}
                height={48}
                priority
              />
            </Link>

            <button
              type="button"
              className="appgrade-mobile-menu-close"
              onClick={closeMobileMenu}
              aria-label="Закрыть меню"
            >
              <X size={18} />
            </button>

          </div>

          {/* CITY */}

          <button
            type="button"
            className="appgrade-mobile-city-simple"
            onClick={() => {
              closeMobileMenu();

              window.setTimeout(() => {
                openCitySelector();
              }, 120);
            }}
          >
            <span>
              <small>
                Ваш город
              </small>

              <strong>
                {currentStore?.city ?? 'Выбрать город'}
              </strong>
            </span>

            <ChevronDown size={16} />
          </button>

          {/* SEARCH */}

          <label className="appgrade-mobile-search">
            <Search size={17} />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Найти товар"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Очистить"
              >
                <X size={13} />
              </button>
            )}
          </label>

          {/* SEARCH RESULTS */}

          {query.trim().length >= 2 && (
            <div className="appgrade-mobile-search-results">

              {results.length ? (
                results.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setQuery('');
                      closeMobileMenu();
                    }}
                  >
                    <span className="appgrade-mobile-search-result-image">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        unoptimized
                        sizes="42px"
                      />
                    </span>

                    <span className="appgrade-mobile-search-result-copy">
                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.detail}
                      </small>
                    </span>

                    <b>
                      {money.format(item.price)} ₽
                    </b>
                  </Link>
                ))
              ) : (
                <p>
                  Ничего не найдено
                </p>
              )}

            </div>
          )}

          {/* NAV */}

          <nav className="appgrade-mobile-links">

            <button
              type="button"
              className={`appgrade-mobile-catalog-toggle ${
                mobileCatalogOpen ? 'is-open' : ''
              }`}
              onClick={() =>
                setMobileCatalogOpen(
                  (value) => !value,
                )
              }
            >
              <span>
                Каталог
              </span>

              <ChevronDown size={17} />
            </button>

            <div
              className={`appgrade-mobile-categories ${
                mobileCatalogOpen ? 'is-open' : ''
              }`}
            >
              <div className="appgrade-mobile-categories-inner">

                {menuCategories.map((item) => (
                  <Link
                    key={item}
                    href={getCategoryHref(item)}
                    onClick={closeMobileMenu}
                  >
                    {item}
                  </Link>
                ))}

              </div>
            </div>

            <Link
              href="/trade-in"
              className="appgrade-mobile-tradein-simple"
              onClick={closeMobileMenu}
            >
              <span>
                <i />
                Trade-In
              </span>

              <span>
                ↗
              </span>
            </Link>

            <Link
              href="/catalog"
              onClick={closeMobileMenu}
            >
              <span>
                Новинки
              </span>

              <span>
                ↗
              </span>
            </Link>

            <Link
              href="/#контакты"
              onClick={closeMobileMenu}
            >
              <span>
                Магазин
              </span>

              <span>
                ↗
              </span>
            </Link>

            <Link
              href="/#reviews"
              onClick={closeMobileMenu}
            >
              <span>
                Отзывы
              </span>

              <span>
                ↗
              </span>
            </Link>

          </nav>

          {/* BOTTOM */}

          <div className="appgrade-mobile-menu-bottom">

            <Link
              href="/favorites"
              onClick={closeMobileMenu}
            >
              <Heart size={16} />

              <span>
                Избранное
              </span>

              {favoriteCount > 0 && (
                <b>
                  {favoriteCount}
                </b>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={closeMobileMenu}
            >
              <ShoppingBag size={16} />

              <span>
                Корзина
              </span>

              {cartCount > 0 && (
                <b>
                  {cartCount}
                </b>
              )}
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}
