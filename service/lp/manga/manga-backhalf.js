(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-auto-lane]').forEach(lane => {
    const viewport = lane.querySelector('.evidence-viewport');
    const group = lane.querySelector('.evidence-group');
    const toggle = lane.querySelector('.lane-toggle');
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.querySelectorAll('img').forEach(img => img.alt = '');
    group.after(clone);
    let paused = reduced.matches, visible = false, touching = false, focused = false;
    let frame = 0, last = 0, position = 0, manualUntil = 0;
    const label = () => { toggle.textContent = paused ? '自動スクロールを再開' : '自動スクロールを停止'; toggle.setAttribute('aria-pressed', String(paused)); };
    const canRun = () => !paused && visible && !touching && !focused && !document.hidden;
    function tick(time) {
      if (!canRun()) {frame = 0; last = 0; return;}
      if (last && time > manualUntil) {
        const cycle = group.getBoundingClientRect().width + 14;
        position += Math.min(time - last, 50) * Number(lane.dataset.speed) / 1000;
        if (position >= cycle) position -= cycle;
        viewport.scrollLeft = position;
      }
      last = time; frame = requestAnimationFrame(tick);
    }
    function sync() {
      if (canRun() && !frame) {position = viewport.scrollLeft; frame = requestAnimationFrame(tick);}
      else if (!canRun() && frame) {cancelAnimationFrame(frame); frame = 0; last = 0;}
    }
    toggle.addEventListener('click', () => {paused = !paused; label(); sync();});
    new IntersectionObserver(entries => {visible = entries[0].isIntersecting; sync();}, {threshold:0.05}).observe(lane);
    viewport.addEventListener('pointerdown', () => {touching = true; sync();});
    window.addEventListener('pointerup', () => {if(touching) {touching = false; manualUntil = performance.now() + 1600; sync();}});
    viewport.addEventListener('pointercancel', () => {touching = false; manualUntil = performance.now() + 1600; sync();});
    viewport.addEventListener('wheel', () => {manualUntil = performance.now() + 1600; position = viewport.scrollLeft;}, {passive:true});
    viewport.addEventListener('scroll', () => {if(touching || focused || performance.now() < manualUntil) position = viewport.scrollLeft;}, {passive:true});
    lane.addEventListener('focusin', () => {focused = true; sync();});
    lane.addEventListener('focusout', event => {if(!lane.contains(event.relatedTarget)) {focused = false; sync();}});
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', () => {if(reduced.matches) paused = true; label(); sync();});
    label();
  });
})();
