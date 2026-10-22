import {chapterDestination} from './reading-model.js';

export function initReadingNavigation(data) {
  const role = document.body.dataset.page || 'home';
  if (!['home', 'chapter', 'article'].includes(role)) return;
  const chapterNumber = Number(document.body.dataset.chapter);
  if (role !== 'home' && !data.chapters.some(c => c.number === chapterNumber)) return;
  const header = document.querySelector('.site-header');
  if (!header) return;
  const tocLabel = role === 'chapter' ? 'この章の目次' : 'この記事の目次';
  const headingSelectors = role === 'article' ? '.article-section h2, .article-section h3, .article-section h4' :
    '.chapter-lesson h2, .chapter-lesson h3, .chapter-faq h2, .chapter-tools h2, .chapter-tools h3, .rd-faq h2, .rd-support-tools h2, .rd-support-tools h3, .chapter-summary h2';
  const headings = role === 'home' ? [] : [...document.querySelectorAll(headingSelectors)];
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = `reading-heading-${index + 1}`;
    heading.tabIndex = -1;
  });
  const bar = document.createElement('nav');
  bar.className = 'reading-dock';
  bar.setAttribute('aria-label', '読む場所を選ぶ');
  bar.hidden = true;
  bar.innerHTML = (headings.length ? `<button type="button" data-reading-open="toc" aria-haspopup="dialog" aria-controls="reading-dialog" aria-expanded="false"><span aria-hidden="true">☷</span>${tocLabel}</button>` : '') +
    '<button type="button" data-reading-open="chapters" aria-haspopup="dialog" aria-controls="reading-dialog" aria-expanded="false"><span aria-hidden="true">▤</span>章を選ぶ</button>';
  const dialog = document.createElement('dialog');
  dialog.id = 'reading-dialog';
  dialog.className = 'reading-dialog';
  dialog.setAttribute('aria-labelledby', 'reading-dialog-title');
  dialog.innerHTML = '<div class="reading-dialog-header"><h2 id="reading-dialog-title"></h2><button type="button" class="reading-dialog-close" aria-label="一覧を閉じる">閉じる <span aria-hidden="true">×</span></button></div><nav class="reading-dialog-links"></nav>';
  document.body.append(bar, dialog);
  document.body.classList.add('has-reading-dock');
  const title = dialog.querySelector('h2');
  const links = dialog.querySelector('nav');
  let trigger;
  let savedScroll = 0;
  function updateVisibility() {
    bar.hidden = header.getBoundingClientRect().bottom > 0 && !dialog.open && !bar.contains(document.activeElement);
  }
  function close(restore = true) {
    dialog.close();
    document.documentElement.classList.remove('reading-dialog-open');
    trigger?.setAttribute('aria-expanded', 'false');
    if (restore) {
      trigger?.focus({preventScroll: true});
      window.scrollTo({top: savedScroll, behavior: 'instant'});
    }
    updateVisibility();
  }
  function jump(target) {
    const heading = target.matches('h1,h2,h3,h4') ? target : target.querySelector('h1,h2,h3,h4') || target;
    heading.tabIndex = -1;
    heading.focus({preventScroll: true});
    heading.scrollIntoView({block: 'start', behavior: 'instant'});
  }
  bar.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    trigger = button;
    savedScroll = window.scrollY;
    const toc = button.dataset.readingOpen === 'toc';
    title.textContent = toc ? tocLabel : '章を選ぶ';
    links.setAttribute('aria-label', title.textContent);
    const ol = document.createElement('ol');
    (toc ? headings : data.chapters).forEach((item, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      if (toc) {
        a.href = '#' + item.id;
        a.textContent = item.textContent;
        a.className = 'toc-level-' + item.tagName.toLowerCase();
      } else {
        const destination = chapterDestination(item, role === 'home');
        a.href = destination.url;
        a.innerHTML = `<span class="menu-chapter-number">第${item.number}章</span>`;
        const text = document.createElement('span');
        text.textContent = item.parent.title;
        a.append(text);
        const state = document.createElement('small');
        state.textContent = (item.number === chapterNumber ? '現在の章' : '') +
          (destination.introduction && role !== 'home' ? (item.number === chapterNumber ? ' · ' : '') + '章の紹介' : '');
        a.append(state);
        if (item.number === chapterNumber) a.setAttribute('aria-current', 'true');
      }
      li.append(a); ol.append(li);
    });
    links.replaceChildren(ol);
    document.documentElement.classList.add('reading-dialog-open');
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
    dialog.querySelector('.reading-dialog-close').focus({preventScroll: true});
  });
  dialog.querySelector('.reading-dialog-close').addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => {event.preventDefault(); close();});
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') event.stopPropagation();
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll('button, a[href]')];
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
    }
  });
  links.addEventListener('click', event => {
    const a = event.target.closest('a');
    if (!a || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const url = new URL(a.href);
    if (url.pathname === location.pathname && url.hash) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      close(false);
      history.pushState(null, '', url);
      jump(target);
    } else {
      sessionStorage.setItem('zero-reading-destination', url.pathname + url.hash);
      close(false);
    }
  });
  const observer = new IntersectionObserver(updateVisibility);
  observer.observe(header);
  window.addEventListener('scroll', updateVisibility, {passive: true});
  bar.addEventListener('focusout', () => requestAnimationFrame(updateVisibility));
  // Native Tab scrolling can stop at the viewport edge, underneath a fixed dock.
  // Keep focused reading controls (including table scrollers and CTAs) above it.
  document.addEventListener('focusin', event => {
    const target = event.target;
    if (!target.matches('a,button,summary,[tabindex="0"]') || !target.closest('main')) return;
    requestAnimationFrame(() => {
      if (bar.hidden || dialog.open || document.activeElement !== target) return;
      const rect = target.getBoundingClientRect(), dock = bar.getBoundingClientRect();
      if (rect.right <= dock.left || rect.left >= dock.right) return;
      if (rect.bottom > dock.top - 16) {
        const shift = rect.height < dock.top - 40 ? rect.bottom - dock.top + 16 : rect.top - 24;
        window.scrollBy({top: shift, behavior: 'instant'});
      }
    });
  });
  const incoming = sessionStorage.getItem('zero-reading-destination');
  if (incoming === location.pathname + location.hash || location.hash) {
    sessionStorage.removeItem('zero-reading-destination');
    requestAnimationFrame(() => {
      const target = location.hash ? document.getElementById(location.hash.slice(1)) : document.querySelector('h1');
      if (target) jump(target);
    });
  }
  updateVisibility();
}
