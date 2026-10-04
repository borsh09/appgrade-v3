import assert from 'node:assert/strict';
import {test} from 'node:test';
import {photoSourceMatchesItem} from '../lib/catalog-photo-source';

void test('basic AirPods 4 cannot take photographs from an ANC charging case listing',()=>{
 const basic={model:'AirPods 4'};
 const anc={source:'https://mgg.stores-apple.com/catalog/naushniki-apple-airpods-4-belye-s-shumopodavleniem/'};
 assert.equal(photoSourceMatchesItem(basic,anc),false);
 assert.equal(photoSourceMatchesItem(basic,{sourceTitle:'Наушники Apple AirPods 4 белые (с шумоподавлением)'}),false);
 assert.equal(photoSourceMatchesItem(basic,{sourceTitle:'AirPods 4 with Active Noise Cancellation'}),false);
 assert.equal(photoSourceMatchesItem(basic,{sourceTitle:'AirPods 4 без шумоподавления'}),true);
 assert.equal(photoSourceMatchesItem({...basic,configuration:'ANC'},anc),true);
});
