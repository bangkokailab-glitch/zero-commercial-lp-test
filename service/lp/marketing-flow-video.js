/* The strategy alone follows reduced-motion and background-tab preferences. */
(() => {
  const section = document.querySelector('#marketing-flow-final');
  const media = section && section.querySelector('.marketing-flow-media');
  const video = media && media.querySelector('.marketing-flow-video');
  if (!video) return;

  /* The legacy page's overflow-x:hidden prevents native sticky positioning.
     Move a viewport-sized layer only within this section's clipped bounds. */
  let frame = 0;
  let previousOffset = -1;
  const placeBackground = () => {
    frame = 0;
    const bounds = section.getBoundingClientRect();
    const maximum = Math.max(0, bounds.height - media.offsetHeight);
    const offset = Math.max(0, Math.min(-bounds.top, maximum));
    if (offset !== previousOffset) {
      media.style.transform = `translate3d(0, ${offset}px, 0)`;
      previousOffset = offset;
    }
  };
  const schedulePosition = () => {
    if (!frame) frame = window.requestAnimationFrame(placeBackground);
  };
  window.addEventListener('scroll', schedulePosition, { passive: true });
  window.addEventListener('resize', schedulePosition, { passive: true });
  window.addEventListener('pageshow', schedulePosition);
  window.addEventListener('load', schedulePosition);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', schedulePosition, { passive: true });
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(schedulePosition).observe(section);
  }
  placeBackground();

})();
