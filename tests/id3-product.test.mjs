import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { id3SelectionFromRoute, id3SelectionLabel, id3VersionId } from '../dist/id3-product-core.mjs';
import { createProductSectionNav } from '../dist/id3-product/section-nav.js';

test('Product section shortcuts scroll locally and preserve modified link clicks', t => {
 const previous=globalThis.window,calls=[];
 globalThis.window={uniID3Scroll:section=>calls.push(section)};
 t.after(()=>{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;});
 const React={createElement:(tag,props,...children)=>({tag,props,children}),useState:value=>[value,()=>{}],useEffect(){}};
 const Component=createProductSectionNav(React,[{id:'overview',label:'Overview'},{id:'versions',label:'Choose your ID.3'}]);
 const bar=Component(),links=bar.children[0].children[1].children[0];
 let prevented=false;
 links[1].props.onClick({preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.deepEqual(calls,['versions']);
 prevented=false;links[1].props.onClick({ctrlKey:true,preventDefault(){prevented=true;}});
 assert.equal(prevented,false);assert.equal(calls.length,1);
});

test('Product pages keep the shared header stable while other pages retain its scroll animation', () => {
 const source=readFileSync('dist/app.js','utf8');
 const implementation=source.slice(source.indexOf('function initHeaderScroll('),source.indexOf('function initNavigationMotion('));
 const body=new Set(['has-id3-product']),classes=new Set(),listeners={};
 const header={offsetHeight:96,matches:()=>false,contains:()=>false,querySelector:()=>({offsetTop:0,offsetHeight:96}),addEventListener(){},classList:{toggle:(name,value)=>value?classes.add(name):classes.delete(name)}};
 const window={scrollY:800,innerWidth:1440,addEventListener:(name,callback)=>{listeners[name]=callback}};
 const document={body:{classList:{contains:name=>body.has(name)}},elementsFromPoint:()=>[],addEventListener(){}};
 const context={window,document,getComputedStyle:()=>({top:'30px'}),requestAnimationFrame:callback=>callback(),MutationObserver:class{observe(){}}};
 vm.createContext(context);vm.runInContext(implementation,context);context.initHeaderScroll(header);
 assert.equal(classes.has('is-hidden'),false);assert.equal(classes.has('is-scrolled'),false);
 body.delete('has-id3-product');window.scrollY=1000;listeners.scroll();
 assert.equal(classes.has('is-scrolled'),true);assert.equal(classes.has('is-hidden'),true);
 body.add('has-id3-product');window.scrollY=1200;listeners.scroll();
 assert.equal(classes.has('is-scrolled'),false);assert.equal(classes.has('is-hidden'),false);
});

test('The actual page router opens the refined experience for collection and search links', () => {
 const source=readFileSync('dist/app.js','utf8');
 const router=source.slice(source.indexOf('function render(id)'),source.indexOf('function updateLocations()'));
 const main={},mobile={},calls=[];
 const context={closeMenus(){},current:'',act(){return ''},document:{body:{classList:{toggle(){}}}},$:selector=>selector==='#main'?main:mobile,window:{unmountUniID3(){},scrollTo(){},renderUniID3:route=>{calls.push(route);return '<div id="id3ProductRoot"></div>';},renderUniRangeVehicle(){throw Error('Neo reached the old catalogue renderer');}}};
 vm.createContext(context);vm.runInContext(router,context);
 for(const route of ['range-volkswagen-id-3-neo','range-volkswagen-id-3-neo?version=volkswagen-id-3-neo-version-6','smart-vehicle-volkswagen-id-3-neo-version-1']){
  context.render(route);assert.equal(calls.at(-1),route);assert.ok(main.innerHTML.includes('id3ProductRoot'));
 }
});

test('Legacy catalogue entry points also open the refined Neo page', () => {
 const queued=[],routes=[];
 const window={renderUniID3:route=>{routes.push(route);return 'refined-product';}};
 vm.runInNewContext(readFileSync('dist/vehicle-library.js','utf8'),{window,document:{addEventListener(){}},queueMicrotask:callback=>queued.push(callback)});
 assert.equal(window.renderUniRangeVehicle('volkswagen-id-3-neo'),'refined-product');
 assert.equal(window.renderUniRangeVehicle('volkswagen-id-3-neo?version=volkswagen-id-3-neo-version-2'),'refined-product');
 assert.equal(queued.length,0);
 assert.equal(routes.length,2);
 assert.match(window.renderUniRangeVehicle('volkswagen-golf'),/id="rangeVehicle"/);
 assert.equal(queued.length,1);
});

test('Deployment URLs version the complete module graph without changing external resources', () => {
 execFileSync('python3',['-c',`
import importlib.util,tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('builder','scripts/build-wix.py')
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
with tempfile.TemporaryDirectory() as temp:
 root=Path(temp);(root/'assets').mkdir()
 (root/'index.html').write_text('<script src="app.js"></script><link href="https://cdn.example/style.css">')
 (root/'app.js').write_text("import('./assets/page.js');import('./assets/runtime.js')")
 (root/'assets/page.js').write_text('import "./runtime.js";')
 (root/'assets/runtime.js').write_text('export const root = {};')
 builder.version_frontend_assets(root,'release-one')
 assert 'app.js?v=release-one' in (root/'index.html').read_text()
 assert 'https://cdn.example/style.css' in (root/'index.html').read_text()
 assert './assets/runtime.js?v=release-one' in (root/'app.js').read_text()
 assert './runtime.js?v=release-one' in (root/'assets/page.js').read_text()
 builder.version_frontend_assets(root,'release-one')
 assert '?v=release-one?v=' not in (root/'app.js').read_text()
`]);
});

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
