'use client';

import {
  ArrowUpRight,
  Star,
} from 'lucide-react';

const reviewSources = [
  {
    name: 'Яндекс Карты',
    href: 'https://yandex.ru/maps/235/magnitogorsk/?ll=58.985899%2C53.412694&mode=poi&poi%5Bpoint%5D=58.984785%2C53.413001&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D89372369544&z=17.55',
    className: 'is-yandex',
    mark: 'Я',
    description: 'Отзывы покупателей',
  },
  {
    name: '2ГИС',
    href: 'https://2gis.ru/magnitogorsk/firm/70000001081044586/58.98484%2C53.413055',
    className: 'is-2gis',
    mark: '2ГИС',
    description: 'Отзывы о магазине',
  },
  {
    name: 'Авито',
    href: 'https://www.avito.ru/brands/appgrademgn?src=sharing',
    className: 'is-avito',
    mark: 'A',
    description: 'Профиль продавца',
  },
];

const reviews = [
  {
    name: 'Покупатель APPGRADE',
    source: '2ГИС',
    text: 'Отличный магазин, приятное обслуживание и большой выбор техники.',
    href: 'https://2gis.ru/magnitogorsk/firm/70000001081044586/58.98484%2C53.413055',
  },
  {
    name: 'Покупатель APPGRADE',
    source: 'Яндекс Карты',
    text: 'Помогли с выбором устройства, всё подробно рассказали и проверили на месте.',
    href: 'https://yandex.ru/maps/235/magnitogorsk/?ll=58.985899%2C53.412694&mode=poi&poi%5Bpoint%5D=58.984785%2C53.413001&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D89372369544&z=17.55',
  },
  {
    name: 'Покупатель APPGRADE',
    source: 'Авито',
    text: 'Быстро ответили, помогли подобрать нужную модель. Покупкой остался доволен.',
    href: 'https://www.avito.ru/brands/appgrademgn?src=sharing',
  },
];

export function AvitoReviews() {
  return (
    <section
      id="reviews"
      className="appgrade-reviews-new"
    >
      <div className="container">
        <div className="appgrade-reviews-new-heading">
          <div>
            <span>
              Отзывы
            </span>

            <h2>
              Нам
              <br />
              доверяют.
            </h2>
          </div>

          <p>
            Читайте отзывы покупателей APPGRADE
            на независимых площадках.
          </p>
        </div>

        <div className="appgrade-review-sources">
          {reviewSources.map((source) => (
            <a
              key={source.name}
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`appgrade-review-source ${source.className}`}
              aria-label={`Открыть ${source.name}`}
            >
              <div className="appgrade-review-source-logo">
                {source.mark}
              </div>

              <div className="appgrade-review-source-copy">
                <span>
                  {source.name}
                </span>

                <strong>
                  {source.description}
                </strong>

                <small>
                  Открыть отзывы
                </small>
              </div>

              <ArrowUpRight
                size={18}
                className="appgrade-review-source-arrow"
              />
            </a>
          ))}
        </div>

        <div className="appgrade-review-section-title">
          <span>
            Покупатели об APPGRADE
          </span>
        </div>

        <div className="appgrade-review-cards">
          {reviews.map((review, index) => (
            <article
              key={`${review.source}-${index}`}
              className="appgrade-review-card-new"
            >
              <div className="appgrade-review-card-top">
                <div className="appgrade-review-avatar">
                  {review.name.charAt(0)}
                </div>

                <div>
                  <strong>
                    {review.name}
                  </strong>

                  <span>
                    {review.source}
                  </span>
                </div>
              </div>

              <div className="appgrade-review-stars-new">
                {Array.from({ length: 5 }).map(
                  (_, starIndex) => (
                    <Star
                      key={starIndex}
                      size={14}
                      fill="currentColor"
                    />
                  ),
                )}
              </div>

              <p>
                {review.text}
              </p>

              <a
                href={review.href}
                target="_blank"
                rel="noopener noreferrer"
                className="appgrade-review-original"
              >
                Смотреть на {review.source}

                <ArrowUpRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}