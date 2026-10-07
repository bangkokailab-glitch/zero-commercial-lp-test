/* Reveal the contact circle after the first view and keep the side contents above it. */
(() => {
  'use strict';
  const dock = document.querySelector('.sticky-consultation');
  const link = dock?.querySelector('a');
  const hero = document.querySelector('#mv');
  if (!dock || !link) return;
  dock.hidden = false;

  const root = document.documentElement;
  root.classList.add('has-sticky-consultation');
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
    const heroBottom = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 0;
    const revealAt = heroBottom + window.innerWidth * 282 / 1920;
    const visible = window.scrollY > 0 && window.scrollY + window.innerHeight > revealAt;
    dock.classList.toggle('is-visible', visible);
    root.classList.toggle('has-floating-consultation', visible);
    link.tabIndex = visible ? 0 : -1;
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true });
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
