/* Progressive enhancement: approved copy remains readable without JavaScript. */
(() => {
  'use strict';
  const root = document.getElementById('secret');
  if (!root || typeof window.matchMedia !== 'function') return;
  const mobile = window.matchMedia('(max-width: 768px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 260;
  let scrollToken = 0;
  const entries = Array.from(root.querySelectorAll('.secrets-white > h4 > .secrets-toggle')).map(button => ({
    button,
    box: button.closest('.secrets-white'),
    panel: document.getElementById(button.getAttribute('aria-controls')),
    mobileOpen: false,
    animation: null
  })).filter(entry => entry.panel);
  if (!entries.length) return;

  function cancel(entry) {
    if (entry.animation) entry.animation.cancel();
    entry.animation = null;
    entry.panel.classList.remove('is-animating');
    entry.panel.style.removeProperty('height');
  }

  function render(entry, animate = true) {
    const open = !mobile.matches || entry.mobileOpen;
    entry.button.disabled = !mobile.matches;
    entry.button.setAttribute('aria-expanded', String(open));
    entry.box.classList.toggle('is-collapsed', !open);
    cancel(entry);

    if (!mobile.matches || !animate || reduced.matches || typeof entry.panel.animate !== 'function') {
      entry.panel.hidden = !open;
      return Promise.resolve();
    }
    if (open) entry.panel.hidden = false;
    const start = open ? 0 : entry.panel.getBoundingClientRect().height;
    const end = open ? entry.panel.scrollHeight : 0;
    entry.panel.classList.add('zero-smooth-panel', 'is-animating');
    entry.animation = entry.panel.animate(
      [{ height: `${start}px`, opacity: open ? .35 : 1 }, { height: `${end}px`, opacity: open ? 1 : .35 }],
      { duration, easing: 'cubic-bezier(.25,.8,.25,1)' }
    );
    const animation = entry.animation;
    return animation.finished.catch(() => {}).then(() => {
      if (entry.animation !== animation) return;
      entry.panel.hidden = !open;
      entry.animation = null;
      entry.panel.classList.remove('is-animating');
      entry.panel.style.removeProperty('height');
    });
  }

  function setOnlyOpen(selected, animate = true) {
    const waits = [];
    for (const entry of entries) {
      entry.mobileOpen = entry === selected;
      waits.push(render(entry, animate));
    }
    return waits;
  }

  function cancelPendingScroll() {
    scrollToken += 1;
    window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    document.documentElement.classList.remove('zero-accordion-switching');
  }

  function alignOpenedHeading(button, waits, token) {
    document.documentElement.classList.add('zero-accordion-switching');
    Promise.allSettled(waits).then(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    })).then(() => {
      if (token !== scrollToken || button.getAttribute('aria-expanded') !== 'true') return;
      const header = document.getElementById('top-header');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const top = window.scrollY + button.getBoundingClientRect().top - Math.max(12, headerBottom + 12);
      window.scrollTo({ top: Math.max(0, top), behavior: reduced.matches ? 'auto' : 'smooth' });
    }).finally(() => {
      if (token === scrollToken) document.documentElement.classList.remove('zero-accordion-switching');
    });
  }

  function holdScrollAnchor(waits, token) {
    document.documentElement.classList.add('zero-accordion-switching');
    Promise.allSettled(waits).then(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    })).finally(() => {
      if (token === scrollToken) document.documentElement.classList.remove('zero-accordion-switching');
    });
  }

  function revealHash(scroll) {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target || !root.contains(target)) return;
    const entry = entries.find(item => item.panel.contains(target) || item.box.querySelector(':scope > h4') === target || item.button === target);
    const revealed = entry && entry.panel.hidden;
    if (entry) setOnlyOpen(entry, false);
    for (let ancestor = target; ancestor && ancestor !== root; ancestor = ancestor.parentElement) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
    }
    if (scroll && revealed) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'auto' }));
  }

  for (const entry of entries) {
    entry.button.addEventListener('click', () => {
      if (!mobile.matches) return;
      const switching = !entry.mobileOpen && entries.some(other => other !== entry && other.mobileOpen);
      cancelPendingScroll();
      const token = scrollToken;
      const waits = setOnlyOpen(entry.mobileOpen ? null : entry, true);
      entry.button.focus({ preventScroll: true });
      if (switching) alignOpenedHeading(entry.button, waits, token);
      else holdScrollAnchor(waits, token);
    });
    render(entry, false);
  }
  root.classList.add('secrets-accordion-ready');
  revealHash(true);
  window.addEventListener('hashchange', () => revealHash(true));
  const onModeChange = () => {
    for (const entry of entries) {
      entry.mobileOpen = false;
      render(entry, false);
    }
    revealHash(false);
  };
  if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', onModeChange);
  else mobile.addListener(onModeChange);
})();
