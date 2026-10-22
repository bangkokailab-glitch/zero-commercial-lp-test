import {matchesTerm} from './glossary-search.js';

export function initGlossary(root,locationObject=window.location){
 const form=root.querySelector('.glossary-search'),query=root.querySelector('#glossary-query'),chapter=root.querySelector('#glossary-chapter');
 const count=root.querySelector('#glossary-result-count'),reset=root.querySelector('#glossary-reset'),empty=root.querySelector('#glossary-empty');
 const terms=[...root.querySelectorAll('.glossary-term')],groups=[...root.querySelectorAll('.glossary-group')];
 if(!form||!query||!chapter)return;
 function update(){
  let visible=0;
  for(const term of terms){term.hidden=!matchesTerm(term.dataset.search,term.dataset.chapter,query.value,chapter.value);if(!term.hidden)visible++;}
  for(const group of groups)group.hidden=![...group.querySelectorAll('.glossary-term')].some(term=>!term.hidden);
  const active=Boolean(query.value.trim()||chapter.value);
  count.textContent=active?visible+'語が見つかりました（全'+terms.length+'語）':'全'+terms.length+'語';
  reset.hidden=!active;empty.hidden=visible!==0;
 }
 function revealHash(){
  let id;try{id=decodeURIComponent(locationObject.hash.slice(1));}catch{return;}
  const target=terms.find(term=>term.id===id);if(!target)return;
  if(target.hidden){query.value='';chapter.value='';update();target.scrollIntoView({block:'start'});}
  const details=target.querySelector('details');if(details)details.open=true;
 }
 form.hidden=false;form.addEventListener('submit',e=>{e.preventDefault();update();});
 query.addEventListener('input',e=>{if(!e.isComposing)update();});query.addEventListener('compositionend',update);
 chapter.addEventListener('change',update);
 reset.addEventListener('click',()=>{query.value='';chapter.value='';update();query.focus();});
 update();revealHash();
 return {update,revealHash};
}
if(typeof document!=='undefined'){
 const controller=initGlossary(document);
 if(controller)window.addEventListener('hashchange',controller.revealHash);
}
