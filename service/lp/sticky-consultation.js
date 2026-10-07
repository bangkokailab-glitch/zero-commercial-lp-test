/* Keep the consultation available from the first view, with the side contents above it. */
(() => {
  'use strict';
  const dock = document.querySelector('.sticky-consultation');
  const link = dock?.querySelector('a');
  if (!dock || !link) return;
  dock.hidden = false;

  const contents = document.querySelector('.fix-menu');
  const toggle = contents?.querySelector('.fix-menu-toggle');
  if (toggle) {
    contents.classList.add('is-compact-ready');
    const setExpanded = expanded => {
      contents.classList.toggle('is-expanded', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? 'Contents −' : 'Contents ＋';
    };
    toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
    contents.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setExpanded(false)));
    document.addEventListener('pointerdown', event => { if (!contents.contains(event.target)) setExpanded(false); });
    contents.addEventListener('keydown', event => {
      if (event.key === 'Escape') { setExpanded(false); toggle.focus(); }
    });
  }

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
