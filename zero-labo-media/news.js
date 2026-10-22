import {selectNews,newsOptionsFromUrl,newsUrl} from './news-model.js';
import {renderNewsCards,renderNewsPagination,newsCount} from './news-render.js';

export function initNews(root,locationObject,historyObject){
 const form=root.querySelector('.news-filters'),category=root.querySelector('#news-category'),tag=root.querySelector('#news-tag');
 const reset=root.querySelector('#news-reset'),results=root.querySelector('#news-results'),count=root.querySelector('#news-count');
 const pagination=root.querySelector('#news-pagination'),empty=root.querySelector('#news-empty');
 let entries;
 try{
  entries=JSON.parse(root.querySelector('#news-data').textContent);
  if(!Array.isArray(entries)||!entries.length)throw Error('Missing news data');
 }catch{
  root.querySelector('#news-load-error').hidden=false;return;
 }
 function render(options){
  const state=selectNews(entries,options);
  category.value=state.category;tag.value=state.tag;
  results.innerHTML=renderNewsCards(state.items);count.textContent=newsCount(state);
  pagination.innerHTML=renderNewsPagination(state);pagination.hidden=state.total===0||state.pages<2;
  results.hidden=state.total===0;empty.hidden=state.total!==0;
  reset.hidden=!state.category&&!state.tag;
  const current=new URL(locationObject.href),next=newsUrl(state)+current.hash;
  if(current.pathname+current.search+current.hash!==next)historyObject.replaceState(null,'',next);
  return state;
 }
 const applyFilters=()=>render({category:category.value,tag:tag.value,page:1});
 const restore=()=>render(newsOptionsFromUrl(locationObject.href));
 form.addEventListener('submit',e=>{e.preventDefault();applyFilters();});
 category.addEventListener('change',applyFilters);tag.addEventListener('change',applyFilters);
 reset.addEventListener('click',()=>{category.value='';tag.value='';applyFilters();category.focus();});
 restore();form.hidden=false;
 return {render,restore};
}
if(typeof document!=='undefined'){
 const controller=initNews(document,window.location,window.history);
 if(controller)window.addEventListener('popstate',controller.restore);
}
