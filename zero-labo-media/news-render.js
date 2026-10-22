import {CATEGORIES,newsUrl,selectNews} from './news-model.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderNewsCards(items){
 return items.map(n=>'<li><button type="button" class="news-card" data-article="'+n.articleId+'"><span class="news-image"><img src="/zero-commercial-lp-test/zero-labo-media/assets/'+esc(n.image)+'" width="1536" height="1024" loading="lazy" alt=""></span><span class="news-copy"><span class="news-meta"><span class="news-date">公開準備中</span><span class="news-category">'+esc(n.categoryLabel)+'</span></span><span class="news-title">'+esc(n.title)+'</span><span class="news-excerpt">'+esc(n.excerpt)+'</span><span class="news-tags">'+n.tags.map(t=>'<span>#'+esc(t)+'</span>').join('')+'</span></span></button></li>').join('');
}
export function renderNewsPagination(state){
 if(!state.total||state.pages<2)return '';
 const link=(page,label,aria)=>'<a href="'+esc(newsUrl({...state,page}))+'" aria-label="'+aria+'">'+label+'</a>';
 return (state.page>1?link(state.page-1,'← 前へ','前のページへ'):'<span class="page-disabled" aria-disabled="true">← 前へ</span>')+Array.from({length:state.pages},(_,i)=>i+1).map(page=>page===state.page?'<span class="page-current" aria-current="page" aria-label="'+page+'ページ目（現在のページ）">'+page+'</span>':link(page,page,page+'ページ目へ')).join('')+(state.page<state.pages?link(state.page+1,'次へ →','次のページへ'):'<span class="page-disabled" aria-disabled="true">次へ →</span>');
}
export function newsCount(state){return state.total?'全'+state.total+'件中 '+state.from+'〜'+state.to+'件':'該当する記事はありません';}
export function renderNewsPage(template,entries,page=1){
 const state=selectNews(entries,{page});
 return template.replace('<!-- NEWS_CATEGORIES -->',CATEGORIES.map(c=>'<option value="'+c.id+'">'+c.label+'</option>').join('')).replace('<!-- NEWS_TAGS -->',[...new Set(entries.flatMap(e=>e.tags))].map(tag=>'<option value="'+esc(tag)+'">'+esc(tag)+'</option>').join('')).replace('<!-- NEWS_COUNT -->',newsCount(state)).replace('<!-- NEWS_ITEMS -->',renderNewsCards(state.items)).replace('<!-- NEWS_PAGINATION -->',renderNewsPagination(state)).replace('<!-- NEWS_DATA -->',JSON.stringify(entries).replace(/</g,'\\u003c'));
}
