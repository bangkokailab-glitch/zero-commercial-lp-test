/* Band-first headings and gentle image entrances. No scroll hijacking or replay. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pending = new Set();
  const running = new Map();
  const loading = new WeakSet();
  let observer;

  document.querySelectorAll('#secret .secrets-renovated').forEach(chapter => {
    chapter.querySelectorAll('.secrets-white > h4 > .secrets-toggle').forEach((button, index) => {
      if (button.querySelector('.zero-subheading-number')) return;
      const copy = button.querySelector('.secrets-toggle-copy');
      // Chapter 07 already has circled ordinals: replace them, never double-number.
      if (copy?.firstChild?.nodeType === Node.TEXT_NODE) {
        copy.firstChild.textContent = copy.firstChild.textContent.replace(/^[①-⑳]\s*/, '');
      }
      const number = document.createElement('span');
      number.className = 'zero-subheading-number';
      number.textContent = String(index + 1).padStart(2, '0');
      button.prepend(number);
      button.classList.add('zero-numbered-heading');
    });
  });

  const selectors = [
    '#worry .worry-h2', '#worry p.lines', '#worry p.dot', '#works > h2',
    '.secret-cover-a__live-title', '.secret-cover-a__live-lockup',
    '.secret-cover-a__phases', '.secret-cover-a__description > p',
    '#secret .secrets-renovated > .wrap > h3',
    '#secret .secrets-white > h4 .secrets-toggle-copy',
    '#secret .secrets-closing--text > p'
  ];
  const wipes = [...document.querySelectorAll(selectors.join(','))].map(target => {
    const wipe = document.createElement('span');
    wipe.className = 'zero-content-wipe';
    const copy = document.createElement('span');
    copy.className = 'zero-content-wipe__copy';
    copy.append(...target.childNodes);
    // Keep authored breaks, while balancing each phrase on narrow screens.
    if (target.matches('.secrets-toggle-copy') && copy.querySelector(':scope > br')) {
      const nodes = [...copy.childNodes];
      copy.replaceChildren();
      let line = document.createElement('span');
      line.className = 'zero-subheading-line';
      copy.append(line);
      nodes.forEach(node => {
        if (node.nodeName === 'BR') {
          line = document.createElement('span');
          line.className = 'zero-subheading-line';
          copy.append(line);
        } else line.append(node);
      });
    }
    wipe.append(copy);
    target.append(wipe);
    return wipe;
  });
  const images = [...document.querySelectorAll('#secret .secrets-renovated img')];
  images.forEach(image => image.classList.add('zero-secret-image'));

  // The band follows each rendered line, including mobile line breaks. It never
  // fills the heading's surrounding margins/padding or overlaps another heading.
  function measureBars(wipe) {
    const copy = wipe.querySelector('.zero-content-wipe__copy');
    const origin = wipe.getBoundingClientRect();
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
    const lines = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        const line = lines.find(row => Math.min(row.bottom, rect.bottom) - Math.max(row.top, rect.top) > Math.min(row.bottom - row.top, rect.height) * .5);
        if (line) {
          line.left = Math.min(line.left, rect.left);
          line.right = Math.max(line.right, rect.right);
          line.top = Math.min(line.top, rect.top);
          line.bottom = Math.max(line.bottom, rect.bottom);
        } else lines.push({left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom});
      }
    }
    const bars = document.createElement('span');
    bars.className = 'zero-content-wipe__bars';
    bars.setAttribute('aria-hidden', 'true');
    lines.forEach(line => {
      const bar = document.createElement('span');
      bar.className = 'zero-content-wipe__bar';
      bar.style.cssText = `left:${line.left-origin.left}px;top:${line.top-origin.top}px;width:${line.right-line.left}px;height:${line.bottom-line.top}px`;
      bars.append(bar);
    });
    wipe.append(bars);
  }

  function finish(target) {
    clearTimeout(running.get(target));
    running.delete(target);
    pending.delete(target);
    observer?.unobserve(target);
    target.classList.remove('is-content-pending', 'is-content-entering');
    target.classList.add('is-content-shown');
    target.style.removeProperty('--content-delay');
    target.querySelector(':scope > .zero-content-wipe__bars')?.remove();
  }
  function show(target, delay = 0) {
    if (!pending.has(target)) return;
    // A lazy, large diagram should animate when its pixels arrive, not use up
    // its entrance while the visitor is still waiting for the download.
    if (target.tagName === 'IMG' && !target.complete) {
      if (!loading.has(target)) {
        loading.add(target);
        const ready = () => {
          target.removeEventListener('load', ready);
          target.removeEventListener('error', ready);
          loading.delete(target);
          const rect = target.getBoundingClientRect();
          if (rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight) show(target);
        };
        target.addEventListener('load', ready);
        target.addEventListener('error', ready);
      }
      return;
    }
    pending.delete(target);
    observer.unobserve(target);
    if (reduced.matches || document.hidden || (target.tagName === 'IMG' && !target.naturalWidth)) return finish(target);
    if (target.classList.contains('zero-content-wipe')) measureBars(target);
    target.style.setProperty('--content-delay', `${delay}ms`);
    target.classList.replace('is-content-pending', 'is-content-entering');
    // Always settle, including an accordion closed during its entrance.
    running.set(target, setTimeout(() => finish(target), delay + 850));
  }
  function stop() {
    [...pending, ...running.keys()].forEach(finish);
    observer?.disconnect();
  }
  function start() {
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      const entering = entries.filter(entry => entry.isIntersecting && entry.intersectionRect.height > 0)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      entering.forEach((entry, index) => show(entry.target, Math.min(index * 100, 400)));
    }, {threshold: 0, rootMargin: '0px 0px -6% 0px'});
    [...wipes, ...images].forEach(target => {
      pending.add(target);
      target.classList.add('is-content-pending');
      observer.observe(target);
    });
  }
  // Wait for font metrics without making a slow font host a blocking dependency.
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(resolve => setTimeout(resolve, 1600))]).then(start);
  reduced.addEventListener('change', event => { if (event.matches) stop(); });
  window.addEventListener('resize', () => [...running.keys()].forEach(finish), {passive: true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) [...running.keys()].forEach(finish);
  });
  document.addEventListener('focusin', event => {
    const heading = event.target.closest('.secrets-toggle');
    heading?.querySelectorAll('.zero-content-wipe').forEach(finish);
  });
})();
