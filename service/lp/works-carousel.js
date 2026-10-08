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
  }
  previous.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });
  track.addEventListener('scroll', function () {
    if (!frame) frame = requestAnimationFrame(update);
  }, {passive:true});
  track.addEventListener('keydown', function (event) {
    if (!mobile.matches || event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  if (mobile.addEventListener) mobile.addEventListener('change', layout);
  else mobile.addListener(layout);
  // Preserve the selected case through orientation changes without moving the page vertically.
  if (window.ResizeObserver) new ResizeObserver(layout).observe(track);
  layout();
})();
