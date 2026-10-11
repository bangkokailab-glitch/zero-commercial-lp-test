/* A per-history-entry bookmark: no cookies, form values, or cross-tab storage. */
(() => {
  'use strict';
  const start = window.zeroPageStart;
  const main = document.querySelector('main');
  if (!start || !main) return;
  start.ready = true;
  let restoring = !!start.saved;
  let saveTimer;

  function address(element) {
    const steps = [];
    while (element && !element.id && element !== main) {
      steps.unshift(Array.prototype.indexOf.call(element.parentElement.children, element));
      element = element.parentElement;
    }
    return element ? { id: element.id, main: element === main, steps } : null;
  }
  function resolve(mark) {
    let element = mark?.main ? main : document.getElementById(mark?.id || '');
    for (const index of mark?.steps || []) element = element?.children[index];
    return element && main.contains(element) ? element : null;
  }
  function bookmark() {
    const header = document.getElementById('top-header');
    const y = Math.min(innerHeight / 2, (header?.getBoundingClientRect().bottom || 0) + 40);
    const elements = document.elementsFromPoint(innerWidth / 2, Math.max(1, y));
    for (const element of elements) {
      if (!main.contains(element)) continue;
      const block = element.closest('p,h1,h2,h3,h4,h5,li,figure,table,article,section,[id]');
      if (!block || !main.contains(block) || block.closest('.fix-menu, #top-header')) continue;
      const target = address(block);
      if (target) return { ...target, top: block.getBoundingClientRect().top };
    }
    return null;
  }
  function save() {
    clearTimeout(saveTimer);
    if (restoring) return;
    // Keep unrelated history state untouched. Restricted storage must not break navigation.
    try {
      const state = history.state;
      if (state !== null && (typeof state !== 'object' || Array.isArray(state))) return;
      history.replaceState({ ...state, [start.key]: {
        version: 1, path: location.pathname + location.search, y: scrollY, anchor: bookmark(),
        expanded: [...main.querySelectorAll('button[aria-expanded="true"][aria-controls]:not(:disabled)')].map(button => button.getAttribute('aria-controls')),
        details: [...main.querySelectorAll('details[open]')].map(address),
        swipes: Object.fromEntries([...main.querySelectorAll('[id][data-reading-card]')].map(track => [track.id, Number(track.dataset.readingCard)]))
      } }, '');
    } catch { /* Native scroll restoration remains available. */ }
  }
  addEventListener('scroll', () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 200); }, { passive: true });
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  if (!start.saved) return;
  const saved = start.saved;
  // Use the existing controls so their internal state stays consistent after restoration.
  start.restoring = true;
  if (!start.interrupted) {
    main.querySelectorAll('button[aria-controls]').forEach(button => {
      if (!button.disabled && saved.expanded?.includes(button.getAttribute('aria-controls')) && button.getAttribute('aria-expanded') !== 'true') button.click();
    });
    for (const mark of saved.details || []) {
      const detail = resolve(mark);
      if (detail?.tagName !== 'DETAILS') continue;
      detail.open = true;
      detail.querySelector(':scope > summary')?.setAttribute('aria-expanded', 'true');
      const panel = detail.querySelector(':scope > div');
      if (panel) panel.hidden = false;
    }
  }
  start.restoring = false;
  if (start.hash && !start.interrupted) history.replaceState(history.state, '', start.path + start.hash);

  let observer, frame, deadline;
  const events = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'click', 'hashchange'];
  const finish = () => {
    if (!restoring) return;
    restoring = false;
    observer?.disconnect();
    cancelAnimationFrame(frame);
    clearTimeout(deadline);
    events.forEach(event => removeEventListener(event, finish));
    document.removeEventListener('load', correct, true);
    history.scrollRestoration = 'auto';
  };
  function correct() {
    if (!restoring) return;
    if (start.interrupted) { finish(); return; }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!restoring) return;
      const anchor = resolve(saved.anchor);
      const top = anchor?.getClientRects().length ? scrollY + anchor.getBoundingClientRect().top - saved.anchor.top : saved.y;
      if (Number.isFinite(top)) scrollTo({ top: Math.max(0, top), left: 0, behavior: 'instant' });
    });
  }
  events.forEach(event => addEventListener(event, finish, { passive: true, once: true }));
  addEventListener('pagehide', () => { finish(); save(); });
  // Correct layout changes from web fonts and nearby lazy images, not a continuous scroll loop.
  if (typeof ResizeObserver === 'function') {
    observer = new ResizeObserver(correct);
    observer.observe(main);
  }
  document.addEventListener('load', correct, true);
  document.fonts?.ready.then(correct);
  addEventListener('pageshow', correct, { once: true });
  deadline = setTimeout(finish, 8000);
  correct();
})();
