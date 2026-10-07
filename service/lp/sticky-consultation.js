/* Keep the consultation available from the first view, with the side contents above it. */
(() => {
  'use strict';
  const dock = document.querySelector('.sticky-consultation');
  const link = dock?.querySelector('a');
  if (!dock || !link) return;
  dock.hidden = false;

  const root = document.documentElement;
  root.classList.add('has-sticky-consultation', 'has-floating-consultation');
  dock.classList.add('is-visible');
  link.tabIndex = 0;
  let queued = false;
  let lastSpace = '';
  function update() {
    queued = false;
    const dockStyle = getComputedStyle(dock);
    const space = `${Math.ceil(dock.getBoundingClientRect().height + parseFloat(dockStyle.bottom)) + 16}px`;
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
