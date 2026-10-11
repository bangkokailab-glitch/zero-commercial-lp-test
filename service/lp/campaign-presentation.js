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
  // Position the approved oval beside the copy where possible. Measure offsets
  // (not animated client rects) so its tail stays stable while the label pulses.
  const priceButtons = buttons.filter(button => button.querySelector('.offer-price-bubble'));
  const pointInButton = (element, button) => {
    let x = 0, y = 0;
    for (let node = element; node && node !== button; node = node.offsetParent) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    return { x, y };
  };
  const positionPrices = () => priceButtons.forEach(button => {
    const bubble = button.querySelector('.offer-price-bubble');
    const shape = bubble.querySelector('svg');
    const path = shape.querySelector('path');
    const lines = button.querySelectorAll('.offer-gift__line');
    if (lines.length < 2) return;
    const first = pointInButton(lines[0], button);
    const second = pointInButton(lines[1], button);
    const buttonBox = button.getBoundingClientRect();
    const left = Math.max(-70, 12 - buttonBox.left);
    // Allow clearance for the original label's 1.08 peak-scale animation.
    const copyWidth = button.querySelector('.offer-gift__copy').offsetWidth;
    const available = first.x - copyWidth * .04 - 16 - left;
    const above = available < 205;
    const width = above ? (innerWidth <= 768 ? 170 : 200) : Math.min(250, available);
    const height = width * .44;
    const x = above ? Math.max(-8, 12 - buttonBox.left) : left;
    const y = above ? -height - 6 : -height * .20;
    button.parentElement.classList.toggle('offer-proposal--price-above', above);
    button.parentElement.classList.add('price-layout-ready');
    bubble.style.setProperty('--price-bubble-width', width + 'px');
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';
    shape.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    const tx = second.x - x - copyWidth * .04 - 5;
    const ty = second.y - y + lines[1].offsetHeight * .5;
    const w = width, h = height;
    const outline = above
      ? `M ${w/2} 2 C ${w*.775} 2 ${w-2} ${h*.24} ${w-2} ${h/2}
         C ${w-2} ${h*.775} ${w*.775} ${h-2} ${w/2} ${h-2}
         C ${w*.34} ${h-2} ${w*.20} ${h*.93} ${w*.12} ${h*.83}
         Q ${-x-12} ${h+14} ${tx} ${ty}
         Q ${-x-20} ${h+5} ${w*.055} ${h*.68}
         C ${w*.02} ${h*.62} 2 ${h*.56} 2 ${h/2}
         C 2 ${h*.24} ${w*.225} 2 ${w/2} 2 Z`
      : `M ${w/2} 2 C ${w*.775} 2 ${w-2} ${h*.24} ${w-2} ${h/2}
         C ${w-2} ${h*.685} ${w*.88} ${h*.84} ${w*.76} ${h*.925}
         Q ${w*.83} ${h*1.05} ${tx} ${ty}
         Q ${w*.76} ${h*1.07} ${w*.65} ${h*.975}
         C ${w*.60} ${h*.99} ${w*.55} ${h-2} ${w/2} ${h-2}
         C ${w*.225} ${h-2} 2 ${h*.775} 2 ${h/2}
         C 2 ${h*.24} ${w*.225} 2 ${w/2} 2 Z`;
    path.setAttribute('d', outline);
  });
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
  const resize = () => { positionPrices(); update(); };
  document.addEventListener('visibilitychange', schedule);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', resize);
  addEventListener('pageshow', resize);
  addEventListener('load', resize);
  window.visualViewport?.addEventListener('resize', resize);
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(resize);
    layers.forEach(layer => observer.observe(layer.parentElement));
    buttons.forEach(button => {
      observer.observe(button);
      const copy = button.querySelector('.offer-gift__copy');
      if (copy) observer.observe(copy);
    });
  }
  if (reduced.addEventListener) reduced.addEventListener('change', resize);
  else reduced.addListener(resize);
  document.fonts?.ready.then(resize);
  document.fonts?.addEventListener('loadingdone', resize);
  resize();
})();
