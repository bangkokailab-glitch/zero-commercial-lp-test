/* Preserve the 1,000px headline frame while using licensed, selectable text. */
(() => {
  const frame = document.querySelector('.zero-hero-display');
  const text = frame?.querySelector('.zero-hero-display__text');
  if (!frame || !text) return;
  const context = document.createElement('canvas').getContext('2d');
  const fit = () => {
    const naturalWidth = text.offsetWidth;
    if (!naturalWidth) return;
    const style = getComputedStyle(text);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = context.measureText(text.textContent);
    const inkWidth = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const scale = frame.clientWidth / (inkWidth || naturalWidth);
    text.style.setProperty('--hero-fit', scale);
    text.style.setProperty('--hero-ink-offset', `${metrics.actualBoundingBoxLeft * scale}px`);
  };
  fit();
  document.fonts?.ready.then(fit);
  document.fonts?.addEventListener('loadingdone', fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(frame);
  else window.addEventListener('resize', fit);
})();
