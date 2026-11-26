import {validateCriteria} from './smart-core.mjs';

export const searchSortOptions=[['recommended','Recommended'],['price-asc','Price: low to high'],['price-desc','Price: high to low'],['name','Brand & model: A–Z']];
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');

export function sortSearchMatches(matches,sort='recommended'){
 const sorted=[...matches],name=(a,b)=>(a.brand+' '+a.model).localeCompare(b.brand+' '+b.model,'en',{sensitivity:'base'});
 if(sort==='price-asc')sorted.sort((a,b)=>a.price-b.price||name(a,b));
 else if(sort==='price-desc')sorted.sort((a,b)=>b.price-a.price||name(a,b));
 else if(sort==='name')sorted.sort((a,b)=>name(a,b)||a.price-b.price);
 return sorted;
}

export function searchModels(vehicles,criteria){
 const names=[...new Set(vehicles.filter(vehicle=>!criteria.brand||vehicle.brand===criteria.brand).map(vehicle=>vehicle.model))].sort((a,b)=>a.localeCompare(b));
 // The parser also understands model families, such as Q3. Keep that active
 // selection visible even if the catalogue has more specific model names.
 if(criteria.model&&!names.includes(criteria.model))names.unshift(criteria.model);
 return names;
}

export function applySearchFilter(input,field,value,vehicles=[]){
 const criteria=validateCriteria(input);
 if(field==='budget'){
  const budget=value===''?null:Number(value);
  if(budget!==null&&(!Number.isFinite(budget)||budget<0||budget>1000000))return criteria;
  return validateCriteria({...criteria,intent:'vehicle',budget:budget||null,budgetKind:'purchase'});
 }
 if(!['brand','model','body','powertrain','transmission','condition'].includes(field))return criteria;
 const next={...criteria,intent:'vehicle',[field]:value||(['brand','model'].includes(field)?null:'any')};
 const validated=validateCriteria(next);
 if(value&&validated[field]!==value)return criteria;
 if(field==='brand'){
  next.excludedBrands=criteria.excludedBrands.filter(brand=>brand!==next.brand);
  if(next.brand&&next.model&&!vehicles.some(vehicle=>vehicle.brand===next.brand&&normalize(vehicle.model).startsWith(normalize(next.model))))next.model=null;
 }
 if(field==='powertrain')next.excludedPowertrains=[];
 if(field==='condition'&&['test-drive','approved'].includes(value))next.source='ehub';
 return validateCriteria(next);
}
