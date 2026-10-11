/* Automatic-only horizontal galleries with a seamless loop of the real LP samples. */
(() => {
  'use strict';

  const start = () => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pixelsPerSecond = 18;
    const pendingMeasurements = new Set();
    let measurementFrame = 0;
    const scheduleMeasurement = measure => {
      pendingMeasurements.add(measure);
      if (measurementFrame) return;
      measurementFrame = requestAnimationFrame(() => {
        measurementFrame = 0;
        const measurements = [...pendingMeasurements];
        pendingMeasurements.clear();
        // All galleries read their geometry before any CSS variables change.
        // Clones and layout remain identical; duplicate load/resize events no
        // longer force a separate whole-page layout for every gallery.
        const applyMeasurements = measurements.map(read => read());
        applyMeasurements.forEach(apply => apply());
      });
    };

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
      // Pause unseen strips without resetting their CSS animation progress.
      // Returning to the gallery resumes the same position and approved speed.
      const mayMove = () => canLoop && inView && !motion.matches && !document.hidden;

      const reconcile = () => {
        const playing = mayMove() ? 'true' : 'false';
        if (gallery.dataset.offerGoldPlaying !== playing) gallery.dataset.offerGoldPlaying = playing;
      };

      const measure = () => {
        const first = samples[0].getBoundingClientRect();
        const nextPeriod = clones[0].getBoundingClientRect().left - first.left;
        // The gallery's scrollWidth shrinks as the track translates left, which
        // could incorrectly stop a valid loop during image loads or resizing.
        const nextCanLoop = nextPeriod > 0 && track.scrollWidth - gallery.clientWidth >= nextPeriod - 1;
        const bounds = gallery.getBoundingClientRect();
        const nextInView = bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 &&
          bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth;
        return () => {
          period = nextPeriod;
          canLoop = nextCanLoop;
          inView = nextInView;
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
          reconcile();
        };
      };
      const scheduleMeasure = () => scheduleMeasurement(measure);

      if ('IntersectionObserver' in window) {
        const visibility = new IntersectionObserver(entries => {
          inView = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
          reconcile();
        }, { threshold: 0 });
        visibility.observe(gallery);
      } else {
        window.addEventListener('scroll', scheduleMeasure, { passive: true });
      }
      if ('ResizeObserver' in window) {
        const dimensions = new ResizeObserver(scheduleMeasure);
        dimensions.observe(gallery);
        dimensions.observe(track);
      }
      track.addEventListener('load', scheduleMeasure, true);
      window.addEventListener('resize', scheduleMeasure, { passive: true });
      window.addEventListener('pageshow', scheduleMeasure);
      document.addEventListener('visibilitychange', () => {
        reconcile();
      });
      if (motion.addEventListener) motion.addEventListener('change', reconcile);
      else if (motion.addListener) motion.addListener(reconcile);
      scheduleMeasure();
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
