'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useCity } from '@/components/providers/city-provider';
import { AddToCartButton } from '@/components/shared/commerce-buttons';
import type { FeaturedProduct } from '@/types/catalog';
const money = new Intl.NumberFormat('ru-RU');
export function ProductCard({
  product,
  index,
}: {
  product: FeaturedProduct;
  index: number;
}) {
  const { cityId } = useCity();
  const inStock = (product.sku.availability[cityId] ?? 0) > 0;
  const params = new URLSearchParams({
    color: product.sku.colorSlug,
    ...(product.sku.storage ? { storage: product.sku.storage } : {}),
    ...(product.sku.sim ? { sim: product.sku.sim } : {}),
  });
  const href = `/catalog/${product.model.slug}?${params}`;
  const commerceProduct = {
    id: product.sku.id,
    name: product.model.name,
    configuration: [product.sku.storage, product.sku.color]
      .filter(Boolean)
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
        aria-label={product.model.name}
      >
        <Image
          src={product.sku.image}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 600px) 80vw, (max-width: 1100px) 42vw, 25vw"
          className={`product-image product-image-${index}`}
        />
      </Link>
      <div className="product-meta">
        <div>
          <p className={inStock ? 'stock' : 'stock muted'}>
            {inStock ? 'В наличии' : 'Под заказ'}
          </p>
          <h3>{product.model.name}</h3>
          <p className="configuration">{commerceProduct.configuration}</p>
        </div>
        <div className="product-buy">
          <div>
            {product.sku.oldPrice && (
              <del>{money.format(product.sku.oldPrice)} ₽</del>
            )}
            <strong>{money.format(product.sku.price)} ₽</strong>
          </div>
          <AddToCartButton product={commerceProduct} compact />
        </div>
      </div>
    </article>
  );
}
