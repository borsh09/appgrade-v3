import assert from 'node:assert/strict';
import {test} from 'node:test';
import {matchesSupplierUltraPhoto} from '../lib/supplier-watch-photo-identity';

void test('supplier watch photos compare case, band finish and length independently',()=>{
 const desired='Ultra 3 49mm Natural Ti Blue Trail Loop M/L';
 const actual='Смарт-часы Apple Watch Ultra 3, 49 мм, Natural Titanium Bright Blue Trail ML 5G 1';
 assert.equal(matchesSupplierUltraPhoto(desired,actual),true);
 assert.equal(matchesSupplierUltraPhoto(desired.replace('M/L','S/M'),actual),false);
 assert.equal(matchesSupplierUltraPhoto(desired,actual.replace('Natural Titanium','Black Titanium')),false);
 assert.equal(matchesSupplierUltraPhoto(desired,actual.replace('Ultra 3','Ultra 2')),false);
 assert.equal(matchesSupplierUltraPhoto(desired,actual.replace('49 мм','45 мм')),false);
 assert.equal(matchesSupplierUltraPhoto(desired,actual.replace('Bright Blue','Black')),false);
 assert.equal(matchesSupplierUltraPhoto(desired,actual.replace('Trail','Alpine Loop')),false);
 assert.equal(matchesSupplierUltraPhoto('Ultra 3 49mm Black Ti Black Alpine Loop Small','Apple Watch Ultra 3 49 mm Black Titanium Black Alpine Loop S 5G'),true);
 assert.equal(matchesSupplierUltraPhoto('Ultra 3 49mm Black Ti Black Alpine Loop Small','Apple Watch Ultra 3 49 mm Black Titanium Black Alpine Loop M/L 5G'),false);
});
