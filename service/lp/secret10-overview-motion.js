/* Reveal the original picture in reading order once, without replacing,
   rescaling or rerasterizing its purchased-font artwork. Coordinates are source pixels. */
(() => {
  'use strict';
  const host = document.querySelector('.secret10-overview-diagram');
  const image = host?.querySelector('picture img');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 768px)');
  if (!image || reduce.matches || !window.IntersectionObserver || !Element.prototype.animate) return;

  const order = [
    ['lp', 0], ['acquisition', 650], ['to-lp', 1020],
    ['response', 1330], ['to-response', 1700],
    ['sales', 2010], ['to-sales', 2380],
    ['improvement', 2690], ['to-improvement', 3060],
    ['multilingual', 3370], ['to-multilingual', 3740],
    ['overseas', 4050], ['to-overseas', 4420]
  ];
  const portrait = {
    width: 1200, height: 1431, offset: 0,
    regions: {
      heading: [[0, 0, 1200, 155]],
      lp: [[312, 160, 576, 858]],
      acquisition: [[18, 220, 257, 798]],
      'to-lp': [[265, 548, 47, 65]],
      response: [[923, 188, 259, 591]],
      'to-response': [[888, 548, 48, 65]],
      sales: [[923, 823, 259, 255]],
      'to-sales': [[1020, 769, 65, 54]],
      improvement: [[35, 1112, 351, 275]],
      'to-improvement': [[590, 1018, 18, 62], [188, 1064, 420, 18], [174, 1082, 45, 37]],
      multilingual: [[428, 1112, 340, 275]],
      'to-multilingual': [[376, 1190, 66, 64]],
      overseas: [[810, 1112, 353, 275]],
      'to-overseas': [[758, 1190, 66, 64]]
    }
  };
  const landscape = {
    width: 1458, height: 1079, offset: 180,
    regions: {
      lp: [[434, 190, 590, 636]],
      acquisition: [[45, 208, 305, 621]],
      'to-lp': [[340, 465, 94, 72]],
      // Desktop combines response and sales in one frame. Reveal that existing
      // frame first, then its sales label/chart; do not redesign or add arrows.
      response: [[1106, 208, 307, 114], [1106, 322, 69, 507],
        [1390, 322, 23, 507], [1175, 391, 215, 269], [1175, 799, 215, 30]],
      'to-response': [[1024, 465, 94, 72]],
      sales: [[1175, 322, 215, 69], [1175, 660, 215, 139]],
      improvement: [[29, 870, 417, 151]],
      'to-improvement': [[251, 826, 485, 32], [240, 858, 45, 25]],
      multilingual: [[515, 870, 428, 151]],
      'to-multilingual': [[437, 915, 86, 65]],
      overseas: [[1009, 870, 421, 151]],
      'to-overseas': [[932, 915, 86, 65]]
    }
  };
  let stage, animations = [], timer, started = false, done = false;
  const finish = () => {
    done = true;
    clearTimeout(timer);
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
    animations = [];
    stage?.remove();
    host.dataset.overviewMotion = 'complete';
  };
  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (!entry.isIntersecting) {
      // If the reader moves on, do not leave an unfinished diagram behind.
      if (started) finish();
      return;
    }
    const visible = Math.min(entry.boundingClientRect.height * .45, innerHeight * .45);
    if (entry.intersectionRect.height >= visible) play();
  }, {threshold: [0, .1, .2, .3, .45, .6, 1]});

  function build() {
    if (done || started || !image.complete || !image.naturalWidth) return;
    const layout = mobile.matches ? portrait : landscape;
    // Decode only the picture source selected by the browser, never both sizes.
    if (image.naturalWidth !== layout.width || image.naturalHeight !== layout.height) return finish();
    stage?.remove();
    const svg = (tag, attributes = {}) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
      return node;
    };
    stage = svg('svg', {
      class: 'secret10-overview-stage', 'aria-hidden': 'true', focusable: 'false',
      viewBox: `0 0 ${layout.width} ${layout.height - layout.offset}`,
      preserveAspectRatio: 'none'
    });
    const defs = svg('defs');
    const mask = svg('mask', {id: 'secret10-overview-mask', maskUnits: 'userSpaceOnUse',
      x: 0, y: 0, width: layout.width, height: layout.height - layout.offset});
    mask.style.maskType = 'luminance';
    mask.append(svg('rect', {width: layout.width, height: layout.height - layout.offset, fill: '#fff'}));
    const arrows = Object.entries(layout.regions).filter(([name]) => name.startsWith('to-')).flatMap(([, rectangles]) => rectangles);
    for (const [name, rectangles] of Object.entries(layout.regions)) {
      const piece = svg('g', {
        class: 'secret10-overview-piece' + (name === 'heading' ? ' secret10-overview-piece--heading' : ''),
        'data-overview-step': name
      });
      const [x, y, width, height] = rectangles[0];
      piece.style.transformOrigin = `${x + width / 2}px ${y - layout.offset + height / 2}px`;
      rectangles.forEach(([x, y, width, height]) => {
        piece.append(svg('rect', {x, y: y - layout.offset, width, height, fill: '#000'}));
      });
      // Frames and arrow tips can share a bounding box. Keep those tips covered
      // until their own step, rather than letting part of an arrow appear early.
      if (!name.startsWith('to-')) arrows.forEach(([ax, ay, aw, ah]) => {
        rectangles.forEach(([x, y, width, height]) => {
          const left = Math.max(x, ax), top = Math.max(y, ay);
          const right = Math.min(x + width, ax + aw), bottom = Math.min(y + height, ay + ah);
          if (right > left && bottom > top) piece.append(svg('rect', {
            x: left, y: top - layout.offset, width: right - left, height: bottom - top, fill: '#fff'
          }));
        });
      });
      mask.append(piece);
    }
    defs.append(mask);
    stage.append(defs, svg('rect', {width: layout.width, height: layout.height - layout.offset,
      fill: '#000', mask: 'url(#secret10-overview-mask)'}));
    host.append(stage);
    host.dataset.overviewMotion = 'ready';
    observer.observe(host);
  }

  function play() {
    if (started || done || !stage) return;
    if (reduce.matches || document.hidden) return finish();
    started = true;
    host.dataset.overviewMotion = 'playing';
    order.forEach(([name, delay]) => {
      stage.querySelectorAll(`[data-overview-step="${name}"]`).forEach(piece => {
        const arrow = name.startsWith('to-');
        animations.push(piece.animate([
          {opacity: 0, transform: arrow ? 'scale(1)' : 'scale(.96)'},
          {opacity: 1, transform: 'scale(1)'}
        ], {duration: arrow ? 200 : 300, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both'}));
      });
    });
    // Atomic return to the original guarantees the approved final image and
    // avoids retaining duplicate compositing layers after the entrance.
    timer = setTimeout(finish, 4820);
  }

  image.addEventListener('load', build);
  image.addEventListener('error', finish, {once: true});
  if (image.complete) build();
  // A viewport/source change or a motion preference change must never strand
  // cropped pieces in a layout they were not designed for.
  mobile.addEventListener('change', finish);
  reduce.addEventListener('change', () => { if (reduce.matches) finish(); });
  const viewportWidth = innerWidth;
  addEventListener('resize', () => { if (started && !done && innerWidth !== viewportWidth) finish(); }, {passive: true});
  document.addEventListener('visibilitychange', () => { if (document.hidden && started) finish(); });
})();
