export const brandLogos={Volkswagen:'volkswagen',Audi:'audi','Škoda':'skoda',CUPRA:'cupra',SEAT:'seat'};
export const periods={morning:'Morning',afternoon:'Afternoon',flexible:'I’m flexible'};
export function dayKey(date=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Nicosia',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;
}
export function addDays(key,n){const d=new Date(key+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function validDay(key,today=dayKey()) {return /^\d{4}-\d{2}-\d{2}$/.test(key)&&!Number.isNaN(Date.parse(key+'T12:00:00Z'))&&new Date(key+'T12:00:00Z').toISOString().slice(0,10)===key&&key>today&&key<=addDays(today,90)}
export function formatDay(key){return new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(key+'T12:00:00Z'))}
export function freshRequest(today=dayKey()){return {step:0,furthest:0,brand:'',modelId:'',locationId:'',date:'',period:'',contactMethod:'phone',name:'',email:'',phone:'',notes:'',consent:false,query:'',limit:6,month:today.slice(0,7),errors:{},complete:false}}
export function eligibleLocations(locations,brand){return locations.filter(l=>l.type==='sales'&&(!brand||l.brands.split(' · ').some(b=>b===brand||b.startsWith(brand+' '))))}
export function chosenModel(models,state){return models.find(m=>m.id===state.modelId&&m.brand===state.brand)||null}
export function modelChoices(models,state){const q=state.query.trim().normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();return models.filter(m=>(!state.brand||m.brand===state.brand)&&(!q||`${m.brand} ${m.model}`.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().includes(q)))}
export function validateStep(state,step,models,locations,today=dayKey()){
 const e={};if(step===0){if(!state.brand)e.brand='Choose a brand to start.';if(!chosenModel(models,state))e.modelId='Choose the car you would like to drive.'}
 if(step===1){const m=chosenModel(models,state);if(!eligibleLocations(locations,m?.brand||state.brand).some(l=>l.id===state.locationId))e.locationId='Choose a sales location for this brand.';if(!validDay(state.date,today))e.date='Choose a future date within the next 90 days.';if(!periods[state.period])e.period='Choose a preferred time of day.'}
 if(step===2){if(state.name.trim().length<2)e.name='Please enter your name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim()))e.email='Enter a valid email address.';if(!['phone','email'].includes(state.contactMethod))e.contactMethod='Choose how you would like us to contact you.';const digits=state.phone.replace(/\D/g,'');if((state.contactMethod==='phone'||state.phone.trim())&&(digits.length<7||digits.length>15))e.phone='Enter a valid phone number, including your country code.';if(!state.consent)e.consent='Please agree to be contacted about this request.'}
 return e;
}
export function firstInvalidStep(state,models,locations,today=dayKey()){for(let i=0;i<3;i++){const errors=validateStep(state,i,models,locations,today);if(Object.keys(errors).length)return {step:i,errors}}return null}
export function calendarCells(month){const [y,m]=month.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)),days=new Date(Date.UTC(y,m,0)).getUTCDate(),offset=(first.getUTCDay()+6)%7;return [...Array(offset).fill(null),...Array.from({length:days},(_,i)=>`${month}-${String(i+1).padStart(2,'0')}`)]}
export function moveMonth(month,n){const [y,m]=month.split('-').map(Number);return new Date(Date.UTC(y,m-1+n,1)).toISOString().slice(0,7)}
