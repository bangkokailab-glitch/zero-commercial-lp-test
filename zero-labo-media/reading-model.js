// The children arrays in content.json are the single learning-order source.
// IDs and published URLs remain stable when those arrays are reordered.
export const publication = {
  chapters: {1: {status: 'published', url: '/zero-commercial-lp-test/zero-labo-media/chapters/lp-basics/'}},
  articles: {
    3: {status: 'published', url: '/zero-commercial-lp-test/zero-labo-media/articles/lp-homepage-difference/'},
    88: {status: 'preview', url: '/zero-commercial-lp-test/zero-labo-media/articles/ch01-001/'}
  }
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function chapterDestination(chapter, home = false, registry = publication) {
  const page = registry.chapters[chapter.number];
  return home ? {url: '#chapter-' + chapter.number, introduction: true} :
    page?.status === 'published' && page.url ? {url: page.url, introduction: false} :
    {url: '/zero-commercial-lp-test/zero-labo-media/#chapter-' + chapter.number, introduction: true};
}
export function readingState(chapter, currentId = null, registry = publication) {
  const currentIndex = chapter.children.findIndex(a => a.id === currentId);
  const articles = chapter.children.map((article, index) => {
    const record = registry.articles[article.id];
    const published = record?.status === 'published' && Boolean(record.url);
    const preview = record?.status === 'preview' && Boolean(record.url);
    const available = published || preview;
    return {...article, number: `${chapter.number}-${index + 1}`, published, preview, available,
      url: available ? record.url : null, current: article.id === currentId};
  });
  const next = currentIndex < 0 ? null : articles.slice(currentIndex + 1).find(a => a.available);
  return {articles: articles.map(a => ({...a, next: a.id === next?.id})),
    publishedCount: articles.filter(a => a.published).length,
    previewCount: articles.filter(a => a.preview).length,
    ending: currentIndex < 0 ? '' : currentIndex === articles.length - 1 ? 'この章の記事一覧はここまでです' :
      next ? '' : 'この先の記事は準備中です'};
}
export function renderReadingItem(article, {card = false, artwork = ''} = {}) {
  const status = article.current ? '現在の記事' : article.next ? '次に読む' : article.preview ? '確認用' : article.published ? '読む' : '準備中';
  const className = `reading-item${card ? ' reading-item--card' : ''}${article.current ? ' is-current' : ''}${article.next ? ' is-next' : ''}${article.preview ? ' is-preview' : ''}${!article.available ? ' is-pending' : ''}`;
  const linked = article.available && !article.current;
  return `<li data-article-id="${article.id}" data-reading-number="${article.number}"><${linked ? 'a' : 'div'} class="${className}"${linked ? ` href="${escape(article.url)}"` : article.current ? ' aria-current="page"' : ''}>` +
    (card && artwork ? `<img class="reading-thumbnail" src="/zero-commercial-lp-test/zero-labo-media/assets/${escape(artwork)}" width="72" height="60" loading="lazy" alt="">` : '') +
    `<span class="reading-number">${article.number}</span><span class="reading-item-title">${escape(article.title)}</span><span class="reading-state">${status}${linked ? '<span aria-hidden="true"> →</span>' : ''}</span></${linked ? 'a' : 'div'}></li>`;
}
export function renderReadingList(chapter, {currentId = null, cards = false, artwork = '', registry = publication} = {}) {
  const state = readingState(chapter, currentId, registry);
  const previewLabel = state.previewCount ? `／確認用${state.previewCount}記事` : '';
  return `<p class="reading-list-intro">番号順に読むと、前の記事で学んだことを次の記事につなげながら、理解を深められます。気になる記事から読むこともできます。</p><p class="reading-count">公開${state.publishedCount}記事${previewLabel}／掲載予定${state.articles.length}記事</p><ol class="reading-list${cards ? ' reading-list--cards' : ''}">` +
    state.articles.map(a => renderReadingItem(a, {card: cards, artwork})).join('') +
    `</ol>${state.ending ? `<p class="reading-ending">${state.ending}</p>` : ''}`;
}
