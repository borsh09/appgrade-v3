import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mediaAppearance} from '../lib/catalog-media-identity';
import type {CatalogItem} from '../lib/catalog-registry';

void test('tablet photographs distinguish cellular bodies and normalize Wi-Fi spelling',()=>{
 const tablet={model:'iPad Air 13 M4',configuration:'',connectivity:'Wi-Fi'} as CatalogItem;
 assert.equal(mediaAppearance(tablet),mediaAppearance({...tablet,connectivity:'Wi‑Fi'}));
 assert.notEqual(mediaAppearance(tablet),mediaAppearance({...tablet,connectivity:'LTE'}));
 assert.equal(mediaAppearance({...tablet,connectivity:'LTE'}),mediaAppearance({...tablet,connectivity:'Wi-Fi + Cellular'}));
 assert.notEqual(mediaAppearance(tablet),mediaAppearance({...tablet,connectivity:undefined}));
 assert.equal(mediaAppearance(tablet),mediaAppearance({...tablet,storage:'1 ТБ'}));
});
