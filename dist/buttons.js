(() => {
 const selectors=['.ehub-nav-button','.button','.home-btn','.home-text-link','.text-button','.smart-submit','.smart-reset','.smart-enquiry','.smart-card-link','.smart-back','.smart-data-links a','.smart-empty>a','.smart-empty-actions a','.smart-empty-actions button','.smart-start-examples button','.campaign-view','.campaign-navigation button','.dialog-poster a','.mobile-back','.mobile-priority','.mobile-hub-action','.mobile-banner-cta','.menu-quiet','.service-list>a','.service-list>button','.finder-results button'];
 const selector=selectors.join(',');
 function normalise(control){
  control.classList.add('action-button');
  if(control.matches('.smart-empty>a:not(.smart-submit)'))control.classList.add('text-button');
  let box=[...control.children].find(child=>child.classList.contains('action-icon')||child.classList.contains('header-cta-arrow'));
  if(box){box.classList.add('action-icon');return;}
  const svg=[...control.children].find(child=>child.tagName.toLowerCase()==='svg');
  box=document.createElement('span');box.className='action-icon';box.setAttribute('aria-hidden','true');
  if(svg){control.insertBefore(box,svg);box.append(svg);}
  else{
   const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.innerHTML='<path d="M4 12h15m-6-6 6 6-6 6"/>';box.append(icon);control.append(box);
  }
  if(control.matches('.smart-back')){for(const node of [...control.childNodes])if(node.nodeType===Node.TEXT_NODE)node.textContent=node.textContent.replace(/←\s*/g,'');box.dataset.direction='back';}
 }
 function scan(root){if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;if(root.matches?.(selector))normalise(root);root.querySelectorAll(selector).forEach(normalise);}
 scan(document);
 new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)scan(node);}).observe(document.body,{childList:true,subtree:true});
})();
