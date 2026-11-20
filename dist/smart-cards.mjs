// Presentation prices never replace the qualifying version used by the matcher.
export function modelPresentation(vehicle,vehicles,media={}){
 if(vehicle.kind==='ehub_listing')return {baseline:{price:vehicle.price,trim:vehicle.trim,powertrain:vehicle.powertrain,source:vehicle.source},images:vehicle.images||[{src:vehicle.image,alt:vehicle.brand+' '+vehicle.model+' listing',fit:'cover',caption:'Indicative eHub listing image'}],matchingPrice:vehicle.price,hasPriceDifference:false};
 const entry=media[vehicle.brand+' '+vehicle.model]||media[vehicle.model]||{};
 const variants=vehicles.filter(v=>v.kind!=='ehub_listing'&&v.brand===vehicle.brand&&v.model===vehicle.model);
 const lowest=variants.reduce((a,b)=>a.price<=b.price?a:b,vehicle);
 const baseline=entry.baseline||{price:lowest.price,trim:lowest.trim,powertrain:lowest.powertrain,source:lowest.source};
 return {baseline,images:entry.images?.length?entry.images:[{src:vehicle.image,alt:vehicle.brand+' '+vehicle.model+' model view',fit:'contain',caption:'Model image · equipment varies'}],matchingPrice:vehicle.price,hasPriceDifference:baseline.price!==vehicle.price};
}
