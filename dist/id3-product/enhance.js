/* Retain gallery gestures and keyboard access without the prototype toolbar. */
window.enhanceUnicars = function () {
  const root = document.getElementById('id3ProductRoot');
  if (!root || root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const nav = root.querySelector('nav[aria-label="On this page"]');
  nav?.parentElement.parentElement.classList.add('product-nav');
  root.querySelectorAll('[role=tablist]:not(.decision-tabs)').forEach(list => list.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...list.querySelectorAll('[role=tab]')], index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  }));
  let startX;
  const image = root.querySelector('#gallery>div:nth-child(2)>div');
  image?.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, { passive: true });
  image?.addEventListener('touchend', event => {
    if (startX === undefined) return;
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 50) image.querySelector(delta < 0 ? 'button[aria-label="Next image"]' : 'button[aria-label="Previous image"]')?.click();
    startX = undefined;
  }, { passive: true });
};
