(() => {
  const variants=[...document.querySelectorAll('[data-variant]')];
  const buttons=[...document.querySelectorAll('[data-preview-choice]')];
  function select(id){
    if(!'abc'.includes(id)||id.length!==1)id='a';
    variants.forEach(el=>{el.hidden=el.dataset.variant!==id;if(el.hidden)el.querySelector('video').pause()});
    buttons.forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.previewChoice===id)));
    history.replaceState(null,'','#'+id);
  }
  buttons.forEach(el=>el.addEventListener('click',()=>select(el.dataset.previewChoice)));
  document.querySelector('.preview-replay').addEventListener('click',()=>{
    const active=variants.find(el=>!el.hidden),map=active.querySelector('.strategy-map');
    map.scrollIntoView({block:'start',behavior:'auto'});
    map.dispatchEvent(new Event('strategy:replay'));
    const video=active.querySelector('video');
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){if(!video.src)video.src=video.dataset.src;video.play().catch(()=>{})}
  });
  select(location.hash.slice(1)||'a');
})();
