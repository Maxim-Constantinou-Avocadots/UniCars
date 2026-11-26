import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createFormStore } from '../dist/js/wix/form-store.js';
import { useTokenStore } from '../dist/js/wix/client.js';
import { contextPrefills, resolveVehicleContext, fieldMarkup, escapeFormText } from '../dist/wix-forms-ui.mjs';
const config=JSON.parse(fs.readFileSync('dist/data/wix-forms.json'));
const schemas=JSON.parse(fs.readFileSync('tests/fixtures/wix-form-schemas.json'));
const library=JSON.parse(fs.readFileSync('dist/data/vehicle-library.json'));
const stock=JSON.parse(fs.readFileSync('dist/data/ehub.json'));
const models=[...library.models,...stock.models.map(m=>({...m,id:'offer-'+m.id}))];
const target=(key,role,brand)=>Object.keys(config[key].hints).find(t=>config[key].hints[t].role===role&&(!brand||config[key].hints[t].brand===brand));
function validValues(key){const form=schemas[key],values={};for(const f of form.fields){const role=config[key].hints[f.target]?.role;values[f.target]=f.control==='checkbox'?true:f.choices.length?(f.choices.find(c=>c.value==='Email me')||f.choices[0]).value:f.control==='email'?'test@example.com':f.control==='phone'?'':f.control==='date'?f.validation.minDate:role==='name'?'Test Person':'Test request';}return values;}
function store(key){return createFormStore({formId:config[key].formId,initialForm:structuredClone(schemas[key])});}

test('All vehicle and Smart Search routes retain the exact selected model',()=>{
 for(const m of library.models){assert.equal(resolveVehicleContext('range-'+m.id,models).id,m.id);for(const v of m.versions)assert.equal(resolveVehicleContext('smart-vehicle-'+v.id,models).id,m.id);}
 assert.equal(resolveVehicleContext('model-vw-tiguan',models).id,'volkswagen-tiguan');
 for(const m of stock.models){assert.equal(resolveVehicleContext('ehub-car-'+m.id,models).reference,m.reference);assert.equal(resolveVehicleContext('smart-vehicle-ehub-'+m.id,models).id,'offer-'+m.id);}
});

test('Context prefills use live allowed choices and never invent a hidden or removed control',()=>{
 const f=structuredClone(schemas.testDrive),def=config.testDrive,m=library.models.find(m=>m.brand==='Audi');
 const result=contextPrefills(f,def,{vehicle:'range-'+m.id,page:'https://test.invalid/#test-drive'},models);
 assert.equal(result[target('testDrive','brand')],'Audi');assert.equal(result[target('testDrive','model','Audi')],m.id);
 f.fields=f.fields.filter(x=>x.target!==target('testDrive','model','Audi'));
 assert.equal(contextPrefills(f,def,{vehicle:'range-'+m.id},models)[target('testDrive','model','Audi')],undefined);
});

test('Switching brands clears the prior model and showroom; only the selected brand can submit',()=>{
 const s=store('testDrive'),v=validValues('testDrive');s.setValues(v);
 const vw=target('testDrive','model','Volkswagen'),vwLocation=target('testDrive','showroom','Volkswagen');
 assert.ok(s.getState().form.fields.some(f=>f.target===vw));s.setValue(target('testDrive','brand'),'Audi');
 assert.equal(s.getState().values[vw],'');assert.equal(s.getState().values[vwLocation],'');
 assert.ok(!s.getState().form.fields.some(f=>f.target===vw));assert.ok(s.getState().form.fields.some(f=>f.target===target('testDrive','model','Audi')));
});

test('The live schema controls required phone, email, consent and the date window',()=>{
 const s=store('testDrive');s.setValues(validValues('testDrive'));assert.equal(s.validate(),true);
 s.setValue(target('testDrive','contactMethod'),'Call me');assert.equal(s.validate(),false);assert.ok(s.getState().errors[target('testDrive','phone')]);
 s.setValue(target('testDrive','contactMethod'),'Email me');s.setValue(target('testDrive','email'),'invalid');s.setValue(target('testDrive','consent'),false);s.setValue(target('testDrive','date'),'2020-01-01');
 assert.equal(s.validate(),false);for(const role of ['email','consent','date'])assert.ok(s.getState().errors[target('testDrive',role)]);
});

test('Owner-added fields and renamed labels render with validation and escaped content',()=>{
 const f={...schemas.contact.fields.find(f=>f.control==='textarea'),target:'owner_added',label:'<script>New label</script>',required:true};
 const ui={id:'test',definition:{hints:{}},models,search:{},month:{}};
 const html=fieldMarkup(f,{form:schemas.contact,values:{owner_added:'<img src=x onerror=alert(1)>'}},ui);
 assert.match(html,/name="owner_added"/);assert.match(html,/&lt;script&gt;New label/);assert.match(html,/&lt;img/);assert.ok(!html.includes('<script>'));
 assert.equal(escapeFormText('"<>&'),'&quot;&lt;&gt;&amp;');
});

test('Originating page stays hidden in the UI and remains available to the submission',()=>{
 const form=schemas.contact,definition=config.contact,page='https://test.invalid/#contact';
 const values=contextPrefills(form,definition,{page},models);
 const field=form.fields.find(f=>definition.hints[f.target]?.role==='page');
 const html=fieldMarkup(field,{form,values},{id:'contact',definition,models,search:{},month:{}});
 assert.match(html,/class="uf-context" hidden/);
 assert.match(html,/type="hidden"/);
 assert.ok(html.includes(`name="${field.target}"`));
 assert.ok(html.includes(`value="${page}"`));
 const s=store('contact');s.setValues({...validValues('contact'),...values});
 assert.equal(s.validate(),true);
 assert.equal(s.getState().values[field.target],page);
});

test('Review preserves values and final submission revalidates earlier steps',async()=>{
 const s=store('testDrive');s.setValues(validValues('testDrive'));for(let i=0;i<3;i++)assert.equal(s.next(),true);
 assert.equal(s.getState().step,3);s.previous();assert.equal(s.getState().values[target('testDrive','name')],'Test Person');s.goToStep(3);
 s.setValue(target('testDrive','date'),'2020-01-01');assert.equal(await s.submit(),false);assert.equal(s.getState().step,1);assert.equal(s.getState().outcome,null);
});

test('Every journey submits through the visitor transport and keeps the actual submission reference',async t=>{
 const original=globalThis.fetch;const calls=[];
 useTokenStore({load:()=>({accessToken:'unit-test-visitor',refreshToken:'unit-test-refresh',expiresAt:Date.now()+600000}),save(){}});
 globalThis.fetch=async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});return Response.json({submission:{id:'saved-'+calls.length,status:'CONFIRMED'}});};
 t.after(()=>{globalThis.fetch=original;});
 for(const key of Object.keys(config)){
  const s=store(key);s.setValues(validValues(key));const outcome=await s.submit();assert.ok(outcome);assert.equal(outcome.submission.id,'saved-'+calls.length);
  const body=calls.at(-1).body;assert.equal(body.submission.formId,config[key].formId);assert.ok(Object.keys(body.submission.submissions).length);
  if(key==='testDrive'){const entries=Object.keys(body.submission.submissions);assert.ok(entries.includes(target(key,'model','Volkswagen')));assert.ok(!entries.includes(target(key,'model','Audi')));}
 }
 assert.equal(calls.length,6);assert.ok(calls.every(x=>x.options.headers.Authorization==='unit-test-visitor'));
});

test('Network/server failures and closed forms never produce a success screen',async t=>{
 const original=globalThis.fetch;let count=0;globalThis.fetch=async()=>{count++;return Response.json({message:'Temporarily unavailable'},{status:503});};t.after(()=>{globalThis.fetch=original;});
 const s=store('contact');s.setValues(validValues('contact'));assert.equal(await s.submit(),false);assert.equal(s.getState().outcome,null);assert.ok(s.getState().errors['@form']);assert.equal(s.getState().values[target('contact','name')],'Test Person');
 const closed=structuredClone(schemas.contact);closed.enabled=false;const c=createFormStore({formId:closed.id,initialForm:closed});assert.equal(await c.submit(),false);assert.equal(count,1);
});
