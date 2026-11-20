export const engineNames={electric:'Electric',mild_hybrid:'Mild hybrid',full_hybrid:'Full hybrid',plug_in_hybrid:'Plug-in hybrid',petrol:'Petrol',diesel:'Diesel'};
export const defaultFilters={brand:'all',query:'',engines:[],bodies:[],budget:0,sort:'range'};
export function filterModels(models,state={}){
 const s={...defaultFilters,...state},q=s.query.trim().toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
 const found=[];
 for(const m of models){
  if(s.brand!=='all'&&m.brand!==s.brand)continue;
  const familyMatch=!q||`${m.brand} ${m.model}`.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').includes(q),versionMatch=v=>`${v.trim} ${v.displayModel||''}`.toLocaleLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').includes(q);if(!familyMatch&&!m.versions?.some(versionMatch))continue;
  if(m.versions?.length){
   const selected=m.versions.filter(v=>(familyMatch||versionMatch(v))&&(!s.engines.length||s.engines.some(p=>v.powertrain===p||(p==='diesel'&&v.fuel==='diesel')))&&(!s.bodies.length||s.bodies.some(b=>b.toLowerCase()===v.body))&&(!s.budget||v.price<=Number(s.budget))).sort((a,b)=>a.price-b.price);
   if(!selected.length)continue;
   const filtered=!!(s.engines.length||s.bodies.length||!familyMatch);
   found.push({...m,matchingPrice:selected[0].price,matchingVersion:filtered?selected[0]:null,matchingVersionCount:selected.length});
  }else if((!s.engines.length||s.engines.some(p=>m.powertrains.includes(p)))&&(!s.bodies.length||s.bodies.includes(m.body))&&(!s.budget||m.price<=Number(s.budget)))found.push(m);
 }
 return found.sort((a,b)=>s.sort==='price-low'?(a.matchingPrice??a.price)-(b.matchingPrice??b.price)||a.order-b.order:s.sort==='price-high'?(b.matchingPrice??b.price)-(a.matchingPrice??a.price)||a.order-b.order:s.sort==='name'?`${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`):a.order-b.order);
}
export function activeFilterCount(s){return Number(s.brand!=='all')+s.engines.length+s.bodies.length+Number(!!s.budget)+Number(!!s.query.trim());}
export function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

export function collectionModels(models,brand){return brand?models.filter(m=>m.brand===brand):models;}
