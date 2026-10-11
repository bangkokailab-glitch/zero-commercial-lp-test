/* Run in the head: fresh visits start at the FV; reloads keep the reading position. */
(() => {
  'use strict';
  const entry = performance.getEntriesByType('navigation')[0];
  const type = entry?.type || ['navigate', 'reload', 'back_forward'][performance.navigation?.type] || 'navigate';
  const key = 'zeroLPReadingPosition';
  const path = location.pathname + location.search;
  const stored = history.state?.[key];
  const saved = type !== 'navigate' && stored?.version === 1 && stored.path === path ? stored : null;
  window.zeroPageStart = { key, path, type, saved, restoring: false, interrupted: false };
  // A reload without a bookmark and native history navigation use browser restoration.
  history.scrollRestoration = type === 'navigate' || saved ? 'manual' : 'auto';
  const hash = location.hash;
  if (hash && (type === 'navigate' || saved)) {
    history.replaceState(history.state, '', path);
    if (saved) window.zeroPageStart.hash = hash;
  }
  const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
  const stop = () => { window.zeroPageStart.interrupted = true; };
  events.forEach(event => addEventListener(event, stop, { passive: true, once: true }));
  addEventListener('pageshow', event => {
    if (!event.persisted && type === 'navigate' && !window.zeroPageStart.interrupted) {
      scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (!saved || !window.zeroPageStart.ready) {
      history.scrollRestoration = 'auto';
      if (saved && hash && !window.zeroPageStart.ready && !window.zeroPageStart.interrupted) history.replaceState(history.state, '', path + hash);
    }
    events.forEach(event => removeEventListener(event, stop));
  }, { once: true });
})();
