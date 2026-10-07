/* Original ZERO implementation: a single reveal, then count up only when visible. */
(() => {
  'use strict';
  const hero = document.querySelector('#mv');
  if (!hero) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const counters = [...hero.querySelectorAll('[data-count-to]')];
  const played = new WeakSet();
  const pending = new Map();
  const frames = new Map();
  let revealTimer;
  let observer;
  let started = false;
  if (!motion.matches && !document.hidden) {
    hero.classList.add('hero-motion-pending');
  }

  function finishCounter(counter) {
    clearTimeout(pending.get(counter));
    cancelAnimationFrame(frames.get(counter));
    pending.delete(counter);
    frames.delete(counter);
    counter.textContent = counter.dataset.countTo;
  }
  function stopMotion() {
    hero.classList.remove('hero-is-animating', 'hero-motion-pending');
    clearTimeout(revealTimer);
    counters.forEach(finishCounter);
    observer?.disconnect();
  }
  function count(counter, delay) {
    if (played.has(counter)) return;
    played.add(counter);
    if (motion.matches || document.hidden) return finishCounter(counter);
    counter.textContent = '0';
    pending.set(counter, setTimeout(() => {
      pending.delete(counter);
      const start = performance.now();
      const target = Number(counter.dataset.countTo);
      function tick(now) {
        const progress = Math.min((now - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = String(Math.min(target, Math.floor(target * eased)));
        if (progress < 1) frames.set(counter, requestAnimationFrame(tick));
        else finishCounter(counter);
      }
      frames.set(counter, requestAnimationFrame(tick));
    }, delay));
  }
  function start() {
    if (started) return;
    started = true;
    hero.classList.remove('hero-motion-pending');
    if (motion.matches || document.hidden) return;
    const rect = hero.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < innerHeight;
    const startedAt = performance.now();
    // Desktop: two lead-in lines, audience, diagonal strip, story, title,
    // signature, then proof. Mobile omits the intro and starts at the strip.
    const mobile = matchMedia('(max-width:768px)').matches;
    const offset = mobile ? 0 : 980;
    const delays = {'intro-1':0,'intro-2':260,audience:520,story:offset+380,title:offset+700,signature:offset+1020};
    hero.querySelectorAll('[data-hero-step]').forEach(element => {
      element.style.setProperty('--hero-reveal-delay', `${delays[element.dataset.heroStep]}ms`);
    });
    hero.style.setProperty('--hero-banner-delay', `${offset}ms`);
    hero.style.setProperty('--hero-stats-delay', `${offset+1560}ms`);
    if (inView) {
      hero.classList.add('hero-is-animating');
      revealTimer = setTimeout(() => hero.classList.remove('hero-is-animating'), offset+2110);
    }
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const counter = entry.target.querySelector('[data-count-to]');
          const index = counters.indexOf(counter);
          const delay = Math.max(0, (inView ? offset+1650 : 0) - (performance.now() - startedAt)) + index * 170;
          count(counter, delay);
          observer.unobserve(entry.target);
        });
      }, {threshold:.3});
      counters.forEach(counter => observer.observe(counter.closest('.zero-hero-stat')));
    }
  }
  // A slow font delivery must not leave the first view hidden or delay it forever.
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(resolve => setTimeout(resolve, 1600))]).then(start);
  motion.addEventListener('change', event => { if (event.matches) stopMotion(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hero.classList.remove('hero-is-animating', 'hero-motion-pending');
      clearTimeout(revealTimer);
      for (const counter of [...pending.keys(), ...frames.keys()]) finishCounter(counter);
    }
  });
})();
