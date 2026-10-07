/* Keep the approved photo at viewport coordinates, clipped to each campaign.
   Unlike background-attachment:fixed, this also works in mobile browsers. */
(() => {
  'use strict';
  const layers = [...document.querySelectorAll('.offer-campaign-background')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const floating = document.querySelector('.sticky-consultation');
  const proposals = [...document.querySelectorAll('.cta-offer--gold .offer-proposal')];
  const buttons = [...document.querySelectorAll('.cta-offer--gold .offer-gift')];
  const visibleButtons = new Set();
  const updateMotion = () => buttons.forEach(button => {
    button.classList.toggle('is-in-view', visibleButtons.has(button) && !document.hidden && !reduced.matches);
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
  }
  document.addEventListener('visibilitychange', updateMotion);
  let frame = 0;
  const update = () => {
    frame = 0;
    updateMotion();
    layers.forEach(layer => {
      const pinned = !reduced.matches;
      layer.classList.toggle('is-viewport-pinned', pinned);
      const box = layer.parentElement.getBoundingClientRect();
      if (!pinned) layer.style.removeProperty('transform');
      else if (box.bottom > 0 && box.top < innerHeight) {
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
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  addEventListener('load', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(schedule);
    layers.forEach(layer => observer.observe(layer.parentElement));
  }
  if (reduced.addEventListener) reduced.addEventListener('change', schedule);
  else reduced.addListener(schedule);
  update();
})();
