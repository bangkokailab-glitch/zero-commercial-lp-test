/* Semantic Web-font diagram. All labels remain readable without JavaScript. */
(() => {
  'use strict';
  const ns='http://www.w3.org/2000/svg';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const nodes=[['ltv-kpi',0],['three-c',550],['big-idea',1350],['lp',2150],['acquisition',3220],['response-sales',4040],['improvement',4860],['multilingual',5880],['overseas',6700]];
  const connections=[
    ['to-three-c','ltv-kpi','three-c',890,380],
    ['to-big-idea','three-c','big-idea',1690,380],
    ['to-lp-from-idea','big-idea','lp',2490,650],
    ['to-lp-from-acquisition','acquisition','lp',3560,380],
    ['to-response-sales','lp','response-sales',4380,380],
    ['to-improvement','lp','improvement',5200,600],
    ['to-multilingual','improvement','multilingual',6220,380],
    ['to-overseas','multilingual','overseas',7040,380],
    ['to-sales-from-overseas','overseas','response-sales',7550,500]
  ];
  const make=(tag,attrs)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el};
  document.querySelectorAll('.strategy-map').forEach(host=>{
    const svg=host.querySelector('.map-connectors');
    if(!svg)return;
    let animations=[],timer,observer,started=false,done=false,lastWidth=0;
    const cards=Object.fromEntries(nodes.map(([name])=>[name,host.querySelector('[data-node="'+name+'"]')]));
    if(Object.values(cards).some(card=>!card))return;
    const arrows=connections.map(([name,from,to,delay,duration])=>{
      const g=make('g',{'data-connection':name,'data-from':from,'data-to':to,'data-delay':delay});
      const line=make('path',{class:'map-arrow-line',pathLength:1});
      const head=make('path',{class:'map-arrow-head'});
      g.append(line,head);svg.append(g);return {g,line,head,name,from,to,delay,duration};
    });
    function finish(){
      clearTimeout(timer);
      host.classList.remove('is-map-pending');
      host.dataset.diagramMotion='complete';
      animations.forEach(a=>a.cancel());animations=[];
      done=true;observer?.disconnect();
    }
    function draw(){
      const root=host.getBoundingClientRect();
      if(!root.width||!root.height)return;
      if(lastWidth&&Math.abs(lastWidth-root.width)>.5&&started&&!done)finish();
      lastWidth=root.width;
      svg.setAttribute('viewBox','0 0 '+root.width+' '+root.height);
      const boxes=Object.fromEntries(Object.entries(cards).map(([name,el])=>{
        const r=el.getBoundingClientRect();return [name,{x:r.left-root.left,y:r.top-root.top,w:r.width,h:r.height}];
      }));
      const mobile=matchMedia('(max-width:800px)').matches,hub=host.dataset.design==='c';
      const compactGrid=mobile&&host.dataset.design==='a';
      // A retains desktop connections on phones; shorter insets leave room
      // for the horizontal arrows in the narrow planning/expansion gutters.
      const inset=compactGrid?Math.min(4,root.width*.008):7;
      const pt=(b,side,t=.5)=>side==='l'?[b.x-inset,b.y+b.h*t]:side==='r'?[b.x+b.w+inset,b.y+b.h*t]:side==='t'?[b.x+b.w*t,b.y-inset]:[b.x+b.w*t,b.y+b.h+inset];
      const down=(a,b)=>{const s=pt(a,'b'),e=pt(b,'t'),y=(s[1]+e[1])/2;return [s,[s[0],y],[e[0],y],e]};
      const across=(a,b)=>{const s=pt(a,'r'),e=pt(b,'l'),x=(s[0]+e[0])/2;return [s,[x,s[1]],[x,e[1]],e]};
      for(const arrow of arrows){
        const a=boxes[arrow.from],b=boxes[arrow.to];
        let points;
        if(mobile&&!compactGrid){
          if(arrow.name==='to-sales-from-overseas'){
            const s=pt(a,'r'),e=pt(b,'r');points=[s,[root.width-4,s[1]],[root.width-4,e[1]],e];
          }else if(arrow.name==='to-lp-from-idea'||arrow.name==='to-improvement'){
            const s=pt(a,'l',.75),e=pt(b,'l',.3),x=arrow.name==='to-improvement'?12:4;
            points=[s,[x,s[1]],[x,e[1]],e];
          }else points=down(a,b);
        }else if(hub){
          if(['to-three-c','to-big-idea','to-improvement','to-overseas'].includes(arrow.name))points=down(a,b);
          else if(arrow.name==='to-lp-from-idea'||arrow.name==='to-lp-from-acquisition'){
            const s=pt(a,'r'),e=pt(b,'l',arrow.name==='to-lp-from-idea'?.55:.85);
            const x=(s[0]+e[0])/2+(arrow.name==='to-lp-from-acquisition'?9:-9);
            points=[s,[x,s[1]],[x,e[1]],e];
          }else if(arrow.name==='to-sales-from-overseas'){
            const s=pt(a,'r'),e=pt(b,'r',.82);points=[s,[root.width-2,s[1]],[root.width-2,e[1]],e];
          }else points=across(a,b);
        }else{
          if(['to-lp-from-idea','to-improvement'].includes(arrow.name))points=down(a,b);
          else if(arrow.name==='to-sales-from-overseas'){
            const s=pt(a,'t'),e=pt(b,'b'),y=(s[1]+e[1])/2;points=[s,[s[0],y],[e[0],y],e];
          }else points=across(a,b);
        }
        // Drop duplicate vertices, so even straight connections have a direction.
        points=points.filter((p,i)=>!i||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>.1);
        const end=points[points.length-1],prev=points[points.length-2];
        const angle=Math.atan2(end[1]-prev[1],end[0]-prev[0]),size=compactGrid?Math.min(7,root.width*.013):mobile?7:9;
        const base=[end[0]-Math.cos(angle)*size,end[1]-Math.sin(angle)*size];
        const l=[base[0]-Math.sin(angle)*size*.65,base[1]+Math.cos(angle)*size*.65];
        const r=[base[0]+Math.sin(angle)*size*.65,base[1]-Math.cos(angle)*size*.65];
        arrow.line.setAttribute('d',points.map((p,i)=>(i?'L':'M')+p.map(n=>n.toFixed(2)).join(' ')).join(' '));
        arrow.head.setAttribute('d','M'+end.join(' ')+' L'+l.join(' ')+' L'+r.join(' ')+' Z');
      }
      if(host.dataset.design==='b'&&!mobile){
        host.querySelector('.map-phase--execute').style.top=(boxes.acquisition.y-34)+'px';
        host.querySelector('.map-phase--grow').style.top=(boxes.improvement.y-34)+'px';
      }
    }
    function play(){
      if(started||done||!host.offsetWidth)return;
      started=true;host.dataset.diagramMotion='playing';
      try {
        nodes.forEach(([name,delay])=>{
          const card=cards[name].querySelector('.map-card__inner');
          animations.push(card.animate([{opacity:0,transform:'scale(.96)'},{opacity:1,transform:'scale(1.012)',offset:.75},{opacity:1,transform:'scale(1)'}],{duration:330,delay,fill:'forwards',easing:'cubic-bezier(.16,1,.3,1)'}));
        });
        arrows.forEach(({line,head,delay,duration})=>{
          animations.push(line.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration,delay,fill:'forwards',easing:'ease-in-out'}));
          animations.push(head.animate([{opacity:0},{opacity:1}],{duration:90,delay:delay+duration-70,fill:'forwards'}));
        });
        timer=setTimeout(finish,8450);
      } catch {finish()}
    }
    function prepare(){
      draw();
      if(reduced.matches||!window.IntersectionObserver||!Element.prototype.animate){finish();return}
      host.classList.add('is-map-pending');host.dataset.diagramMotion='ready';
      observer=new IntersectionObserver(entries=>{
        for(const entry of entries){
          if(done)return;
          if(started&&!entry.isIntersecting){finish();return}
          if(entry.isIntersecting&&entry.intersectionRect.height>=Math.min(entry.boundingClientRect.height*.35,innerHeight*.35))play();
        }
      },{threshold:[0,.1,.2,.35,.5,1]});
      observer.observe(host);
    }
    if(window.ResizeObserver)new ResizeObserver(draw).observe(host);
    else addEventListener('resize',draw,{passive:true});
    document.fonts?.ready.then(draw);
    document.fonts?.addEventListener('loadingdone',draw);
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)finish()});
    reduced.addEventListener('change',()=>{if(reduced.matches)finish()});
    host.addEventListener('strategy:replay',()=>{
      finish();started=false;done=false;prepare();play();
    });
    prepare();
  });
})();
