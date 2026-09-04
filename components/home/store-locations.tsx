'use client';

import {
  ArrowUpRight,
  Clock3,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';

import { useCity } from '@/components/providers/city-provider';

export function StoreLocations() {
  const {
    currentStore,
    openCitySelector,
  } = useCity();

  if (!currentStore) {
    return null;
  }

  const hasCoordinates =
    typeof currentStore.latitude === 'number' &&
    typeof currentStore.longitude === 'number';

  const mapUrl = hasCoordinates
    ? `https://yandex.ru/map-widget/v1/?ll=${currentStore.longitude}%2C${currentStore.latitude}&z=17&pt=${currentStore.longitude},${currentStore.latitude},pm2rdm`
    : '';

  return (
    <section
      id="контакты"
      className="appgrade-find-us"
    >
      <div className="container">
        <div className="appgrade-find-us-heading">
          <span>Как нас найти</span>

          <h2>
            Ждём вас
            <br />
            в APPGRADE.
          </h2>
        </div>

        <div
          className="appgrade-find-us-card"
          aria-live="polite"
        >

          {/* LEFT INFO */}

          <div className="appgrade-find-us-info">
            <div className="appgrade-find-us-city-row">
              <div>
                <span>
                  Ваш город
                </span>

                <h3>
                  {currentStore.city}
                </h3>
              </div>

              <button
                type="button"
                onClick={openCitySelector}
              >
                Другой город
              </button>
            </div>

            <div className="appgrade-find-us-details">
              <div className="appgrade-find-us-detail">
                <div className="appgrade-find-us-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>Адрес</span>

                  <strong>
                    {currentStore.address}
                  </strong>
                </div>
              </div>

              {currentStore.phone && (
                <div className="appgrade-find-us-detail">
                  <div className="appgrade-find-us-icon">
                    <Phone size={18} />
                  </div>

                  <div>
                    <span>Телефон</span>

                    <a
                      href={`tel:${currentStore.phone}`}
                    >
                      {currentStore.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="appgrade-find-us-detail">
                <div className="appgrade-find-us-icon">
                  <Clock3 size={18} />
                </div>

                <div>
                  <span>Режим работы</span>

                  <strong>
                    {currentStore.schedule}
                  </strong>
                </div>
              </div>
            </div>

            {currentStore.routeUrl && (
              <a
                href={currentStore.routeUrl}
                target="_blank"
                rel="noreferrer"
                className="appgrade-find-us-route"
              >
                <Navigation size={17} />

                Проложить маршрут

                <ArrowUpRight size={16} />
              </a>
            )}
          </div>

          {/* MAP */}

          <div className="appgrade-find-us-map">
            {hasCoordinates ? (
              <iframe
                key={currentStore.id}
                title={`APPGRADE ${currentStore.city}`}
                src={mapUrl}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="appgrade-find-us-placeholder">
                <MapPin size={28} />

                <strong>
                  APPGRADE {currentStore.city}
                </strong>

                <span>
                  Точную точку магазина скоро добавим
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
