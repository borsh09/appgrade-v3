import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from '../node_modules/next/node_modules/sharp/dist/index.mjs';
import sources from '../data/retouched-product-photo-sources.json';
import { iphoneCatalog } from '../data/iphone-catalog';

void test('retouched iPhone angles have transparent square canvases and matching galleries', async () => {
  for (const [key, source] of Object.entries(sources)) {
    const color = key.startsWith('iphone-16-pro-max-') ? key.split('-').slice(-2).join(' ')
      : key.endsWith('-cosmic-orange') ? 'Cosmic Orange'
      : key.endsWith('-deep-blue') ? 'Deep Blue' : key.split('-').at(-1);
    const model = key.startsWith('iphone-16-pro-max-') ? 'iPhone 16 Pro Max'
      : key.startsWith('iphone-17-pro-max-') ? 'iPhone 17 Pro Max'
      : key.startsWith('iphone-13-') ? 'iPhone 13'
      : key.startsWith('iphone-14-') ? 'iPhone 14'
      : key.includes('-plus-') ? 'iPhone 15 Plus' : 'iPhone 15';
    const skus = iphoneCatalog.filter(item => item.model === model && item.color.toLowerCase() === color?.toLowerCase());
    assert.ok(skus.length > 0, `Missing SKU for ${key}`);
    for (const sku of skus) {
      assert.equal(sku.gallery?.length, 3);
      assert.deepEqual(sku.gallery?.slice(-source.processed.length), source.processed);
    }
    for (const image of source.processed) {
      const metadata = await sharp(`public${image}`).metadata();
      assert.equal(metadata.width, metadata.height, `${image} must be square`);
      assert.ok(metadata.width! >= 1000, `${image} is too small`);
      assert.equal(metadata.hasAlpha, true, `${image} needs transparency`);
    }
  }
});
