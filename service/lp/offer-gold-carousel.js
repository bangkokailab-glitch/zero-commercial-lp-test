/* Automatic-only horizontal galleries with a seamless loop of the real LP samples. */
(() => {
  'use strict';

  const start = () => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pixelsPerSecond = 18;

    document.querySelectorAll('section.cta-offer--gold, .offer-gold-carousel-instance').forEach(section => {
      const gallery = section.querySelector('.offer-gold__gallery');
      const track = gallery && gallery.querySelector('.offer-gold__track');
      if (!track || gallery.dataset.offerGoldReady) return;
      const samples = Array.from(track.children).filter(item => item.matches('.offer-gold__sample'));
      if (!samples.length) return;
      gallery.dataset.offerGoldReady = 'true';

      const clones = samples.map(sample => {
        const clone = sample.cloneNode(true);
        clone.removeAttribute('id');
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        clone.dataset.offerGoldClone = 'true';
        clone.style.pointerEvents = 'none';
        clone.querySelectorAll('[id]').forEach(item => item.removeAttribute('id'));
        clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(item => {
          item.setAttribute('tabindex', '-1');
        });
        clone.querySelectorAll('img').forEach(image => { image.alt = ''; });
        track.appendChild(clone);
        return clone;
      });

      let period = 0;
      let canLoop = false;
      let inView = false;
      const mayMove = () => canLoop && inView && !motion.matches && !document.hidden;

      const reconcile = () => {
        gallery.dataset.offerGoldPlaying = mayMove() ? 'true' : 'false';
      };

      const measure = () => {
        const first = samples[0].getBoundingClientRect();
        period = clones[0].getBoundingClientRect().left - first.left;
        canLoop = period > 0 && gallery.scrollWidth - gallery.clientWidth >= period - 1;
        if (canLoop) {
          const distance = `${period}px`;
          const duration = `${period / pixelsPerSecond}s`;
          if (track.style.getPropertyValue('--offer-loop-distance') !== distance) {
            track.style.setProperty('--offer-loop-distance', distance);
          }
          if (track.style.getPropertyValue('--offer-loop-duration') !== duration) {
            track.style.setProperty('--offer-loop-duration', duration);
          }
        }
        const bounds = gallery.getBoundingClientRect();
        inView = bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 &&
          bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
        reconcile();
      };

      if ('IntersectionObserver' in window) {
        const visibility = new IntersectionObserver(entries => {
          inView = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
          reconcile();
        }, { threshold: 0 });
        visibility.observe(gallery);
      } else {
        window.addEventListener('scroll', measure, { passive: true });
      }
      if ('ResizeObserver' in window) {
        const dimensions = new ResizeObserver(measure);
        dimensions.observe(gallery);
        dimensions.observe(track);
      }
      track.addEventListener('load', measure, true);
      window.addEventListener('resize', measure, { passive: true });
      window.addEventListener('pageshow', measure);
      document.addEventListener('visibilitychange', () => {
        reconcile();
      });
      if (motion.addEventListener) motion.addEventListener('change', reconcile);
      else if (motion.addListener) motion.addListener(reconcile);
      measure();
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
