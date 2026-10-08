(function () {
  'use strict';
  var mobile = window.matchMedia('(max-width:768px)');
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
  document.querySelectorAll('.lp-swipe-navigation[data-swipe-for]').forEach(function (navigation) {
    var track = document.getElementById(navigation.dataset.swipeFor);
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;
    var isWorks = track.id === 'works-case-track';
    var slider = track.closest('.lp-purpose-slider');
    var desktopControls = slider && slider.querySelector('.lp-purpose-controls');
    var desktopPrev = desktopControls && desktopControls.querySelector('.lp-purpose-prev');
    var desktopNext = desktopControls && desktopControls.querySelector('.lp-purpose-next');
    var dots = desktopControls && desktopControls.querySelector('.lp-purpose-dots');
    var previous = navigation.querySelector('.lp-swipe-prev');
    var next = navigation.querySelector('.lp-swipe-next');
    var position = navigation.querySelector('.lp-swipe-position');
    var works = isWorks && document.getElementById('works');
    var current = 0, frame = 0, heightFrame = 0, settleTimer = 0, lastWidth = -1;
    var lastMobile = mobile.matches;
    function perView() { return mobile.matches || isWorks ? 1 : 4; }
    function count() { return Math.ceil(cards.length / perView()); }
    function active() { return mobile.matches || !isWorks; }
    function pad(value) { return String(value).padStart(2, '0'); }
    function leftOf(index) {
      var card = cards[Math.min(index * perView(), cards.length - 1)];
      var left = card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
      return Math.max(0, Math.min(left, track.scrollWidth - track.clientWidth));
    }
    function updateControls() {
      var text = pad(current + 1) + ' / ' + pad(cards.length);
      if (position.textContent !== text) position.textContent = text;
      previous.disabled = current === 0; next.disabled = current >= count() - 1;
      if (desktopControls) {
        desktopPrev.disabled = current === 0; desktopNext.disabled = current >= count() - 1;
        dots.querySelectorAll('button').forEach(function (dot, index) {
          dot.classList.toggle('is-current', index === current);
          dot.setAttribute('aria-current', index === current ? 'true' : 'false');
        });
      }
    }
    function syncFromScroll() {
      frame = 0;
      if (!active() || !track.clientWidth) return;
      var distance = Infinity;
      for (var i = 0; i < count(); i++) {
        var delta = Math.abs(leftOf(i) - track.scrollLeft);
        if (delta < distance) { distance = delta; current = i; }
      }
      updateControls();
    }
    function setVariable(element, name, value) {
      if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
    }
    function fitHeight() {
      heightFrame = 0;
      if (!mobile.matches) {
        track.style.removeProperty('--swipe-current-height');
        track.style.removeProperty('--works-current-height');
        if (works) works.style.removeProperty('--works-scrollbar-height');
        return;
      }
      if (!track.clientWidth) return; // Closed accordion: measure only after it opens.
      syncFromScroll();
      var height = cards[current].getBoundingClientRect().height + 'px';
      setVariable(track, '--swipe-current-height', height);
      if (works) {
        setVariable(track, '--works-current-height', height);
        setVariable(works, '--works-scrollbar-height', Math.max(0, track.offsetHeight - track.clientHeight) + 'px');
      }
    }
    function scheduleHeight() { if (!heightFrame) heightFrame = requestAnimationFrame(fitHeight); }
    function go(index) {
      if (!active() || !track.clientWidth) return;
      index = Math.max(0, Math.min(count() - 1, index));
      track.scrollTo({left:leftOf(index), behavior:reduce.matches ? 'instant' : 'smooth'});
    }
    function renderDots() {
      if (!dots) return;
      dots.replaceChildren();
      if (mobile.matches) return;
      for (var i = 0; i < count(); i++) {
        var dot = document.createElement('button');
        dot.type = 'button'; dot.className = 'lp-purpose-dot'; dot.dataset.page = i;
        dot.setAttribute('aria-label', (i + 1) + 'ページ目を表示');
        dot.addEventListener('click', function () { go(Number(this.dataset.page)); });
        dots.appendChild(dot);
      }
    }
    function layout() {
      if (lastMobile !== mobile.matches) {
        if (!isWorks) current = mobile.matches ? current * 4 : Math.floor(current / 4);
        lastMobile = mobile.matches;
      }
      current = Math.min(current, count() - 1);
      navigation.hidden = !mobile.matches;
      if (active()) {
        track.setAttribute('tabindex', '0'); track.setAttribute('aria-roledescription', 'カルーセル');
        if (track.clientWidth) track.scrollTo({left:leftOf(current), behavior:'instant'});
      } else {
        track.removeAttribute('tabindex'); track.removeAttribute('aria-roledescription'); track.scrollLeft = 0;
      }
      renderDots(); updateControls(); scheduleHeight();
    }
    previous.addEventListener('click', function () { go(current - 1); });
    next.addEventListener('click', function () { go(current + 1); });
    if (desktopControls) {
      desktopPrev.addEventListener('click', function () { go(current - 1); });
      desktopNext.addEventListener('click', function () { go(current + 1); });
    }
    track.addEventListener('scroll', function () {
      if (!frame) frame = requestAnimationFrame(syncFromScroll);
      clearTimeout(settleTimer); settleTimer = setTimeout(scheduleHeight, 150);
    }, {passive:true});
    track.addEventListener('scrollend', scheduleHeight);
    track.addEventListener('load', scheduleHeight, true);
    track.addEventListener('keydown', function (event) {
      if (!active() || event.target !== track) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    if (mobile.addEventListener) mobile.addEventListener('change', layout);
    else mobile.addListener(layout);
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (track.clientWidth !== lastWidth) { lastWidth = track.clientWidth; layout(); }
      }).observe(track);
      var observer = new ResizeObserver(scheduleHeight);
      cards.forEach(function (card) { observer.observe(card); });
    } else window.addEventListener('resize', layout);
    if (document.fonts) document.fonts.ready.then(scheduleHeight);
    layout();
  });
})();
