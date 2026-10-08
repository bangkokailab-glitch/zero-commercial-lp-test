(() => {
  const descriptions = {
    a:'A｜元の白文字＋黄色の点を活かす、コンパクトな2行。既存LPとのなじみを重視。',
    b:'B｜「売れない理由は」を大きく、答えを黄色で強調。今回の「しっかり読ませたい」におすすめ。',
    c:'C｜白帯で問い、赤帯で答え。色面で視線を止める、ポスターのような見せ方。'
  };
  const params = new URLSearchParams(location.search);
  const section = document.querySelector('.copy-proposal');
  if (params.get('embed') === '1') document.body.classList.add('embed');
  function select(variant, change = false) {
    if (!descriptions[variant]) variant = 'a';
    section.className = 'copy-proposal variant-' + variant;
    document.querySelector('.review-note').textContent = descriptions[variant];
    document.querySelectorAll('[data-variant]').forEach(link => {
      if (link.dataset.variant === variant) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    if (change) {
      const url = new URL(location.href); url.searchParams.set('variant', variant);
      history.replaceState(null,'',url); section.classList.add('is-changing');
    }
  }
  document.querySelectorAll('[data-variant]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); select(link.dataset.variant, true);
  }));
  select(params.get('variant') || 'a');
})();
