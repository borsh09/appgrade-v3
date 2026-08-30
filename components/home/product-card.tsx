'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCity } from '@/components/providers/city-provider';
import type { FeaturedProduct } from '@/types/catalog';
const money = new Intl.NumberFormat('ru-RU');
export function ProductCard({ product, index }: { product: FeaturedProduct; index: number }) {
  const { cityId } = useCity(); const inStock = (product.sku.availability[cityId] ?? 0) > 0;
  const params = new URLSearchParams({ color: product.sku.colorSlug, ...(product.sku.storage ? { storage: product.sku.storage } : {}), ...(product.sku.sim ? { sim: product.sku.sim } : {}) });
  return <article className="product-card"><Link href={`/catalog/${product.model.slug}?${params}`} className="product-image-wrap" aria-label={product.model.name}><Image src={product.sku.image} alt="" fill sizes="(max-width: 600px) 80vw, (max-width: 1100px) 42vw, 25vw" className={`product-image product-image-${index}`} /></Link><div className="product-meta"><div><p className={inStock ? 'stock' : 'stock muted'}>{inStock ? 'В наличии' : 'Под заказ'}</p><h3>{product.model.name}</h3><p className="configuration">{[product.sku.storage, product.sku.color].filter(Boolean).join(' · ')}</p></div><div className="product-buy"><div>{product.sku.oldPrice && <del>{money.format(product.sku.oldPrice)} ₽</del>}<strong>{money.format(product.sku.price)} ₽</strong></div><button aria-label={`Добавить ${product.model.name} в корзину`}><Plus size={20} /></button></div></div></article>;
}
