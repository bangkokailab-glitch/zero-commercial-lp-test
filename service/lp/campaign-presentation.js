/* Original hero background, shared with the first offer, and compact CTAs. */
(() => {
  'use strict';
  const layers = [...document.querySelectorAll('.shared-hero-background')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const floating = document.querySelector('.sticky-consultation');
  const proposals = [...document.querySelectorAll('.cta-offer--gold .offer-proposal, .pricing-proposal-cta')];
  const buttons = [...document.querySelectorAll('.cta-offer--gold .offer-gift, .pricing-proposal-cta .offer-gift')];
  const copyAnimations = new Map();
  const copyPulse = 180;
  const leadIn = 120;
  // Keep the approved 80% pulse speed and peak; move both lines as one unit.
  const copySpeed = .8;
  const copyPeak = 1.58 * .8;
  const copyCycle = leadIn + copyPulse + 660;
  const copyKeyframes = peak => {
    const keyframes = [{ offset: 0, transform: 'scale(1)' }];
    for (let sample = 0; sample <= 4; sample += 1) {
      const progress = sample / 4;
      const scale = 1 + (peak - 1) * Math.sin(progress * Math.PI) ** 2;
      keyframes.push({ offset: (leadIn + progress * copyPulse) / copyCycle, transform: `scale(${scale.toFixed(4)})`, easing: 'ease-in-out' });
    }
    keyframes.push({ offset: 1, transform: 'scale(1)' });
    return keyframes;
  };
  buttons.forEach(button => {
    if (typeof button.animate !== 'function') return;
    const copy = button.querySelector('.offer-gift__copy');
    const lines = [...button.querySelectorAll('.offer-gift__line')];
    if (!copy || !lines.length) return;
    // Keep a single accessible name for the two-line action.
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', lines.map(line => line.textContent.trim()).join(' '));
    copy.setAttribute('aria-hidden', 'true');
    const animation = copy.animate(copyKeyframes(copyPeak), { duration: copyCycle / copySpeed, iterations: Infinity, fill: 'both' });
    animation.pause();
    animation.currentTime = 0;
    copyAnimations.set(button, { animation, lines, peak: copyPeak });
  });
  const fitCopyMotion = () => copyAnimations.forEach((state, button) => {
    if (!button.clientWidth) return;
    // Only cap the peak when a narrow phone would push the text into the frame.
    const textWidth = Math.max(...state.lines.map(line => line.offsetWidth));
    const peak = Math.max(1, Math.min(copyPeak, (button.clientWidth - 8) / textWidth));
    if (Math.abs(peak - state.peak) < .0001) return;
    state.animation.effect.setKeyframes(copyKeyframes(peak));
    state.peak = peak;
  });
  const visibleButtons = new Set();
  const updateMotion = () => buttons.forEach(button => {
    const running = visibleButtons.has(button) && !document.hidden && !reduced.matches;
    button.classList.toggle('is-in-view', running);
    const animation = copyAnimations.get(button)?.animation;
    if (animation) {
      if (running && animation.playState !== 'running') animation.play();
      else if (!running && animation.playState === 'running') animation.pause();
      if (reduced.matches) animation.currentTime = 0;
    }
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
  const resize = () => { fitCopyMotion(); update(); };
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
