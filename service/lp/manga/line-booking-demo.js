/* Scripted demonstration only: no network, real messages or reservations. */
(() => {
  'use strict';
  const demo = document.querySelector('[data-line-demo]');
  if (!demo) return;
  const chat = demo.querySelector('[data-demo-chat]');
  const toggle = demo.querySelector('[data-demo-toggle]');
  const restart = demo.querySelector('[data-demo-restart]');
  const select = demo.querySelector('[data-demo-language]');
  const note = demo.querySelector('[data-demo-explain]');
  const status = demo.querySelector('[data-demo-status]');
  const progress = demo.querySelector('[data-demo-progress]');
  const portrait = demo.querySelector('[data-demo-portrait]');
  if (![chat, toggle, restart, select, note, status, progress, portrait].every(Boolean)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dashboard = demo.querySelector('.demo-dashboard');
  const controls = toggle.closest('.demo-controls');
  if (dashboard && controls) progress.after(controls);
  const languageBar = select.closest('.demo-language-bar');
  const languageOptions = document.createElement('div');
  languageOptions.className = 'demo-language-options';
  languageOptions.setAttribute('role', 'group');
  languageOptions.setAttribute('aria-label', '会話の言語');
  [...select.options].forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.language = option.value;
    button.textContent = option.textContent;
    button.setAttribute('aria-pressed', String(option.selected));
    button.addEventListener('click', () => {
      select.value = option.value;
      changeLanguage(option.value);
    });
    languageOptions.append(button);
  });
  languageBar.append(languageOptions);
  languageBar.classList.add('has-language-buttons');
  const explanations = [
    '事前に準備したお店の情報をもとに回答するよ',
    '日本語・英語・タイ語。来た言語に合わせて対応するんだ',
    '予約に必要な情報も、こちらから確認するよ',
    'お店の予約ルールとカレンダーを確認しているんだ',
    '選ばれた枠が予約できるか、確定前にもう一度確認',
    '予約登録と、お客様への案内まで進められるよ'
  ];
  const titles = ['質問に回答','言語に合わせて対応','希望を確認','空き枠を案内','確定前に再確認','予約登録・完了案内'];
  const copy = {
    ja: {
      lang:'ja',title:'サロン予約',you:'お客様',ai:'サロン AI',
      stages:[
        [['you','こんにちは。ホワイトニングの料金と所要時間を教えてください。'],['ai','こんにちは！ホワイトニングは1,500 THB、所要時間は60分です。']],
        [['you','日本語で予約まで相談できますか？'],['ai','はい。このまま日本語でご案内します。']],
        [['ai','ご希望のメニューと日時を教えてください。'],['you','ホワイトニングを、明日の午後にお願いします。']],
        [['system','予約ルール・カレンダーを確認中…'],['ai','明日は14:00または15:30から、60分の枠をご案内できます。']],
        [['you','14:00でお願いします。'],['system','選択された枠の空きを、もう一度確認中…'],['ai','14:00〜15:00で予約可能です。この内容で確定しますか？'],['you','はい、確定してください。']],
        [['system','カレンダーに登録しました'],['ai','ご予約を承りました。明日14:00〜15:00、ホワイトニングでお待ちしております。']]
      ],handoff:['アレルギーがあるのですが、施術できますか？','確認が必要な内容です。スタッフへ引き継ぎますので、お返事をお待ちください。']
    },
    en:{
      lang:'en',title:'Salon booking',you:'Guest',ai:'Salon AI',
      stages:[
        [['you','Hello! How much is teeth whitening, and how long does it take?'],['ai','Hello! Teeth whitening costs 1,500 THB and takes 60 minutes.']],
        [['you','Can I book in English?'],['ai','Yes. I can help you through the booking in English.']],
        [['ai','Which service, date and time would you like?'],['you','Teeth whitening tomorrow afternoon, please.']],
        [['system','Checking booking rules and the calendar…'],['ai','Tomorrow, a 60-minute appointment is available at 14:00 or 15:30.']],
        [['you','14:00, please.'],['system','Checking the selected time slot again…'],['ai','14:00–15:00 is available. Would you like to confirm?'],['you','Yes, please confirm.']],
        [['system','Added to the calendar'],['ai','Your teeth-whitening appointment is confirmed for tomorrow, 14:00–15:00. We look forward to seeing you!']]
      ],handoff:['I have an allergy. Can I have this treatment?','This needs to be checked by our staff. I will pass your question on. Please wait for their reply.']
    },
    th:{
      lang:'th',title:'จองคิวร้าน',you:'ลูกค้า',ai:'AI ของร้าน',
      stages:[
        [['you','สวัสดีค่ะ ฟอกฟันขาวราคาเท่าไร และใช้เวลานานเท่าไรคะ'],['ai','สวัสดีค่ะ ฟอกฟันขาวราคา 1,500 บาท ใช้เวลา 60 นาทีค่ะ']],
        [['you','จองคิวเป็นภาษาไทยได้ไหมคะ'],['ai','ได้ค่ะ สามารถสอบถามและจองคิวเป็นภาษาไทยได้เลยค่ะ']],
        [['ai','ต้องการจองบริการอะไร และสะดวกวันเวลาไหนคะ'],['you','ขอจองฟอกฟันขาวพรุ่งนี้ช่วงบ่ายค่ะ']],
        [['system','กำลังตรวจสอบเงื่อนไขการจองและปฏิทิน…'],['ai','พรุ่งนี้มีคิวว่างเวลา 14:00 น. หรือ 15:30 น. ใช้เวลา 60 นาทีค่ะ']],
        [['you','ขอเวลา 14:00 น. ค่ะ'],['system','กำลังตรวจสอบคิวที่เลือกอีกครั้ง…'],['ai','เวลา 14:00–15:00 น. ยังว่างค่ะ ต้องการยืนยันการจองไหมคะ'],['you','ยืนยันค่ะ']],
        [['system','บันทึกลงในปฏิทินแล้ว'],['ai','ยืนยันการจองฟอกฟันขาวพรุ่งนี้ เวลา 14:00–15:00 น. เรียบร้อยแล้วค่ะ แล้วพบกันนะคะ']]
      ],handoff:['มีอาการแพ้บางอย่าง สามารถรับบริการได้ไหมคะ','เรื่องนี้ต้องให้พนักงานตรวจสอบก่อนค่ะ จะส่งคำถามให้พนักงาน กรุณารอการตอบกลับนะคะ']
    }
  };
  let language='ja', entries=[], index=0, timer=0, visible=false, paused=reduced.matches, complete=false;
  const screen = demo.querySelector('[data-demo-screen]');
  const ready = () => visible && !paused && !complete && !document.hidden;
  function updateControl(){toggle.textContent=complete?'もう一度再生':paused?'▶ 再生':'Ⅱ 一時停止';toggle.setAttribute('aria-pressed',String(paused));}
  function stop(){clearTimeout(timer);timer=0;}
  function schedule(){stop();if(ready())timer=setTimeout(next, index===0?600:2550);}
  function addMessage(role,text,scroll=true){
    const item=document.createElement('div');item.className=`line-message line-message--${role}`;
    if(role!=='system'){
      const label=document.createElement('span');label.className='line-message__sender';label.textContent=copy[language][role];item.append(label);
    }
    const bubble=document.createElement('p');bubble.textContent=text;item.append(bubble);chat.append(item);
    // Deliberately scroll this element only, never the outer page.
    if(scroll)chat.scrollTo({top:chat.scrollHeight,behavior:reduced.matches?'instant':'smooth'});
  }
  function setStage(stage){
    note.textContent=explanations[stage];
    const number=document.createElement('span');number.className='demo-status__number';number.textContent=String(stage+1).padStart(2,'0');
    const total=document.createElement('small');total.textContent=' / 06';number.append(total);
    const title=document.createElement('span');title.textContent=titles[stage];status.replaceChildren(number,title);
    progress.value=stage+1;portrait.dataset.pose=String(stage);portrait.setAttribute('aria-label',`斎藤さん：${titles[stage]}`);
    demo.querySelectorAll('[data-demo-step]').forEach((b,i)=>b.setAttribute('aria-current',i===stage?'step':'false'));
  }
  function next(){
    if(!ready())return;
    const entry=entries[index++];if(!entry)return;
    setStage(entry.stage);addMessage(entry.role,entry.text);
    if(index===entries.length){complete=true;stop();updateControl();demo.querySelector('[data-demo-finished]').hidden=false;}
    else schedule();
  }
  function reset(play){
    stop();paused=!play;complete=false;index=0;chat.replaceChildren();
    chat.lang=copy[language].lang;demo.querySelector('[data-demo-chat-title]').textContent=copy[language].title;
    entries=copy[language].stages.flatMap((messages,stage)=>messages.map(([role,text])=>({role,text,stage})));
    demo.querySelector('[data-demo-finished]').hidden=true;setStage(0);
    if(!play&&reduced.matches){entries.slice(0,2).forEach(entry=>addMessage(entry.role,entry.text,false));index=2;chat.scrollTop=0;}
    updateControl();schedule();renderHandoff();
  }
  function renderHandoff(){
    const box=demo.querySelector('[data-demo-handoff]');box.lang=copy[language].lang;box.replaceChildren();
    copy[language].handoff.forEach((text,i)=>{const p=document.createElement('p');p.className=i?'handoff-answer':'handoff-question';p.textContent=text;box.append(p);});
  }
  toggle.addEventListener('click',()=>{if(complete)return reset(true);paused=!paused;updateControl();schedule();});
  restart.addEventListener('click',()=>reset(true));
  function changeLanguage(value){
    if(!copy[value])return;
    language=value;
    languageOptions.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===value)));
    reset(!reduced.matches);
  }
  select.addEventListener('change',()=>changeLanguage(select.value));
  demo.querySelectorAll('[data-demo-step]').forEach((button,stage)=>button.addEventListener('click',()=>{
    stop();paused=true;complete=false;chat.replaceChildren();index=0;
    entries.forEach((entry,i)=>{if(entry.stage<=stage){addMessage(entry.role,entry.text,false);index=i+1;}});
    chat.scrollTo({top:chat.scrollHeight,behavior:'instant'});
    complete=index===entries.length;demo.querySelector('[data-demo-finished]').hidden=!complete;setStage(stage);updateControl();
  }));
  // A touch, wheel or keyboard read pauses auto-play so earlier messages remain readable.
  function pauseForReading(){if(!paused&&!complete){paused=true;stop();updateControl();}}
  chat.addEventListener('pointerdown',pauseForReading);chat.addEventListener('wheel',pauseForReading,{passive:true});chat.addEventListener('keydown',pauseForReading);
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.35,rootMargin:'0px 0px -145px 0px'}).observe(screen);
  }else{visible=true;}
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',event=>{if(event.matches){paused=true;stop();updateControl();}});
  reset(!reduced.matches);
})();
