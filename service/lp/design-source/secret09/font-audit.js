/* Readiness metadata for the editable diagram renderer. No font files are copied. */
Promise.all([document.fonts.ready, ...Array.from(document.images).map(img => img.decode().catch(() => {}))]).then(() => {
  const fonts = Array.from(document.fonts).filter(face => /pshingopr6n/.test(face.family));
  const glyphs = {regular: '', bold: ''};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.parentElement || /SCRIPT|STYLE/.test(node.parentElement.tagName)) continue;
    const family = getComputedStyle(node.parentElement).fontFamily;
    for (const name of ['regular', 'bold']) {
      if (family.includes('mfw-pshingopr6n-' + name)) glyphs[name] += node.textContent;
    }
  }
  const state = name => ({
    loaded: fonts.filter(face => face.family.includes(name) && face.status === 'loaded').length,
    errors: fonts.filter(face => face.family.includes(name) && face.status === 'error').length,
  });
  document.documentElement.dataset.fontAudit = JSON.stringify({
    status: document.fonts.status,
    regular: state('regular'), bold: state('bold'),
    regularCheck: document.fonts.check('16px "mfw-pshingopr6n-regular"', [...new Set(glyphs.regular)].join('')),
    boldCheck: document.fonts.check('24px "mfw-pshingopr6n-bold"', [...new Set(glyphs.bold)].join('')),
    headingFamily: getComputedStyle(document.querySelector('h1')).fontFamily,
    bodyFamily: getComputedStyle(document.body).fontFamily,
    failedImages: Array.from(document.images).filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
  });
});
