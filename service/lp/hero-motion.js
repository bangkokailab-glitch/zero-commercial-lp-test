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
  const animations = [];
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
    animations.forEach(animation => animation.cancel());
    counters.forEach(finishCounter);
    observer?.disconnect();
  }
  function count(counter, delay) {
    if (played.has(counter)) return;
    played.add(counter);
    if (motion.matches || document.hidden) return finishCounter(counter);
    counter.textContent = '1';
    pending.set(counter, setTimeout(() => {
      pending.delete(counter);
      const start = performance.now();
      const target = Number(counter.dataset.countTo);
      function tick(now) {
        const progress = Math.min((now - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = String(Math.min(target, Math.floor(1 + (target - 1) * eased)));
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
    if (inView) {
      hero.classList.add('hero-is-animating');
      [...hero.querySelectorAll('.zero-hero-intro>p,.zero-hero-legacy-banner')].forEach((element, index) => {
        animations.push(element.animate([{opacity:0,translate:'0 12px'}, {opacity:1,translate:'0 0'}], {
          duration:600,delay:index*100,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'
        }));
      });
      setTimeout(() => hero.classList.remove('hero-is-animating'), 1650);
    }
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const counter = entry.target.querySelector('[data-count-to]');
          const index = counters.indexOf(counter);
          const delay = Math.max(0, (inView ? 1050 : 0) - (performance.now() - startedAt)) + index * 170;
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
      for (const counter of [...pending.keys(), ...frames.keys()]) finishCounter(counter);
    }
  });
})();
