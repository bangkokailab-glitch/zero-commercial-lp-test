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
    const range = () => Math.max(0, screen.scrollHeight - screen.clientHeight);
    const sourceImage = () => screen.querySelector('[data-lp-example-image]') || screen.querySelector('img');
    function contentTop(element) {
      return element.getBoundingClientRect().top - screen.getBoundingClientRect().top
        + screen.scrollTop - screen.clientTop;
    }
    function pointGeometry() {
      const image = sourceImage();
      return image ? { top: contentTop(image), height: image.getBoundingClientRect().height }
        : { top: 0, height: screen.scrollHeight };
    }
    function guideText(guide) {
      const speech = guide.querySelector('[data-lp-example-text], .lp-example__speech');
      return (guide.dataset.lpExampleText || speech?.innerText
        || guide.querySelector('img[alt]')?.alt || guide.textContent || '')
        .replace(/\s+/g, ' ').trim();
    }
    function update() {
      frame = 0;
      const maxScroll = range();
      const fraction = maxScroll ? Math.max(0, Math.min(1, screen.scrollTop / maxScroll)) : 0;
      let next = 0;
      if (isStaged) {
        const midpoint = screen.scrollTop + screen.clientHeight / 2;
        stages.forEach((stage, index) => { if (contentTop(stage) <= midpoint) next = index; });
      } else if (screen.scrollTop <= 1 || maxScroll === 0) {
        next = 0;
      } else if (screen.scrollTop >= maxScroll - 1) {
        next = sceneCount - 1;
      } else {
        const geometry = pointGeometry();
        const readingLine = screen.scrollTop + screen.clientHeight * 0.25;
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
      component.querySelectorAll('[data-lp-example-current]').forEach((element) => { element.textContent = String(active + 1).padStart(2, '0'); });
      component.querySelectorAll('[data-lp-example-total]').forEach((element) => { element.textContent = String(sceneCount); });
      if (status) status.textContent = `解説 ${active + 1} / ${sceneCount}：${guides[active] ? guideText(guides[active]) : notes[active]?.querySelector('.manga-example__thought')?.textContent || ''}`;
    }
    function requestUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    function moveTo(index) {
      if (!Number.isInteger(index) || index < 0 || index >= sceneCount) return;
      let target = 0;
      if (isStaged) {
        target = contentTop(stages[index]);
      } else if (index > 0) {
        const geometry = pointGeometry();
        // Align the chosen section with the same reading line used above.
        // Two CSS pixels avoid rounding backwards at a section boundary.
        target = geometry.top + geometry.height * points[index] - screen.clientHeight * 0.25 + 2;
      }
      screen.scrollTo({
        top: Math.min(range(), Math.max(0, target)),
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
    screen.querySelectorAll('img').forEach((image) => image.addEventListener('load', requestUpdate));
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(requestUpdate);
      observer.observe(screen);
      [...screen.children].forEach((child) => observer.observe(child));
    } else {
      window.addEventListener('resize', requestUpdate, { passive: true });
    }
    update();
  });
})();
