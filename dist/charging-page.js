/* The charging experience shares the site's navigation; map styles stay isolated. */
window.renderUniChargers = function (route) {
  const query = new URLSearchParams(route.split('?')[1] || '');
  const station = query.get('station');
  const fragment = station !== null && /^\d+$/.test(station) ? '#station-' + station : '';
  return `<section class="charging-page" aria-label="Find a charger"><iframe class="charging-frame" src="charging-map.html${fragment}" title="UniCars charging network — search stations across Cyprus" allow="geolocation; fullscreen; clipboard-write" allowfullscreen></iframe></section>`;
};

// Measure the real shared header at each breakpoint, including the concept switcher.
const chargingHeaders = ['.prototype-bar', '.header'].map(selector => document.querySelector(selector)).filter(Boolean);
function resizeChargingPage() {
  const height = chargingHeaders.reduce((sum, element) => sum + element.getBoundingClientRect().height, 0);
  document.documentElement.style.setProperty('--charging-shell-height', height + 'px');
}
if (window.ResizeObserver) {
  const observer = new ResizeObserver(resizeChargingPage);
  chargingHeaders.forEach(element => observer.observe(element));
}
window.addEventListener('resize', resizeChargingPage);
resizeChargingPage();
