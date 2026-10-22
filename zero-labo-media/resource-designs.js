// Keep chapter index links useful when their destination is a closed folder.
export function revealResourceChapter(hash,doc=document){
 if(!/^#resource-chapter-(?:[1-9]|10)$/.test(hash))return false;
 const target=doc.getElementById(hash.slice(1));
 if(target?.tagName==='DETAILS')target.open=true;
 return Boolean(target);
}
if(typeof document!=='undefined'){
 revealResourceChapter(location.hash);
 document.addEventListener('click',event=>{
  const link=event.target.closest('.rd-chapter-index a');if(!link)return;
  revealResourceChapter(link.getAttribute('href'));
 });
 window.addEventListener('hashchange',()=>revealResourceChapter(location.hash));
}
