/* One-shot reveal of the approved transparent artwork. No image resampling. */
(() => {
  'use strict';
  const host = document.querySelector('#strategy-expansion .strategy-expansion__diagram');
  const image = host?.querySelector('img');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!image || reduced.matches || !window.IntersectionObserver || !Element.prototype.animate) return;

  const ns = 'http://www.w3.org/2000/svg';
  const width = 1672, height = 941;
  // Coordinates refer to the unchanged 1672 x 941 approved artwork. Panels and
  // connecting arrows are separate so the relationship appears after its nodes.
  const steps = [
    {name:'lp', delay:0, boxes:[[528,40,615,670]]},
    {name:'acquisition', delay:650, boxes:[[128,80,305,623]]},
    {name:'to-lp', delay:1020, boxes:[[433,333,95,73]]},
    {name:'response', delay:1330, boxes:[[1240,80,305,623]], holes:[[1305,190,205,58],[1305,536,205,134]]},
    {name:'to-response', delay:1700, boxes:[[1143,333,97,73]]},
    {name:'sales', delay:2010, boxes:[[1305,190,205,58],[1305,536,205,134]]},
    {name:'improvement', delay:2690, boxes:[[92,764,445,140],[92,753,233,11],[361,753,176,11]]},
    {name:'to-improvement', delay:3060, boxes:[[827,710,17,25],[337,723,507,14],[325,735,36,29]]},
    {name:'multilingual', delay:3370, boxes:[[615,753,444,151]]},
    {name:'to-multilingual', delay:3740, boxes:[[537,800,78,57]]},
    {name:'overseas', delay:4050, boxes:[[1137,753,445,151]]},
    {name:'to-overseas', delay:4420, boxes:[[1059,800,78,57]]}
  ];
  let stage, observer, timer, loadTimer, started = false, done = false;
  let viewportWidth = window.innerWidth;
  const animations = [];
  const make = (name, attrs = {}) => {
    const node = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    clearTimeout(loadTimer);
    observer?.disconnect();
    // Restore the original before discarding animation layers (also on errors).
    host.classList.remove('is-diagram-pending');
    host.dataset.diagramMotion = 'complete';
    animations.forEach(animation => animation.cancel());
    stage?.remove();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    reduced.removeEventListener('change', finish);
  }
  function onResize() {
    // Ignore mobile browser chrome height changes, but never leave clipped art
    // after a layout/orientation change.
    if (window.innerWidth !== viewportWidth) finish();
  }
  function onVisibility() { if (document.hidden) finish(); }
  function prepare() {
    if (done || reduced.matches || image.naturalWidth !== width || image.naturalHeight !== height) return;
    stage = make('svg', {viewBox:`0 0 ${width} ${height}`, 'aria-hidden':'true', focusable:'false', class:'strategy-expansion__stage'});
    const defs = make('defs');
    const mask = make('mask', {id:'strategy-expansion-reveal', maskUnits:'userSpaceOnUse', x:0, y:0, width, height, 'mask-type':'luminance'});
    mask.append(make('rect', {width, height, fill:'black'}));
    const groups = steps.map(step => {
      const group = make('g', {'data-diagram-piece':step.name});
      group.style.opacity = '0';
      for (const [x,y,w,h] of step.boxes) group.append(make('rect', {x,y,width:w,height:h,fill:'white'}));
      for (const [x,y,w,h] of step.holes || []) group.append(make('rect', {x,y,width:w,height:h,fill:'black'}));
      mask.append(group);
      return group;
    });
    defs.append(mask);
    stage.append(defs);
    const artwork = make('image', {width,height,mask:'url(#strategy-expansion-reveal)'});
    artwork.addEventListener('error', finish, {once:true});
    artwork.addEventListener('load', () => {
      if (done) return;
      clearTimeout(loadTimer);
      host.classList.add('is-diagram-pending');
      host.dataset.diagramMotion = 'ready';
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (done) return;
          if (started && !entry.isIntersecting) { finish(); return; }
          if (started || !entry.isIntersecting || entry.intersectionRect.height < Math.min(entry.boundingClientRect.height * .45, window.innerHeight * .45)) continue;
          started = true;
          host.dataset.diagramMotion = 'playing';
          groups.forEach((group, index) => animations.push(group.animate(
            [{opacity:0}, {opacity:1}],
            {duration:steps[index].name.startsWith('to-') ? 200 : 300, delay:steps[index].delay, fill:'forwards', easing:'cubic-bezier(.16,1,.3,1)'}
          )));
          timer = setTimeout(finish, 4820);
        }
      }, {threshold:[0,.1,.2,.3,.45,.6,1]});
      observer.observe(host);
    }, {once:true});
    stage.append(artwork);
    host.append(stage);
    loadTimer = setTimeout(finish, 8000);
    artwork.setAttribute('href', image.currentSrc || image.src);
    window.addEventListener('resize', onResize, {passive:true});
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', finish);
  }
  if (image.complete && image.naturalWidth) prepare();
  else {
    image.addEventListener('load', prepare, {once:true});
    image.addEventListener('error', finish, {once:true});
  }
})();
