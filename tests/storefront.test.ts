import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync } from 'node:fs';
import { searchIndex } from '@/data/search-index';
import clientBasePrices from '@/data/client-base-prices.json';
import newPriceSource from '@/data/new-price-source.json';
import { catalogById, catalogItems } from '@/lib/catalog-registry';
import { getProductDetails } from '@/lib/product-details';
import rawCatalog from '@/data/new-price-catalog.json';
import { presentCatalogItem } from '@/lib/catalog-presentation';
import type { CatalogItem } from '@/lib/catalog-registry';
import { modelVariants, optionHref, selectProduct, variantFields } from '@/lib/product-selection';
import { interleaveCatalogModels } from '@/lib/catalog-model-groups';
import { missingPhotosLast } from '@/lib/catalog-order';
import { applyCatalogMedia, missingProductImage, type ProductMedia } from '@/lib/catalog-media';
import productMedia from '@/data/catalog-product-media.json';
import exclusions from '@/data/product-media-exclusions.json';
import {catalogPromoPhoto} from '@/lib/catalog-promo-photo';

void test('every category keeps missing photos after photographed products, including filtered pages', () => {
  for (const category of new Set(catalogItems.map(item => item.category))) {
    const source = catalogItems.filter(item => item.category === category);
    const previous = category === 'macbooks' ? interleaveCatalogModels(source) : source;
    const snapshot = [...previous];
    const ordered = missingPhotosLast(previous);
    assert.deepEqual(previous, snapshot, `${category}: input remains unchanged`);
    assert.deepEqual(ordered.filter(item => !item.photoMissing), previous.filter(item => !item.photoMissing), `${category}: photographed order`);
    assert.deepEqual(ordered.filter(item => item.photoMissing), previous.filter(item => item.photoMissing), `${category}: pending order`);
    assert.equal(new Set(ordered.map(item => item.id)).size, source.length, `${category}: every SKU retained`);
    for (const model of new Set(source.map(item => item.model))) {
      const filtered = ordered.filter(item => item.model === model);
      const firstMissing = filtered.findIndex(item => item.photoMissing);
      if (firstMissing >= 0) assert.ok(filtered.slice(firstMissing).every(item => item.photoMissing), `${category}/${model}: filtered order`);
    }
    const withPhotos = ordered.filter(item => !item.photoMissing).length;
    assert.ok(ordered.slice(0, Math.min(48, withPhotos)).every(item => !item.photoMissing), `${category}: first page`);
  }
});

void test('supplier names show models and retain configuration without changing import identifiers', () => {
  const mac = catalogItems.find(item => item.article === 'P-36724007')!;
  assert.equal(mac.model, 'MacBook Pro 16 M5 Max');
  assert.equal(mac.ram, '48 ГБ');
  assert.equal(mac.storage, '2 ТБ');
  assert.equal(mac.color, 'Silver');
  assert.equal(mac.manufacturerPart, 'MGE94');
  const phone = presentCatalogItem({ id: 'P-test', model: 'iPhone 17 Pro 256 Silver (eSIM)', modelSlug: 'p-test', category: 'iphones', price: 100, color: '', image: '/images/category-iphone.webp' });
  assert.equal(phone.model, 'iPhone 17 Pro');
  assert.equal(phone.storage, '256 ГБ');
  assert.equal(phone.sim, 'eSIM');
  assert.equal(phone.color, 'Silver');
  for (const [id, model, color] of [
    ['P-37444527', 'Яндекс Станция Мини 3', 'Лиловый'],
    ['P-82678119', 'Яндекс Станция Миди', 'Изумрудный'],
    ['P-51376677', 'Яндекс Станция Миди', 'Малиновый'],
    ['P-31484760', 'Яндекс Станция Миди', 'Оранжевый'],
  ]) {
    const station = catalogById.get(id)!;
    assert.equal(station.model, model);
    assert.equal(station.color, color);
    assert.equal(station.photoMissing, false);
  }
  for (const raw of rawCatalog) {
    const shown = presentCatalogItem(raw as CatalogItem);
    for (const field of ['id', 'article', 'modelSlug', 'price', 'image', 'priceAlias', 'sourceTitle'] as const) {
      assert.equal(shown[field], raw[field], `${raw.id}: ${field}`);
    }
    assert.deepEqual(presentCatalogItem(shown), shown, raw.id);
  }
});

void test('MacBook cards share model pages and every option selects a real article', () => {
  const macs = catalogItems.filter(item => item.sourceCategory === 'Macbook');
  assert.equal(macs.length, 83);
  for (const selected of macs) {
    const { variants } = modelVariants(catalogItems, selected.modelSlug);
    assert.ok(variants.length >= 1, selected.model);
    const old = modelVariants(catalogItems, selected.originalModelSlug!);
    assert.ok(old.variants.some(item => item.id === selected.id), selected.id);
    if (selected.originalModelSlug?.startsWith('p-')) assert.equal(old.legacy?.id, selected.id);
    for (const key of variantFields) for (const value of new Set(variants.map(item => item[key]).filter((value): value is string => Boolean(value)))) {
      const href = optionHref(variants, selected, key, value)!;
      const url = new URL(href, 'http://localhost');
      assert.equal(url.pathname, `/catalog/${selected.modelSlug}`);
      const target = selectProduct(variants, { sku: url.searchParams.get('sku')! })!;
      assert.ok(target, href);
      assert.equal(target[key], value, href);
      assert.equal(catalogById.get(target.id)?.article, target.article);
    }
  }
  const pro = macs.filter(item => item.modelSlug === 'macbook-pro-16-m5');
  assert.deepEqual(new Set(pro.map(item => item.chip)), new Set(['M5 Pro', 'M5 Max']));
  const mixed = interleaveCatalogModels(macs);
  assert.equal(new Set(mixed.map(item => item.id)).size, macs.length);
  assert.ok(new Set(mixed.slice(0, 12).map(item => item.modelSlug)).size >= 8);
});

void test('all storefront photos come from the exact model and colour map; stale mappings fail closed', () => {
  for (const item of catalogItems) {
    const entry = (productMedia as Record<string, ProductMedia>)[item.id];
    assert.ok(entry, item.id);
    assert.equal(item.photoApproximate, false, item.id);
    if (item.photoMissing) {
      assert.equal(item.image, missingProductImage);
      assert.deepEqual(item.gallery, [missingProductImage]);
    } else {
      assert.equal(entry.status, 'verified');
      assert.equal(entry.referenceModel, item.model, item.id);
      assert.equal(entry.referenceColor, item.color, item.id);
      assert.ok(entry.source, item.id);
      assert.ok(item.gallery?.length, item.id);
      for (const image of item.gallery!) {
        assert.ok(!(image in exclusions), `Rejected gallery photo returned: ${item.id} ${image}`);
        assert.ok(existsSync(`public${image}`), image);
        assert.ok(!/category-|king-product|pending|art-directed|concept|apple-2027/.test(image), image);
      }
    }
    const indexed = searchIndex.find(product => product.id === item.id)!;
    assert.equal(indexed.image, item.image, item.id);
  }
  const actual = catalogItems.find(item => !item.photoMissing)!;
  assert.equal(applyCatalogMedia({ ...actual, model: 'Different model' }).image, missingProductImage);
  assert.equal(applyCatalogMedia({ ...actual, color: 'Different colour' }).image, missingProductImage);
  assert.equal(applyCatalogMedia({ ...actual, configuration: 'Different accessory kit' }).image, missingProductImage);
  const teal = catalogItems.find(item => item.article === 'P-79528648')!;
  assert.equal(teal.color, 'Teal');
  assert.ok(!teal.gallery?.includes('/images/products/verified/d868fd3790fe6ad40b656fcb.jpg'));
});

void test('category banners select a real reviewed SKU and never reuse another model photo', () => {
  const watch=catalogPromoPhoto(searchIndex,['Apple Watch Ultra 4'])!;
  assert.ok(watch);
  assert.equal(watch.image,catalogById.get(watch.id)?.image);
  assert.equal(watch.href,`/catalog/${catalogById.get(watch.id)?.modelSlug}?sku=${watch.id}`);
  assert.equal(catalogPromoPhoto(searchIndex,['A model absent from the catalog']),undefined);
  assert.equal(catalogPromoPhoto([{model:'Unavailable',image:missingProductImage,href:'/catalog/unavailable'}],['Unavailable']),undefined);
});

void test('reviewed watch band lengths retain their exact selection and reject a different case or band', () => {
  const small=catalogById.get('P-71775529')!;
  const large=catalogById.get('P-50994856')!;
  assert.equal(small.photoMissing,false);
  assert.equal(large.photoMissing,false);
  assert.equal(small.image,large.image);
  assert.equal(small.configuration,'Sport Band (S/M)');
  assert.equal(large.configuration,'Sport Band (M/L)');
  assert.equal(applyCatalogMedia({...small,size:'42 мм'}).image,missingProductImage);
  assert.equal(applyCatalogMedia({...small,color:'Gold'}).image,missingProductImage);
  assert.equal(applyCatalogMedia({...small,configuration:'Milanese Loop (S/M)'}).image,missingProductImage);
  assert.equal(applyCatalogMedia({...small,configuration:large.configuration}).image,missingProductImage);
});

void test('manufacturer-shared XREAL originals retain the individually reviewed IPD SKU', () => {
  const medium=catalogById.get('P-32867890')!;
  const large=catalogById.get('P-10667937')!;
  assert.equal(medium.photoMissing,false);
  assert.equal(large.photoMissing,false);
  assert.equal(medium.image,large.image);
  assert.equal((productMedia as Record<string,ProductMedia>)[medium.id].source,'https://us.shop.xreal.com/products/xreal-one-pro?variant=51684067279215');
  assert.equal((productMedia as Record<string,ProductMedia>)[large.id].source,'https://us.shop.xreal.com/products/xreal-one-pro?variant=51684067311983');
  assert.equal(applyCatalogMedia({...medium,model:large.model}).image,missingProductImage);
  assert.equal(applyCatalogMedia({...medium,model:'XREAL One'}).image,missingProductImage);
  assert.equal(applyCatalogMedia({...medium,color:'White'}).image,missingProductImage);
});

void test('Ray-Ban shared factory originals preserve each frame size and lens identity', () => {
  for(const ids of [['P-14322001','P-48267170'],['P-44900249','P-95866495'],['P-83854371','P-92527656']]){
    const medium=catalogById.get(ids[0])!,large=catalogById.get(ids[1])!;
    assert.equal(medium.photoMissing,false);
    assert.equal(large.photoMissing,false);
    assert.equal(medium.image,large.image);
    assert.notEqual((productMedia as Record<string,ProductMedia>)[medium.id].source,(productMedia as Record<string,ProductMedia>)[large.id].source);
    assert.equal(applyCatalogMedia({...medium,configuration:large.configuration}).image,missingProductImage);
    assert.equal(applyCatalogMedia({...medium,color:'Shiny Transparent Gray'}).image,missingProductImage);
    assert.equal(applyCatalogMedia({...medium,configuration:'Clear M'}).image,missingProductImage);
  }
});

void test('legacy labels, compound colours and ring sizes retain their variant information', () => {
  const make = (model: string, extra: Partial<CatalogItem> = {}) => presentCatalogItem({
    id: 'P-test', model, modelSlug: 'p-test', price: 100, color: '', image: '/images/category-iphone.webp', ...extra,
  });
  const regional = make('OnePlus 15 16/512GB Violet (CN)', { category: 'smartphones', sim: 'CN' });
  assert.equal(regional.model, 'OnePlus 15');
  assert.equal(regional.color, 'Violet');
  assert.equal(regional.sim, undefined);
  assert.equal(regional.configuration, 'CN');
  const ring = make('Oura Ring 5 Brushed Silver (Size 7)');
  assert.equal(ring.model, 'Oura Ring 5');
  assert.equal(ring.color, 'Brushed Silver');
  assert.equal(ring.configuration, 'Размер 7');
  const mouse = make('Magic Mouse Black USB-C');
  assert.equal(mouse.model, 'Apple Magic Mouse');
  assert.equal(mouse.configuration, 'USB-C');
  const imac = catalogById.get('parser-sheet1-1199')!;
  assert.equal(imac.model, 'iMac 24 M4 (2024)');
  assert.equal(imac.color, 'Blue');
  assert.ok(imac.configuration?.includes('4 порта'));
  assert.ok(imac.configuration?.includes('MWV13'));
  assert.ok(!catalogItems.some(item => /^Apple MacBook \([A-Z0-9]{5}\)/.test(item.model)));
});

void test('catalog has exactly the articles and prices from Новый прайс', () => {
  assert.equal(newPriceSource.length, 1591);
  const visibleRows = newPriceSource.filter(row => !/\bActive\b/i.test(row.title));
  assert.equal(catalogItems.length, visibleRows.length);
  const byArticle = new Map(catalogItems.map(item => [item.article, item]));
  assert.equal(byArticle.size, visibleRows.length);
  for (const row of visibleRows) {
    const item = byArticle.get(row.article);
    assert.ok(item, `Missing article ${row.article} in row ${row.row}`);
    assert.equal(item.price, row.cost <= 1 ? null : row.price, row.article);
  }
});

void test('all catalog IDs and article codes are unique', () => {
  assert.equal(new Set(catalogItems.map(item => item.id)).size, catalogItems.length);
  assert.equal(new Set(catalogItems.map(item => item.article)).size, catalogItems.length);
});

void test('supplier Active iPhones are absent from the storefront catalog', () => {
  const activeRows = newPriceSource.filter(row => /\bActive\b/i.test(row.title));
  assert.equal(activeRows.length, 19);
  for (const row of activeRows) {
    assert.ok(!catalogItems.some(product => product.article === row.article), row.article);
    assert.ok(!searchIndex.some(product => product.article === row.article), row.article);
  }
});

void test('every card has a local image, a route, and a browser price', () => {
  assert.equal(searchIndex.length, catalogItems.length);
  assert.equal(Object.keys(clientBasePrices).length, catalogItems.length);
  for (const item of searchIndex) {
    assert.ok(catalogById.has(item.id), item.id);
    assert.ok(existsSync(`public${item.image}`), `${item.id}: ${item.image}`);
    assert.equal((clientBasePrices as Record<string, number | null>)[item.id], item.price, item.id);
    const url = new URL(item.href, 'http://localhost');
    assert.equal(url.pathname, `/catalog/${item.modelSlug}`);
  }
});

void test('all price-list products have descriptions and specifications', () => {
  for (const item of catalogItems) {
    const details = getProductDetails(item);
    assert.ok(details.description.length > 20, item.id);
    assert.ok(details.groups.some(group => group.rows.length), item.id);
    assert.ok(!JSON.stringify(details).includes('undefined'), item.id);
  }
});
