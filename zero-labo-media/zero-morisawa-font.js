// Change font family only; retain the approved size, weight, leading and layout.
(() => {
  // Some preview browsers do not fire preload load handlers. Always promote
  // the same licensed URL to a stylesheet; never fetch or rewrite font data.
  const delivery = document.querySelector('link[href="https://morisawafonts.net/c/01M4BM2NTN3DGZBTPFB0NSJDMZ/mf.css"]');
  diagnoseFonts();
  if (delivery?.rel === 'preload') delivery.rel = 'stylesheet';
  function diagnoseFonts() {
    const root = document.documentElement;
    root.dataset.zeroFontStatus = 'pending';
    const fonts = document.fonts;
    if (!fonts || typeof fonts.forEach !== 'function') { root.dataset.zeroFontStatus = 'error'; return; }
    const families = ['mfw-pshingopr6n-regular', 'mfw-pshingopr6n-bold'];
    let finished = false, waitingReady = false, poll, deadline;
    const collect = () => {
      const faces = [];
      fonts.forEach(face => {
        const family = face.family.trim().replace(/^["']|["']$/g, '');
        if (families.includes(family)) faces.push({family, status:face.status});
      });
      return faces;
    };
    const loaded = faces => families.every(family => faces.some(face => face.family === family && face.status === 'loaded'));
    const failed = faces => faces.some(face => face.status === 'error');
    function finish(status) {
      if (finished) return;
      finished = true;
      root.dataset.zeroFontStatus = status;
      clearTimeout(poll); clearTimeout(deadline);
      delivery?.removeEventListener('load', inspect);
      delivery?.removeEventListener('error', deliveryError);
      fonts.removeEventListener?.('loadingdone', inspect);
      fonts.removeEventListener?.('loadingerror', inspect);
    }
    function deliveryError() { finish('error'); }
    function inspect() {
      clearTimeout(poll);
      if (finished || waitingReady) return;
      const faces = collect();
      if (failed(faces)) { finish('error'); return; }
      if (!loaded(faces)) { poll = setTimeout(inspect, 100); return; }
      // An already-resolved fonts.ready with no registered faces is not evidence.
      // Both supplied families must actually load before waiting for layout readiness.
      waitingReady = true;
      fonts.ready.then(() => {
        waitingReady = false;
        if (finished) return;
        const current = collect();
        if (failed(current)) finish('error');
        else if (loaded(current)) finish('loaded');
        else poll = setTimeout(inspect, 100);
      }, () => finish('error'));
    }
    delivery?.addEventListener('load', inspect);
    delivery?.addEventListener('error', deliveryError);
    fonts.addEventListener?.('loadingdone', inspect);
    fonts.addEventListener?.('loadingerror', inspect);
    deadline = setTimeout(() => finish('error'), 30000);
    inspect();
  }
  const skipped = 'script,style,noscript,svg,math,canvas,iframe,pre,code,kbd,samp,[data-zero-font-skip]';
  const iconFont = /Font\s*Awesome|Genericons|dashicons|Material\s*(Icons|Symbols)|slick/i;
  let pending = false;
  function apply() {
    pending = false;
    const changes = [];
    for (const element of document.body.querySelectorAll('*')) {
      if (!(element instanceof HTMLElement) || element.closest(skipped)) continue;
      const text = [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (!text && !element.matches('input,textarea,select,option,button')) continue;
      const style = getComputedStyle(element);
      if (iconFont.test(style.fontFamily)) continue;
      const family = Number.parseInt(style.fontWeight, 10) >= 600 ? 'bold' : 'regular';
      if (element.dataset.zeroFont !== family) changes.push([element, family]);
    }
    // Separate style reads from writes to avoid layout thrashing.
    for (const [element, family] of changes) element.dataset.zeroFont = family;
  }
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(apply); }
  }
  function start() {
    apply();
    new MutationObserver(schedule).observe(document.body, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['class','style','data-variant','data-design','data-support-design','data-resource-design']
    });
    addEventListener('resize', schedule, {passive:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
