export function normalizeTerm(value){
 return String(value).normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/[\s・／/\-ー]+/g,'');
}
export function matchesTerm(corpus,termChapter,query,chapter){
 if(chapter&&String(termChapter)!==String(chapter))return false;
 const words=String(query).normalize('NFKC').trim().split(/\s+/).filter(Boolean).map(normalizeTerm);
 return words.every(word=>normalizeTerm(corpus).includes(word));
}
