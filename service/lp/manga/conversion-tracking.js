(() => {
  'use strict';
  // Re-injection must never install a second click listener or count a second view.
  if (window.MangaConversion) return;
  const config = window.MANGA_CONVERSION_CONFIG || {};
  const state = { started: false, transport: 'none', events: 0 };
  window.MangaConversion = Object.freeze({ status: () => Object.freeze({ ...state }) });
  if (config.enabled !== true) return;

  const pageLocation = 'https://bangkokailab-glitch.github.io/zero-commercial-lp-test/service/lp/manga/';
  const pageId = 'bangkok_manga';
  const visitKey = 'bangkok_manga_visit_v1';
  const ttl = 30 * 60 * 1000;
  const pageViewId = randomId();
  const visitId = readVisit();
  const sectionNames = [
    ['.manga-hero h1', 'hero'], ['#worries h2', 'worries'], ['#block03 h2', 'solution'],
    ['#lp-example .manga-example__scene', 'lp_example'], ['#multilingual-lp .language-story-crop', 'multilingual_lp'],
    ['#line-automation h2', 'line_automation'], ['#line-demo h2', 'line_demo'],
    ['#google-ads h2', 'google_ads'], ['#plans h2', 'plans'],
    ['#production-flow h2', 'production_flow'], ['#faq h2', 'faq'],
    ['#about-zero h2', 'about_zero'], ['#free-rough h2', 'free_rough'],
  ];
  const viewed = new Set();
  const visibleSections = new Map();
  const timers = new Map();
  const clickTimes = new Map();
  let nearestSection = 'hero';
  let counter = 0;
  let gaSend = null;

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  }
  function readVisit() {
    const now = Date.now();
    let value;
    try {
      value = JSON.parse(window.sessionStorage.getItem(visitKey));
      if (!value || !/^[a-z0-9-]{8,80}$/i.test(value.id) || !Number.isFinite(value.at) ||
          now - value.at >= ttl || value.at > now) value = null;
    } catch (_) { value = null; }
    value = { id: value ? value.id : randomId(), at: now };
    try { window.sessionStorage.setItem(visitKey, JSON.stringify(value)); } catch (_) { /* memory-only visit */ }
    return value.id;
  }
  function push(value) {
    try {
      if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
      window.dataLayer.push(value);
    } catch (_) { /* Analytics must never break navigation or reading. */ }
  }
  function initTransport() {
    if (config.transport !== 'ga4') return;
    if (!/^G-[A-Z0-9]{4,20}$/.test(config.measurementId || '')) { state.transport = 'invalid_measurement_id'; return; }
    const containers = window.google_tag_manager || {};
    const hasGtm = Object.keys(containers).some(key => key.startsWith('GTM-'));
    const hasGtag = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (hasGtm || hasGtag) { state.transport = 'blocked_existing_tag_owner'; return; }
    // This optional adapter owns a single GA4 destination. Default is OFF.
    function command() { push(arguments); }
    command('js', new Date());
    command('config', config.measurementId, {
      send_page_view: false,
      page_location: pageLocation,
      page_referrer: '',
      page_title: 'Bangkok store acquisition manga LP',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
    script.onerror = () => { state.transport = 'ga4_load_failed'; };
    document.head.appendChild(script);
    gaSend = (name, payload) => command('event', name, { ...payload, send_to: config.measurementId });
    state.transport = 'ga4_requested';
  }
  function emit(name, fields) {
    const payload = {
      schema_version: '1', page_id: pageId, environment: 'test',
      page_location: pageLocation, page_referrer: '',
      lp_visit_id: visitId, page_view_id: pageViewId,
      event_id: `${pageViewId}-${++counter}`,
      section_id: fields.section_id || nearestSection,
      cta_id: fields.cta_id || 'not_applicable',
      cta_position: fields.cta_position || 'not_applicable',
      destination_type: fields.destination_type || 'not_applicable',
      offer_id: 'lp_outline_main_visual_rough',
    };
    // Explicit allowlist: no textContent, input values, full URL queries, or referrers.
    push({ event: name, event_source: 'bangkok_manga', ...payload });
    if (gaSend) gaSend(name, payload);
    state.events += 1;
  }
  function recordSection(node, id) {
    if (viewed.has(id) || timers.has(node) || document.visibilityState === 'hidden') return;
    timers.set(node, window.setTimeout(() => {
      timers.delete(node);
      if (!visibleSections.has(node) || document.visibilityState === 'hidden') return;
      viewed.add(id);
      nearestSection = id;
      emit('manga_section_view', { section_id: id });
    }, 1000));
  }
  function cancelSection(node) {
    if (timers.has(node)) window.clearTimeout(timers.get(node));
    timers.delete(node);
  }
  function initSections() {
    if (!('IntersectionObserver' in window)) return; // No unreliable fallback "view" counts.
    const ids = new Map();
    const observer = new window.IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = ids.get(entry.target);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          visibleSections.set(entry.target, id);
          nearestSection = id;
          recordSection(entry.target, id);
        } else {
          visibleSections.delete(entry.target);
          cancelSection(entry.target);
        }
      });
    }, { threshold: [0, 0.5], rootMargin: '0px 0px -15% 0px' });
    sectionNames.forEach(([selector, id]) => {
      const section = document.querySelector(selector);
      if (!section) return;
      // Observe visible headings/scene areas, never a clipped screen-reader heading.
      ids.set(section, id);
      observer.observe(section);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') timers.forEach((_, node) => cancelSection(node));
      else visibleSections.forEach((id, node) => recordSection(node, id));
    });
  }
  function trackClick(event) {
    // Ignore scripted demo interactions, disabled CTA, and non-primary clicks.
    if (event.isTrusted === false || event.defaultPrevented || (typeof event.button === 'number' && event.button !== 0)) return;
    const target = event.target && event.target.closest ? event.target : event.target && event.target.parentElement;
    const link = target && target.closest('a[data-cv-cta="free_rough"]');
    if (!link || link.closest('#lp-example, #line-demo, [data-cv-ignore], [inert], [aria-hidden="true"]') ||
        link.getAttribute('aria-disabled') === 'true') return;
    let destination;
    try { destination = new URL(link.href, pageLocation); } catch (_) { return; }
    if (!['https:', 'http:'].includes(destination.protocol)) return;
    const now = Date.now();
    if (clickTimes.has('free_rough') && now - clickTimes.get('free_rough') < 1500) return;
    clickTimes.set('free_rough', now);
    const dock = link.closest('.manga-cta--dock');
    emit('manga_cta_click', {
      cta_id: 'free_rough',
      cta_position: dock ? (dock.classList.contains('is-docked') ? 'final' : 'floating') : 'inline',
      destination_type: /(^|\.)line\.me$/.test(destination.hostname) || destination.hostname === 'lin.ee' ? 'line' : 'temporary_contact_form',
    });
    // Never preventDefault, decorate the destination, wait for a callback, or call this a lead.
  }
  function start() {
    if (state.started) return;
    state.started = true;
    initTransport();
    emit('manga_page_view', { section_id: 'hero' });
    initSections();
    document.addEventListener('click', trackClick);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
