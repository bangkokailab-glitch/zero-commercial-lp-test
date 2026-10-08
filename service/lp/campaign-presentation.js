/* Original hero background, shared with the first offer, and compact CTAs. */
(() => {
  'use strict';
  const layers = [...document.querySelectorAll('.shared-hero-background')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const floating = document.querySelector('.sticky-consultation');
  const proposals = [...document.querySelectorAll('.cta-offer--gold .offer-proposal, .pricing-proposal-cta')];
  const buttons = [...document.querySelectorAll('.cta-offer--gold .offer-gift, .pricing-proposal-cta .offer-gift')];
  const characterAnimations = new Map();
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'grapheme' }) : null;
  const characterStep = 90;
  const characterPulse = 180;
  const leadIn = 120;
  buttons.forEach(button => {
    if (typeof button.animate !== 'function') return;
    const copy = button.querySelector('.offer-gift__copy');
    const lines = [...button.querySelectorAll('.offer-gift__line')];
    if (!copy || !lines.length || copy.querySelector('.offer-gift__character')) return;
    // Keep the accessible name as one sentence, not 27 individually read letters.
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', lines.map(line => line.textContent.trim()).join(' '));
    copy.setAttribute('aria-hidden', 'true');
    const characters = [];
    const rows = lines.map(line => {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const row = [];
      nodes.forEach(node => {
        const parts = segmenter ? [...segmenter.segment(node.textContent)].map(part => part.segment) : Array.from(node.textContent);
        const fragment = document.createDocumentFragment();
        parts.forEach(text => {
          if (!text.trim()) { fragment.append(document.createTextNode(text)); return; }
          const span = document.createElement('span');
          span.className = 'offer-gift__character';
          span.textContent = text;
          row.push(characters.length);
          characters.push(span);
          fragment.append(span);
        });
        node.replaceWith(fragment);
      });
      return row;
    });
    const cycle = leadIn + (characters.length - 1) * characterStep + characterPulse + 660;
    const pulseAt = (index, time) => {
      if (index === undefined) return 0;
      const progress = (time - leadIn - index * characterStep) / characterPulse;
      return progress <= 0 || progress >= 1 ? 0 : Math.sin(progress * Math.PI) ** 2;
    };
    const animations = [];
    rows.forEach(row => row.forEach((index, position) => {
      const previous = row[position - 1], next = row[position + 1];
      const times = new Set([0, cycle]);
      [previous, index, next].filter(value => value !== undefined).forEach(value => {
        for (let sample = 0; sample <= 4; sample += 1) times.add(leadIn + value * characterStep + sample * characterPulse / 4);
      });
      const keyframes = [...times].sort((a, b) => a - b).map(time => {
        // Neighbours make room without changing line width or button height.
        const shift = .31 * (pulseAt(previous, time) - pulseAt(next, time));
        const scale = 1 + .58 * pulseAt(index, time);
        return { offset: time / cycle, transform: `translateX(${shift.toFixed(4)}em) scale(${scale.toFixed(4)})`, easing: 'ease-in-out' };
      });
      const animation = characters[index].animate(keyframes, { duration: cycle, iterations: Infinity, fill: 'both' });
      animation.pause();
      animation.currentTime = 0;
      animations.push(animation);
    }));
    characterAnimations.set(button, animations);
  });
  const visibleButtons = new Set();
  const updateMotion = () => buttons.forEach(button => {
    const running = visibleButtons.has(button) && !document.hidden && !reduced.matches;
    button.classList.toggle('is-in-view', running);
    characterAnimations.get(button)?.forEach(animation => {
      if (running && animation.playState !== 'running') animation.play();
      else if (!running && animation.playState === 'running') animation.pause();
      if (reduced.matches) animation.currentTime = 0;
    });
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
  }
  if (reduced.addEventListener) reduced.addEventListener('change', resize);
  else reduced.addListener(resize);
  resize();
})();
