// Non-WebGL fallback with the same camera/marker interface used by the Mapbox view.
function createFallbackLibrary(config){
 const coord=p=>Array.isArray(p)?[p[1],p[0]]:[p.lat,p.lng];
 class Bounds{
  constructor(a,b){this.value=L.latLngBounds([]);if(a)this.extend(a);if(b)this.extend(b)}
  extend(p){this.value.extend(coord(p));return this}
  contains(p){return this.value.contains(coord(p))}
 }
 class FallbackMap{
  constructor(o){
   this.raw=L.map(o.container,{zoomControl:false,attributionControl:false,minZoom:o.minZoom,maxZoom:o.maxZoom,zoomSnap:.25,scrollWheelZoom:true}).setView(coord(o.center),o.zoom);
   this.handlers={};
   const style=config.mapboxStyle||'mapbox/light-v11';
   const tiles=L.tileLayer('https://api.mapbox.com/styles/v1/'+style+'/tiles/512/{z}/{x}/{y}?access_token='+encodeURIComponent(config.mapboxToken),{tileSize:512,zoomOffset:-1,maxNativeZoom:22,maxZoom:20,attribution:'© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> <a href="https://apps.mapbox.com/feedback/" target="_blank" rel="noopener">Improve this map</a>'});
   tiles.on('tileerror',()=>this.handlers.error?.());
   tiles.on('load',()=>document.getElementById('map-error').hidden=true);
   tiles.addTo(this.raw);
   L.control.attribution({position:'bottomright',prefix:false}).addTo(this.raw);
   const logo=L.control({position:'bottomleft'});
   logo.onAdd=()=>{const a=L.DomUtil.create('a','mapboxgl-ctrl-logo');a.href='https://www.mapbox.com/';a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','Mapbox');return a};
   logo.addTo(this.raw);
  }
  on(ev,fn){if(ev==='load')setTimeout(fn,0);else if(ev==='error')this.handlers.error=fn;else this.raw.on(ev,fn);return this}
  addControl(){return this}
  getContainer(){return this.raw.getContainer()}
  getZoom(){return this.raw.getZoom()}
  project(p){return this.raw.latLngToContainerPoint(coord(p))}
  unproject(p){const a=this.raw.containerPointToLatLng(p);return{lng:a.lng,lat:a.lat}}
  getBounds(){const b=new Bounds();b.value=this.raw.getBounds();return b}
  fitBounds(b,o={}){const bounds=b instanceof Bounds?b.value:L.latLngBounds(b.map(coord));const p=o.padding||{};this.raw.fitBounds(bounds,{paddingTopLeft:[p.left||0,p.top||0],paddingBottomRight:[p.right||0,p.bottom||0],maxZoom:o.maxZoom,animate:false});return this}
  easeTo(o={}){const z=o.zoom??this.getZoom();let target=o.center?L.latLng(coord(o.center)):this.raw.getCenter();if(o.center&&o.padding){const p=o.padding;const pt=this.raw.project(target,z);target=this.raw.unproject([pt.x-((p.left||0)-(p.right||0))/2,pt.y-((p.top||0)-(p.bottom||0))/2],z)}this.raw.flyTo(target,z,{animate:!!o.duration,duration:(o.duration||0)/1000});return this}
  zoomIn(){this.raw.zoomIn();return this}
  zoomOut(){this.raw.zoomOut();return this}
  resize(){this.raw.invalidateSize();return this}
  remove(){this.raw.remove()}
 }
 class Marker{
  constructor(o){this.el=o.element}
  setLngLat(p){this.location=coord(p);if(this.instance)this.instance.setLatLng(this.location);return this}
  addTo(m){const size=Number(this.el.dataset.markerSize)||(this.el.classList.contains('cluster-marker')?40:this.el.style.width?parseInt(this.el.style.width):36);this.instance=L.marker(this.location,{icon:L.divIcon({html:this.el,className:'custom-marker',iconSize:[size,size],iconAnchor:[size/2,size/2]}),keyboard:false}).addTo(m.raw);return this}
  remove(){this.instance?.remove();return this}
 }
 return {Map:FallbackMap,Marker,LngLatBounds:Bounds,AttributionControl:class{}};
}
