'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../../conversion-tracking.js'), 'utf8');
const configSource = fs.readFileSync(path.join(__dirname, '../../conversion-config.js'), 'utf8');

function harness(options = {}) {
  let now = 1760000000000;
  let sequence = 0;
  const timers = new Map();
  const listeners = new Map();
  const observed = [];
  const scripts = [];
  const sections = new Map();
  let observerCallback;
  const storage = options.storage || new Map();
  const document = {
    readyState: options.loading ? 'loading' : 'complete', visibilityState: 'visible',
    querySelector(selector) {
      if (selector.startsWith('script[')) return options.existingGtag ? {} : null;
      if (options.noSections) return null;
      if (!sections.has(selector)) sections.set(selector, { selector });
      return sections.get(selector);
    },
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, []); listeners.get(name).push(fn); },
    createElement(tag) { return { tag }; }, head: { appendChild(node) { scripts.push(node); } },
  };
  const window = {
    document, dataLayer: [],
    MANGA_CONVERSION_CONFIG: { enabled: true, transport: 'none', measurementId: '', ...options.config },
    crypto: { randomUUID: () => `aaaaaaaa-aaaa-4aaa-8aaa-${String(++sequence).padStart(12, '0')}` },
    sessionStorage: {
      getItem(key) { if (options.blockedStorage) throw new Error('SecurityError'); return storage.get(key) || null; },
      setItem(key, value) { if (options.blockedStorage) throw new Error('SecurityError'); storage.set(key, value); },
    },
    setTimeout(fn, ms) { const id = ++sequence; timers.set(id, { fn, due: now + ms }); return id; },
    clearTimeout(id) { timers.delete(id); },
    google_tag_manager: options.existingGtm ? { 'GTM-EXAMPLE': {} } : undefined,
  };
  if (!options.noObserver) window.IntersectionObserver = class {
    constructor(callback) { observerCallback = callback; }
    observe(node) { observed.push(node); }
  };
  class Clock extends Date { static now() { return now; } }
  const context = vm.createContext({ window, document, URL, Date: Clock, Set, Map, Object, Math, JSON, Number });
  const run = () => vm.runInContext(source, context);
  run();
  function dispatch(name, event = {}) { (listeners.get(name) || []).forEach(fn => fn(event)); }
  function advance(ms) {
    const end = now + ms;
    for (;;) {
      const next = [...timers].filter(([, v]) => v.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break;
      now = next[1].due; timers.delete(next[0]); next[1].fn();
    }
    now = end;
  }
  function click(opts = {}) {
    const dock = { classList: { contains: () => !!opts.docked } };
    const link = {
      href: opts.href || 'https://zero-s.jp/contact/?email=private@example.com',
      getAttribute: () => opts.disabled ? 'true' : null,
      closest(selector) {
        if (selector === 'a[data-cv-cta="free_rough"]') return opts.unmarked ? null : link;
        if (selector === '.manga-cta--dock') return opts.inline ? null : dock;
        return opts.demo || opts.hidden ? {} : null;
      },
    };
    const event = { isTrusted: opts.trusted !== false, button: opts.button || 0, defaultPrevented: !!opts.prevented, target: link,
      preventDefault() { throw new Error('Tracker must not block navigation'); } };
    dispatch('click', event);
    return link;
  }
  const events = () => window.dataLayer.filter(item => item.event);
  return { window, document, context, run, dispatch, advance, click, events, observed, scripts, storage, listeners,
    enter(index = 0, ratio = 1) { observerCallback([{ target: observed[index], intersectionRatio: ratio, isIntersecting: ratio > 0 }]); },
  };
}

test('shipped config does not initialize a remote collector; duplicate script/DOMContentLoaded do not double count', () => {
  const env = harness({ loading: true });
  assert.equal(env.events().length, 0);
  env.dispatch('DOMContentLoaded'); env.dispatch('DOMContentLoaded'); env.run();
  assert.equal(env.events().filter(e => e.event === 'manga_page_view').length, 1);
  assert.equal(env.listeners.get('click').length, 1);
  assert.equal(env.scripts.length, 0);
  vm.runInContext(configSource, env.context);
  assert.equal(env.window.MANGA_CONVERSION_CONFIG.transport, 'none');
  assert.equal(env.window.MANGA_CONVERSION_CONFIG.measurementId, '');
});

test('CTA is intent only, duplicate click suppressed, normal later clicks retained, dock position captured', () => {
  const env = harness();
  const link = env.click(); env.click(); env.advance(1499); env.click();
  assert.equal(env.events().filter(e => e.event === 'manga_cta_click').length, 1);
  env.advance(1); env.click({ docked: true });
  const clicks = env.events().filter(e => e.event === 'manga_cta_click');
  assert.deepEqual(clicks.map(e => e.cta_position), ['floating', 'final']);
  assert.equal(link.href, 'https://zero-s.jp/contact/?email=private@example.com');
  assert.ok(!JSON.stringify(env.events()).includes('private@example.com'));
  assert.ok(!env.events().some(e => ['generate_lead', 'qualify_lead', 'close_convert_lead'].includes(e.event)));
  assert.equal(new Set(env.events().map(e => e.event_id)).size, env.events().length);
});

test('demo, unmarked, hidden, disabled, synthetic, prevented and non-primary clicks are excluded', () => {
  const env = harness();
  [{ demo: true }, { unmarked: true }, { hidden: true }, { disabled: true }, { trusted: false }, { prevented: true }, { button: 1 }, { href: 'javascript:void(0)' }]
    .forEach(options => env.click(options));
  assert.equal(env.events().length, 1);
  env.click({ href: 'https://line.me/R/ti/p/@example?secret=ignored', inline: true });
  const click = env.events().at(-1);
  assert.equal(click.destination_type, 'line');
  assert.equal(click.cta_position, 'inline');
  assert.ok(!JSON.stringify(click).includes('secret'));
});

test('section must be >=50% visible for one continuous second and counts only once per page', () => {
  const env = harness();
  env.enter(0, .49); env.advance(1500); assert.equal(env.events().length, 1);
  env.enter(); env.advance(500); env.enter(0, 0); env.advance(600); assert.equal(env.events().length, 1);
  env.enter(); env.advance(999); assert.equal(env.events().length, 1);
  env.advance(1); env.enter(0, 0); env.enter(); env.advance(1500);
  assert.equal(env.events().filter(e => e.event === 'manga_section_view').length, 1);
  assert.ok(env.observed.every(node => !node.selector.includes('sr-only')));
});

test('hidden tab cancels visibility dwell; visible tab starts a fresh dwell', () => {
  const env = harness();
  env.enter(); env.advance(500);
  env.document.visibilityState = 'hidden'; env.dispatch('visibilitychange'); env.advance(3000);
  assert.equal(env.events().length, 1);
  env.document.visibilityState = 'visible'; env.dispatch('visibilitychange'); env.advance(999);
  assert.equal(env.events().length, 1); env.advance(1); assert.equal(env.events().length, 2);
});

test('blocked/corrupt storage and missing observer do not prevent tracking or navigation', () => {
  const env = harness({ blockedStorage: true, noObserver: true });
  env.click(); assert.equal(env.events().length, 2);
  const storage = new Map([['bangkok_manga_visit_v1', '{not json']]);
  const other = harness({ storage }); other.click(); assert.equal(other.events().length, 2);
  const first = other.events()[0].lp_visit_id;
  const reload = harness({ storage }); assert.equal(reload.events()[0].lp_visit_id, first);
});

test('disabled and invalid collector settings cause no remote load; existing tag owner is not duplicated', () => {
  assert.equal(harness({ config: { enabled: false } }).events().length, 0);
  const invalid = harness({ config: { transport: 'ga4', measurementId: 'not-an-id' } });
  assert.equal(invalid.scripts.length, 0); assert.equal(invalid.window.MangaConversion.status().transport, 'invalid_measurement_id');
  for (const existing of [{ existingGtag: true }, { existingGtm: true }]) {
    const env = harness({ ...existing, config: { transport: 'ga4', measurementId: 'G-TEST1234' } });
    assert.equal(env.scripts.length, 0); assert.equal(env.window.MangaConversion.status().transport, 'blocked_existing_tag_owner');
  }
});

test('explicit GA4 adapter creates one script and one event command per event with sanitized locations', () => {
  const env = harness({ config: { transport: 'ga4', measurementId: 'G-TEST1234' } });
  env.click(); env.run();
  assert.equal(env.scripts.length, 1);
  const commands = env.window.dataLayer.filter(item => item[0] === 'event');
  assert.equal(commands.length, 2);
  assert.equal(commands[0][2].send_to, 'G-TEST1234');
  assert.equal(commands[1][2].page_location.includes('?'), false);
  assert.equal(commands[1][2].page_referrer, '');
  env.scripts[0].onerror(); env.advance(1500); env.click();
  assert.equal(env.window.MangaConversion.status().transport, 'ga4_load_failed');
});
