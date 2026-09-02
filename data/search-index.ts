import { iphoneCatalog } from '@/data/iphone-catalog';
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
  ...iphoneCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?storage=${encodeURIComponent(item.storage)}&color=${encodeURIComponent(item.color)}&sim=${encodeURIComponent(item.sim)}`,
  })),
  ...samsungCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.ram} / ${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?storage=${encodeURIComponent(item.storage)}&color=${encodeURIComponent(item.color)}&ram=${encodeURIComponent(item.ram)}`,
  })),
  ...xiaomiCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.ram} / ${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?storage=${encodeURIComponent(item.storage)}&color=${encodeURIComponent(item.color)}`,
  })),
  ...macbookCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.ram} / ${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?storage=${encodeURIComponent(item.storage)}&color=${encodeURIComponent(item.color)}&ram=${encodeURIComponent(item.ram)}`,
  })),
  ...ipadCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.storage} · ${item.color} · ${item.connectivity}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?storage=${encodeURIComponent(item.storage)}&color=${encodeURIComponent(item.color)}`,
  })),
  ...audioCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.kind} · ${item.color}`,
    price: item.price ?? 0,
    image: item.image,
    href: `/catalog/${item.modelSlug}?color=${encodeURIComponent(item.color)}`,
  })),
  ...watchCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.size} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?size=${encodeURIComponent(item.size)}&color=${encodeURIComponent(item.color)}`,
  })),
  ...playstationCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: item.configuration,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}`,
  })),
  ...googleCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.storage} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?storage=${encodeURIComponent(item.storage)}&color=${encodeURIComponent(item.color)}`,
  })),
  ...dysonCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.kind} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?color=${encodeURIComponent(item.color)}`,
  })),
  ...cameraCatalog.map((item) => ({
    id: item.id,
    name: item.model,
    detail: `${item.kind} · ${item.color}`,
    price: item.price,
    image: item.image,
    href: `/catalog/${item.modelSlug}?color=${encodeURIComponent(item.color)}`,
  })),
];
