import {publication, chapterDestination, renderReadingList} from './reading-model.js';
import {initReadingNavigation} from './reading-navigation.js';
const q=(s)=>document.querySelector(s);
const isAbout=document.body.dataset.page==='about';
const isSubpage=Boolean(document.body.dataset.page);
const siteHome=isSubpage?'/zero-commercial-lp-test/zero-labo-media/':'';
const chapterOnePath=publication.chapters[1].url;
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraph=(xs)=>'<div class="prose">'+xs.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>';
const variants={
 A:{name:'大きな弧',path:'M0 10 C360 160 980 184 1440 28 L1440 240 L0 240 Z'},
 B:{name:'やさしい波',path:'M0 60 C390 260 1050 -20 1440 106 L1440 240 L0 240 Z'},
 C:{name:'青の章扉',path:'M0 22 C460 250 930 250 1440 22 L1440 240 L0 240 Z'},
 D:{name:'流れるカーブ',path:'M0 184 C360 208 730 -80 1440 60 L1440 240 L0 240 Z'},
 E:{name:'余白たっぷり',path:'M0 4 C310 272 1070 270 1440 20 L1440 240 L0 240 Z'}
};
variants.C.path=variants.D.path;
let current='C';

document.body.dataset.variant=current;
const divider=(from,to,i)=>'<div class="section-divider" aria-hidden="true" style="--from:'+from+';--to:'+to+'"><svg viewBox="0 0 1440 240" preserveAspectRatio="none" style="'+(i%2?'transform:scaleX(-1)':'')+'"><path d="'+variants[current].path+'"/></svg></div>';
const flowData={
 2:{title:'制作費だけでなく、公開後まで見通す',nodes:['目的を決める','予算を分ける','発注範囲を決める'],note:'制作・集客・改善を、ひとつの予算として考えます。'},
 3:{title:'3つの視点から、選ばれる理由を見つける',nodes:['顧客の悩み','競合の提案','自社の強み'],note:'調べた情報を合わせて「誰に、何を伝えるか」を決めます。'},
 4:{title:'提案の中心から、説明の順番へ',nodes:['コンセプト','説明の順番','ワイヤーフレーム'],note:'見た目を作る前に、伝える内容を一つの流れに。'},
 5:{title:'読み手の疑問に、一つずつ答える',nodes:['自分に関係ある？','何がよくなる？','どう申し込む？'],note:'専門的な内容も、読み手の言葉へ置き換えます。'},
 6:{title:'読み順が見えると、迷わず理解できる',nodes:['大切な情報','読みやすい本文','見つけやすい案内'],note:'文字・色・余白・配置で、情報の役割を分けます。'},
 7:{title:'読める・申し込める・振り返れる',nodes:['ページを構築','送信と計測を確認','公開・引き継ぎ'],note:'画面が表示されるだけでなく、受信まで確かめます。'},
 8:{title:'広告とLPを、ひと続きの説明に',nodes:['検索・SNS・記事','同じ約束のLP','問い合わせ'],note:'入口で期待したことに、LPがきちんと答えます。'},
 9:{title:'一つ変えたら、結果を確かめる',nodes:['課題を見つける','仮説を立てて直す','結果を比べる'],note:'変更内容と結果を残し、次の改善へつなげます。'},
 10:{title:'相手が変われば、伝え方も見直す',nodes:['業種に合わせる','海外に合わせる','登録後につなぐ'],note:'共通の考え方を生かし、必要なところを作り直します。'}
};
const artwork=n=>n===1?'hp-vs-lp-diagram.png':n<=4?'strategy-research.png':n<=7?'copy-design-build.png':'traffic-improvement.png';
const figureNotes={1:'ホームページとLPは、役割と情報の並べ方が違います。',2:'誰に何を届けるかを整理し、目的・予算・発注範囲を決めます。',3:'顧客・競合・自社の3つを調べ、伝えるべき価値を見つけます。',4:'調査で見つけた価値を、コンセプトと説明の順番へつなげます。',5:'伝える内容を整理してから、読み手の言葉で文章にします。',6:'文章の大切な部分が伝わるよう、色・文字・配置を整えます。',7:'設計をページに実装し、動作と計測を確認してから公開します。',8:'検索やSNSなどの入口と、LPで伝える約束をそろえます。',9:'集客から申込みまでを確かめ、課題のある部分を見直します。',10:'分析で得た学びを、業種や市場に合わせた展開につなげます。'};
function figure(c){return '<figure class="chapter-illustration"><img src="assets/'+artwork(c.number)+'" width="1536" height="1024" loading="lazy" alt="'+esc(figureNotes[c.number])+'"><figcaption>'+esc(figureNotes[c.number])+'</figcaption></figure>';}
function parentCard(c){const destination=chapterDestination(c),ready=!destination.introduction;const opening=ready?'<a class="chapter-parent" href="'+destination.url+'">':'<div class="chapter-parent" aria-label="章専用ページは準備中">';return opening+'<span class="parent-thumb"><img src="assets/'+artwork(c.number)+'" width="1536" height="1024" loading="lazy" alt=""></span><span class="parent-button-copy"><small>第'+c.number+'章はここから</small><strong>'+esc(c.parent.title)+'</strong><span class="parent-read">'+(ready?'この章を最初から読む <span aria-hidden="true">→</span>':'章専用ページは準備中')+'</span></span>'+(ready?'</a>':'</div>');}
let data;
try{
 const r=await fetch('/zero-commercial-lp-test/zero-labo-media/content.json');if(!r.ok)throw Error('content');
 data=await r.json();
 if(document.body.dataset.page==='article' && document.body.dataset.articleId!=='88'){
  const chapter=data.chapters.find(c=>c.number===Number(document.body.dataset.chapter));
  q('#same-chapter-articles').innerHTML=renderReadingList(chapter,{currentId:Number(document.body.dataset.articleId)});
 }
 if(!isSubpage){
 const indexColumn=chapters=>'<ol class="end-index">'+chapters.map(c=>'<li><a href="#chapter-'+c.number+'"><span class="index-number">第'+c.number+'章</span><span class="index-title">'+esc(c.parent.title)+'</span><span class="index-arrow" aria-hidden="true">↗</span></a></li>').join('')+'</ol>';
 const dialogue=data.dialogue.map((s,i)=>'<div class="speech '+(i%2?'speech--ikeda':'speech--bear')+'">'+(i%2?'<img class="avatar" src="/zero-commercial-lp-test/zero-labo-media/assets/ikeda-naoki-portrait-v1.png" width="56" height="56" loading="lazy" alt="池田直樹">':'<img class="avatar" src="assets/giruguma-avatar.png" width="56" height="56" alt="初心者 LPクマ（仮イラスト）">')+'<div class="speech-content"><span class="speaker">'+(i%2?'LPの専門家 池田':'初心者 LPクマ')+'</span><div class="bubble"><p>'+esc(s)+'</p></div></div></div>').join('');
 let out='<h1 class="sr-only">'+esc(data.catalog.top.title)+'</h1><section class="intro-section" id="about"><div class="section-inner"><p class="eyebrow">はじめに</p><h2>ゼロラボについて</h2><h3>LPづくりの「分からない」を、<br>自分で判断できる力に。</h3>'+paragraph(data.intro)+'<div class="dialogue">'+dialogue+'</div><p class="avatar-note">※LPクマは仮イラストです。</p><nav class="chapter-index" id="index" aria-labelledby="index-title"><h2 id="index-title">全10章の目次</h2><div class="index-columns">'+indexColumn(data.chapters.slice(0,5))+indexColumn(data.chapters.slice(5))+'</div></nav></div></section>';
 for(const c of data.chapters){
  const tinted=c.number%2===1;
  out+=divider(tinted?'#fff':'var(--surface)',tinted?'var(--surface)':'#fff',c.number);
  out+='<section class="chapter '+(tinted?'is-tinted':'')+'" id="chapter-'+c.number+'" data-chapter="'+c.number+'"><div class="chapter-lead wide-inner"><div class="chapter-introduction"><div class="chapter-head"><span class="chapter-number" aria-hidden="true">'+String(c.number).padStart(2,'0')+'</span><div><p class="chapter-label">第'+c.number+'章｜'+esc(c.label)+'</p><h2>'+esc(c.parent.title)+'</h2></div></div>'+paragraph(c.intro)+'</div>'+figure(c)+'</div><div class="section-inner chapter-body"><h3>'+esc(c.heading)+'</h3>'+paragraph(c.body)+'<p class="decision">'+esc(c.decision)+'</p></div><div class="wide-inner parent-area"><div class="related-head parent-head"><h3>まずは章の全体を読む</h3></div>'+parentCard(c)+'</div><div class="wide-inner related-area"><div class="related-head"><h3>第'+c.number+'章のテーマ別記事</h3></div>'+renderReadingList(c,{cards:true,artwork:artwork(c.number)})+'</div></section>';
 }
 out+=divider('#fff','#eaf4fb',11)+'<section class="ending-section news-section" id="news"><div class="section-inner"><p class="eyebrow">最新情報</p><h2>LPの今を知る。</h2>'+paragraph(data.news)+'</div><div class="wide-inner"><p class="sample-note">掲載イメージ｜記事は準備中です</p><ul class="news-grid">';
 const newsItems=[{id:55,label:'AI・制作',excerpt:'AIを使う前に決めておくことと、公開前に人が確かめること。'},{id:57,label:'計測・公開',excerpt:'公開した後に振り返れるよう、成果の測り方を最初に整える。'},{id:77,label:'分析・改善',excerpt:'何を比べ、どこまで待つか。A/Bテストの進め方を整理する。'}];
 for(const n of newsItems){const c=data.chapters.find(c=>c.children.some(a=>a.id===n.id)),a=c.children.find(a=>a.id===n.id);out+='<li><button class="news-card" data-article="'+a.id+'"><span class="news-image"><img src="assets/'+artwork(c.number)+'" width="1536" height="1024" loading="lazy" alt=""></span><span class="news-copy"><span class="news-meta"><span class="news-date">公開準備中</span><span class="news-category">'+esc(n.label)+'</span></span><span class="news-title">'+esc(a.title)+'</span><span class="news-excerpt">'+esc(n.excerpt)+'</span><span class="news-read">記事について <span aria-hidden="true">→</span></span></span></button></li>';}
 out+='</ul><p class="news-archive-link"><a href="/zero-commercial-lp-test/zero-labo-media/news/">最新情報をすべて見る <span aria-hidden="true">→</span></a></p></div></section>';
out+=divider('#eaf4fb','var(--footer-blue)',12)+'<section class="share-section" id="sharing"><div class="share-note"><p class="share-tag">SHARE THE KNOWLEDGE</p><h2>役に立った知識を、<br>次の誰かにも。</h2><div class="prose"><p>LPづくりで迷っている仲間にも、<br class="desktop-break">このページをシェアしてみませんか。</p></div><div class="share-actions"><button type="button" data-share="x"><span aria-hidden="true">𝕏</span> Xでシェアする</button><button type="button" data-share="copy">リンクをコピー</button></div></div></section>';
 q('#article').innerHTML=out;
 }
 const footerHtml='<footer class="site-footer"><div class="wide-inner footer-bottom" id="operator"><div class="footer-brand"><a class=\"brand-lockup\" href="#cover" aria-label="ZEROラボ ページ先頭へ"><svg class=\"brand-symbol\" viewBox=\"0 0 40 40\" aria-hidden=\"true\"><defs><filter id=\"footer-symbol-white\" color-interpolation-filters=\"sRGB\"><feColorMatrix type=\"matrix\" values=\"0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -0.6378 -2.1456 -0.2166 0 3\"/></filter></defs><image href=\"assets/zero-logo-original.png\" width=\"142\" height=\"40\" filter=\"url(#footer-symbol-white)\"/></svg><span class=\"brand-word\">ZEROラボ</span></a><p>ランディングページを、<br>知る。つくる。育てる。</p></div><div class="footer-description">'+paragraph(data.about).replace('サイトです。','サイトです。<br>')+'<nav class="footer-links" aria-label="フッターサイトマップ"><div class="footer-link-row"><a href="/zero-commercial-lp-test/zero-labo-media/about/">ゼロラボについて</a><details class="chapter-dropdown footer-dropdown"><summary>10章一覧 <span aria-hidden="true">⌄</span></summary><div class="header-chapters footer-chapters"></div></details><a href="/zero-commercial-lp-test/zero-labo-media/news/">最新情報</a><a href="/zero-commercial-lp-test/zero-labo-media/glossary/">用語集</a></div><div class="footer-link-row"><a href="https://zero-s.jp/aboutus/" target="_blank" rel="noopener">会社情報</a><a href="https://zero-s.jp/service/lp/" target="_blank" rel="noopener">LP制作の相談はこちら</a><a href="https://zero-s.jp/contact/" target="_blank" rel="noopener">お問い合わせ</a></div></nav></div></div></footer>';
 q('#article').insertAdjacentHTML('afterend',footerHtml.replaceAll('href="#','href="'+siteHome+'#').replaceAll('src="assets/','src="/zero-commercial-lp-test/zero-labo-media/assets/').replaceAll('href="assets/','href="/zero-commercial-lp-test/zero-labo-media/assets/'));
 if(document.body.dataset.page==='news')document.querySelectorAll('a[href="/zero-commercial-lp-test/zero-labo-media/news/"]').forEach(a=>a.setAttribute('aria-current','page')); if(isAbout)document.querySelectorAll('a[href="/zero-commercial-lp-test/zero-labo-media/about/"]').forEach(a=>a.setAttribute('aria-current','page')); if(document.body.dataset.page==='glossary')document.querySelectorAll('a[href="/zero-commercial-lp-test/zero-labo-media/glossary/"]').forEach(a=>a.setAttribute('aria-current','page'));
 q('.header-chapters').innerHTML=data.chapters.map(c=>'<a href="'+chapterDestination(c,!isSubpage).url+'">第'+c.number+'章　'+esc(c.label)+'</a>').join('');
 q('.footer-chapters').innerHTML=data.chapters.map(c=>'<a href="'+chapterDestination(c,!isSubpage).url+'">第'+c.number+'章　'+esc(c.parent.title)+(isSubpage&&chapterDestination(c).introduction?'（章の紹介）':'')+'</a>').join('');
 if(!isSubpage)q('.book-links').innerHTML=data.chapters.map(c=>'<a href="#chapter-'+c.number+'" style="top:'+(52.3+((c.number-1)%5)*6.0)+'%" aria-label="第'+c.number+'章 '+esc(c.label)+'へ"></a>').join('');
}catch(e){if(!isSubpage)q('#article').innerHTML='<section class="intro-section"><div class="section-inner"><h2>本文を読み込めませんでした。</h2><p>ページを再読み込みしてください。</p></div></section>';console.error(e);}
const menuToggle=q('.mobile-menu-toggle'),mainNav=q('#primary-navigation'),mobileNavQuery=matchMedia('(max-width: 767px)');
function setMobileMenu(open,returnFocus=false){
 q('.site-header').classList.toggle('is-menu-open',open);
 menuToggle.setAttribute('aria-expanded',String(open));
 menuToggle.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');
 q('.menu-label').textContent=open?'閉じる':'メニュー';
 if(!open)mainNav.querySelectorAll('.chapter-dropdown[open]').forEach(el=>el.open=false);
 if(returnFocus)menuToggle.focus();
}
menuToggle.addEventListener('click',()=>setMobileMenu(menuToggle.getAttribute('aria-expanded')!=='true'));
mainNav.addEventListener('click',e=>{if(mobileNavQuery.matches&&e.target.closest('a,button'))setMobileMenu(false,true);});
document.addEventListener('click',e=>{if(mobileNavQuery.matches&&!e.target.closest('.site-header'))setMobileMenu(false);});
document.addEventListener('keydown',e=>{if(q('#reading-dialog')?.open)return;if(e.key==='Escape'&&mobileNavQuery.matches&&menuToggle.getAttribute('aria-expanded')==='true')setMobileMenu(false,true);});
mobileNavQuery.addEventListener('change',e=>{
 const navFocused=mainNav.contains(document.activeElement),toggleFocused=document.activeElement===menuToggle;
 setMobileMenu(false,e.matches&&navFocused);
 if(!e.matches&&toggleFocused)mainNav.querySelector('button,a').focus();
});
const dialog=q('#article-dialog');
function showDialog(title,html){q('.dialog-eyebrow').textContent=title.endsWith('の検索結果')?'掲載予定記事の検索':'記事の掲載計画';q('#dialog-title').textContent=title;q('#dialog-body').innerHTML=html;dialog.showModal();}
q('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.addEventListener('click',async e=>{
 if(e.target.closest('a[href^="#"]'))boundaryMode=false;
 const parent=e.target.closest('[data-parent]'),article=e.target.closest('[data-article]'),info=e.target.closest('[data-info]'),share=e.target.closest('[data-share]');
 if(parent){const menu=parent.closest('.chapter-dropdown');if(menu){menu.open=false;menu.querySelector('summary').focus();}const c=data.chapters.find(c=>c.number===Number(parent.dataset.parent));showDialog(c.parent.title,'<p>この章の親ページに掲載する子記事の一覧です。確認できる記事だけリンクしています。</p><ol class="catalog-children">'+c.children.map(a=>{const record=publication.articles[a.id];return '<li>'+((record?.status==='published'||record?.status==='preview')&&record.url?'<a href="'+esc(record.url)+'">'+esc(a.title)+(record.status==='preview'?'（確認用）':'')+'</a>':esc(a.title))+'</li>';}).join('')+'</ol>');}
 if(article){const a=data.chapters.flatMap(c=>c.children).find(a=>a.id===Number(article.dataset.article));showDialog(a.title,'<p>掲載予定の記事です。今回のプレビューではリンクの見え方と記事構成を確認できます。記事本文・公開URLはまだ接続していません。</p>');}
 if(info){const kind=info.dataset.info;showDialog({policy:'ゼロラボについて',operator:'会社情報',contact:'お問い合わせ'}[kind],kind==='policy'?'<p>LPを初めて学ぶ経営者の方と、制作を任された担当者が、自社に合った次の判断をできるようにするサイトです。</p><p>専門的な内容を、やさしい言葉と図解で。ZEROが実務で使う考え方を、制作の順番で紹介します。</p>':kind==='operator'?paragraph(data.about):'<p>お問い合わせ先は本番実装時に接続します。この確認ページから情報は送信されません。</p>');}
 if(share){if(share.dataset.share==='x'){showDialog('シェアの掲載位置','<p>本番の公開URLが確定した後に、Xの共有画面へつなぎます。非公開のデザイン確認ページは投稿しません。</p>');return;}try{await navigator.clipboard.writeText(location.href);const s=q('.status-message');s.textContent='この案の確認リンクをコピーしました';s.classList.add('show');setTimeout(()=>s.classList.remove('show'),2500);}catch{showDialog('リンクのコピー','<p>ブラウザーのアドレス欄からURLをコピーしてください。</p>');}}
});
document.addEventListener('click',e=>{document.querySelectorAll('.chapter-dropdown[open]').forEach(menu=>{if(!menu.contains(e.target)||e.target.closest('.header-chapters a,.header-chapters button'))menu.open=false;});});
document.querySelectorAll('.chapter-dropdown').forEach(menu=>menu.addEventListener('toggle',()=>{if(menu.open)document.querySelectorAll('.chapter-dropdown[open]').forEach(other=>{if(other!==menu)other.open=false;});}));
document.addEventListener('keydown',e=>{if(q('#reading-dialog')?.open)return;if(e.key==='Escape')document.querySelectorAll('.chapter-dropdown[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});
if(location.hash&&!['article','chapter',''].includes(document.body.dataset.page||'')){requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView()));}
if(data)initReadingNavigation(data);
