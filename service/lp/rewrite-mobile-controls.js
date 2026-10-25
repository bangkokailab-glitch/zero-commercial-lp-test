/* Only move existing nodes; keep the shared menu, links and page scrolling. */
(() => {
  'use strict';

  function install() {
    const body = document.body;
    if (body?.dataset.editorialVersion !== '20261026' ||
        body.dataset.rewriteMobileControls === 'ready') return;

    const menu = body.querySelector('.fix-menu.pc');
    const toggle = menu?.querySelector('.fix-menu-toggle');
    const consultation = body.querySelector('.sticky-consultation');
    if (!menu || !toggle || !consultation || !menu.classList.contains('is-compact-ready')) return;
    body.dataset.rewriteMobileControls = 'ready';

    const root = document.documentElement;
    const media = matchMedia('(max-width: 768px)');
    const menuHome = document.createComment('Editorial mobile menu return point');
    const consultationHome = document.createComment('Editorial mobile CTA return point');
    menu.before(menuHome);
    consultation.before(consultationHome);

    let bar = null;
    let frame = 0;
    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(scheduleMeasure) : null;

    function measure() {
      frame = 0;
      if (!bar || !media.matches) return;
      const height = `${Math.ceil(bar.getBoundingClientRect().height)}px`;
      const header = document.getElementById('top-header');
      const headerHeight = `${Math.ceil(header?.getBoundingClientRect().height || 0)}px`;
      if (root.style.getPropertyValue('--rewrite-mobile-controls-height') !== height) {
        root.style.setProperty('--rewrite-mobile-controls-height', height);
      }
      if (root.style.getPropertyValue('--rewrite-mobile-header-height') !== headerHeight) {
        root.style.setProperty('--rewrite-mobile-header-height', headerHeight);
      }
    }

    function scheduleMeasure() {
      if (!frame && bar) frame = requestAnimationFrame(measure);
    }

    function closeMenu() {
      if (toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    }

    function updateMode() {
      if (media.matches) {
        if (!bar) {
          bar = document.createElement('div');
          bar.className = 'rewrite-mobile-controls';
          bar.setAttribute('role', 'group');
          bar.setAttribute('aria-label', '目次とLP制作の相談');
          body.append(bar);
          bar.append(menu, consultation);
          root.classList.add('has-rewrite-mobile-controls');
          body.classList.add('has-rewrite-mobile-controls');
          resizeObserver?.observe(bar);
          const header = document.getElementById('top-header');
          if (header) resizeObserver?.observe(header);
        }
        measure();
      } else if (bar) {
        closeMenu();
        resizeObserver?.disconnect();
        cancelAnimationFrame(frame);
        frame = 0;
        menuHome.after(menu);
        consultationHome.after(consultation);
        bar.remove();
        bar = null;
        root.classList.remove('has-rewrite-mobile-controls');
        body.classList.remove('has-rewrite-mobile-controls');
        root.style.removeProperty('--rewrite-mobile-controls-height');
        root.style.removeProperty('--rewrite-mobile-header-height');
      }
    }

    // The shared handler covers Escape inside the menu. This also closes the
    // non-modal list if keyboard focus has moved elsewhere on the page.
    document.addEventListener('keydown', event => {
      if (bar && event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus({ preventScroll: true });
      }
    });

    if (media.addEventListener) media.addEventListener('change', updateMode);
    else media.addListener(updateMode);
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    window.addEventListener('pageshow', scheduleMeasure);
    window.visualViewport?.addEventListener('resize', scheduleMeasure);
    document.fonts?.ready.then(scheduleMeasure);
    updateMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
