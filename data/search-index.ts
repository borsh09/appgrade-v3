import { productHref } from '@/lib/product-selection';
import { iphoneCatalog } from '@/data/iphone-catalog';
import { additionalCatalog } from '@/data/additional-catalog';
import { samsungCatalog } from '@/data/samsung-catalog';
import { macbookCatalog } from '@/data/macbook-catalog';
import { ipadCatalog } from '@/data/ipad-catalog';
import { audioCatalog } from '@/data/audio-catalog';
import { watchCatalog } from '@/data/watch-catalog';
import { playstationCatalog } from '@/data/playstation-catalog';
import { googleCatalog } from '@/data/google-catalog';
import { dysonCatalog } from '@/data/dyson-catalog';
import { cameraCatalog } from '@/data/camera-catalog';
import { xiaomiCatalog } from '@/data/xiaomi-catalog';

export const searchIndex = [
  ...additionalCatalog.map(item => ({
    id: item.id,
    name: item.model,
    detail: 'В наличии',
    price: item.price ?? 0,
    image: item.image,
    href: productHref(item),
  })),
  ...iphoneCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...samsungCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.ram} / ${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...xiaomiCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.ram} / ${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...macbookCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.ram} / ${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...ipadCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.storage} · ${item.color} · ${item.connectivity}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...audioCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.kind} · ${item.color}`,
    price: item.price ?? 0,
    image: item.image,
    href: productHref(item),
  })),
  ...watchCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.size} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...playstationCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: item.configuration,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...googleCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...dysonCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.kind} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
  ...cameraCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.kind} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: productHref(item),
  })),
];
