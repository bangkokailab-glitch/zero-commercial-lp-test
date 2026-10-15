/* Keep the two square gold outlines continuous through the central pointer.
   Geometry follows each heading's actual height, including the one-line About. */
(() => {
  'use strict';
  const ns = 'http://www.w3.org/2000/svg';
  const headings = document.querySelectorAll('.direction-a .selected-heading, .direction-a .back-heading');
  if (!headings.length) return;

  const create = (name, attrs = {}) => {
    const node = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };

  headings.forEach((heading, index) => {
    if (heading.querySelector(':scope > .heading-b__frame')) return;
    const id = `heading-b-gold-${index}`;
    const navyId = `heading-b-navy-${index}`;
    const svg = create('svg', {
      class: 'heading-b__frame',
      'aria-hidden': 'true',
      focusable: 'false',
      preserveAspectRatio: 'none'
    });
    const defs = create('defs');
    const gold = create('linearGradient', { id, x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
    [
      ['0%', '#c7a14b'], ['19%', '#ffedab'], ['44%', '#d6b15e'],
      ['69%', '#f5df94'], ['100%', '#d0aa54']
    ].forEach(([offset, color]) => gold.append(create('stop', { offset, 'stop-color': color })));
    const navy = create('linearGradient', { id: navyId, x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    navy.append(create('stop', { offset: '0%', 'stop-color': '#062552' }));
    navy.append(create('stop', { offset: '100%', 'stop-color': '#031a3b' }));
    defs.append(gold, navy);
    const fill = create('path', { fill: `url(#${navyId})` });
    const outline = (width) => create('path', {
      fill: 'none', stroke: `url(#${id})`, 'stroke-width': width,
      'stroke-linejoin': 'miter', 'vector-effect': 'non-scaling-stroke'
    });
    const outer = outline('3.2');
    const inner = outline('1.35');
    svg.append(defs, fill, outer, inner);
    heading.prepend(svg);
    heading.classList.add('heading-b');

    let lastSize = '';
    const draw = () => {
      const { width, height } = heading.getBoundingClientRect();
      if (!width || !height) return;
      const key = `${width}:${height}`;
      if (key === lastSize) return;
      lastSize = key;
      const center = width / 2;
      const tail = Math.min(32, Math.max(26, width * 28 / 390));
      const halfBase = tail * 1.5;
      const point = (value) => Number(value.toFixed(2));
      const w = point(width), h = point(height), c = point(center);
      heading.style.setProperty('--heading-b-tail', `${point(tail)}px`);
      svg.setAttribute('viewBox', `0 0 ${w} ${point(height + tail)}`);
      fill.setAttribute('d', `M0 0H${w}V${h}H${point(center + halfBase)}L${c} ${point(height + tail)}L${point(center - halfBase)} ${h}H0Z`);

      // Each complete path includes both diagonals. There is deliberately no
      // horizontal segment across the mouth of the central pointer.
      const frame = (inset, baseInset, tipInset, sideInset) => {
        const bottom = point(height - baseInset);
        return `M${inset} ${inset}H${point(width - inset)}V${bottom}H${point(center + halfBase - sideInset)}L${c} ${point(height + tail - tipInset)}L${point(center - halfBase + sideInset)} ${bottom}H${inset}Z`;
      };
      outer.setAttribute('d', frame(9, 9, 7, 6));
      inner.setAttribute('d', frame(14.5, 14.5, 15, 11));
    };
    draw();
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(heading);
    else window.addEventListener('resize', draw, { passive: true });
    document.fonts?.ready.then(draw);
  });
})();
