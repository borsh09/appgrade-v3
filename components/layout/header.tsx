'use client';

import Image from 'next/image';
import { catalogCategories } from '@/data/catalog-navigation';
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

import { searchIndex as baseSearchIndex } from '@/data/search-index';
import { usePricedCatalog } from '@/components/providers/price-provider';

const menuCategories = catalogCategories;

const money = new Intl.NumberFormat('ru-RU');



export function Header() {
  const searchIndex = usePricedCatalog(baseSearchIndex);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDialogElement>(null);

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
        [...found].sort((a, b) => (b.price || Infinity) - (a.price || Infinity)).map((item) => [
          item.name,
          item,
        ]),
      ).values(),
    ].slice(0, 6);
  }, [query, searchIndex]);

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
    if (!menuOpen) return;
    const menu = mobileMenuRef.current;
    if (!menu) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const background = [...document.querySelectorAll<HTMLElement>('body > header, body > main, body > footer')];
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => menu.querySelector<HTMLElement>('button')?.focus());
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = [...menu.querySelectorAll<HTMLElement>('a[href], button, input')]
        .filter(element => !element.closest('[inert]') && !element.hasAttribute('disabled') && element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!menu.contains(document.activeElement)) { event.preventDefault(); first?.focus(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    menu.addEventListener('keydown', trapFocus);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      menu.removeEventListener('keydown', trapFocus);
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
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
              aria-controls="appgrade-desktop-catalog"
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
                        {item.price > 0 ? `${money.format(item.price)} ₽` : 'Цена уточняется'}
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
          id="appgrade-desktop-catalog"
          inert={!catalogOpen}
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
                  key={item.id}
                  href={item.href}
                  onClick={() => setCatalogOpen(false)}
                >
                  {item.title}

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

      <dialog
        open={menuOpen}
        id="appgrade-mobile-menu"
        ref={mobileMenuRef}
        aria-modal={menuOpen || undefined}
        aria-label="Меню сайта"
        onTransitionEnd={(event) => {
          if (menuOpen && event.target === event.currentTarget && !event.currentTarget.contains(document.activeElement)) {
            event.currentTarget.querySelector<HTMLButtonElement>('button')?.focus();
          }
        }}
        className={`appgrade-mobile-menu ${
          menuOpen ? 'is-open' : ''
        }`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
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
              aria-label="Поиск по каталогу"
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
                      {item.price > 0 ? `${money.format(item.price)} ₽` : 'Цена уточняется'}
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
              aria-expanded={mobileCatalogOpen}
              aria-controls="appgrade-mobile-categories"
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
              id="appgrade-mobile-categories"
              inert={!mobileCatalogOpen}
              className={`appgrade-mobile-categories ${
                mobileCatalogOpen ? 'is-open' : ''
              }`}
            >
              <div className="appgrade-mobile-categories-inner">

                {menuCategories.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={closeMobileMenu}
                  >
                    {item.title}
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
                Весь каталог
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
      </dialog>
    </>
  );
}
