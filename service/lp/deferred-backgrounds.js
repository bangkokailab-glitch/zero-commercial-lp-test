/* Keep real background artwork, but avoid competing with the first viewport. */
(() => {
  const targets = document.querySelectorAll('#about .about-support-message, .lp-purpose-media--k2-continuation');
  const show = target => target.classList.add('is-background-ready');
  if (!('IntersectionObserver' in window)) { targets.forEach(show); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    show(entry.target); observer.unobserve(entry.target);
  }), { rootMargin: '1200px 0px' });
  targets.forEach(target => observer.observe(target));
  addEventListener('beforeprint', () => targets.forEach(show));
})();
