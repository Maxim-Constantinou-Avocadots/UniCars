import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import * as core from '../dist/ehub-core.mjs';
const data=JSON.parse(fs.readFileSync('dist/data/ehub.json'));
const money=n=>new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);

function harness({reduced=false}={}){
  const listeners={},observers=[];
  const video={paused:true,src:'',muted:false,isConnected:true,dataset:{src:'assets/ehub-hero-film.mp4',mobileSrc:'assets/ehub-hero-film-mobile.mp4'},plays:0,
    addEventListener(k,fn){(listeners[k]??=[]).push(fn)},emit(k){(listeners[k]||[]).forEach(fn=>fn())},
    play(){this.plays++;this.paused=false;this.emit('play');return Promise.resolve()},pause(){this.paused=true;this.emit('pause')}};
  const toggle={hidden:true,innerHTML:'',attrs:{},click:null,setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){if(k==='click')this.click=fn}};
  const featured={innerHTML:'',hidden:false};
  const root={querySelector:s=>({'#ehFeatured':featured,'.eh-hero-film':video,'[data-eh-film]':toggle}[s]||null)};
  const ctx={window:{addEventListener(){}},document:{addEventListener(){}},navigator:{},Intl,Promise,queueMicrotask(){},
    matchMedia:q=>({matches:q.includes('reduce')?reduced:false,addEventListener(){}}),
    IntersectionObserver:class{constructor(cb){this.cb=cb;observers.push(this)}observe(){}}};
  const code=fs.readFileSync('dist/ehub.js','utf8').replace(/\}\)\(\);\s*$/,'window.test={configure(){data=DATA;core=CORE},renderHero,setupHeroFilm,heroStats,featureModels,page};})();');
  ctx.DATA=data;ctx.CORE=core;vm.runInNewContext(code,ctx);const ui=ctx.window.test;ui.configure();
  return {ui,root,video,toggle,featured,observe:visible=>observers.forEach(o=>o.cb([{isIntersecting:visible}]))};
}
const flush=()=>new Promise(r=>setTimeout(r,0));

test('Featured offers link to each specific car with its exact published price and saving',()=>{
  const h=harness(),items=h.ui.featureModels();h.ui.renderHero(h.root);const html=h.featured.innerHTML;
  assert.equal(items.length,3);assert.equal((html.match(/class="eh-offer-link"/g)||[]).length,3);assert.ok(!html.includes('role="tab"'));
  for(const m of items){assert.ok(html.includes('href="#ehub-car-'+m.id+'"'));assert.ok(html.includes(m.images[0].src));assert.ok(html.includes(money(m.price)));if(m.saving)assert.ok(html.includes('Save '+money(m.saving)));}
});

test('Hero proof figures are computed from the published snapshot',()=>{
  const h=harness(),st=h.ui.heroStats();
  assert.equal(st.count,data.models.length);assert.equal(st.save,Math.max(...data.models.map(m=>m.saving||0)));
  const html=h.ui.page();assert.ok(html.includes(`${st.count} cars · Save up to ${money(st.save)}`));assert.match(html,/<h1 id="ehHeroTitle">/);assert.match(html,/<video class="eh-hero-film" muted playsinline loop preload="none"[^>]*aria-hidden="true"/);
});

test('The background film loads only when visible and can be paused and resumed',async()=>{
  const h=harness();h.ui.setupHeroFilm(h.root);assert.equal(h.video.src,'');
  h.observe(true);await flush();assert.equal(h.video.src,'assets/ehub-hero-film.mp4');assert.equal(h.video.paused,false);assert.equal(h.toggle.hidden,false);assert.equal(h.toggle.attrs['aria-label'],'Pause background video');
  h.toggle.click();assert.equal(h.video.paused,true);assert.equal(h.toggle.attrs['aria-label'],'Play background video');
  h.observe(false);h.observe(true);await flush();assert.equal(h.video.paused,true,'a user pause survives scrolling away and back');
  h.toggle.click();await flush();assert.equal(h.video.paused,false);
});

test('Reduced motion keeps the poster still but leaves a play control',async()=>{
  const h=harness({reduced:true});h.ui.setupHeroFilm(h.root);h.observe(true);await flush();
  assert.equal(h.video.plays,0);assert.equal(h.toggle.hidden,false);assert.equal(h.toggle.attrs['aria-label'],'Play background video');
});
