/* Product wayfinding sits below the hero and shares the site's header stack. */
export function createProductSectionNav(React, items) {
 const h=React.createElement;
 return function ProductSectionNav() {
  const [active,setActive]=React.useState('overview');
  React.useEffect(()=>{
   let frame;
   const update=()=>{
    frame=null;
    const root=document.getElementById('id3ProductRoot');
    if(!root)return;
    const header=parseFloat(root.style.getPropertyValue('--id3-shell-height'))||130;
    const bar=root.querySelector('.id3-section-bar');
    const threshold=header+(bar?.getBoundingClientRect().height||64)+16;
    let current=items[0].id;
    for(const item of items){
     const section=root.querySelector('#'+(item.id==='versions'?'decision-hub':item.id));
     if(section&&section.getBoundingClientRect().top<=threshold)current=item.id;
    }
    setActive(current);
   };
   const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
   update();
   window.addEventListener('scroll',schedule,{passive:true});
   window.addEventListener('resize',schedule);
   return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  },[]);
  return h('div',{className:'product-nav id3-section-bar'},
   h('div',{className:'id3-section-frame'},
    h('span',{className:'id3-section-model'},'ID.3 Neo'),
    h('nav',{'aria-label':'On this page',className:'id3-section-links'},items.map(item=>h('a',{
     key:item.id,
     href:'#'+item.id,
     'aria-current':active===item.id?'location':undefined,
     onClick:event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();setActive(item.id);window.uniID3Scroll?.(item.id);}
    },item.label)))
  ));
 };
}
