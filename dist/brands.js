(() => {
 const brands=[
  {name:'Volkswagen',route:'brand-vw',logo:'volkswagen'},
  {name:'Audi',route:'brand-audi',logo:'audi'},
  {name:'Škoda',route:'brand-skoda',logo:'skoda'},
  {name:'CUPRA',route:'brand-cupra',logo:'cupra'},
  {name:'SEAT',route:'brand-seat',logo:'seat'}
 ];
 window.uniCarsBrands=brands;
 const arrow='<span class="action-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>';
 window.renderUniBrands=()=>{queueMicrotask(loadCounts);return `<section class="uni-brands" id="uniBrands"><div class="brands-wrap"><header class="brands-heading"><div><p>Explore vehicles / Our brands</p><h1>Find your brand.</h1><p>Five different ways to drive. Choose a brand to explore its models, compare starting prices and find your next car.</p></div><a class="button secondary brands-all-models" href="#cars"><span>View all models</span>${arrow}</a></header><div class="brands-grid">${brands.map(b=>`<article class="brand-choice"><a class="brand-logo-link" href="#${b.route}" aria-label="Explore ${b.name} models"><img src="assets/brands/${b.logo}.svg" alt="${b.name}" width="150" height="110"></a><div class="brand-choice-copy"><h2>${b.name}</h2><p data-brand-count="${b.route}">Explore the model range</p></div><a class="button primary brand-choice-button" href="#${b.route}" aria-label="View ${b.name} models"><span>View models</span>${arrow}</a></article>`).join('')}</div><div class="brands-bottom"><div><h2>A clearer starting point.</h2><p>Every collection brings together model images, published prices and original price-list PDFs. Filter by engine, body style and starting price to narrow your choice.</p></div><a class="button secondary" href="#available"><span>Explore eHub offers</span>${arrow}</a></div><p class="brands-price-note">Published model range. Equipment, final prices and vehicle availability require confirmation with Unicars.</p></div></section>`;};
 async function loadCounts(){const root=document.getElementById('uniBrands');if(!root)return;try{const r=await fetch('data/vehicle-library.json');if(!r.ok)return;const data=await r.json();if(!root.isConnected)return;root.querySelectorAll('[data-brand-count]').forEach(p=>{const brand=brands.find(b=>b.route===p.dataset.brandCount);const count=data.models.filter(m=>m.brand===brand.name).length;p.textContent=`${count} models to explore`})}catch(e){/* Navigation remains usable without the counts. */}}
})();
