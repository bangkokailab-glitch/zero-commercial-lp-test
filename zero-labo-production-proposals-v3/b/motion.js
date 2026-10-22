const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  nav.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
    button.click();
    button.focus();
  }
});
const video = document.querySelector('.hero-media video');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
function syncVideo() {
  if (reduceMotion.matches || document.hidden) video.pause();
  else video.play().catch(() => {});
}
reduceMotion.addEventListener('change', syncVideo);
document.addEventListener('visibilitychange', syncVideo);
syncVideo();
