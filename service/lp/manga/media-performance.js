/* Load decorative scenes close to the reader; keep the hero eager. */
(() => {
  'use strict';
  const root = document.documentElement;
  const scenes = [...document.querySelectorAll('[data-deferred-media]')];
  function loadScene(scene) {
    scene.querySelectorAll('[data-media-src]').forEach(image => {
      image.setAttribute(image.tagName.toLowerCase() === 'image' ? 'href' : 'src', image.dataset.mediaSrc);
      image.removeAttribute('data-media-src');
    });
    scene.classList.add('is-media-ready');
  }
  if ('IntersectionObserver' in window) {
    const preload = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      loadScene(entry.target);
      preload.unobserve(entry.target);
    }), { rootMargin: '900px 0px' });
    scenes.forEach(scene => preload.observe(scene));
    const phone = document.querySelector('.manga-example__scene');
    if (phone) {
      const motion = new IntersectionObserver(entries => {
        phone.classList.toggle('is-performance-visible', entries[0].isIntersecting);
      });
      motion.observe(phone);
    }
  } else {
    scenes.forEach(loadScene);
    root.classList.remove('manga-media-js');
  }
  clearTimeout(window.mangaMediaFallback);
  const syncVisibility = () => root.classList.toggle('manga-document-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
  window.addEventListener('beforeprint', () => scenes.forEach(loadScene));
})();
