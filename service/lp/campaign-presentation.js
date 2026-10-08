/* Original hero background, shared with the first offer, and compact CTAs. */
(() => {
  'use strict';
  const layers = [...document.querySelectorAll('.shared-hero-background')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const floating = document.querySelector('.sticky-consultation');
  const proposals = [...document.querySelectorAll('.cta-offer--gold .offer-proposal, .pricing-proposal-cta')];
  const buttons = [...document.querySelectorAll('.cta-offer--gold .offer-gift, .pricing-proposal-cta .offer-gift')];
  // The complete copy now uses the floating consultation label's shared CSS
  // keyframes. No second JS pulse or character-by-character animation.
  buttons.forEach(button => {
    const copy = button.querySelector('.offer-gift__copy');
    const lines = [...button.querySelectorAll('.offer-gift__line')];
    if (!copy || !lines.length) return;
    // Keep a single accessible name for the two-line action.
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', lines.map(line => line.textContent.trim()).join(' '));
    copy.setAttribute('aria-hidden', 'true');
  });
  const visibleButtons = new Set();
  const updateMotion = () => buttons.forEach(button => {
    const running = visibleButtons.has(button) && !document.hidden && !reduced.matches;
    button.classList.toggle('is-in-view', running);
  });
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleButtons.add(entry.target);
        else visibleButtons.delete(entry.target);
      });
      updateMotion();
    }, { threshold: 0 });
    buttons.forEach(button => observer.observe(button));
  } else {
    buttons.forEach(button => visibleButtons.add(button));
  }
  let frame = 0;
  const update = () => {
    frame = 0;
    updateMotion();
    layers.forEach(layer => {
      // Keep one viewport-sized background behind both sections on mobile too.
      layer.classList.add('is-viewport-pinned');
      const box = layer.parentElement.getBoundingClientRect();
      if (box.bottom > 0 && box.top < innerHeight) {
        layer.style.transform = `translate3d(0, ${-box.top}px, 0)`;
      }
    });
    // A duplicate floating CTA must not obscure the gift or its conditions.
    const floatingBox = floating?.getBoundingClientRect();
    const overlaps = innerWidth <= 768 && floatingBox && proposals.some(proposal => {
      const box = proposal.getBoundingClientRect();
      return box.top < floatingBox.bottom && box.bottom > floatingBox.top && box.right > floatingBox.left && box.left < floatingBox.right;
    });
    document.documentElement.classList.toggle('gift-cta-overlaps-floating', Boolean(overlaps));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const resize = update;
  document.addEventListener('visibilitychange', schedule);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', resize);
  addEventListener('pageshow', resize);
  addEventListener('load', resize);
  window.visualViewport?.addEventListener('resize', resize);
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(resize);
    layers.forEach(layer => observer.observe(layer.parentElement));
    buttons.forEach(button => observer.observe(button));
  }
  if (reduced.addEventListener) reduced.addEventListener('change', resize);
  else reduced.addListener(resize);
  document.fonts?.ready.then(resize);
  resize();
})();
