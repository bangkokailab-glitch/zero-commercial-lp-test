(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wipes = [...document.querySelectorAll('[data-manga-wipe]')];
  const masks = [...document.querySelectorAll('[data-speech-mask]')];
  const counters = [...document.querySelectorAll('[data-manga-count]')];
  const cue = document.querySelector('.manga-example__scroll-cue');
  const timers = new Map();
  const frames = new Map();
  let observer;
  const finish = element => {
    clearTimeout(timers.get(element));
    cancelAnimationFrame(frames.get(element));
    element.classList.remove('is-pending','is-entering','is-cue-entering');
    element.classList.add('is-shown');
    if (element.dataset.mangaCount) element.textContent = element.dataset.mangaCount;
  };
  function reveal(element) {
    if (element.classList.contains('is-shown')) return;
    observer?.unobserve(element);
    if (reduced.matches || document.hidden) return finish(element);
    if (element.dataset.mangaCount) {
      const target = Number(element.dataset.mangaCount);
      const begin = performance.now();
      element.textContent = '1';
      function tick(now) {
        const progress = Math.min((now - begin) / 1600, 1);
        element.textContent = String(Math.floor(1 + (target - 1) * (1 - (1 - progress) ** 3)));
        if (progress < 1) frames.set(element, requestAnimationFrame(tick));
        else finish(element);
      }
      frames.set(element, requestAnimationFrame(tick));
    } else if (element === cue) {
      element.classList.add('is-cue-entering');
      timers.set(element, setTimeout(() => finish(element), 850));
    } else {
      element.classList.replace('is-pending','is-entering');
      const speech = element.hasAttribute('data-speech-mask');
      const delay = parseFloat(getComputedStyle(element).getPropertyValue(speech ? '--speech-delay' : '--wipe-delay')) || 0;
      timers.set(element, setTimeout(() => finish(element), delay + (speech ? 180 : 850)));
    }
  }
  function start() {
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    wipes.forEach(element => {
      const copy = document.createElement('span');
      copy.className = 'manga-wipe__copy';
      copy.append(...element.childNodes);
      element.append(copy);
      const siblings = [...element.closest('.manga-hero__copy, .selected-heading').querySelectorAll('[data-manga-wipe]')];
      element.style.setProperty('--wipe-delay', `${siblings.indexOf(element) * 160}ms`);
      element.classList.add('is-pending');
    });
    masks.forEach(element => element.classList.add('is-pending'));
    counters.forEach(element => { element.textContent = '1'; });
    observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => reveal(entry.target));
    }, { threshold: .15, rootMargin: '0px 0px -155px 0px' });
    [...wipes,...masks,...counters,cue].filter(Boolean).forEach(element => observer.observe(element));
  }
  // Resolve font metrics, but do not leave the page waiting on a font server.
  Promise.race([document.fonts?.ready || Promise.resolve(), new Promise(resolve => setTimeout(resolve,1200))]).then(start);
  reduced.addEventListener('change', event => {
    if (event.matches) {
      observer?.disconnect();
      [...wipes,...masks,...counters,cue].filter(Boolean).forEach(finish);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) [...timers.keys(),...frames.keys()].forEach(finish);
  });
})();
