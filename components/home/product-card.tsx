'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';

import { useCity } from '@/components/providers/city-provider';
import { AddToCartButton } from '@/components/shared/commerce-buttons';

import type { FeaturedProduct } from '@/types/catalog';

import { macbookCatalog } from '@/data/macbook-catalog';
import { audioCatalog } from '@/data/audio-catalog';
import { watchCatalog } from '@/data/watch-catalog';

const money = new Intl.NumberFormat('ru-RU');

export function ProductCard({
  product,
  index,
}: {
  product: FeaturedProduct;
  index: number;
}) {
  const { cityId } = useCity();

  /*
   * Город при первом рендере может быть null,
   * пока пользователь его не выбрал.
   */
  const inStock = cityId
    ? (product.sku.availability[cityId] ?? 0) > 0
    : false;

  let href = '';

  /*
   * =========================================================
   * MACBOOK
   * =========================================================
   */

  if (product.model.category === 'laptops') {
    const macbook = macbookCatalog.find(
      (item) => item.id === product.sku.id,
    );

    if (macbook) {
      const params = new URLSearchParams();

      if (macbook.storage) {
        params.set('storage', macbook.storage);
      }

      if (macbook.ram) {
        params.set('ram', macbook.ram);
      }

      if (macbook.color) {
        params.set('color', macbook.color);
      }

      href = `/catalog/${macbook.modelSlug}?${params.toString()}`;
    }
  }

  /*
   * =========================================================
   * AUDIO / AIRPODS
   * =========================================================
   */

  if (product.model.category === 'audio') {
    const audio = audioCatalog.find(
      (item) => item.id === product.sku.id,
    );

    if (audio) {
      const params = new URLSearchParams();

      if (audio.color) {
        params.set('color', audio.color);
      }

      href = `/catalog/${audio.modelSlug}?${params.toString()}`;
    }
  }

  /*
   * =========================================================
   * APPLE WATCH
   * =========================================================
   */

  if (product.model.category === 'watches') {
    const watch = watchCatalog.find(
      (item) => item.id === product.sku.id,
    );

    if (watch) {
      const params = new URLSearchParams();

      if (watch.size) {
        params.set('size', watch.size);
      }

      if (watch.color) {
        params.set('color', watch.color);
      }

      href = `/catalog/${watch.modelSlug}?${params.toString()}`;
    }
  }

  /*
   * =========================================================
   * OTHER PRODUCTS
   * iPhone / Samsung / Xiaomi / etc.
   * =========================================================
   */

  if (!href) {
    const params = new URLSearchParams();

    if (product.sku.storage) {
      params.set(
        'storage',
        product.sku.storage,
      );
    }

    if (product.sku.color) {
      params.set(
        'color',
        product.sku.color,
      );
    }

    if (product.sku.sim) {
      params.set(
        'sim',
        product.sku.sim,
      );
    }

    const query = params.toString();

    href = query
      ? `/catalog/${product.model.slug}?${query}`
      : `/catalog/${product.model.slug}`;
  }

  /*
   * =========================================================
   * CART PRODUCT
   * =========================================================
   */

  const commerceProduct = {
    id: product.sku.id,

    name: product.model.name,

    configuration: [
      product.sku.storage,
      product.sku.color,
    ]
      .filter(
        (value): value is string =>
          Boolean(value),
      )
      .join(' · '),

    price: product.sku.price,

    image: product.sku.image,

    href,
  };

  return (
    <article className="product-card">
      <Link
        href={href}
        className="product-image-wrap"
        aria-label={`Открыть ${product.model.name}`}
      >
        <Image
          src={product.sku.image}
          alt={product.model.name}
          fill
          unoptimized
          sizes="(max-width: 600px) 80vw, (max-width: 1100px) 42vw, 25vw"
          className={`product-image product-image-${index}`}
        />
      </Link>

      <div className="product-meta">
        <div>
          <p
            className={
              inStock
                ? 'stock'
                : 'stock muted'
            }
          >
            {inStock
              ? 'В наличии'
              : 'Под заказ'}
          </p>

          <h3>
            <Link href={href}>
              {product.model.name}
            </Link>
          </h3>

          <p className="configuration">
            {commerceProduct.configuration}
          </p>
        </div>

        <div className="product-buy">
          <div>
            {product.sku.oldPrice && (
              <del>
                {money.format(
                  product.sku.oldPrice,
                )}{' '}
                ₽
              </del>
            )}

            <strong>
              {money.format(
                product.sku.price,
              )}{' '}
              ₽
            </strong>
          </div>

          <AddToCartButton
            product={commerceProduct}
            compact
          />
        </div>
      </div>
    </article>
  );
}