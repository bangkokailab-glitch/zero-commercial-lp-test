(function () {
  'use strict';
  var track = document.getElementById('works-case-track');
  var navigation = document.querySelector('.works-case-navigation');
  if (!track || !navigation) return;
  var cards = Array.prototype.slice.call(track.children);
  var previous = navigation.querySelector('.works-case-prev');
  var next = navigation.querySelector('.works-case-next');
  var position = navigation.querySelector('.works-case-position');
  var mobile = window.matchMedia('(max-width:768px)');
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
  var current = 0;
  var frame = 0;
  var heightFrame = 0;
  var settleTimer = 0;
  var section = document.getElementById('works');
  function fitCurrentHeight() {
    heightFrame = 0;
    if (!mobile.matches) {
      track.style.removeProperty('--works-current-height');
      section.style.removeProperty('--works-scrollbar-height');
      return;
    }
    var height = cards[current].getBoundingClientRect().height + 'px';
    if (track.style.getPropertyValue('--works-current-height') !== height) {
      track.style.setProperty('--works-current-height', height);
    }
    var scrollbar = Math.max(0, track.offsetHeight - track.clientHeight) + 'px';
    if (section.style.getPropertyValue('--works-scrollbar-height') !== scrollbar) {
      section.style.setProperty('--works-scrollbar-height', scrollbar);
    }
  }
  function scheduleHeight() {
    if (!heightFrame) heightFrame = requestAnimationFrame(fitCurrentHeight);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function leftOf(card) {
    return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
  }
  function update() {
    frame = 0;
    if (!mobile.matches) return;
    var distance = Infinity;
    cards.forEach(function (card, index) {
      var delta = Math.abs(leftOf(card) - track.scrollLeft);
      if (delta < distance) { distance = delta; current = index; }
    });
    var text = pad(current + 1) + ' / ' + pad(cards.length);
    if (position.textContent !== text) position.textContent = text;
    previous.disabled = current === 0;
    next.disabled = current === cards.length - 1;
  }
  function go(index) {
    if (!mobile.matches) return;
    index = Math.max(0, Math.min(cards.length - 1, index));
    track.scrollTo({left:leftOf(cards[index]), behavior:reduce.matches ? 'auto' : 'smooth'});
  }
  function layout() {
    navigation.hidden = !mobile.matches;
    if (mobile.matches) {
      track.setAttribute('tabindex', '0');
      track.setAttribute('aria-roledescription', 'カルーセル');
      track.scrollTo({left:leftOf(cards[current]), behavior:'instant'});
      update();
    } else {
      track.removeAttribute('tabindex');
      track.removeAttribute('aria-roledescription');
      track.scrollLeft = 0;
    }
    scheduleHeight();
  }
  previous.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });
  track.addEventListener('scroll', function () {
    if (!frame) frame = requestAnimationFrame(update);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(scheduleHeight, 150);
  }, {passive:true});
  track.addEventListener('scrollend', scheduleHeight);
  track.addEventListener('load', scheduleHeight, true);
  track.addEventListener('keydown', function (event) {
    if (!mobile.matches || event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  if (mobile.addEventListener) mobile.addEventListener('change', layout);
  else mobile.addListener(layout);
  // Preserve the selected case through orientation changes without moving the page vertically.
  if (window.ResizeObserver) {
    var lastWidth = 0;
    new ResizeObserver(function () {
      var width = track.clientWidth;
      if (width !== lastWidth) { lastWidth = width; layout(); }
    }).observe(track);
    var cardObserver = new ResizeObserver(scheduleHeight);
    cards.forEach(function (card) { cardObserver.observe(card); });
  }
  if (document.fonts) document.fonts.ready.then(scheduleHeight);
  layout();
})();
