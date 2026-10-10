/* Readiness metadata for the editable diagram renderer. No font files are copied. */
document.fonts.ready.then(() => {
  const fonts = Array.from(document.fonts).filter(face => /pshingopr6n/.test(face.family));
  const state = name => ({
    loaded: fonts.filter(face => face.family.includes(name) && face.status === 'loaded').length,
    errors: fonts.filter(face => face.family.includes(name) && face.status === 'error').length,
  });
  document.documentElement.dataset.fontAudit = JSON.stringify({
    status: document.fonts.status,
    regular: state('regular'), bold: state('bold'),
    regularCheck: document.fonts.check('16px "mfw-pshingopr6n-regular"', '布団を自宅から申し込む'),
    boldCheck: document.fonts.check('24px "mfw-pshingopr6n-bold"', '成約率 獲得単価 改善'),
    headingFamily: getComputedStyle(document.querySelector('h1')).fontFamily,
    bodyFamily: getComputedStyle(document.body).fontFamily,
    failedImages: Array.from(document.images).filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
  });
});
