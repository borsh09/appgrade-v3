'use client';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { useState } from 'react';
import { itemConfiguration, type CatalogItem } from '@/lib/catalog-registry';
import { productHref } from '@/lib/product-selection';
import { usePriceResolver } from '@/components/providers/price-provider';
import { AddToCartButton, FavoriteButton } from '@/components/shared/commerce-buttons';
import { ProductVariants } from './product-variants';
import { getIphoneDetails } from '@/data/iphone-details';
const money=new Intl.NumberFormat('ru-RU');
export function AdditionalProductPage({selected}: {selected: CatalogItem; variants?: CatalogItem[]}) {
  const resolve=usePriceResolver(); const sku=resolve(selected);
  const [photo,setPhoto]=useState(0);
  const gallery=[...new Set(sku.gallery?.length ? sku.gallery : [sku.image])];
  const product={id:sku.id,name:sku.model,configuration:itemConfiguration(sku),price:sku.price??0,image:sku.image,href:productHref(sku)};
  const details=sku.model.startsWith('iPhone') ? getIphoneDetails(sku.model) : null;
  return <main className="iphone-product-page"><div className="container"><Link className="product-back" href={`/catalog/${sku.category}`}>← Вернуться в каталог</Link><div className="product-layout"><section className="product-gallery"><div className="product-gallery-frame"><Image src={gallery[photo]??sku.image} alt={sku.model} fill sizes="(max-width:768px) 100vw,58vw" /></div>{gallery.length>1&&<div className="product-gallery-thumbs">{gallery.map((src,i)=><button key={src} onClick={()=>setPhoto(i)} aria-label={`Фото ${i+1}`} aria-pressed={i===photo}><Image src={src} alt="" width={72} height={72}/></button>)}</div>}</section><section className="product-info"><p className="catalog-overline">APPGRADE</p><h1>{sku.model}</h1><p className="product-lead">{details?.lead??itemConfiguration(sku)}</p><div className="product-price-line"><strong>{sku.price===null?'Цена уточняется':`${money.format(sku.price)} ₽`}</strong><span>В наличии</span></div><ProductVariants selectedId={sku.id}/><div className="product-actions">{sku.price===null?<Link href="/#контакты">Уточнить цену у менеджера</Link>:<AddToCartButton product={product}/>}<FavoriteButton product={product}/></div><div className="product-meta-list"><div><span>Самовывоз</span><strong>После подтверждения менеджером</strong></div></div></section></div>{details&&<section className="product-specifications"><h2>Характеристики</h2>{details.groups.map(group=><div className="product-spec-group" key={group.title}><h3>{group.title}</h3><dl>{group.rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>)}</section>}</div></main>;
}
