/* Band-first headings and gentle image entrances. No scroll hijacking or replay. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pending = new Set();
  const running = new Map();
  const loading = new WeakSet();
  let observer;

  // Concise, deliberately two-line mobile labels. Keep the approved desktop
  // wording and the full panel copy unchanged; never truncate a heading.
  const mobileHeadings = {
    'secrets-box-1':['ZEROが考える','ランディングページとは？'],
    'secrets-box-44':['売る・予約・見込み客獲得','目的に合ったLPを選ぶ'],
    'secrets-box-89':['売上と広告費が同じでは','利益が残らない'],
    'secrets-box-132':['目標から逆算する','必要な問い合わせ数'],
    'secrets-box-195':['顧客分析｜買う理由と','迷う理由を捉える'],
    'secrets-box-244':['競合分析｜比較から','選ばれる理由を探す'],
    'secrets-box-265':['自社分析｜当たり前を','選ばれる理由に変える'],
    'secrets-box-311':['徹底調査から生み出す','商品の新しい見せ方'],
    'secrets-box-328':['3Cと検索意図に合った','ストーリーを設計する'],
    'secrets-box-354':['商品の特徴ではなく','あの人の悩みに答える'],
    'secrets-box-363':['読む理由から行動へ','一文ずつ気持ちをつなぐ'],
    'secrets-message-title':['最後は、自分の手で','届く言葉に魂を込める'],
    'secrets-box-397':['ランディングページは','ファーストビューが命'],
    'secrets-box-426':['見出しと画像で惹きつけ','図解で理解を深める'],
    'secrets-box-493':['スマホ対応はPC画面の','縮小ではない'],
    'secrets-box-510':['せっかく集めたお客様を','表示待ちで逃さない'],
    'secrets-box-524':['ボタンの先まで考える','申し込みが完了する導線'],
    'secrets-box-572':['どこから誰を集めるか','LPとセットで考える'],
    'secrets-box-597':['記事LP・動画LPで','自分ごとに変える'],
    'secrets-box-643':['検索広告で探す人を','答えのあるLPへ案内'],
    'secrets-box-667':['SEO・AI検索で','疑問への答えを相談へ'],
    'secrets-box-699':['SNSで接点を広げ','検討中の人に判断材料を'],
    'secrets-box-768':['A/Bテストで確かめる','選ばれる伝え方'],
    'secrets-box-789':['行動データで迷いを探し','一つずつ改善する'],
    'secrets-box-market-strategy':['市場を広げる前に','売上につながる売り方を'],
    'secrets-box-839':['今の強みを活かして','別の業界のお客様へ'],
    'secrets-box-863':['英語・タイ語・中国語で','海外市場へ届ける']
  };
  Object.entries(mobileHeadings).forEach(([id, lines]) => {
    const copy = document.querySelector(`#${id} .secrets-toggle-copy`);
    if (!copy) return;
    if (copy.firstChild?.nodeType === Node.TEXT_NODE) {
      copy.firstChild.textContent = copy.firstChild.textContent.replace(/^[①-⑳]\s*/, '');
    }
    const desktop = document.createElement('span');
    desktop.className = 'zero-subheading-desktop';
    desktop.append(...copy.childNodes);
    const mobile = document.createElement('span');
    mobile.className = 'zero-subheading-mobile';
    lines.forEach(text => {
      const line = document.createElement('span');
      line.textContent = text;
      mobile.append(line);
    });
    copy.append(desktop, mobile);
  });

  document.querySelectorAll('#secret .secrets-renovated').forEach(chapter => {
    chapter.querySelectorAll('.secrets-white > h4 > .secrets-toggle').forEach((button, index) => {
      if (button.querySelector('.zero-subheading-number')) return;
      const copy = button.querySelector('.secrets-toggle-copy');
      // Chapter 07 already has circled ordinals: replace them, never double-number.
      if (copy?.firstChild?.nodeType === Node.TEXT_NODE) {
        copy.firstChild.textContent = copy.firstChild.textContent.replace(/^[①-⑳]\s*/, '');
      }
      const number = document.createElement('span');
      number.className = 'zero-subheading-number';
      number.textContent = String(index + 1).padStart(2, '0');
      button.prepend(number);
      button.classList.add('zero-numbered-heading');
    });
  });

  const selectors = [
    '#worry .worry-h2', '#worry p.lines', '#worry p.dot', '#works > h2',
    '#copy .zero-copy-banner > span', '#copy .zero-copy-title', '#copy .copy-h2__label',
    '.secret-cover-a__live-title', '.secret-cover-a__live-lockup > .secret-cover-a__suffix',
    '.secret-cover-a__phases', '.secret-cover-a__description > p',
    '#secret .secrets-renovated > .wrap > h3',
    '#secret .secrets-white > h4 .secrets-toggle-copy',
    '#secret .secrets-closing--text > p',
    '#price > .wrap > h2', '#price .pricing-section-label',
    '#about > .wrap > h2', '#about .about-title-reveal', '#about .merit-box > h3',
    '.work-case__cvr', '.work-case__lift'
  ];
  const wipes = [...document.querySelectorAll(selectors.join(','))].map(target => {
    const wipe = document.createElement('span');
    wipe.className = 'zero-content-wipe';
    const copy = document.createElement('span');
    copy.className = 'zero-content-wipe__copy';
    copy.append(...target.childNodes);
    // Keep authored breaks, while balancing each phrase on narrow screens.
    if (target.matches('.secrets-toggle-copy') && copy.querySelector(':scope > br')) {
      const nodes = [...copy.childNodes];
      copy.replaceChildren();
      let line = document.createElement('span');
      line.className = 'zero-subheading-line';
      copy.append(line);
      nodes.forEach(node => {
        if (node.nodeName === 'BR') {
          line = document.createElement('span');
          line.className = 'zero-subheading-line';
          copy.append(line);
        } else line.append(node);
      });
    }
    wipe.append(copy);
    target.append(wipe);
    return wipe;
  });
  const images = [...document.querySelectorAll('#secret .secrets-renovated img')];
  images.forEach(image => image.classList.add('zero-secret-image'));
  document.querySelectorAll('#secret .secrets-renovated > .wrap > figure > .img-tag')
    .forEach(image => image.classList.add('zero-secret-number'));

  // The band follows each rendered line, including mobile line breaks. It never
  // fills the heading's surrounding margins/padding or overlaps another heading.
  function measureBars(wipe) {
    const copy = wipe.querySelector('.zero-content-wipe__copy');
    const origin = wipe.getBoundingClientRect();
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
    const lines = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        const line = lines.find(row => Math.min(row.bottom, rect.bottom) - Math.max(row.top, rect.top) > Math.min(row.bottom - row.top, rect.height) * .5);
        if (line) {
          line.left = Math.min(line.left, rect.left);
          line.right = Math.max(line.right, rect.right);
          line.top = Math.min(line.top, rect.top);
          line.bottom = Math.max(line.bottom, rect.bottom);
        } else lines.push({left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom});
      }
    }
    // Preserve the approved about-title artwork, revealing it with the same
    // band without retaining its previous, conflicting fade animation.
    if (!lines.length) copy.querySelectorAll('img').forEach(image => {
      const rect = image.getBoundingClientRect();
      if (rect.width && rect.height) lines.push(rect);
    });
    const bars = document.createElement('span');
    bars.className = 'zero-content-wipe__bars';
    bars.setAttribute('aria-hidden', 'true');
    lines.forEach(line => {
      const bar = document.createElement('span');
      bar.className = 'zero-content-wipe__bar';
      bar.style.cssText = `left:${line.left-origin.left}px;top:${line.top-origin.top}px;width:${line.right-line.left}px;height:${line.bottom-line.top}px`;
      bars.append(bar);
    });
    wipe.append(bars);
  }

  function finish(target) {
    clearTimeout(running.get(target));
    running.delete(target);
    pending.delete(target);
    observer?.unobserve(target);
    target.classList.remove('is-content-pending', 'is-content-entering');
    target.classList.add('is-content-shown');
    target.style.removeProperty('--content-delay');
    target.querySelector(':scope > .zero-content-wipe__bars')?.remove();
  }
  function show(target, delay = 0) {
    if (!pending.has(target)) return;
    // A lazy, large diagram should animate when its pixels arrive, not use up
    // its entrance while the visitor is still waiting for the download.
    if (target.tagName === 'IMG' && !target.complete) {
      if (!loading.has(target)) {
        loading.add(target);
        const ready = () => {
          target.removeEventListener('load', ready);
          target.removeEventListener('error', ready);
          loading.delete(target);
          const rect = target.getBoundingClientRect();
          if (rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight) show(target);
        };
        target.addEventListener('load', ready);
        target.addEventListener('error', ready);
      }
      return;
    }
    pending.delete(target);
    observer.unobserve(target);
    if (reduced.matches || document.hidden || (target.tagName === 'IMG' && !target.naturalWidth)) return finish(target);
    const banner = target.closest('.zero-copy-banner');
    // The tilted label reveals its actual white backing, not a second oversized
    // bar measured from a rotated screen-space rectangle.
    if (banner) banner.style.setProperty('--content-delay', `${delay}ms`);
    else if (target.classList.contains('zero-content-wipe')) measureBars(target);
    target.style.setProperty('--content-delay', `${delay}ms`);
    target.classList.replace('is-content-pending', 'is-content-entering');
    // Always settle, including an accordion closed during its entrance.
    running.set(target, setTimeout(() => finish(target), delay + 850));
  }
  function stop() {
    [...pending, ...running.keys()].forEach(finish);
    observer?.disconnect();
  }
  function start() {
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      const entering = entries.filter(entry => entry.isIntersecting && entry.intersectionRect.height > 0)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      entering.forEach((entry, index) => show(entry.target, Math.min(index * 100, 400)));
    }, {threshold: 0, rootMargin: '0px 0px -6% 0px'});
    [...wipes, ...images].forEach(target => {
      pending.add(target);
      target.classList.add('is-content-pending');
      observer.observe(target);
    });
  }
  // Wait for font metrics without making a slow font host a blocking dependency.
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(resolve => setTimeout(resolve, 1600))]).then(start);
  reduced.addEventListener('change', event => { if (event.matches) stop(); });
  window.addEventListener('resize', () => [...running.keys()].forEach(finish), {passive: true});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) [...running.keys()].forEach(finish);
  });
  document.addEventListener('focusin', event => {
    const heading = event.target.closest('.secrets-toggle, .pricing-section-toggle');
    heading?.querySelectorAll('.zero-content-wipe').forEach(finish);
  });
})();
