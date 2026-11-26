import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('charger routes embed the map with the shared site header and safe station deep links', () => {
  const sizes = [];
  const window = { addEventListener() {} };
  const document = {
    querySelector: selector => ({ getBoundingClientRect: () => ({ height: selector === '.header' ? 88 : 42 }) }),
    documentElement: { style: { setProperty: (...args) => sizes.push(args) } }
  };
  vm.runInNewContext(read('dist/charging-page.js'), { window, document, URLSearchParams });
  assert.match(window.renderUniChargers('chargers'), /src="charging-map.html"/);
  assert.match(window.renderUniChargers('chargers?station=0'), /src="charging-map.html#station-0"/);
  assert.match(window.renderUniChargers('chargers?station=%22%3E%3Cscript%3E'), /src="charging-map.html"/);
  assert.deepEqual(sizes.at(-1), ['--charging-shell-height', '130px']);
  const app = read('dist/app.js');
  assert.match(app, /else if\(id==='chargers'\|\|id.startsWith\('chargers\?'\)\)\{html=window.renderUniChargers\(id\)/);
  assert.doesNotMatch(app + read('dist/smart-search.mjs'), /unicars-charge-finder|CHARGER_MAP_URL/);
  assert.match(read('dist/index.html'), /charging-page.js[\s\S]*app.js/);
});

test('the embedded map keeps station search and controls without the prototype navigation', () => {
  const html = read('dist/charging-map.html');
  assert.doesNotMatch(html, /site-header|main-nav|bottom-bar|charging-tools|id="en"|id="gr"/);
  assert.match(html, /<main class="workspace"[^>]*>[\s\S]*class="charging-help" data-action="help"/);
  for (const id of ['search', 'filters-toggle', 'view-2d', 'view-3d', 'fullscreen', 'mobile-toggle', 'nearby', 'modal']) {
    assert.ok(html.includes(`id="${id}"`), `Missing map control: ${id}`);
  }
  assert.match(read('dist/charging-map/app.js'), /fetch\('charging-map\/stations.json'\)/);
  assert.match(read('dist/charging-map/app.js'), /#chargers\?station=/);
  const stations = JSON.parse(read('dist/charging-map/stations.json'));
  assert.equal(stations.length, 21);
  assert.equal(new Set(stations.map(station => station.id)).size, 21);
  for (const station of stations) {
    assert.ok(station.lat > 34 && station.lat < 36 && station.lng > 32 && station.lng < 35);
  }
  assert.doesNotMatch(read('dist/charging-map/config.js'), /sk\./);
});
