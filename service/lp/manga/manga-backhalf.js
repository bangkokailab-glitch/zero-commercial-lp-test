(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-auto-lane]').forEach(lane => {
    const viewport = lane.querySelector('.evidence-viewport');
    const group = lane.querySelector('.evidence-group');
    const toggle = lane.querySelector('.lane-toggle');
    if (!viewport || !group || !toggle) return;
    let cloned = false;
    let paused = reduced.matches, visible = false, touching = false, focused = false;
    let frame = 0, last = 0, position = 0, manualUntil = 0, resumeTimer = 0;
    let cycle = 0, geometryDirty = true;
    const speed = Number(lane.dataset.speed) || 18;
    const label = () => { toggle.textContent = paused ? '自動スクロールを再開' : '自動スクロールを停止'; toggle.setAttribute('aria-pressed', String(paused)); };
    const canRun = () => !paused && visible && !touching && !focused && !document.hidden;
    function measure() {
      if (!geometryDirty) return;
      cycle = group.getBoundingClientRect().width + (parseFloat(getComputedStyle(group.parentElement).columnGap) || 0);
      geometryDirty = false;
    }
    function prepareClone() {
      if (cloned) return;
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.inert = true;
      clone.querySelectorAll('img').forEach(img => img.alt = '');
      group.after(clone);
      cloned = true;
      geometryDirty = true;
    }
    function tick(time) {
      if (!canRun() || time < manualUntil) {frame = 0; last = 0; sync(); return;}
      measure();
      if (!cycle) { frame = 0; last = 0; return; }
      if (last) {
        position = (position + Math.min(time - last, 50) * speed / 1000) % cycle;
        viewport.scrollLeft = position;
      }
      last = time; frame = requestAnimationFrame(tick);
    }
    function sync() {
      clearTimeout(resumeTimer); resumeTimer = 0;
      const wait = manualUntil - performance.now();
      if (!canRun() || wait > 0) {
        cancelAnimationFrame(frame); frame = 0; last = 0;
        if (canRun() && wait > 0) resumeTimer = setTimeout(sync, wait + 20);
        return;
      }
      prepareClone();
      if (!frame) {position = viewport.scrollLeft; frame = requestAnimationFrame(tick);}
    }
    const invalidate = () => { geometryDirty = true; sync(); };
    toggle.addEventListener('click', () => {paused = !paused; label(); sync();});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {visible = entries[0].isIntersecting; sync();}, {threshold:0.05}).observe(lane);
    } else { visible = true; sync(); }
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(invalidate);
      observer.observe(group); observer.observe(viewport);
    } else window.addEventListener('resize', invalidate, {passive:true});
    group.querySelectorAll('img').forEach(img => img.addEventListener('load', invalidate, {once:true}));
    viewport.addEventListener('pointerdown', () => {touching = true; sync();});
    window.addEventListener('pointerup', () => {if(touching) {touching = false; manualUntil = performance.now() + 1600; sync();}});
    viewport.addEventListener('pointercancel', () => {touching = false; manualUntil = performance.now() + 1600; sync();});
    viewport.addEventListener('wheel', () => {manualUntil = performance.now() + 1600; position = viewport.scrollLeft; sync();}, {passive:true});
    viewport.addEventListener('scroll', () => {if(touching || focused || performance.now() < manualUntil) position = viewport.scrollLeft;}, {passive:true});
    viewport.addEventListener('focusin', () => {focused = true; sync();});
    viewport.addEventListener('focusout', event => {if(!viewport.contains(event.relatedTarget)) {focused = false; sync();}});
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', () => {if(reduced.matches) paused = true; label(); sync();});
    label();
  });
})();
