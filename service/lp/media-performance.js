/* Pause decorative motion when it cannot help the reader. */
(() => {
  'use strict';

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visibility = new WeakMap();
  const videos = Array.from(document.querySelectorAll('video[src$="mv.mp4"]'));

  const syncVideo = video => {
    const mayPlay = !motion.matches && !document.hidden && visibility.get(video) === true;
    if (!mayPlay) {
      video.pause();
      return;
    }
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') promise.catch(() => {});
  };

  const syncVideos = () => videos.forEach(syncVideo);
  const videoObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          visibility.set(entry.target, entry.isIntersecting && entry.intersectionRatio > 0);
          syncVideo(entry.target);
        });
      }, { threshold: 0 })
    : null;

  videos.forEach(video => {
    // Explicit properties help iOS inline autoplay as well as the HTML attributes.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    visibility.set(video, false);
    video.addEventListener('loadeddata', () => syncVideo(video));
    video.addEventListener('canplay', () => syncVideo(video));
    if (motion.matches) video.removeAttribute('autoplay');
    if (videoObserver) videoObserver.observe(video);
    else {
      const rect = video.getBoundingClientRect();
      visibility.set(video, rect.bottom > 0 && rect.top < innerHeight);
    }
  });

  document.addEventListener('visibilitychange', syncVideos);
  window.addEventListener('pageshow', syncVideos);
  if (motion.addEventListener) motion.addEventListener('change', syncVideos);
  else if (motion.addListener) motion.addListener(syncVideos);
  syncVideos();

  const initWorksObserver = () => {
    if (!window.jQuery || !('IntersectionObserver' in window)) return;
    const galleries = Array.from(document.querySelectorAll('.works-box.slick-initialized'));
    if (!galleries.length) return;
    const galleryVisibility = new WeakMap();
    const syncGallery = gallery => {
      const slider = window.jQuery(gallery);
      if (!slider.hasClass('slick-initialized')) return;
      if (motion.matches || document.hidden || galleryVisibility.get(gallery) !== true) slider.slick('slickPause');
      else slider.slick('slickPlay');
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        galleryVisibility.set(entry.target, entry.isIntersecting && entry.intersectionRatio > 0);
        syncGallery(entry.target);
      });
    }, { threshold: 0 });
    galleries.forEach(gallery => {
      galleryVisibility.set(gallery, false);
      observer.observe(gallery);
    });
    const syncGalleries = () => galleries.forEach(syncGallery);
    document.addEventListener('visibilitychange', syncGalleries);
    if (motion.addEventListener) motion.addEventListener('change', syncGalleries);
    else if (motion.addListener) motion.addListener(syncGalleries);
  };

  window.addEventListener('load', initWorksObserver, { once: true });
})();
