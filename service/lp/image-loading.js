/* Keep distant diagrams lazy, but do not leave a reader's visible image at low priority. */
(() => {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  const images = [...document.querySelectorAll('img[loading="lazy"]')]
    .filter(image => !image.closest('.works-box'));
  const prepare = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const image = entry.target;
      if (image.fetchPriority === 'low') image.fetchPriority = 'auto';
      // Reserve all authored dimensions and let <picture> select just one source.
      // No second Image(), duplicate preload, or download of the desktop source on mobile.
      image.loading = 'eager';
      prepare.unobserve(image);
    });
  }, {rootMargin: '900px 0px'});
  const visible = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const image = entry.target;
      if (!image.complete) image.fetchPriority = 'high';
      visible.unobserve(image);
    });
  });
  images.forEach(image => {
    prepare.observe(image);
    visible.observe(image);
  });
})();
