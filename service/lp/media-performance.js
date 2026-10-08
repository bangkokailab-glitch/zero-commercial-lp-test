/* Pause decorative motion when it cannot help the reader. */
(() => {
  'use strict';

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visibility = new WeakMap();
  const videos = Array.from(document.querySelectorAll('video[src$="mv.mp4"], video[data-background-src]'));
  // A fixed/oversized background video's own rectangle can cover the viewport
  // before its section arrives. Use the content section for visibility instead.
  const targetFor = video => video.closest('#copy') || video;
  const videoByTarget = new Map(videos.map(video => [targetFor(video), video]));
  const prepareVideo = video => {
    if (!video.dataset.backgroundSrc || motion.matches) return;
    video.src = video.dataset.backgroundSrc;
    video.preload = 'metadata';
    delete video.dataset.backgroundSrc;
  };
  // The secondary background is far below the first view. Do not compete with
  // hero text/fonts at startup; prepare it shortly before the reader reaches it.
  if ('IntersectionObserver' in window) {
    const preloadObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !motion.matches) {
          prepareVideo(videoByTarget.get(entry.target));
          preloadObserver.unobserve(entry.target);
        }
      });
    }, {rootMargin:'300px 0px'});
    videos.filter(video => video.dataset.backgroundSrc).forEach(video => preloadObserver.observe(targetFor(video)));
  }

  const syncVideo = video => {
    const mayPlay = !motion.matches && !document.hidden && visibility.get(video) === true;
    if (!mayPlay) {
      video.pause();
      return;
    }
    prepareVideo(video);
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') promise.catch(() => {});
  };

  const syncVideos = () => videos.forEach(syncVideo);
  const videoObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const video = videoByTarget.get(entry.target);
          visibility.set(video, entry.isIntersecting && entry.intersectionRatio > 0);
          syncVideo(video);
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
    if (videoObserver) videoObserver.observe(targetFor(video));
    else {
      const rect = targetFor(video).getBoundingClientRect();
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
