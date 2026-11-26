import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {emptyCriteria,parseDemo,recommend} from '../dist/smart-core.mjs';
import {applySearchFilter,searchModels,sortSearchMatches} from '../dist/smart-results-controls.mjs';
const vehicles=JSON.parse(readFileSync('dist/data/vehicles.json')).vehicles;

test('Price sorting uses eligible version prices and preserves the matcher ordering',()=>{
 const matches=[{brand:'Audi',model:'A3',price:40000,baseline:20000},{brand:'SEAT',model:'Leon',price:25000,baseline:23000},{brand:'Volkswagen',model:'Golf',price:30000,baseline:19000}];
 assert.deepEqual(sortSearchMatches(matches,'price-asc').map(v=>v.price),[25000,30000,40000]);
 assert.deepEqual(sortSearchMatches(matches,'price-desc').map(v=>v.price),[40000,30000,25000]);
 assert.deepEqual(sortSearchMatches(matches,'recommended'),matches);
 assert.deepEqual(matches.map(v=>v.price),[40000,25000,30000]);
 assert.deepEqual(sortSearchMatches(matches,'name').map(v=>v.brand),['Audi','SEAT','Volkswagen']);
});

test('Combined controls enforce brand, body, gearbox and purchase budget',()=>{
 let c=parseDemo('An SUV under €50,000',{},vehicles);
 c=applySearchFilter(c,'brand','Volkswagen',vehicles);
 c=applySearchFilter(c,'transmission','automatic',vehicles);
 c=applySearchFilter(c,'budget','35000',vehicles);
 const result=recommend(vehicles,c);assert.ok(result.matches.length);
 for(const v of result.matches){assert.equal(v.brand,'Volkswagen');assert.equal(v.body,'suv');assert.equal(v.transmission,'automatic');assert.ok(v.price<=35000);}
 assert.equal(c.budgetKind,'purchase');
});

test('Changing brands clears incompatible model families but preserves compatible ones',()=>{
 const original={...emptyCriteria(),brand:'Volkswagen',model:'Golf',excludedBrands:['Audi']};
 const next=applySearchFilter(original,'brand','Audi',vehicles);
 assert.equal(next.brand,'Audi');assert.equal(next.model,null);assert.deepEqual(next.excludedBrands,[]);
 assert.equal(applySearchFilter(original,'brand','Volkswagen',vehicles).model,'Golf');
 assert.equal(original.model,'Golf');
});

test('Explicit engine changes can override exclusions and keep all hybrid types available',()=>{
 let c=applySearchFilter({...emptyCriteria(),excludedPowertrains:['hybrid']},'powertrain','hybrid',vehicles);
 assert.deepEqual(c.excludedPowertrains,[]);
 const result=recommend(vehicles,c);assert.ok(result.matches.length);
 assert.ok(result.matches.every(v=>['mild_hybrid','full_hybrid','plug_in_hybrid'].includes(v.powertrain)));
});

test('Stock-only statuses select eHub and never treat model ranges as stock listings',()=>{
 for(const status of ['approved','test-drive']){
  const c=applySearchFilter({...emptyCriteria(),source:'models'},'condition',status,vehicles);
  assert.equal(c.source,'ehub');assert.equal(c.condition,status);
  assert.ok(recommend(vehicles,c).matches.every(v=>v.kind==='ehub_listing'));
 }
});

test('Invalid budget changes do not silently widen the request',()=>{
 const c={...emptyCriteria(),budget:33000};
 for(const value of ['not a number','-1','1000001'])assert.equal(applySearchFilter(c,'budget',value,vehicles).budget,33000);
 assert.equal(applySearchFilter(c,'budget','',vehicles).budget,null);
 assert.equal(applySearchFilter(c,'budget','0',vehicles).budget,null);
 assert.equal(applySearchFilter(c,'unsupported','anything',vehicles).budget,33000);
});

test('Model choices follow the selected brand and retain parsed model-family selections',()=>{
 const models=searchModels(vehicles,{brand:'Audi',model:'Q3'});
 assert.ok(models.includes('Q3'));assert.ok(!models.includes('Golf'));
 assert.equal(new Set(models).size,models.length);
});
