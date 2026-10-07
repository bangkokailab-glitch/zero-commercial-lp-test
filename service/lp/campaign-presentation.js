/* Shared moon scene: fixed-view framing, a distant rocket and compact CTAs. */
(() => {
  'use strict';
  const layers = [...document.querySelectorAll('.moon-scene')];
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
  // Coordinates measured on the generated 1672 x 940 artwork. Project them
  // through object-fit:cover so the live caption/rocket stay beside the moon.
  const placeMoon = layer => {
    const photo = layer.querySelector('.moon-scene__photo');
    if (!photo?.naturalWidth) return;
    const width = photo.clientWidth;
    const height = photo.clientHeight;
    const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
    const position = getComputedStyle(photo).objectPosition.split(' ').map(parseFloat);
    const x = 1509 / 1672 * photo.naturalWidth * scale - (photo.naturalWidth * scale - width) * position[0] / 100;
    const y = photo.offsetTop + 154 / 940 * photo.naturalHeight * scale - (photo.naturalHeight * scale - height) * position[1] / 100;
    layer.style.setProperty('--moon-x', `${x}px`);
    layer.style.setProperty('--moon-y', `${y}px`);
    layer.style.setProperty('--moon-radius', `${55 / 1672 * photo.naturalWidth * scale}px`);
  };
  let frame = 0;
  const update = () => {
    frame = 0;
    updateMotion();
    layers.forEach(layer => {
      // Static viewport framing: neither the city nor the distant rocket moves.
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
  const resize = () => { update(); layers.forEach(placeMoon); };
  document.addEventListener('visibilitychange', schedule);
  layers.forEach(layer => layer.querySelector('.moon-scene__photo')?.addEventListener('load', resize));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', resize);
  addEventListener('pageshow', resize);
  addEventListener('load', resize);
  window.visualViewport?.addEventListener('resize', resize);
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(resize);
    layers.forEach(layer => observer.observe(layer.parentElement));
  }
  if (reduced.addEventListener) reduced.addEventListener('change', resize);
  else reduced.addListener(resize);
  resize();
})();
