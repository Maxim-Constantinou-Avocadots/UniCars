/* Mount the retained product interface inside the shared site shell. */
(() => {
  let generation = 0, reactRoot, observers = [], product;
  const sections = new Set(['overview', 'versions', 'ownership', 'decision-hub', 'decision-details', 'charging', 'features', 'gallery', 'warranty', 'faqs']);
  let modules;
  function load() {
    return modules ||= Promise.all([
      import('./id3-product-core.mjs'),
      import('./id3-product/assets/index-Cur0LnY2.js'),
      import('./id3-product/assets/routes-DWs6PPHP.js'),
      import('./id3-product/enhance.js')
    ]).catch(error => { modules = null; throw error; });
  }
  window.uniID3Scroll = function (section) {
    if (!sections.has(section) || !product?.isConnected) return;
    window.dispatchEvent(new CustomEvent('unicars:id3-section', { detail: section }));
    const target = product.querySelector('#' + (['versions', 'ownership'].includes(section) ? 'decision-hub' : section));
    if (!target) return;
    const header = parseFloat(product.style.getPropertyValue('--id3-shell-height')) || 130;
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - header - 78, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  window.unmountUniID3 = function () {
    generation++;
    reactRoot?.unmount(); reactRoot = null;
    observers.forEach(observer => observer.disconnect()); observers = [];
    product = null;
    window.uniID3Selection = null;
    document.body.classList.remove('has-id3-product');
  };
  window.renderUniID3 = function (route) {
    document.body.classList.add('has-id3-product');
    document.querySelector('.header')?.classList.remove('is-hidden', 'is-scrolled', 'is-on-dark');
    const request = generation;
    queueMicrotask(async () => {
      const root = document.getElementById('id3ProductRoot');
      if (!root) return;
      try {
        const [core, runtime, page] = await load();
        if (request !== generation || !root.isConnected) return;
        product = root;
        const headers = ['.prototype-bar', '.header'].map(selector => document.querySelector(selector)).filter(Boolean);
        const resize = () => root.style.setProperty('--id3-shell-height', headers.reduce((height, element) => height + (element.matches('.header.is-hidden') ? 0 : element.getBoundingClientRect().height), 0) + 'px');
        const sizeObserver = new ResizeObserver(resize), stateObserver = new MutationObserver(resize);
        headers.forEach(header => { sizeObserver.observe(header); stateObserver.observe(header, { attributes: true, attributeFilter: ['class'] }); });
        observers.push(sizeObserver, stateObserver); resize();
        root.addEventListener('click', event => {
          const anchor = event.target.closest('a');
          if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          if (anchor.getAttribute('href')?.startsWith('#') && sections.has(anchor.hash.slice(1))) {
            event.preventDefault(); window.uniID3Scroll(anchor.hash.slice(1));
          }
        });
        const React = runtime.r();
        reactRoot = runtime.productReactDOM.createRoot(root);
        reactRoot.render(React.createElement(page.component, { initialSelection: core.id3SelectionFromRoute(route) }));
      } catch (error) {
        if (request === generation && root.isConnected) root.innerHTML = '<div class="id3-load-state"><h1>The ID.3 Neo page couldn’t load.</h1><p>Please refresh, or explore the model range.</p><a class="button secondary" href="#cars">Explore vehicles</a></div>';
      }
    });
    return '<div id="id3ProductRoot" class="id3-product"><div class="id3-load-state" role="status">Preparing your ID.3 Neo…</div></div>';
  };
  window.addEventListener('unicars:id3-selection', async event => {
    if (!product?.isConnected) return;
    const [core] = await load();
    if (!product?.isConnected) return;
    const hash = '#range-' + core.ID3_MODEL + '?version=' + core.id3VersionId(event.detail);
    history.replaceState(history.state, '', location.pathname + location.search + hash);
  });
})();
