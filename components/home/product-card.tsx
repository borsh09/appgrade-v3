'use client';

import cardStyles from '@/components/shared/store-card.module.css';
import { HoverProductPhoto } from '@/components/shared/hover-product-photo';
import { catalogById, itemConfiguration } from '@/lib/catalog-registry';
import { productHref } from '@/lib/product-selection';
import Link from '@/components/shared/safe-link';

import { AddToCartButton } from '@/components/shared/commerce-buttons';

import type { FeaturedProduct } from '@/types/catalog';
import { usePriceResolver } from '@/components/providers/price-provider';

const money = new Intl.NumberFormat('ru-RU');

export function ProductCard({
  product: baseProduct,
  index,
  status = 'В наличии',
}: {
  product: FeaturedProduct;
  index: number;
  status?: string;
}) {
  const resolvePrice = usePriceResolver();
  const product = { ...baseProduct, sku: resolvePrice(baseProduct.sku) };

  const inStock = status === 'В наличии';

  const catalogItem = catalogById.get(product.sku.id);
  const href = catalogItem ? productHref(catalogItem) : `/catalog/${product.model.slug}`;
  const commerceProduct = {
    id: product.sku.id,

    name: product.model.name,

    configuration: catalogItem ? itemConfiguration(catalogItem) : [
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
    <article className={`product-card ${cardStyles.card}`}>
      <Link
        href={href}
        className="product-image-wrap"
        aria-label={`Открыть ${product.model.name}`}
      >
        <HoverProductPhoto
          image={product.sku.image}
          gallery={catalogById.get(product.sku.id)?.gallery}
          alt={product.model.name}
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
            {status}
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
