/* Preserve the 1,000px headline frame while using licensed, selectable text. */
(() => {
  const frame = document.querySelector('.zero-hero-display');
  const text = frame?.querySelector('.zero-hero-display__text');
  if (!frame || !text) return;
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return;
  const wipes = [...document.querySelectorAll('#mv .zero-hero-wipe')];
  const fitWipe = wipe => {
    // Intro lines include highlights, different font sizes and emphasis dots;
    // their local CSS uses the whole line box instead of one font's ink metrics.
    if (wipe.closest('.zero-hero-intro')) return;
    const content = wipe.querySelector('.zero-hero-wipe__content');
    if (!content) return;
    const style = getComputedStyle(content);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = context.measureText(content.textContent);
    // A zero-size baseline marker gives the actual DOM baseline, including
    // Japanese emphasis dots, line-height, and the signature's padding.
    const baseline = document.createElement('span');
    baseline.setAttribute('aria-hidden', 'true');
    baseline.style.cssText = 'display:inline-block;width:0;height:0;margin:0;padding:0;border:0;vertical-align:baseline;line-height:0';
    wipe.append(baseline);
    const baselineY = baseline.getBoundingClientRect().top - wipe.getBoundingClientRect().top;
    baseline.remove();
    const top = Math.floor(baselineY - metrics.actualBoundingBoxAscent);
    const bottom = Math.ceil(baselineY + metrics.actualBoundingBoxDescent);
    wipe.style.setProperty('--hero-wipe-top', `${top}px`);
    wipe.style.setProperty('--hero-wipe-height', `${bottom - top}px`);
  };
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
    wipes.forEach(fitWipe);
  };
  fit();
  document.fonts?.ready.then(fit);
  document.fonts?.addEventListener('loadingdone', fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(frame);
  else window.addEventListener('resize', fit);
})();
