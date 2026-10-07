/* Measure the always-visible, server-rendered CTA without changing its approved markup. */
(() => {
  'use strict';
  const dock = document.querySelector('.sticky-consultation');
  const link = dock?.querySelector('a');
  if (!dock || !link) return;
  dock.hidden = false;

  const root = document.documentElement;
  root.classList.add('has-sticky-consultation');
  let queued = false;
  let lastSpace = '';
  function update() {
    queued = false;
    // Dock height includes the actual CTA and the existing safe-area padding.
    const space = `${Math.ceil(dock.getBoundingClientRect().height) + 8}px`;
    if (space !== lastSpace) {
      root.style.setProperty('--sticky-consultation-space', space);
      lastSpace = space;
    }
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  for (const image of link.querySelectorAll('img')) image.addEventListener('load', schedule);
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(schedule);
    resize.observe(link);
    resize.observe(dock);
  }
  update();
})();
