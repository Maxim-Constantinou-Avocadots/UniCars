(() => {
 const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=name=>`<span class="action-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${name==='check'?'<path d="m5 12 4 4L19 6"/>':'<path d="M5 12h14m-6-6 6 6-6 6"/>'}</svg></span>`;
 let pendingContext='',pendingDetails={};
 function page(context='',details={}){
  const data=e(JSON.stringify({vehicle:context,...details}));
  return `<div class="td-page" id="testDrivePage"><div class="td-wrap"><div class="td-topline"><a class="button secondary td-back-home" href="#cars"><span>Explore vehicles</span>${icon('arrow')}</a><span>Your next step, at your pace.</span></div><div class="td-layout"><aside class="td-story"><div class="td-story-photo"><img src="assets/test-drive-driver.webp" alt="A person fastening their seat belt before a drive" width="1024" height="1536"><div class="td-photo-shade"></div><div class="td-story-copy"><p class="td-story-eyebrow">BOOK A TEST DRIVE</p><h1>Good on paper.<br>Better in person.</h1><p>Meet your next car.<br>From the driver’s seat.</p></div><div class="td-selection" data-uf-selection><p>YOUR DRIVE, TAKING SHAPE</p><h2>Five brands.<br>Your kind of drive.</h2></div></div><p class="td-story-note">${icon('check')}Your car and appointment will be confirmed by the team.</p></aside><section class="td-booking" aria-label="Plan your test drive"><div data-wix-form="testDrive" data-wix-context="${data}"></div></section></div><section class="td-after" aria-labelledby="tdAfterTitle"><div><p class="td-overline">FROM INTEREST TO IGNITION</p><h2 id="tdAfterTitle">A clearer next step.</h2></div><div class="td-after-items"><article>${icon('arrow')}<h3>Choose your drive</h3><p>Pick the model you’d like to get to know.</p></article><article>${icon('arrow')}<h3>Talk to your team</h3><p>Unicars confirms the car, date and location.</p></article><article>${icon('check')}<h3>Make it personal</h3><p>Experience the car and ask the questions that matter.</p></article></div></section><p class="td-page-note">Your request is sent to Unicars. Vehicle and appointment availability need confirmation.</p></div></div>`;
 }
 window.startUniTestDrive=(context,details={})=>{
  pendingContext=context||'';pendingDetails=details;
  if(window.location.hash==='#test-drive'){
   const root=document.getElementById('testDrivePage');if(root)root.outerHTML=page(pendingContext,pendingDetails);pendingContext='';pendingDetails={};
  }else window.location.hash='test-drive';
 };
 window.renderUniTestDrive=route=>{
  const query=new URLSearchParams((route||'').split('?')[1]||'');const context=query.get('model')||pendingContext,details=pendingDetails;pendingContext='';pendingDetails={};return page(context,details);
 };
})();
