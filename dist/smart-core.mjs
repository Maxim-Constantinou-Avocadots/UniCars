export const powerLabels={any:'Any powertrain',hybrid:'All hybrid types',full_hybrid:'Full hybrid',mild_hybrid:'Mild hybrid',plug_in_hybrid:'Plug-in hybrid',electric:'Electric',petrol:'Petrol',diesel:'Diesel',unknown:'See specifications'};
export const emptyCriteria=()=>({intent:'vehicle',source:'any',condition:'any',budget:null,budgetKind:'purchase',powertrain:'any',brand:null,model:null,body:'any',transmission:'any',passengers:null,family:false,charging:'unknown',commute:null,excludedBrands:[],excludedPowertrains:[]});
const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function validateCriteria(input={}){
 const c=emptyCriteria();
 for(const k of ['intent','source','condition','budgetKind','powertrain','body','transmission','charging']){
  const allowed={intent:['vehicle','service','charging','contact','unknown'],source:['any','models','ehub'],condition:['any','new','test-drive','approved'],budgetKind:['purchase','monthly'],powertrain:Object.keys(powerLabels),body:['any','suv','hatchback','saloon','estate','mpv','van','pick-up','convertible'],transmission:['any','automatic','manual'],charging:['yes','no','unknown']}[k];
  if(allowed.includes(input[k]))c[k]=input[k];
 }
 for(const k of ['budget','passengers'])if(typeof input[k]==='number'&&Number.isFinite(input[k])&&input[k]>0&&input[k]<=(k==='budget'?1000000:20))c[k]=k==='passengers'?Math.ceil(input[k]):input[k];
 c.family=input.family===true;
 const brands=['Volkswagen','Audi','Škoda','CUPRA','SEAT'];if(brands.includes(input.brand))c.brand=input.brand;
 for(const k of ['model','commute'])if(typeof input[k]==='string')c[k]=input[k].slice(0,120);
 if(Array.isArray(input.excludedBrands))c.excludedBrands=input.excludedBrands.filter(x=>brands.includes(x));
 if(Array.isArray(input.excludedPowertrains))c.excludedPowertrains=input.excludedPowertrains.filter(x=>Object.keys(powerLabels).includes(x)&&x!=='any');
 return c;
}
export function parseDemo(text,previous={},catalogue=[]){
 const c=validateCriteria(previous),q=fold(text).replace(/family of (two|three|four|five|six|seven|eight)/g,(_,n)=>'family of '+({two:2,three:3,four:4,five:5,six:6,seven:7,eight:8}[n]));let understood=false;
 const mark=()=>{understood=true;c.intent='vehicle'};if(/\b(?:cars?|vehicles?|show all|all results)\b/.test(q))mark();
 const money=[...q.matchAll(/(?:€\s*)?(\d{1,3}(?:[,.\s]\d{3})+|\d{3,6}|\d{1,3}(?:\.\d+)?\s*k)(?:\s*(?:eur|euros?|€))?/g)].map(m=>({raw:m[1],index:m.index,whole:m[0],n:/k/.test(m[1])?parseFloat(m[1])*1000:Number(m[1].replace(/[,\.\s]/g,''))})).filter(x=>x.n>=500&&x.n<=1000000&&!/^\s*(?:km|kwh|kw|bhp|ps|cc|miles)\b/.test(q.slice(x.index+x.whole.length))&&(x.n>=5000||/€|eur|euro/.test(x.whole)||/budget|under|below|maximum|μεχρι/.test(q.slice(Math.max(0,x.index-18),x.index))));
 const monthly=q.match(/(\d{1,4})\s*(?:eur|euros?|€)?\s*(?:per month|monthly|a month|\/month)/);if(monthly){c.budget=Number(monthly[1]);c.budgetKind='monthly';mark()}
 if(money.length){c.budget=money[money.length-1].n;c.budgetKind=/per month|monthly|a month|\/month|μηνα|minia|mina/.test(q)?'monthly':'purchase';mark()}
 if(/no budget|any budget|remove.{0,12}budget|χωρις οριο/.test(q)){c.budget=null;mark()}
 if(/family|kids|children|οικογεν|παιδια|oikogen|paidia/.test(q)){c.family=true;mark()}
 const seats=q.match(/(?:family of|οικογενεια.{0,5}|oikogeneia.{0,5})\s*(\d+)|\b(\d+)\s*(?:seats?|people|passengers|θεσε|ατομα)/);if(seats){c.passengers=Number(seats[1]||seats[2]);mark()}
 if(/wife.{0,20}(?:2|two) (?:kids|children)/.test(q)){c.passengers=4;c.family=true;mark()}
 const powers=[['plug_in_hybrid',/plug[ -]?in|phev|e[ -]?hybrid|φορτιζομεν.{0,8}υβριδ/],['full_hybrid',/full hybrid|self[ -]?charging|\bhev\b|χωρις πριζα/],['mild_hybrid',/mild hybrid|mhev|etsi|ηπιο υβριδ/],['electric',/electric|\bev\b|ηλεκτρ|ilektr/],['petrol',/petrol|gasoline|βενζιν|venzin/],['diesel',/diesel|ντιζελ|πετρελαι/],['hybrid',/hybrid|υβριδ|yvrid|ivrid/]];
 const negative=/\b(?:no|not|without|avoid|exclude)\s+(?:an?\s+)?(electric|diesel|petrol|hybrid)|οχι\s+(ηλεκτρ|υβριδ)/;
 const neg=q.match(negative);let positive=q.replace(negative,'');
 if(neg){const n=neg[1]||neg[2],p=/electric|ηλεκτρ/.test(n)?'electric':/hybrid|υβριδ/.test(n)?'hybrid':n;c.excludedPowertrains=[...new Set([...c.excludedPowertrains,p])];if(c.powertrain===p)c.powertrain='any';mark()}
 for(const [p,re]of powers)if(re.test(positive)){c.powertrain=p;c.excludedPowertrains=c.excludedPowertrains.filter(x=>x!==p);mark();break}
 if(/any powertrain|any fuel|open to (?:all|anything)|remove.{0,10}(?:hybrid|powertrain)|any car/.test(q)){c.powertrain='any';c.excludedPowertrains=[];mark()}
 for(const [b,re]of [['Volkswagen',/volkswagen|\bvw\b/],['Audi',/\baudi\b/],['Škoda',/skoda|σκοντα/],['CUPRA',/cupra/],['SEAT',/\bseat\b(?!s)/]])if(re.test(q)){
  if(new RegExp('(?:no|not|avoid|exclude)\\s+'+re.source).test(q)){c.excludedBrands=[...new Set([...c.excludedBrands,b])];if(c.brand===b)c.brand=null}else {c.brand=b;c.excludedBrands=c.excludedBrands.filter(x=>x!==b)}mark();
 }
 if(/any brand|all brands|remove.{0,10}brand|not just/.test(q)){c.brand=null;c.excludedBrands=[];mark()}
 const names=[...new Set([...catalogue.map(v=>v.model),...catalogue.filter(v=>/^(?:S[356]|SQ[5678])\b/.test(v.model)).map(v=>v.model.split(' ')[0]),'Golf','T-Roc','Tiguan','Raval','Terramar','Ibiza','Q3','Kamiq','Octavia','Elroq'])].sort((a,b)=>b.length-a.length);
 for(const model of names){const tokens=fold(model).match(/[a-z0-9]+/g);if(tokens&&new RegExp('\\b'+tokens.join('[\\s.\\-]*')+'\\b').test(q)){c.model=model;mark();break}}
 if(/\b(?:ehub|e-hub|offers?|discounted|in stock|available cars)\b/.test(q)){c.source='ehub';mark()}
 if(/model range|list prices|all models/.test(q)){c.source='models';mark()}
 if(/test[ -]?drive car|demo car|demonstrator/.test(q)){c.source='ehub';c.condition='test-drive';mark()}
 if(/audi approved|approved (?:used|cars)/.test(q)){c.source='ehub';c.condition='approved';mark()}
 if(/brand new|new cars only/.test(q)){c.condition='new';mark()}
 if(/all sources|all results|models and offers/.test(q)){c.source='any';c.condition='any';mark()}
 if(/any model|remove.{0,10}model/.test(q)){c.model=null;mark()}
 if(/automatic|\bauto\b|\bdsg\b|αυτοματ/.test(q)){c.transmission='automatic';mark()}
 if(/manual|χειροκινητ/.test(q)){c.transmission='manual';mark()}
 if(/\bsuvs?\b/.test(q)){c.body='suv';mark()}else if(/hatchback|compact|city car/.test(q)){c.body='hatchback';mark()}else if(/saloon|sedan/.test(q)){c.body='saloon';mark()}else if(/estate|combi|avant/.test(q)){c.body='estate';mark()}else if(/mpv|people carrier|multivan/.test(q)){c.body='mpv';mark()}else if(/\bvan\b|cargo/.test(q)){c.body='van';mark()}else if(/pick[ -]?up/.test(q)){c.body='pick-up';mark()}else if(/convertible|cabrio/.test(q)){c.body='convertible';mark()}
 if(/any body|any shape|not just.{0,6}suv/.test(q)){c.body='any';mark()}
 if(/no.{0,15}(?:charging|charger)|cannot charge|can't charge|δεν.{0,10}φορτι/.test(q)){c.charging='no';mark()}else if(/(?:can|home|have a).{0,15}charg|φορτιση στο σπιτι/.test(q)){c.charging='yes';mark()}
 if(/nicosia|larnaca|λευκωσια|λαρνακα/.test(q)){const n=/nicosia|λευκωσια/.test(q),l=/larnaca|λαρνακα/.test(q);c.commute=n&&l?'Larnaca–Nicosia commute':n?'Nicosia driving':'Larnaca driving';mark()}else if(/commut|daily drive|καθημεριν/.test(q)){c.commute='Regular commute';mark()}
 if(/\bservice\b|servicing|repair|σερβις/.test(q)){c.intent='service';understood=true}else if(/(?:find|nearest|where).{0,20}(?:charger|charging station)/.test(q)){c.intent='charging';understood=true}else if(/contact|call the team/.test(q)){c.intent='contact';understood=true}
 if(!understood)c.intent='unknown';
 return validateCriteria(c);
}
function matchesPower(actual,wanted){return wanted==='any'||actual===wanted||(wanted==='hybrid'&&['full_hybrid','plug_in_hybrid','mild_hybrid'].includes(actual));}
export function recommend(catalogue,input){
 const c=validateCriteria(input);
 const issues=[];
 if(c.budgetKind==='monthly'&&c.budget)issues.push('monthly_budget');
 const modelFold=value=>fold(value||'').replace(/[^a-z0-9]/g,'');
 const eligible=catalogue.filter(v=>(c.source==='any'||(c.source==='ehub')===(v.kind==='ehub_listing'))&&(c.condition==='any'||c.condition==='new'&&(v.kind!=='ehub_listing'||v.condition==='New car')||c.condition==='test-drive'&&v.kind==='ehub_listing'&&(v.condition==='Test-drive car'||/demo|test.?drive/i.test(v.vehicleStatus||''))||c.condition==='approved'&&v.kind==='ehub_listing'&&v.condition==='Audi Approved')&&(!(v.powertrain==='unknown'&&(c.powertrain!=='any'||c.excludedPowertrains.length)))&&(!c.budget||c.budgetKind!=='purchase'||v.price<=c.budget)&&(matchesPower(v.powertrain,c.powertrain)||(c.powertrain==='diesel'&&v.fuel==='diesel'))&&!c.excludedPowertrains.some(p=>matchesPower(v.powertrain,p)||(p==='diesel'&&v.fuel==='diesel'))&&(!c.brand||v.brand===c.brand)&&!c.excludedBrands.includes(v.brand)&&(!c.model||modelFold(v.model).startsWith(modelFold(c.model)))&&(c.body==='any'||v.body===c.body)&&(c.transmission==='any'||v.transmission===c.transmission)&&(!c.passengers||(v.seats==null?c.passengers<=5:v.seats>=c.passengers)));
 const score=v=>(c.family&&['suv','saloon','estate'].includes(v.body)?2:0)+(c.commute&&v.powertrain==='full_hybrid'?1:0)+(c.charging==='yes'&&['electric','plug_in_hybrid'].includes(v.powertrain)?1:0);
 eligible.sort((a,b)=>score(b)-score(a)||a.price-b.price);
 const seen=new Set(),ranked=[];for(const v of eligible){const key=v.kind==='ehub_listing'?v.id:v.brand+' '+v.model+' '+v.powertrain;if(!seen.has(key)){seen.add(key);ranked.push({...v,otherVersions:v.kind==='ehub_listing'?[]:eligible.filter(x=>x.kind!=='ehub_listing'&&x.brand===v.brand&&x.model===v.model&&x.powertrain===v.powertrain&&x.id!==v.id)})}}
 const warnings=[];if(c.family||c.passengers)warnings.push('Passenger capacity, child-seat fit and luggage space have not been verified for these versions. Confirm these before choosing.');if(c.charging==='no'&&['electric','plug_in_hybrid'].includes(c.powertrain))warnings.push('You said you cannot charge at home. Check a reliable charging option before choosing this powertrain.');if(c.commute)warnings.push('Your commute is noted. Route distance, energy costs and real-world range have not been calculated.');
 return {criteria:c,matches:issues.length?[]:ranked,issues,warnings,needsHybridChoice:false,needsChargingChoice:['electric','plug_in_hybrid'].includes(c.powertrain)&&c.charging==='unknown'};
}
export function reasons(v,c){const r=[];if(c.budget&&c.budgetKind==='purchase')r.push(`${new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(c.budget-v.price)} below your purchase budget`);r.push(powerLabels[v.powertrain]+(v.powertrain==='full_hybrid'?' · no plug required':''));if(c.transmission==='automatic')r.push('Automatic transmission');if(c.body!=='any')r.push(c.body.toUpperCase()==='SUV'?'SUV body style':c.body+' body style');return r.slice(0,3)}
