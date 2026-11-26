import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { id3SelectionFromRoute, id3SelectionLabel, id3VersionId } from '../dist/id3-product-core.mjs';

test('Each ID.3 Neo catalogue version opens the matching battery and equipment level', () => {
 const library=JSON.parse(readFileSync('dist/data/vehicle-library.json'));
 const model=library.models.find(model=>model.id==='volkswagen-id-3-neo');
 assert.equal(model.versions.length,6);
 for(const version of model.versions){
  const routes=['smart-vehicle-'+version.id,'range-'+model.id+'?version='+version.id];
  for(const route of routes){
   const selection=id3SelectionFromRoute(route);
   assert.equal(id3VersionId(selection),version.id);
   assert.ok(version.trim.includes(selection.battery+'kWh'));
   assert.ok(version.trim.includes(selection.line==='style'?'Style':'Life'));
   assert.match(id3SelectionLabel(selection),/^Volkswagen ID\.3 Neo (Life|Style) (50|58|79) kWh$/);
  }
 }
});

test('Other ID.3 stock IDs and invalid version parameters do not invent a Neo configuration', () => {
 for(const route of ['ehub-car-vw-id-3-pa-pro-3','range-volkswagen-id-3-neo?version=anything','range-volkswagen-id-3-neo?version=volkswagen-id-3-neo-version-7']){
  assert.deepEqual(id3SelectionFromRoute(route),{battery:'58',line:'life'});
 }
});

test('Test-drive handoff carries the selected product and origin into the live form without leaking into later visits', () => {
 const window={location:{hash:'#range-volkswagen-id-3-neo'}},document={getElementById(){return null}};
 vm.runInNewContext(readFileSync('dist/test-drive.js','utf8'),{window,document,URLSearchParams});
 const vehicle='smart-vehicle-volkswagen-id-3-neo-version-6';
 const context={page:'https://test.invalid/#range-volkswagen-id-3-neo?version=volkswagen-id-3-neo-version-6',notes:'Interested in the Volkswagen ID.3 Neo Style 79 kWh.'};
 window.startUniTestDrive(vehicle,context);
 assert.equal(window.location.hash,'test-drive');
 const getContext=html=>JSON.parse(html.match(/data-wix-context="([^"]+)"/)[1].replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&amp;','&'));
 assert.deepEqual(getContext(window.renderUniTestDrive('test-drive')),{vehicle,...context});
 assert.deepEqual(getContext(window.renderUniTestDrive('test-drive')),{vehicle:''});
});
