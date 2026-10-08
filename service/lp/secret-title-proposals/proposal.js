(() => {
  const descriptions={a:'A｜2行の大見出しを横幅いっぱいに。元の配列を保ち、文字を大きくした案。',b:'B｜「制作」を数字の段へ。ランディングページをさらに大きく見せる3段構成。',c:'C｜ZEROの青をタイトル帯に。大きな文字と色面で、章の入口を印象づける案。'};
  const params=new URLSearchParams(location.search),section=document.querySelector('.secret-proposal'),counter=document.querySelector('.count'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame,timer,observer,current='a';
  if(params.get('embed')==='1')document.body.classList.add('embed');
  function stop(){cancelAnimationFrame(frame);clearTimeout(timer);observer?.disconnect();section.classList.remove('is-animating');counter.textContent='10';}
  function animate(){
    stop();if(motion.matches||document.hidden)return;
    counter.textContent='1';void section.offsetWidth;section.classList.add('is-animating');
    const run=()=>{const start=performance.now();function tick(now){const p=Math.min((now-start)/1600,1);counter.textContent=String(Math.min(10,Math.floor(1+9*(1-Math.pow(1-p,3)))));if(p<1)frame=requestAnimationFrame(tick);else counter.textContent='10';}frame=requestAnimationFrame(tick);};
    if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();run();}},{threshold:.5});observer.observe(counter);}else run();
    timer=setTimeout(()=>section.classList.remove('is-animating'),1200);
  }
  function select(v,change=false){current=descriptions[v]?v:'a';stop();section.className='secret-proposal variant-'+current;document.querySelector('.review-note').textContent=descriptions[current];document.querySelectorAll('[data-variant]').forEach(a=>{if(a.dataset.variant===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(change){const u=new URL(location.href);u.searchParams.set('variant',current);history.replaceState(null,'',u);animate();}}
  document.querySelectorAll('[data-variant]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();select(a.dataset.variant,true);}));
  document.querySelector('.replay').addEventListener('click',animate);
  motion.addEventListener('change',()=>{if(motion.matches)stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  select(params.get('variant')||'a');Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(r=>setTimeout(r,1600))]).then(animate);
})();
