(() => {
  document.querySelectorAll('[data-lp-example]').forEach((component) => {
    const screen = component.querySelector('[data-lp-example-screen]');
    const guides = [...component.querySelectorAll('[data-lp-example-guide]')];
    const controls = [...component.querySelectorAll('[data-lp-example-step]')];
    const notes = [...component.querySelectorAll('[data-lp-example-note]')];
    notes.forEach((note) => {
      const thought = note.querySelector('.manga-example__thought');
      note.classList.toggle('is-long', (thought?.textContent || '').trim().length > 18);
    });
    const selectors = [...component.querySelectorAll('[data-lp-example-select]')];
    const stages = [...component.querySelectorAll('[data-lp-example-stage]')];
    const progress = component.querySelector('[data-lp-example-progress]');
    const status = component.querySelector('[data-lp-example-status]');
    const methodStages = [...component.querySelectorAll('[data-lp-example-method-stage]')];
    const stageLabel = component.querySelector('[data-lp-example-stage-label]');
    const currentLabels = [...component.querySelectorAll('[data-lp-example-current]')];
    const totalLabels = [...component.querySelectorAll('[data-lp-example-total]')];
    const sceneCount = Math.max(guides.length, notes.length);
    if (!screen || !sceneCount) return;

    // Points are section starts in the complete source image, normalized 0–1.
    // They are not percentages of the available scroll range. Guide frames,
    // optional step buttons, and select options all use the same content order.
    const suppliedPoints = (component.dataset.lpExamplePoints || '')
      .split(',').map((value) => value.trim()).filter(Boolean).map(Number);
    const points = Array.from({ length: sceneCount }, (_, index) => {
      const point = suppliedPoints[index];
      return Number.isFinite(point) ? Math.max(0, Math.min(1, point))
        : sceneCount > 1 ? index / (sceneCount - 1) : 0;
    });
    points[0] = 0;
    for (let index = 1; index < points.length; index += 1) {
      points[index] = Math.max(points[index - 1], points[index]);
    }

    // Staged chat examples keep their existing midpoint-based behavior.
    const isStaged = stages.length === sceneCount;
    let active = -1;
    let frame = 0;
    let visible = !('IntersectionObserver' in window), geometryDirty = true;
    let screenHeight = 0, maxScroll = 0, stageTops = [], geometry = {top:0, height:0};
    const sourceImage = screen.querySelector('[data-lp-example-image]') || screen.querySelector('img');
    function measure() {
      if (!geometryDirty) return;
      const box = screen.getBoundingClientRect();
      const offset = screen.scrollTop - box.top - screen.clientTop;
      screenHeight = screen.clientHeight;
      maxScroll = Math.max(0, screen.scrollHeight - screenHeight);
      if (isStaged) stageTops = stages.map(stage => stage.getBoundingClientRect().top + offset);
      else if (sourceImage) {
        const imageBox = sourceImage.getBoundingClientRect();
        geometry = {top:imageBox.top + offset, height:imageBox.height};
      } else geometry = {top:0, height:screen.scrollHeight};
      geometryDirty = false;
    }
    function guideText(guide) {
      const speech = guide.querySelector('[data-lp-example-text], .lp-example__speech');
      return (guide.dataset.lpExampleText || speech?.innerText
        || guide.querySelector('img[alt]')?.alt || guide.textContent || '')
        .replace(/\s+/g, ' ').trim();
    }
    function update() {
      frame = 0;
      measure();
      const scrollTop = screen.scrollTop;
      const fraction = maxScroll ? Math.max(0, Math.min(1, scrollTop / maxScroll)) : 0;
      let next = 0;
      if (isStaged) {
        const midpoint = scrollTop + screenHeight / 2;
        stageTops.forEach((top, index) => { if (top <= midpoint) next = index; });
      } else if (scrollTop <= 1 || maxScroll === 0) {
        next = 0;
      } else if (scrollTop >= maxScroll - 1) {
        next = sceneCount - 1;
      } else {
        const readingLine = scrollTop + screenHeight * 0.25;
        const contentFraction = geometry.height > 0 ? (readingLine - geometry.top) / geometry.height : 0;
        points.forEach((point, index) => { if (point <= contentFraction) next = index; });
      }
      if (progress) progress.style.transform = `scaleX(${fraction})`;
      if (next === active) return;
      active = next;
      guides.forEach((guide, index) => { guide.hidden = index !== active; });
      notes.forEach((note, index) => { note.hidden = index !== active; });
      const stage = notes[active]?.querySelector('.manga-example__stage')?.textContent?.trim() || '';
      if (stageLabel) stageLabel.textContent = stage.split('｜')[1] || stage;
      const stageParts = stage.split('｜')[1]?.split('→') || [];
      methodStages.forEach((item) => {
        item.classList.toggle('is-active', item.dataset.lpExampleMethodStage === stageParts[0]);
        item.classList.toggle('is-near', item.dataset.lpExampleMethodStage === stageParts[1]);
      });
      controls.forEach((button, index) => {
        const current = index === active;
        button.classList.toggle('is-active', current);
        if (current) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      selectors.forEach((select) => {
        if ([...select.options].some((option) => option.value === String(active))) select.value = String(active);
        else select.selectedIndex = active;
      });
      currentLabels.forEach((element) => { element.textContent = String(active + 1).padStart(2, '0'); });
      totalLabels.forEach((element) => { element.textContent = String(sceneCount); });
      if (status) status.textContent = `解説 ${active + 1} / ${sceneCount}：${guides[active] ? guideText(guides[active]) : notes[active]?.querySelector('.manga-example__thought')?.textContent || ''}`;
    }
    function requestUpdate() {
      if (!frame && visible && !document.hidden) frame = window.requestAnimationFrame(update);
    }
    const invalidate = () => { geometryDirty = true; requestUpdate(); };
    function moveTo(index) {
      if (!Number.isInteger(index) || index < 0 || index >= sceneCount) return;
      measure();
      let target = 0;
      if (isStaged) {
        target = stageTops[index];
      } else if (index > 0) {
        // Align the chosen section with the same reading line used above.
        // Two CSS pixels avoid rounding backwards at a section boundary.
        target = geometry.top + geometry.height * points[index] - screenHeight * 0.25 + 2;
      }
      screen.scrollTo({
        top: Math.min(maxScroll, Math.max(0, target)),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }
    screen.addEventListener('scroll', requestUpdate, { passive: true });
    controls.forEach((button, index) => { button.addEventListener('click', () => moveTo(index)); });
    selectors.forEach((select) => {
      select.addEventListener('change', () => {
        const value = Number(select.value);
        moveTo(Number.isInteger(value) && select.value.trim() !== '' ? value : select.selectedIndex);
      });
    });
    screen.querySelectorAll('img').forEach((image) => image.addEventListener('load', invalidate));
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(invalidate);
      observer.observe(screen);
      [...screen.children].forEach((child) => observer.observe(child));
      if (sourceImage) observer.observe(sourceImage);
    } else {
      window.addEventListener('resize', invalidate, { passive: true });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) requestUpdate();
      else { cancelAnimationFrame(frame); frame = 0; }
    }, {rootMargin:'150px 0px'}).observe(component);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else requestUpdate();
    });
    document.fonts?.ready.then(invalidate);
    update();
  });
})();
