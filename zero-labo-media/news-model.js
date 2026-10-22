export const PAGE_SIZE=10;
export const CATEGORIES=[{id:'planning',label:'企画'},{id:'production',label:'制作'},{id:'traffic',label:'集客'},{id:'improvement',label:'改善'}];
export function prepareNews(records,chapters){
 const ids=new Set();
 return records.map(record=>{
  const chapter=chapters.find(c=>c.children.some(a=>a.id===record.articleId));
  const article=chapter?.children.find(a=>a.id===record.articleId);
  const category=CATEGORIES.find(c=>c.label===record.category);
  if(!article||!category||ids.has(record.articleId)||!record.excerpt||!Array.isArray(record.tags)||!record.tags.length||record.tags.some(t=>typeof t!=='string'||!t.trim()))throw Error('Invalid news record: '+record.articleId);
  ids.add(record.articleId);
  return {...record,title:article.title,category:category.id,categoryLabel:category.label,image:chapter.number===1?'hp-vs-lp-diagram.png':chapter.number<=4?'strategy-research.png':chapter.number<=7?'copy-design-build.png':'traffic-improvement.png'};
 });
}
export function selectNews(entries,{category='',tag='',page=1}={}){
 category=CATEGORIES.some(c=>c.id===category)?category:'';
 tag=entries.some(e=>e.tags.includes(tag))?tag:'';
 const filtered=entries.filter(e=>(!category||e.category===category)&&(!tag||e.tags.includes(tag)));
 const total=filtered.length,pages=Math.max(1,Math.ceil(total/PAGE_SIZE));
 const requested=/^\d+$/.test(String(page))?Number(page):1;
 page=Math.min(pages,Math.max(1,Number.isSafeInteger(requested)?requested:1));
 return {category,tag,page,pages,total,from:total?(page-1)*PAGE_SIZE+1:0,to:Math.min(page*PAGE_SIZE,total),items:filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)};
}
export function newsUrl({page=1,category='',tag=''}={}){
 const params=new URLSearchParams();if(category)params.set('category',category);if(tag)params.set('tag',tag);
 return (page>1?'/zero-commercial-lp-test/zero-labo-media/news/page/'+page+'/':'/zero-commercial-lp-test/zero-labo-media/news/')+(params.size?'?'+params.toString():'');
}
export function newsOptionsFromUrl(href){
 const url=new URL(href),match=url.pathname.match(/^\/zero-commercial-lp-test\/zero-labo-media\/news\/page\/(\d+)\/$/);
 return {page:match?match[1]:1,category:url.searchParams.get('category')||'',tag:url.searchParams.get('tag')||''};
}
