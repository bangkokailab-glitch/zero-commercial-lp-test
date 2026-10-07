(() => {
  'use strict';

  const mobile = window.matchMedia('(max-width: 768px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 260;
  let accordionScrollToken = 0;

  function setupMobileViewportLock() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    const desktopValue = viewport.getAttribute('content') || 'width=device-width,initial-scale=1.0';
    const mobileValue = 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no';
    const update = () => viewport.setAttribute('content', mobile.matches ? mobileValue : desktopValue);
    update();
    if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', update);
  }

  function setupAboutPortrait() {
    const message = document.querySelector('#about .about-support-message');
    const paragraph = message?.querySelector(':scope > p');
    if (!paragraph || typeof ResizeObserver !== 'function') return;
    const update = () => {
      if (mobile.matches) {
        message.style.setProperty('--about-message-visible-height', `${Math.ceil(paragraph.getBoundingClientRect().height) + 24}px`);
      } else {
        message.style.removeProperty('--about-message-visible-height');
      }
    };
    new ResizeObserver(update).observe(paragraph);
    if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', update);
    update();
  }

  function cancelPanel(panel) {
    if (panel._zeroAnimation) panel._zeroAnimation.cancel();
    panel._zeroAnimation = null;
    panel.classList.remove('is-animating');
    panel.style.removeProperty('height');
  }

  function setPanel(panel, open, animate = true) {
    if (!panel) return Promise.resolve();
    cancelPanel(panel);
    if (!animate || reduced.matches || typeof panel.animate !== 'function') {
      panel.hidden = !open;
      return Promise.resolve();
    }
    if (open) panel.hidden = false;
    const start = open ? 0 : panel.getBoundingClientRect().height;
    const end = open ? panel.scrollHeight : 0;
    panel.classList.add('zero-smooth-panel', 'is-animating');
    panel._zeroAnimation = panel.animate(
      [{ height: `${start}px`, opacity: open ? .35 : 1 }, { height: `${end}px`, opacity: open ? 1 : .35 }],
      { duration, easing: 'cubic-bezier(.25,.8,.25,1)' }
    );
    const animation = panel._zeroAnimation;
    return animation.finished.catch(() => {}).then(() => {
      if (panel._zeroAnimation !== animation) return;
      panel.hidden = !open;
      panel._zeroAnimation = null;
      panel.classList.remove('is-animating');
      panel.style.removeProperty('height');
    });
  }

  function cancelPendingAccordionScroll() {
    accordionScrollToken += 1;
    window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    document.documentElement.classList.remove('zero-accordion-switching');
  }

  function alignOpenedAccordionHeading(target, waits, token) {
    document.documentElement.classList.add('zero-accordion-switching');
    Promise.allSettled(waits).then(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    })).then(() => {
      if (token !== accordionScrollToken || target.getAttribute('aria-expanded') !== 'true') return;
      const header = document.getElementById('top-header');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const top = window.scrollY + target.getBoundingClientRect().top - Math.max(12, headerBottom + 12);
      window.scrollTo({ top: Math.max(0, top), behavior: reduced.matches ? 'auto' : 'smooth' });
    }).finally(() => {
      if (token === accordionScrollToken) document.documentElement.classList.remove('zero-accordion-switching');
    });
  }

  function holdAccordionScrollAnchor(waits, token) {
    document.documentElement.classList.add('zero-accordion-switching');
    Promise.allSettled(waits).then(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    })).finally(() => {
      if (token === accordionScrollToken) document.documentElement.classList.remove('zero-accordion-switching');
    });
  }

  function setupExclusiveDetails(selector) {
    const details = Array.from(document.querySelectorAll(selector));
    details.forEach(detail => {
      const summary = detail.querySelector(':scope > summary');
      const panel = detail.querySelector(':scope > div');
      if (!summary || !panel || summary.dataset.zeroAccordionReady) return;
      summary.dataset.zeroAccordionReady = 'true';
      summary.setAttribute('aria-expanded', String(detail.open));
      summary.addEventListener('click', event => {
        if (!mobile.matches) return;
        event.preventDefault();
        const willOpen = summary.getAttribute('aria-expanded') !== 'true';
        const switching = willOpen && details.some(other => other !== detail && other.querySelector(':scope > summary')?.getAttribute('aria-expanded') === 'true');
        cancelPendingAccordionScroll();
        const token = accordionScrollToken;
        const waits = [];
        details.forEach(other => {
          if (other === detail || other.querySelector(':scope > summary')?.getAttribute('aria-expanded') !== 'true') return;
          const otherPanel = other.querySelector(':scope > div');
          other.querySelector(':scope > summary')?.setAttribute('aria-expanded', 'false');
          const stateToken = (other._zeroStateToken || 0) + 1;
          other._zeroStateToken = stateToken;
          waits.push(setPanel(otherPanel, false).then(() => {
            if (other._zeroStateToken === stateToken && other.querySelector(':scope > summary')?.getAttribute('aria-expanded') === 'false') other.open = false;
          }));
        });
        if (willOpen) {
          detail._zeroStateToken = (detail._zeroStateToken || 0) + 1;
          detail.open = true;
          summary.setAttribute('aria-expanded', 'true');
          waits.push(setPanel(panel, true));
        } else {
          summary.setAttribute('aria-expanded', 'false');
          const stateToken = (detail._zeroStateToken || 0) + 1;
          detail._zeroStateToken = stateToken;
          waits.push(setPanel(panel, false).then(() => {
            if (detail._zeroStateToken === stateToken && summary.getAttribute('aria-expanded') === 'false') detail.open = false;
          }));
        }
        summary.focus({ preventScroll: true });
        if (switching) alignOpenedAccordionHeading(summary, waits, token);
        else holdAccordionScrollAnchor(waits, token);
      });
    });
    const reset = () => details.forEach(detail => {
      const panel = detail.querySelector(':scope > div');
      cancelPanel(panel);
      if (!mobile.matches) panel.hidden = false;
      detail.querySelector(':scope > summary')?.setAttribute('aria-expanded', String(detail.open));
    });
    if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', reset);
  }

  function highlightText(root, needle) {
    if (!root || !needle || root.querySelector('.zero-trust-highlight')?.textContent === needle) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.includes(needle)) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('.zero-trust-highlight, script, style')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const node = walker.nextNode();
    if (!node) return false;
    const start = node.nodeValue.indexOf(needle);
    const tail = node.splitText(start);
    tail.splitText(needle.length);
    const mark = document.createElement('mark');
    mark.className = 'zero-trust-highlight';
    mark.textContent = needle;
    tail.replaceWith(mark);
    return true;
  }

  function setupTrustHighlights() {
    const secretHighlights = [
      ['#secret-01', 'その違いを生むのは、LPを作る担当者がどれだけの熱量を持って商材と顧客に本気で向き合い、売るための戦略を設計できるかです。'],
      ['#secret-02', '問い合わせ1件の価値を計算し、目標達成に必要な受注・問い合わせ・アクセス数を逆算します。'],
      ['#secret-03', '大切なのは、情報を集めるだけで終わらせず、そこから「何を伝えれば選ばれるのか」を考え抜くことです。'],
      ['#secret-04', 'ZEROは、3C分析で定めた訴求軸とコンセプトから、興味を引くビッグアイデアを考えます。'],
      ['#secret-05', 'ZEROは、文章の先にいる一人を想像し、最後の一文まで考え抜きます。'],
      ['#secret-06', 'ZEROは、商品の価値を視覚化し、理解と納得につなげます。'],
      ['#secret-07', 'ZEROはペルソナの閲覧環境を踏まえ、スマホ・PCの表示、読み込み速度、申し込み導線まで整えます。'],
      ['#secret-08', 'ここまで考え抜いた戦略を、集客から購入・予約・相談へつながる流れに生かします。'],
      ['#secret-09', 'ZEROは、A/Bテストと分析を繰り返しながら、LPを成果につながる「一流の営業マン」へ育てていきます。'],
      ['#secret-10', '育てた「一流の営業マン」の活躍の場を広げ、新たな販売機会をつくります。']
    ];
    secretHighlights.forEach(([selector, text]) => highlightText(document.querySelector(selector), text));

    const panelHighlights = [
      'その違いを生むのは、LPを作る担当者がどれだけの熱量を持って商材と顧客に本気で向き合い、売るための戦略を設計できるかです。',
      'ZEROでは、300社以上のLP制作・改善実績をもとに、ご希望の型をそのまま作るだけでなく、申し込みから購入・契約までの道筋を考え、必要であれば「何を申し込んでもらうLPにするのか」から改めてご提案します。',
      '自社の過去の実績から計算し、データがない部分は仮説を置く。',
      '公開後はKPIと実績を比較し、集客・LP・商談のどこを改善すべきかを見極めます。',
      'ペルソナを作って終わりにはしません。その人の気持ちの流れを捉え、「だからLPでは、この疑問に答える必要がある」ところまで整理します。',
      'そこから、自社でも示すべき安心材料や、競合では満たされていない期待を探ります。',
      'ZEROでは、調査した情報をもとに訴求軸とコンセプトを定め、その方針から構成・コピー・デザインがぶれないように制作を進めます。',
      'しかし、その背景には、商材と顧客を深く理解しようとするリサーチと、考え続ける時間があります。',
      'ZEROは、ビッグアイデアを入口に、お客様が次に知りたいことへ一つずつ答えながら、選ぶ理由が積み重なるストーリーを作ります。',
      '「自分の悩みに、どう役立つのか」を理解し、選ぶための判断材料を届けることが目的です。',
      '「よさそうだった」で終わらず、「まず相談してみよう」と判断できるところまで、言葉を整えます。',
      '私が担当者に求めるのは、文章をきれいに整えることだけではありません。',
      'ZEROは、伝えたい価値から判断します。',
      '大切なのは、画像を増やすことではなく、理解する負担を減らすこと。',
      'そのため、私たちは基本的にスマホからデザインし、構築もスマホを基準に進めています。',
      'ZEROは画像の見やすさと軽さを両立させ、最初の画面からスムーズに読み進められる状態を目指します。',
      'LINEかフォームかを先に決めるのではなく、ペルソナが相談しやすく、その後の商談・予約につながる方法を選ぶ。',
      'ZEROは、誰に届けるかに加え、その人が「今、どこまで理解しているか」まで考えて、伝え方を決めます。',
      '一流の営業マンも、相手の理解度に合わせて話す順番を変えます。LPへの集客も同じです。',
      '誰に、何を、どの順番で伝え、いくらで獲得するか。これまでの戦略が、ここで一つにつながります。',
      '検索した言葉への答えが、広告からLPまで続いていることが大切です。',
      '検索意図に答えることと、相談までの道筋を整えることを、両方考えます。',
      'ZEROは、広告のクリックだけでなく、興味が理解に変わり、相談・購入へ進むまでを一つの流れで考えます。',
      'ZEROは、ペルソナと3C分析をもとに集客方法を選び、LTV・KPIを判断基準として、広告とLPをつなげます。',
      '最初から一つの切り口を正解と決めつけず、実際の反応から、どの訴求が選ばれやすいのかを確かめます。',
      '仮説を立て、配置、コピー、画像、オファー、フォームなどを一箇所ずつ変更し、A/Bテストで確かめます。',
      'ZEROは、これまでの分析や検証で得た学びを生かし、新たな業界への販売につなげます。',
      '大切なのは、文字を翻訳するだけで終わらせないことです。'
    ];
    document.querySelectorAll('#secret .secrets-white').forEach((box, index) => {
      highlightText(box.querySelector('.secrets-panel'), panelHighlights[index]);
    });

    [
      ['#pricing-final-b', '調査・戦略・制作の対応範囲に合わせて、3つの制作プランをご用意しています。'],
      ['#price .pricing-free-frame', 'ご回答内容と打ち合わせを通じて理解を深め、構成案・デザイン案を作成します。'],
      ['#price .pricing-flow-frame', 'ご契約後は、企画構成・原稿・デザインを段階ごとに確認しながら制作を進めます。']
    ].forEach(([selector, text]) => highlightText(document.querySelector(selector), text));
  }

  function setupDeferredImages() {
    document.querySelectorAll('#secret img, #marketing-flow-final img, #price img, #about img, .cta-offer--gold img').forEach(image => {
      if (!image.hasAttribute('loading')) image.loading = 'lazy';
      if (!image.hasAttribute('decoding')) image.decoding = 'async';
    });
  }

  function setupHeadingReveals() {
    const selectors = [
      '#secret-01 > .wrap > h3',
      '#secret-02 > .wrap > h3',
      '#secret-03 > .wrap > h3',
      '#secret-04 > .wrap > h3',
      '#secret-05 > .wrap > h3',
      '#secret-06 > .wrap > h3',
      '#secret-07 > .wrap > h3',
      '#secret-08 > .wrap > h3',
      '#secret-09 > .wrap > h3',
      '#secret-10 > .wrap > h3',
      '#marketing-flow-final-title',
      '#price > .wrap > h2',
      '#about > .wrap > h2'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(heading => {
      if (heading.closest('.cta-offer--gold') || heading.classList.contains('wow')) return;
      heading.classList.add('wow', 'fadein', 'zero-heading-reveal');
    });
  }

  function setupDiagramReveal() {
    if (reduced.matches || typeof IntersectionObserver !== 'function') return;
    const diagrams = Array.from(document.querySelectorAll('#marketing-flow-final .marketing-flow-diagram, #secret .secrets-renovated figure'));
    const closings = Array.from(document.querySelectorAll('#secret .secrets-closing--image'));
    diagrams.forEach(diagram => diagram.classList.add('zero-diagram-reveal'));
    closings.forEach(closing => closing.classList.add('zero-closing-reveal'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        const art = target.querySelector(':scope > .secrets-closing-art');
        const motion = art || target;
        let timer;
        const complete = event => {
          if (event && event.target !== motion) return;
          target.classList.add('is-reveal-complete');
          window.clearTimeout(timer);
          motion.removeEventListener('animationend', complete);
          motion.removeEventListener('animationcancel', complete);
        };
        motion.addEventListener('animationend', complete);
        motion.addEventListener('animationcancel', complete);
        target.classList.add('is-revealed');
        // Also settle if an accordion is closed before its entry animation ends.
        timer = window.setTimeout(complete, art ? 1250 : 850);
        observer.unobserve(target);
      });
    }, { threshold: .08 });
    [...diagrams, ...closings].forEach(element => observer.observe(element));
  }

  function setupFlow() {
    const list = document.querySelector('#price .pricing-flow-list--static');
    if (!list) return;
    const items = Array.from(list.children);
    const rows = items.map((item, index) => {
      const number = item.querySelector(':scope > .pricing-flow-number-image');
      const icon = item.querySelector(':scope > img');
      const body = item.querySelector(':scope > .pricing-flow-step-content');
      const heading = body?.querySelector(':scope > h4');
      if (!number || !icon || !body || !heading) return null;
      const button = document.createElement('button');
      const panelId = `pricing-flow-mobile-panel-${index + 1}`;
      button.type = 'button';
      button.className = 'pricing-flow-mobile-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', panelId);
      button.append(number.cloneNode(true), icon.cloneNode(true));
      const title = document.createElement('span');
      title.className = 'pricing-flow-mobile-title';
      title.textContent = heading.textContent;
      const indicator = document.createElement('span');
      indicator.className = 'pricing-flow-mobile-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      button.append(title, indicator);
      body.id = panelId;
      item.insertBefore(button, item.firstChild);
      item.classList.add('is-mobile-flow-ready');
      return { item, button, body, open: false };
    }).filter(Boolean);

    function render(row, animate = true) {
      row.button.setAttribute('aria-expanded', String(row.open));
      return setPanel(row.body, row.open, animate);
    }
    function setOnlyOpen(selected) {
      const waits = [];
      rows.forEach(row => {
        const next = row === selected;
        if (row.open === next) return;
        row.open = next;
        waits.push(render(row));
      });
      return waits;
    }
    rows.forEach(row => row.button.addEventListener('click', () => {
      if (!mobile.matches) {
        setOnlyOpen(row.open ? null : row);
        row.button.focus({ preventScroll: true });
        return;
      }
      const switching = !row.open && rows.some(other => other !== row && other.open);
      cancelPendingAccordionScroll();
      const token = accordionScrollToken;
      const waits = setOnlyOpen(row.open ? null : row);
      row.button.focus({ preventScroll: true });
      if (switching) alignOpenedAccordionHeading(row.button, waits, token);
      else holdAccordionScrollAnchor(waits, token);
    }));
    function modeChanged() {
      rows.forEach(row => {
        row.open = false;
        row.button.setAttribute('aria-expanded', 'false');
        cancelPanel(row.body);
        row.body.hidden = true;
      });
    }
    modeChanged();
    if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', modeChanged);
  }

  function setupPricingNotes() {
    const notes = Array.from(document.querySelectorAll('#pricing-final-b .pfb-notes'));
    if (!notes.length) return;

    const rows = notes.map((note, index) => {
      const heading = note.querySelector(':scope > h5');
      const list = note.querySelector(':scope > ul');
      if (!heading || !list || note.dataset.zeroNotesReady) return null;

      const button = document.createElement('button');
      const panel = document.createElement('div');
      const panelId = `pricing-notes-panel-${index + 1}`;
      button.type = 'button';
      button.className = 'pfb-notes-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', panelId);
      button.textContent = heading.textContent;
      panel.id = panelId;
      panel.className = 'pfb-notes-panel';
      panel.append(list);
      note.append(button, panel);
      note.dataset.zeroNotesReady = 'true';
      return { button, panel, open: false };
    }).filter(Boolean);

    function render(row, animate = true) {
      row.button.setAttribute('aria-expanded', String(row.open));
      return setPanel(row.panel, row.open, animate);
    }

    function setOnlyOpen(selected) {
      const waits = [];
      rows.forEach(row => {
        const next = row === selected;
        if (row.open === next) return;
        row.open = next;
        waits.push(render(row));
      });
      return waits;
    }

    rows.forEach(row => row.button.addEventListener('click', () => {
      if (!mobile.matches) return;
      const switching = !row.open && rows.some(other => other !== row && other.open);
      cancelPendingAccordionScroll();
      const token = accordionScrollToken;
      const waits = setOnlyOpen(row.open ? null : row);
      row.button.focus({ preventScroll: true });
      if (switching) alignOpenedAccordionHeading(row.button, waits, token);
      else holdAccordionScrollAnchor(waits, token);
    }));

    function modeChanged() {
      rows.forEach(row => {
        row.open = false;
        row.button.setAttribute('aria-expanded', 'false');
        cancelPanel(row.panel);
        row.panel.hidden = mobile.matches;
      });
    }

    modeChanged();
    if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', modeChanged);
  }

  setupMobileViewportLock();
  setupAboutPortrait();
  setupExclusiveDetails('#price .pricing-faq');
  setupExclusiveDetails('#secrets-example-120, #secrets-example-125');
  setupHeadingReveals();
  setupDiagramReveal();
  setupFlow();
  setupPricingNotes();
  setupTrustHighlights();
  setupDeferredImages();
})();
