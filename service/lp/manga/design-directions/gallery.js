(() => {
  const gallery = document.getElementById('review-gallery');
  if (!gallery) return;

  const nav = document.querySelector('.review-nav');
  const sections = [...document.querySelectorAll('.comparison-section')];
  const directionButtons = [...document.querySelectorAll('[data-select-direction]')];
  const sectionLinks = [...document.querySelectorAll('[data-section-link]')];
  let activeSection = sections[0];
  let updatePending = false;
  let directionRequest = 0;

  function navigationHeight() {
    return Math.ceil(nav.getBoundingClientRect().height);
  }

  function updateNavigationHeight() {
    document.documentElement.style.setProperty('--nav-height', `${navigationHeight()}px`);
  }

  function findCurrentSection() {
    const readingLine = navigationHeight() + 70;
    return sections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= readingLine && rect.bottom > readingLine;
    }) || (sections[0].getBoundingClientRect().top > readingLine ? sections[0] : sections[sections.length - 1]);
  }

  function updateCurrentSection() {
    updatePending = false;
    activeSection = findCurrentSection();
    sectionLinks.forEach(link => {
      if (link.dataset.sectionLink === activeSection.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  async function selectDirection(direction, focus = false) {
    if (!['A', 'B', 'C'].includes(direction)) return;
    const request = ++directionRequest;
    const requestedSection = findCurrentSection();
    const requestedImage = requestedSection.querySelector(`[data-direction-card="${direction}"] img`);
    document.querySelectorAll(`[data-direction-card="${direction}"] img`).forEach(img => { img.loading = 'eager'; });
    if (document.body.dataset.direction !== direction && requestedImage && !requestedImage.complete) {
      gallery.setAttribute('aria-busy', 'true');
      try { await requestedImage.decode(); } catch (_) {}
      if (request !== directionRequest) return;
    }
    gallery.removeAttribute('aria-busy');
    const isMobile = matchMedia('(max-width: 899px)').matches;
    const currentSection = findCurrentSection();
    const currentRect = currentSection.getBoundingClientRect();
    const readingLine = navigationHeight() + 12;
    const wasInsideSection = currentRect.top < readingLine;
    const progress = Math.max(0, Math.min(1, (readingLine - currentRect.top) / currentRect.height));

    document.body.dataset.direction = direction;
    directionButtons.forEach(button => {
      const selected = button.dataset.selectDirection === direction;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    gallery.setAttribute('aria-label', `${direction}案の比較画像`);
    try { sessionStorage.setItem('manga-review-direction', direction); } catch (_) {}

    if (isMobile && wasInsideSection) {
      requestAnimationFrame(() => {
        const updatedRect = currentSection.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + updatedRect.top + updatedRect.height * progress - readingLine, behavior: 'instant' });
        updateCurrentSection();
      });
    }
  }

  directionButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectDirection(button.dataset.selectDirection));
    button.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % directionButtons.length;
      if (event.key === 'ArrowLeft') nextIndex = (index + directionButtons.length - 1) % directionButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = directionButtons.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      selectDirection(directionButtons[nextIndex].dataset.selectDirection, true);
    });
  });

  sectionLinks.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const target = document.getElementById(link.dataset.sectionLink);
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    history.replaceState(null, '', `#${target.id}`);
    updateCurrentSection();
  }));

  document.querySelectorAll('.design-card img').forEach(img => {
    const loaded = () => {
      // Use actual source dimensions to reserve space without forcing a screen-sized artboard.
      img.width = img.naturalWidth;
      img.height = img.naturalHeight;
      updateCurrentSection();
    };
    const unavailable = () => {
      if (img.hidden) return;
      const message = document.createElement('span');
      message.className = 'image-unavailable';
      message.textContent = '画像を読み込めませんでした。ページを再読み込みしてください。';
      img.hidden = true;
      img.after(message);
    };
    img.addEventListener('load', loaded);
    img.addEventListener('error', unavailable, { once: true });
    if (img.complete) {
      if (img.naturalWidth > 0) loaded();
      else unavailable();
    }
  });

  window.addEventListener('scroll', () => {
    if (!updatePending) {
      updatePending = true;
      requestAnimationFrame(updateCurrentSection);
    }
  }, { passive: true });
  new ResizeObserver(() => {
    updateNavigationHeight();
    updateCurrentSection();
  }).observe(nav);
  updateNavigationHeight();
  try { selectDirection(sessionStorage.getItem('manga-review-direction') || 'A'); } catch (_) { selectDirection('A'); }
  updateCurrentSection();
})();
