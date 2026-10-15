(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wipes = [...document.querySelectorAll('[data-manga-wipe]')];
  const speeches = [...document.querySelectorAll('[data-speech-mask], [data-speech-reveal]')];
  const pendingSpeeches = new Set(speeches);
  let nearbySpeeches = null;
  let speechObserver;
  const counters = [...document.querySelectorAll('[data-manga-count]')];
  const cue = document.querySelector('.manga-example__scroll-cue');
  const timers = new Map();
  const frames = new Map();
  const dock = document.querySelector('.manga-cta--dock');
  let observer;
  let speechTimer = 0;
  let speechRaf = 0;
  let activeSpeech = null;
  let lastSpeech = null;
  let nextSpeechAt = 0;
  let speechFailed = false;

  // Both interactive phone scenes need the full reading area. The same CTA
  // settles into the final offer slot instead of creating a duplicate button.
  const readingZones = [...document.querySelectorAll('#lp-example, #line-demo')];
  const finalSlot = document.querySelector('[data-cta-slot]');
  let dockRaf = 0, dockHeight = 0, dockSizeDirty = true;
  let finalSlotNear = !('IntersectionObserver' in window);
  function syncDockReadingZone() {
    dockRaf = 0;
    if (!dock || document.hidden) return;
    const reading = readingZones.some(zone => {
      const box = zone.getBoundingClientRect();
      return box.bottom > 0 && box.top < innerHeight;
    });
    if (dockSizeDirty) { dockHeight = dock.offsetHeight; dockSizeDirty = false; }
    const slotTop = finalSlot?.getBoundingClientRect().top;
    const changed = reading !== dock.classList.contains('is-reading-hidden');
    if (changed) {
      dock.classList.toggle('is-reading-hidden', reading);
      dock.inert = reading;
      if (reading) dock.setAttribute('aria-hidden', 'true');
      else dock.removeAttribute('aria-hidden');
    }
    if (finalSlot) {
      const height = `${dockHeight}px`;
      if (finalSlot.style.height !== height) finalSlot.style.height = height;
      const docked = slotTop + dockHeight <= innerHeight + 1;
      if (docked !== dock.classList.contains('is-docked')) dock.classList.toggle('is-docked', docked);
      // Keep the floating element outside container-type ancestors.
      const target = docked ? finalSlot : document.body;
      if (dock.parentElement !== target) target.appendChild(dock);
    }
    if (changed) queueSpeechCheck();
  }
  function queueDockCheck() {
    if (!dockRaf && !document.hidden) dockRaf = requestAnimationFrame(syncDockReadingZone);
  }
  const invalidateDock = () => { dockSizeDirty = true; queueDockCheck(); };
  if (dock) {
    window.addEventListener('scroll', () => { if (finalSlotNear || !('IntersectionObserver' in window)) queueDockCheck(); }, { passive: true });
    if ('IntersectionObserver' in window) {
      const zones = new IntersectionObserver(queueDockCheck, {threshold:0});
      readingZones.forEach(zone => zones.observe(zone));
      if (finalSlot) new IntersectionObserver(entries => {
        finalSlotNear = entries[0].isIntersecting;
        queueDockCheck();
      }, {rootMargin:'100% 0px', threshold:0}).observe(finalSlot);
    }
    window.addEventListener('resize', invalidateDock, { passive: true });
    window.addEventListener('pageshow', queueDockCheck);
    if ('ResizeObserver' in window) new ResizeObserver(invalidateDock).observe(dock);
    syncDockReadingZone();
  }

  const finish = element => {
    clearTimeout(timers.get(element));
    cancelAnimationFrame(frames.get(element));
    timers.delete(element);
    frames.delete(element);
    pendingSpeeches.delete(element);
    nearbySpeeches?.delete(element);
    speechObserver?.unobserve(element);
    element.classList.remove('is-pending', 'is-entering', 'is-cue-entering', 'is-revealing');
    element.classList.add('is-shown');
    if (element.dataset.mangaCount) element.textContent = element.dataset.mangaCount;
  };
  function stopSpeechTimer() { clearTimeout(speechTimer); speechTimer = 0; }
  function releaseAllContent() {
    speechFailed = true;
    stopSpeechTimer();
    cancelAnimationFrame(speechRaf);
    root.classList.remove('manga-motion-ready');
    observer?.disconnect();
    speechObserver?.disconnect();
    [...wipes, ...speeches, ...counters, cue].filter(Boolean).forEach(finish);
    clearTimeout(window.mangaMotionFallback);
  }
  function readingBottom() {
    const fixed = dock && !dock.classList.contains('is-reading-hidden') && getComputedStyle(dock).position === 'fixed';
    const box = fixed ? dock.getBoundingClientRect() : null;
    return Math.min(innerHeight - 18, fixed && box.top > 0 ? box.top - 18 : innerHeight - 18);
  }
  function speechInView(element, bottom) {
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return false;
    const top = 12;
    const visibleHeight = Math.min(box.bottom, bottom) - Math.max(box.top, top);
    // Observe each bubble, not the whole tall image: lower panels remain hidden
    // until their own words enter the usable viewport above the fixed CTA.
    return visibleHeight >= Math.min(box.height * .75, Math.max(30, (bottom - top) * .6));
  }
  function readingTime(element) {
    const explicit = Number(element.dataset.speechDuration);
    if (Number.isFinite(explicit) && explicit > 0) return Math.max(700, explicit);
    let text = element.dataset.speechText || element.textContent.trim();
    if (!text) {
      const group = element.closest('[data-speech-group], [data-comic], .comic-frame') || element.parentElement;
      const count = Math.max(1, group.querySelectorAll('[data-speech-mask]').length);
      const alt = group.querySelector('img')?.alt || '';
      text = alt.slice(0, Math.ceil((alt.length || 45) / count));
    }
    return Math.min(3100, Math.max(1500, 650 + text.length * 42));
  }
  function revealNextSpeech() {
    speechRaf = 0;
    if (speechFailed || reduced.matches || document.hidden || activeSpeech) return;
    stopSpeechTimer();
    // One shared clock follows authored DOM order for all currently visible
    // conversation. Jumping to a chapter never starts hidden panels elsewhere.
    const bottom = readingBottom();
    let next;
    for (const element of pendingSpeeches) {
      if (nearbySpeeches && !nearbySpeeches.has(element)) continue;
      if (speechInView(element, bottom)) { next = element; break; }
    }
    if (!next) return;
    if (lastSpeech && !speechInView(lastSpeech, bottom)) nextSpeechAt = 0;
    const wait = nextSpeechAt - performance.now();
    if (wait > 0) { speechTimer = setTimeout(queueSpeechCheck, wait); return; }
    activeSpeech = next;
    next.classList.remove('is-pending');
    next.classList.add('is-revealing');
    speechTimer = setTimeout(() => {
      try {
        finish(next);
        activeSpeech = null;
        lastSpeech = next;
        nextSpeechAt = performance.now() + readingTime(next);
        queueSpeechCheck();
      } catch (_) { releaseAllContent(); }
    }, 180);
  }
  function queueSpeechCheck() {
    if (speechRaf || speechFailed || document.hidden || !pendingSpeeches.size || (nearbySpeeches && !nearbySpeeches.size)) return;
    speechRaf = requestAnimationFrame(() => {
      try { revealNextSpeech(); } catch (_) { releaseAllContent(); }
    });
  }
  function revealAccent(element) {
    if (element.classList.contains('is-shown')) return;
    observer?.unobserve(element);
    if (reduced.matches || document.hidden) return finish(element);
    if (element.dataset.mangaCount) {
      const target = Number(element.dataset.mangaCount);
      const begin = performance.now();
      element.textContent = '1';
      let previous = '1';
      const tick = now => {
        const progress = Math.min((now - begin) / 1600, 1);
        const value = String(Math.floor(1 + (target - 1) * (1 - (1 - progress) ** 3)));
        if (value !== previous) { element.textContent = value; previous = value; }
        if (progress < 1) frames.set(element, requestAnimationFrame(tick));
        else finish(element);
      };
      frames.set(element, requestAnimationFrame(tick));
    } else if (element === cue) {
      element.classList.add('is-cue-entering');
      timers.set(element, setTimeout(() => finish(element), 850));
    } else {
      element.classList.replace('is-pending', 'is-entering');
      const delay = parseFloat(getComputedStyle(element).getPropertyValue('--wipe-delay')) || 0;
      timers.set(element, setTimeout(() => finish(element), delay + 850));
    }
  }
  function startAccents() {
    if (reduced.matches || speechFailed || !('IntersectionObserver' in window)) return;
    wipes.forEach(element => {
      if (!element.querySelector(':scope > .manga-wipe__copy')) {
        const copy = document.createElement('span');
        copy.className = 'manga-wipe__copy';
        copy.append(...element.childNodes);
        element.append(copy);
      }
      const group = element.closest('.manga-hero__copy, .selected-heading, .back-heading') || element.parentElement;
      const siblings = [...group.querySelectorAll('[data-manga-wipe]')];
      element.style.setProperty('--wipe-delay', `${siblings.indexOf(element) * 160}ms`);
      element.classList.add('is-pending');
    });
    counters.forEach(element => { element.textContent = '1'; });
    observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => revealAccent(entry.target));
    }, { threshold: .15, rootMargin: '0px 0px -120px 0px' });
    [...wipes, ...counters, cue].filter(Boolean).forEach(element => observer.observe(element));
  }
  try {
    if (reduced.matches) return releaseAllContent();
    root.classList.add('manga-motion-ready');
    speeches.forEach(element => element.classList.add('is-pending'));
    if ('IntersectionObserver' in window) {
      nearbySpeeches = new Set();
      speechObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) nearbySpeeches.add(entry.target);
          else nearbySpeeches.delete(entry.target);
        });
        queueSpeechCheck();
      }, { rootMargin:'200px 0px', threshold:0 });
      speeches.forEach(element => speechObserver.observe(element));
    }
    window.addEventListener('scroll', queueSpeechCheck, { passive: true });
    window.addEventListener('resize', queueSpeechCheck, { passive: true });
    document.querySelectorAll('.comic-frame img, [data-comic] img').forEach(image => image.addEventListener('load', queueSpeechCheck));
    queueSpeechCheck();
    clearTimeout(window.mangaMotionFallback);
    Promise.race([document.fonts?.ready || Promise.resolve(), new Promise(resolve => setTimeout(resolve, 1200))])
      .then(startAccents).catch(releaseAllContent);
  } catch (_) { releaseAllContent(); }
  reduced.addEventListener('change', event => { if (event.matches) releaseAllContent(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSpeechTimer();
      cancelAnimationFrame(speechRaf); speechRaf = 0;
      cancelAnimationFrame(dockRaf); dockRaf = 0;
      if (activeSpeech) { finish(activeSpeech); lastSpeech = activeSpeech; activeSpeech = null; }
      [...timers.keys(), ...frames.keys()].forEach(finish);
    } else {
      nextSpeechAt = performance.now() + 350;
      queueDockCheck();
      queueSpeechCheck();
    }
  });
})();
