/* Fresh opens and reloads start at the FV; in-page and history navigation stay native. */
(() => {
  'use strict';
  const host = location.hostname;
  const isPreview = host === 'localhost' || host === '127.0.0.1' || host === '::1' ||
    /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (!isPreview) return;
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type === 'back_forward' || (!navigation && performance.navigation?.type === 2)) return;

  const restoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  if (location.hash) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }

  let readerInteracted = false;
  const interactionEvents = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
  const rememberInteraction = () => { readerInteracted = true; };
  for (const event of interactionEvents) {
    window.addEventListener(event, rememberInteraction, { passive: true, once: true });
  }
  window.addEventListener('pageshow', () => {
    requestAnimationFrame(() => {
      // Never pull a reader back after they have already begun navigating the page.
      if (!readerInteracted) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      history.scrollRestoration = restoration;
      for (const event of interactionEvents) window.removeEventListener(event, rememberInteraction);
    });
  }, { once: true });
})();
