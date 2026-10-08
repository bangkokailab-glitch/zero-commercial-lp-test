/* Animate only real case figures, once, when their panel is visible. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const counters = [...document.querySelectorAll('#works [data-work-count]')];
  const panels = [...document.querySelectorAll('#works .work-metric-band')];
  const frames = new Map();
  const timers = new Map();
  const played = new WeakSet();
  let observer;
  const finalValue = counter => Number(counter.dataset.workCount).toFixed(2);
  function finish(counter) {
    cancelAnimationFrame(frames.get(counter));
    frames.delete(counter);
    counter.textContent = finalValue(counter);
  }
  function finishPanel(panel) {
    clearTimeout(timers.get(panel));
    timers.delete(panel);
    panel.classList.remove('is-metric-entering');
  }
  function stop() {
    counters.forEach(finish);
    panels.forEach(finishPanel);
    observer?.disconnect();
  }
  if (motion.matches || !('IntersectionObserver' in window)) return;
  counters.forEach(counter => { counter.textContent = '0.01'; });
  function play(panel) {
    if (played.has(panel) || document.hidden || motion.matches) return;
    played.add(panel);
    observer.unobserve(panel);
    panel.classList.add('is-metric-entering');
    timers.set(panel, setTimeout(() => finishPanel(panel), 850));
    const start = performance.now();
    panel.querySelectorAll('[data-work-count]').forEach(counter => {
      const target = Math.round(Number(counter.dataset.workCount) * 100);
      function tick(now) {
        const progress = Math.min((now - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const hundredths = Math.min(target, Math.floor(1 + (target - 1) * eased));
        counter.textContent = (hundredths / 100).toFixed(2);
        if (progress < 1) frames.set(counter, requestAnimationFrame(tick));
        else finish(counter);
      }
      frames.set(counter, requestAnimationFrame(tick));
    });
  }
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Includes horizontal clipping, so off-screen swipe cards do not play early.
      if (entry.isIntersecting && entry.intersectionRatio >= .55) play(entry.target);
    });
  }, {threshold:.55});
  panels.forEach(panel => observer.observe(panel));
  motion.addEventListener('change', event => { if (event.matches) stop(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      [...frames.keys()].forEach(finish);
      [...timers.keys()].forEach(finishPanel);
    } else if (!motion.matches) {
      // Re-observe pending panels if the page initially opened in a background tab.
      panels.filter(panel => !played.has(panel)).forEach(panel => {
        observer.unobserve(panel); observer.observe(panel);
      });
    }
  });
  window.addEventListener('beforeprint', stop);
})();
