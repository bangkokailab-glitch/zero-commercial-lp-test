(() => {
  'use strict';
  if(!document.documentElement.dataset.zeroScope) {
    const scope=location.pathname.match(/^\/(recruit|labo|lp-media)(?:\/|$)/)?.[1]||'main';
    document.documentElement.dataset.zeroScope=scope;
  }
  const iconFace = /Font\s?Awesome|Genericons|dashicons|Material\s?Icons|slick/i;
  const applyFonts = root => {
    const elements = [root, ...root.querySelectorAll('*')].filter(e =>
      e instanceof HTMLElement && !/SCRIPT|STYLE|NOSCRIPT|IFRAME/.test(e.tagName) &&
      (/INPUT|TEXTAREA|SELECT|OPTION/.test(e.tagName) || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())));
    const weights = elements.map(e => {const s=getComputedStyle(e); return [e,iconFace.test(s.fontFamily)?null:(Number(s.fontWeight)>=600?'bold':'regular')];});
    for (const [e,weight] of weights) if(weight) e.dataset.zeroFont=weight;
  };
  const start = () => {
    applyFonts(document.body);
    document.documentElement.classList.add('zero-font-ready');
    if(document.documentElement.dataset.zeroScope==='recruit') {
      document.querySelectorAll('.bg_photo').forEach(e=>{const img=e.querySelector('img');if(img?.getAttribute('src'))e.style.backgroundImage=`url("${img.src}")`;});
      document.documentElement.classList.add('zero-recruit-backgrounds');
    }
    const sp=document.querySelector('#sp-btn'),label=document.querySelector('label[for="sp-btn"]');
    if(sp&&label){label.setAttribute('role','button');label.tabIndex=0;label.setAttribute('aria-label','メニュー');
      const sync=()=>label.setAttribute('aria-expanded',String(sp.checked));sync();sp.addEventListener('change',sync);
      label.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sp.checked=!sp.checked;sync()}});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'){sp.checked=false;sync()}});
    }
    if(document.documentElement.hasAttribute('data-zero-preview')) {
      document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();alert('テストサイトのため送信は行いません。本番サイトのフォームは変更していません。');},true);
      document.querySelectorAll('form').forEach(f=>{f.removeAttribute('action');f.setAttribute('onsubmit','return false');const note=document.createElement('p');note.className='zero-preview-form-notice';note.textContent='表示確認用フォームです。送信・検索は実行されません。個人情報は入力しないでください。';f.prepend(note)});
    }
    // Theme scripts may create mobile navigation after DOMContentLoaded.
    requestAnimationFrame(()=>applyFonts(document.body));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
