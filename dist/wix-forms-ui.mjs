import { createFormStore, FORM_ERROR, otherText, otherValue } from './js/wix/form-store.js';
import { dayKey, addDays, calendarCells, moveMonth, formatDay, brandLogos } from './test-drive-core.mjs';

export const escapeFormText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeFormText;
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${name==='check'?'<path d="m5 12 4 4L19 6"/>':name==='back'?'<path d="M19 12H5m6-6-6 6 6 6"/>':'<path d="M5 12h14m-6-6 6 6-6 6"/>'}</svg>`;
const button = (text, action, secondary=false, name='arrow') => `<button type="${action==='submit'?'submit':'button'}" class="button ${secondary?'secondary':'primary'} uf-button" data-uf-action="${action}"><span>${e(text)}</span><span class="action-icon">${icon(name)}</span></button>`;
let resources;
const mounted = new Map();
async function loadResources() {
  return resources ||= Promise.all(['wix-forms','vehicle-library','ehub'].map(name => fetch(`data/${name}.json`).then(r => {if(!r.ok)throw Error('Form setup could not load.');return r.json();}))).then(([config, library, stock]) => ({
    config,
    models:[...library.models,...stock.models.map(m=>({...m,id:'offer-'+m.id,model:m.displayModel||m.model,offer:true}))],
  })).catch(error => {resources=null;throw error;});
}

export function resolveVehicleContext(context, models) {
  let id=String(context||'');
  if(id.startsWith('smart-vehicle-ehub-'))id='ehub-car-'+id.slice(19);
  if(id.startsWith('ehub-car-'))id='offer-'+id.slice(9);
  const aliases={'vw-tiguan':'volkswagen-tiguan','vw-taigo':'volkswagen-taigo','vw-t-cross':'volkswagen-t-cross','vw-t-roc':'volkswagen-t-roc'};
  if(id.startsWith('model-'))id=aliases[id.slice(6)]||id.slice(6);
  return models.find(m=>m.id===id||'range-'+m.id===id||(m.versions||[]).some(v=>'smart-vehicle-'+v.id===id));
}

export function contextPrefills(form, definition, context, models) {
  const values={}, selected=resolveVehicleContext(context.vehicle,models);
  for(const field of form.fields){
    const hint=definition.hints[field.target]||{};
    let value=hint.role==='page'?context.page:context[hint.role];
    if(selected&&hint.role==='brand')value=selected.brand;
    if(selected&&hint.role==='model'&&hint.brand===selected.brand)value=selected.id;
    if(value==null)continue;
    if(field.choices.length&&!field.choices.some(c=>c.value===value))continue;
    values[field.target]=value;
  }
  return values;
}

function choiceLabel(field,value){return field.choices.find(c=>c.value===value)?.label||String(value??'');}
export function fieldMarkup(field, state, ui) {
  const value=state.values[field.target], hint=ui.definition.hints[field.target]||{}, v=field.validation||{}, id=ui.id+'-'+field.target;
  const attrs=`id="${id}" name="${e(field.target)}" aria-required="${field.required?'true':'false'}" ${field.readOnly?'disabled':''} aria-describedby="${id}-description ${id}-error"`;
  // The originating page is submission context, not a question for the visitor.
  if(hint.role==='page')return `<div class="uf-context" hidden><input type="hidden" id="${id}" name="${e(field.target)}" value="${e(value)}"></div>`;
  const required=field.required?(state.form.requiredIndicator==='NONE'?'':state.form.requiredIndicator==='TEXT'?' (required)':' *'):'';
  const title=`<label class="uf-label ${field.showLabel?'':'uf-sr'}" for="${id}">${e(field.label+required)}</label>`;
  let control='';
  const choices=field.choices.concat(field.otherOption?[{value:'__uf_other__',label:field.otherOption.label}]:[]);
  if(['radio','checkboxGroup','tags'].includes(field.control)){
    const style=hint.role==='brand'?'uf-brands':hint.role==='model'?'uf-models':hint.role==='showroom'?'uf-showrooms':'uf-options';
    const query=ui.search[field.target]||'',shown=hint.role==='model'?choices.filter(c=>c.label.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase().includes(query.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase())):choices;
    control=(hint.role==='model'?`<label class="uf-model-search">Find a model<input type="search" data-uf-search="${e(field.target)}" value="${e(query)}" placeholder="Search ${e(hint.brand||'models')}" autocomplete="off"></label>`:'')+`<div class="${style}">${shown.map((c,i)=>{
      const model=hint.role==='model'?ui.models.find(m=>m.id===c.value):null;
      const brand=hint.role==='brand'?brandLogos[c.value]:null;
      const image=c.imageUrl||(brand?`assets/brands/${brand}.svg`:model?.images?.[0]?.src);
      const checked=field.control==='radio'?(c.value==='__uf_other__'?otherText(field,value)!=null:value===c.value):Array.isArray(value)&&value.includes(c.value);
      return `<label class="uf-choice"><input ${attrs.replace(`id="${id}"`,`id="${id}-${i}"`)} type="${field.control==='radio'?'radio':'checkbox'}" value="${e(c.value)}" ${checked?'checked':''}><span>${image?`<img src="${e(image)}" alt="" ${brand?'width="56" height="36"':'width="260" height="140" loading="lazy"'}>`:''}<strong>${e(c.label)}</strong><i aria-hidden="true">${icon('check')}</i></span></label>`;
    }).join('')}${!shown.length?'<p>No matching models. Try another search.</p>':''}</div>`;
  }else if(field.control==='select'){
    control=`<div class="uf-select"><select ${attrs}><option value="">Choose an option</option>${choices.map(c=>`<option value="${e(c.value)}" ${value===c.value||c.value==='__uf_other__'&&otherText(field,value)!=null?'selected':''}>${e(c.label)}</option>`).join('')}</select><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></div>`;
  }else if(field.control==='textarea'){
    control=`<textarea ${attrs} rows="4" ${v.maxLength!=null?`maxlength="${v.maxLength}"`:''} placeholder="${e(field.placeholder||'')}">${e(value)}</textarea>`;
  }else if(field.control==='checkbox'){
    control=`<label class="uf-consent"><input ${attrs} type="checkbox" ${value===true?'checked':''}><span>${e(field.label+required)}</span></label>`;
  }else if(field.control==='date'&&hint.role==='date'){
    control=dateMarkup(field,state,ui,id,attrs);
  }else if(field.control==='address'){
    control=`<div class="uf-address">${field.addressParts.map(part=>`<label>${e(part.label)}${part.required?' *':''}${part.choices?.length?`<select name="${e(field.target+'/'+part.sub)}"><option value="">Choose an option</option>${part.choices.map(c=>`<option value="${e(c.value)}" ${value?.[part.sub]===c.value?'selected':''}>${e(c.label)}</option>`).join('')}</select>`:`<input name="${e(field.target+'/'+part.sub)}" value="${e(value?.[part.sub]||'')}">`}<span data-uf-error="${e(field.target+'/'+part.sub)}"></span></label>`).join('')}</div>`;
  }else if(['file','signature'].includes(field.control)){
    control=`<input ${attrs} type="file" accept="${e(v.accept||'')}" ${v.fileLimit>1?'multiple':''}><small>${e(field.explanationText||'')}</small>`;
  }else if(['payment','appointment','unknown'].includes(field.control)){
    control='<p>This field needs help from the team. Please contact Unicars to continue.</p>';
  }else if(field.control==='rating'){
    control=`<div class="uf-options">${Array.from({length:(v.maximum||5)-(v.minimum||1)+1},(_,i)=>(v.minimum||1)+i).map(n=>`<label class="uf-choice"><input ${attrs} type="radio" value="${n}" ${Number(value)===n?'checked':''}><span>${n}</span></label>`).join('')}</div>`;
  }else{
    const type=({phone:'tel',datetime:'datetime-local'})[field.control]||(['text','email','url','password','number','date','time'].includes(field.control)?field.control:'text');
    control=`<input ${attrs} type="${type}" value="${e(value)}" placeholder="${e(field.placeholder||(field.control==='phone'?'+357 …':''))}" ${v.maxLength!=null?`maxlength="${v.maxLength}"`:''} ${v.minimum!=null?`min="${v.minimum}"`:v.minDate?`min="${e(v.minDate)}"`:''} ${v.maximum!=null?`max="${v.maximum}"`:v.maxDate?`max="${e(v.maxDate)}"`:''} ${type==='number'?`step="${v.multipleOf||'any'}"`:''} autocomplete="${({email:'email',phone:'tel',firstName:'name'})[field.control]||'off'}">`;
  }
  const free=field.otherOption&&otherText(field,value)!=null?`<input data-uf-other="${e(field.target)}" aria-label="${e(field.otherOption.label)}" placeholder="${e(field.otherOption.placeholder||field.otherOption.label)}" value="${e(otherText(field,value)||'')}">`:'';
  return `<div class="uf-field uf-role-${e(hint.role||'standard')} ${field.control==='checkbox'?'uf-field-consent':''} ${hint.role==='model'?'uf-field-model':''} ${hint.role==='page'?'uf-context':''}" data-uf-field="${e(field.target)}">${field.control==='checkbox'?'':title}${control}${free}<p id="${id}-description" class="uf-description">${e(field.description||'')}</p><p id="${id}-error" class="uf-error" data-uf-error="${e(field.target)}" aria-live="polite"></p></div>`;
}

function dateMarkup(field,state,ui,id,attrs){
  const min=field.validation.minDate?.slice(0,10)||addDays(dayKey(),1),max=field.validation.maxDate?.slice(0,10),month=ui.month[field.target]||min.slice(0,7);
  ui.month[field.target]=month;
  const label=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(month+'-01T12:00:00Z'));
  return `<div class="uf-calendar"><div class="uf-calendar-head"><strong>${e(label)}</strong><div><button type="button" data-uf-month="${e(field.target)}" data-direction="-1" aria-label="Previous month" ${month<=min.slice(0,7)?'disabled':''}>${icon('back')}</button><button type="button" data-uf-month="${e(field.target)}" data-direction="1" aria-label="Next month" ${max&&month>=max.slice(0,7)?'disabled':''}>${icon('arrow')}</button></div></div><div class="uf-weekdays">${['M','T','W','T','F','S','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="uf-days">${calendarCells(month).map((key,i)=>key?`<label><input ${attrs.replace(`id="${id}"`,`id="${id}-${i}"`)} type="radio" value="${key}" ${key<min||max&&key>max||field.readOnly?'disabled':''} ${state.values[field.target]===key?'checked':''} aria-label="${e(formatDay(key))}"><span>${Number(key.slice(-2))}</span></label>`:'<span></span>').join('')}</div></div>`;
}

function focusSnapshot(root){const active=document.activeElement;if(!root.contains(active))return null;return {name:active.name,search:active.dataset.ufSearch,other:active.dataset.ufOther,value:active.value,start:active.selectionStart,end:active.selectionEnd};}
function restoreFocus(root,saved){if(!saved)return;const candidates=[...root.querySelectorAll('input,select,textarea')];const control=candidates.find(x=>saved.search?x.dataset.ufSearch===saved.search:saved.other?x.dataset.ufOther===saved.other:x.name===saved.name&&(!['radio','checkbox'].includes(x.type)||x.value===saved.value));control?.focus({preventScroll:true});if(saved.start!=null&&control?.setSelectionRange)try{control.setSelectionRange(saved.start,saved.end);}catch{}}

async function mount(root){
  if(mounted.has(root))return;
  const ui={id:'uf-'+Math.random().toString(36).slice(2),root,search:{},month:{},signature:null,seeded:0,furthest:0};mounted.set(root,ui);
  root.innerHTML='<div class="uf-loading" role="status"><span></span>Preparing your form…</div>';
  try{
    const data=await loadResources();if(!root.isConnected)return;
    ui.definition=data.config[root.dataset.wixForm];ui.models=data.models;
    if(!ui.definition)throw Error('This form is not configured.');
    ui.context={page:window.location.href,...JSON.parse(root.dataset.wixContext||'{}')};
    const store=ui.store=createFormStore({formId:ui.definition.formId});
    ui.unsubscribe=store.subscribe(state=>render(state,ui));render(store.getState(),ui);store.start();
    root.addEventListener('input',event=>{
      const t=event.target;if(t.dataset.ufSearch){ui.search[t.dataset.ufSearch]=t.value;ui.signature=null;render(store.getState(),ui);return;}
      if(t.dataset.ufOther){const f=store.getState().form.fields.find(f=>f.target===t.dataset.ufOther);store.setValue(f.target,otherValue(f,t.value));return;}
      if(t.name&&!['radio','checkbox','file'].includes(t.type)&&t.tagName!=='SELECT')change(t);
    });
    const change=t=>{
      const state=store.getState(),[target,sub]=t.name.split('/'),field=state.form?.fields.find(f=>f.target===target);if(!field)return;
      let value=t.type==='checkbox'?t.checked:t.value;
      if(sub)value={...state.values[target],[sub]:t.value};
      else if(['checkboxGroup','tags'].includes(field.control))value=[...root.querySelectorAll('input')].filter(x=>x.name===target&&x.checked).map(x=>x.value);
      else if(t.type==='file')value=[...t.files];
      else if(field.control==='number'||field.control==='rating')value=t.value===''?'':Number(t.value);
      else if(value==='__uf_other__')value=otherValue(field,'');
      store.setValue(target,value);
    };
    root.addEventListener('change',event=>{if(event.target.name)change(event.target);});
    root.addEventListener('focusout',event=>{if(event.target.name)store.validate(event.target.name);});
    root.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(b.dataset.ufAction==='back')store.previous();
      if(b.dataset.ufStep!=null&&Number(b.dataset.ufStep)<=ui.furthest)store.goToStep(Number(b.dataset.ufStep));
      if(b.dataset.ufMonth){ui.month[b.dataset.ufMonth]=moveMonth(ui.month[b.dataset.ufMonth],Number(b.dataset.direction));ui.signature=null;render(store.getState(),ui);}
      if(b.dataset.ufAction==='retry'){store.stop();store.start();}
    });
    root.addEventListener('submit',async event=>{
      event.preventDefault();const state=store.getState();if(state.loading||!state.form||state.outcome)return;
      const currentTarget=event.target;
      if(state.step<state.form.steps.length-1){store.next({currentTarget});if(store.getState().step!==state.step)root.querySelector('.uf-step-title')?.focus();}
      else{
        const outcome=await store.submit({currentTarget});
        if(outcome?.url){const url=new URL(outcome.url,window.location.href);if(url.protocol==='https:'){if(outcome.newTab)window.open(url.href,'_blank','noopener');else window.location.assign(url.href);}}
        if(outcome)root.querySelector('.uf-success')?.focus();
      }
    });
  }catch(error){if(root.isConnected)root.innerHTML=`<p class="uf-error" role="alert">The form could not load. Please try again, or <a href="tel:+35722204222">call +357 22 204 222</a>.</p>`;}
}

function render(state,ui){
  const {root,store}=ui;if(!root.isConnected)return;
  if(state.form&&ui.seeded<2){ui.seeded++;store.setValues({...state.values,...contextPrefills(state.form,ui.definition,ui.context,ui.models)});return;}
  if(!state.form){root.innerHTML=state.errors[FORM_ERROR]?`<p class="uf-error" role="alert">${e(state.errors[FORM_ERROR])}</p>${button('Try again','retry',true)}`:'<div class="uf-loading" role="status"><span></span>Preparing your form…</div>';return;}
  if(state.outcome){ui.signature=null;root.innerHTML=`<div class="uf-success" tabindex="-1"><span class="uf-success-mark">${icon('check')}</span><p>RECEIVED BY UNICARS</p><h2>Thank you.<br>We’ve got your request.</h2><p>${e(state.outcome.message||'Your form has been submitted successfully.').replace(/\n/g,'<br>')}</p><small>Reference: ${e(state.outcome.submission.id)}</small><a href="#cars" class="button secondary">Explore vehicles<span class="action-icon">${icon('arrow')}</span></a></div>`;return;}
  if(state.closed){root.innerHTML=`<div class="uf-closed"><h2>This form is currently closed.</h2><p>${e(state.form.disabledMessage||'Please contact Unicars for help.')}</p><a href="tel:+35722204222" class="button secondary">Call the team<span class="action-icon">${icon('arrow')}</span></a></div>`;return;}
  ui.furthest=Math.max(ui.furthest,state.step);
  const form=state.form,step=form.steps[state.step],fields=form.fields.filter(f=>f.stepId===step.id);
  const signature=JSON.stringify([state.step,fields,fields.map(f=>otherText(f,state.values[f.target])!=null),ui.search,ui.month]);
  if(signature!==ui.signature){
    const saved=focusSnapshot(root);ui.signature=signature;
    const progress=form.steps.length>1?`<nav class="uf-progress" aria-label="Request progress">${form.steps.map((s,i)=>`<button type="button" data-uf-step="${i}" ${i>ui.furthest?'disabled':''} ${i===state.step?'aria-current="step"':''}><span>${i<state.step?icon('check'):i+1}</span><strong>${e(s.name||'Step '+(i+1))}</strong></button>`).join('')}</nav>`:'';
    const review=fields.length===0&&form.steps.length>1?`<div class="uf-review">${form.steps.slice(0,state.step).map((s,i)=>`<section><header><h3>${e(s.name||'Your details')}</h3><button type="button" class="button secondary uf-edit" data-uf-step="${i}">Edit<span class="action-icon">${icon('arrow')}</span></button></header><dl>${form.fields.filter(f=>f.stepId===s.id).map(f=>`<div><dt>${e(f.label)}</dt><dd>${e(Array.isArray(state.values[f.target])?state.values[f.target].map(x=>choiceLabel(f,x)).join(', '):f.control==='checkbox'?(state.values[f.target]?'Agreed':'Not selected'):choiceLabel(f,state.values[f.target])||'Not provided')}</dd></div>`).join('')}</dl></section>`).join('')}</div>`:'';
    root.innerHTML=`${progress}<form class="uf-form" novalidate><header class="uf-heading"><p>${form.steps.length>1?'STEP '+(state.step+1)+' OF '+form.steps.length:'LET’S MAKE THE INTRODUCTION'}</p><h2 class="uf-step-title" tabindex="-1">${e(step.name||(root.dataset.wixForm==='newsletter'?'Stay in the loop.':root.dataset.wixForm==='feedback'?'We’re listening.':'Tell us a little more.'))}</h2>${root.dataset.wixForm==='testDrive'?'<span>Your preferred car and appointment are subject to confirmation.</span>':''}</header><div class="uf-fields">${fields.map(f=>fieldMarkup(f,state,ui)).join('')}</div>${review}<p class="uf-form-error uf-error" role="alert"></p><div class="uf-actions">${state.step>0?button(form.previousText||'Back','back',true,'back'):''}${button(state.step<form.steps.length-1?form.nextText||'Continue':form.submitText||'Send enquiry','submit')}</div><p class="uf-data-note">Your details will be sent securely to Unicars to handle this request.</p></form>`;
    restoreFocus(root,saved);
  }
  root.setAttribute('aria-busy',String(state.loading));
  root.querySelectorAll('[data-uf-error]').forEach(el=>{const text=state.errors[el.dataset.ufError]||'';el.textContent=text;el.hidden=!text;});
  root.querySelectorAll('[name]').forEach(input=>{const invalid=!!state.errors[input.name];input.setAttribute('aria-invalid',String(invalid));if(invalid)input.setAttribute('aria-describedby',ui.id+'-'+input.name+'-error');});
  const error=root.querySelector('.uf-form-error');error.textContent=state.errors[FORM_ERROR]||'';error.hidden=!error.textContent;
  const submit=root.querySelector('[type=submit]');submit.disabled=state.loading;submit.querySelector('span').textContent=state.loading?'Sending…':state.step<form.steps.length-1?form.nextText||'Continue':form.submitText||'Send enquiry';
  const modelField=form.fields.find(f=>ui.definition.hints[f.target]?.role==='model'&&state.values[f.target]);
  const model=modelField&&ui.models.find(m=>m.id===state.values[modelField.target]);
  const selection=root.closest('.td-layout')?.querySelector('[data-uf-selection]');
  if(selection)selection.innerHTML=model?`<p>${e(model.brand)}</p><h2>${e(model.model)}</h2><span>${model.offer?'Selected eHub car · '+e(model.reference):'Your drive, taking shape.'}</span>`:'<p>YOUR DRIVE, TAKING SHAPE</p><h2>Five brands.<br>Your kind of drive.</h2>';
}

function scan(){
  for(const [root,ui] of mounted)if(!root.isConnected){ui.unsubscribe?.();ui.store?.stop();mounted.delete(root);}
  document.querySelectorAll('[data-wix-form]').forEach(mount);
}
if(typeof document!=='undefined'){
  new MutationObserver(()=>{if(!scan.pending){scan.pending=true;queueMicrotask(()=>{scan.pending=false;scan();});}}).observe(document.body,{childList:true,subtree:true});
  scan();
}
