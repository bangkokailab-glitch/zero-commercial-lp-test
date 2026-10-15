/* Scripted demonstration only. Nothing is sent and no reservation is created. */
(() => {
  'use strict';
  const demo = document.querySelector('[data-line-demo]');
  if (!demo) return;
  const chat = demo.querySelector('[data-demo-chat]');
  const screen = demo.querySelector('[data-demo-screen]');
  const note = demo.querySelector('[data-demo-explain]');
  const portrait = demo.querySelector('[data-demo-portrait]');
  const title = demo.querySelector('[data-demo-chat-title]');
  const languageButtons = [...demo.querySelectorAll('[data-demo-language-button]')];
  if (![chat, screen, note, portrait, title].every(Boolean) || !languageButtons.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const explanations = [
    '料金や所要時間は、最初にお店で確認した情報をもとに答えるよ。',
    '日本語・英語・タイ語。届いた言語に合わせて案内するんだ。',
    '希望のメニューと日時も、会話の中で確認していくよ。',
    'お店の予約ルールとカレンダーを確認して、空いている枠を案内するよ。',
    '確定する前に、選ばれた枠がまだ空いているか、もう一度確認するんだ。',
    'カレンダーへの登録と予約完了の案内まで、この会話で進められるよ。'
  ];
  const copy = {
    ja: {
      title: 'サロン予約', you: 'お客様', ai: 'サロン',
      stages: [
        [['you','こんにちは。ホワイトニングの料金と所要時間を教えてください。'],['ai','こんにちは！ホワイトニングは1,500 THB、所要時間は60分です。']],
        [['you','日本語で予約まで相談できますか？'],['ai','はい。このまま日本語でご案内します。']],
        [['ai','ご希望のメニューと日時を教えてください。'],['you','ホワイトニングを、明日の午後にお願いします。']],
        [['system','予約ルールとカレンダーを確認しています…'],['ai','明日は14:00、または15:30からご案内できます。施術時間は60分です。']],
        [['you','14:00でお願いします。'],['system','選んだ時間の空き状況を、もう一度確認しています…'],['ai','14:00〜15:00の枠でお取りできます。こちらで予約を確定してよろしいですか？'],['you','はい、お願いします。']],
        [['system','カレンダーに登録しました'],['ai','ご予約を承りました。ホワイトニング、明日14:00〜15:00です。ご来店をお待ちしております。']]
      ]
    },
    en: {
      title: 'Salon bookings', you: 'You', ai: 'Salon',
      stages: [
        [['you','Hi! How much is teeth whitening, and how long does it take?'],['ai','Hi there! Teeth whitening is THB 1,500, and the appointment takes 60 minutes.']],
        [['you','Can I make a booking in English?'],['ai','Of course! We can take care of your booking right here in English.']],
        [['ai','Which treatment would you like to book, and when would you like to come in?'],['you','Teeth whitening tomorrow afternoon, please.']],
        [['system','Checking the booking schedule and availability…'],['ai','We have a 60-minute appointment available tomorrow at 2:00 pm or 3:30 pm. Which works better for you?']],
        [['you','2:00 pm, please.'],['system','Double-checking that your chosen time is still available…'],['ai','The 2:00–3:00 pm slot is still available. Shall I confirm that for you?'],['you','Yes, please.']],
        [['system','Added to the calendar'],['ai',"You’re booked in for teeth whitening tomorrow, 2:00–3:00 pm. We look forward to seeing you!"]]
      ]
    },
    th: {
      title: 'จองคิวกับทางร้าน', you: 'คุณ', ai: 'ทางร้าน',
      stages: [
        [['you','สวัสดีค่ะ อยากทราบราคาฟอกฟันขาว แล้วใช้เวลากี่นาทีคะ'],['ai','สวัสดีค่ะ ฟอกฟันขาวราคา 1,500 บาท ใช้เวลา 60 นาทีค่ะ']],
        [['you','สอบถามและจองคิวเป็นภาษาไทยได้เลยใช่ไหมคะ'],['ai','ได้เลยค่ะ สอบถามและจองคิวผ่านแชตนี้เป็นภาษาไทยได้เลยค่ะ']],
        [['ai','สนใจจองบริการไหน และสะดวกเข้ามาวันไหน ช่วงเวลาไหนคะ'],['you','ฟอกฟันขาวค่ะ สะดวกพรุ่งนี้ช่วงบ่าย']],
        [['system','กำลังตรวจสอบเงื่อนไขการจองและคิวว่าง…'],['ai','พรุ่งนี้มีคิวว่างตอน 14:00 น. และ 15:30 น. ค่ะ แต่ละคิวใช้เวลา 60 นาที สะดวกเวลาไหนคะ']],
        [['you','ขอเป็น 14:00 น. ค่ะ'],['system','กำลังเช็กคิวที่เลือกอีกครั้งก่อนยืนยัน…'],['ai','ช่วง 14:00–15:00 น. ยังว่างค่ะ ยืนยันจองช่วงนี้เลยไหมคะ'],['you','ยืนยันค่ะ']],
        [['system','บันทึกนัดหมายลงปฏิทินแล้ว'],['ai','จองคิวฟอกฟันขาวให้เรียบร้อยแล้วค่ะ พรุ่งนี้เวลา 14:00–15:00 น. แล้วพบกันนะคะ']]
      ]
    }
  };
  const READING_DELAY = 12000;
  let language = 'ja', visible = false, timer = 0, resumeTimer = 0;
  let messages = [], activeStage = -1, cursor = 0, readingUntil = 0;
  let pointerDown = false, programmaticUntil = 0, scrollFrame = 0;
  let geometryDirty = true, messageGeometry = [], chatHeight = 0, chatBoxHeight = 0, contentHeight = 0;
  let sizeObserver;

  function stop() { clearTimeout(timer); timer = 0; }
  function suspend() {
    stop(); clearTimeout(resumeTimer); resumeTimer = 0;
    cancelAnimationFrame(scrollFrame); scrollFrame = 0;
  }
  function measureMessages() {
    if (!geometryDirty) return;
    const box = chat.getBoundingClientRect();
    const scrollTop = chat.scrollTop;
    chatHeight = chat.clientHeight; chatBoxHeight = box.height; contentHeight = chat.scrollHeight;
    messageGeometry = messages.map(message => {
      const rect = message.getBoundingClientRect();
      return { middle:(rect.top + rect.bottom) / 2 - box.top + scrollTop, bottom:rect.bottom - box.top + scrollTop };
    });
    geometryDirty = false;
  }
  function ready() {
    return visible && !document.hidden && !reduced.matches && !pointerDown && Date.now() >= readingUntil;
  }
  function setStage(stage) {
    if (stage === activeStage) return;
    activeStage = stage;
    note.textContent = explanations[stage];
    portrait.dataset.pose = String(stage);
    portrait.setAttribute('aria-label', '会話の内容を説明する斎藤さん');
    // The whole balloon and its text appear together; there is no empty balloon.
    if (visible && !document.hidden && !reduced.matches && note.animate) {
      note.getAnimations().forEach(animation => animation.cancel());
      note.animate([{opacity:0,transform:'translateY(5px) scale(.97)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'});
    }
  }
  function messageAtReadingPosition() {
    measureMessages();
    const reference = chat.scrollTop + chatBoxHeight * .58;
    let best = 0, distance = Infinity;
    messageGeometry.forEach((geometry, index) => {
      const nextDistance = Math.abs(geometry.middle - reference);
      if (nextDistance < distance) { distance = nextDistance; best = index; }
    });
    return best;
  }
  function syncToReadingPosition(updateCursor = true) {
    if (!messages.length) return;
    measureMessages();
    const index = chat.scrollTop + chatHeight >= contentHeight - 3 ? messages.length - 1 : messageAtReadingPosition();
    if (updateCursor) cursor = index;
    setStage(Number(messages[index].dataset.stage));
  }
  function schedule(delay = 4300) {
    stop();
    if (ready()) timer = setTimeout(advance, delay);
  }
  function advance() {
    if (!ready()) return;
    measureMessages();
    const atEnd = chat.scrollTop + chatHeight >= contentHeight - 3;
    if (atEnd) {
      cursor = 0;
      programmaticUntil = Date.now() + 800;
      chat.scrollTo({top:0,behavior:'smooth'});
      setStage(0);
      schedule(6000);
      return;
    }
    cursor = Math.min(cursor + 1, messages.length - 1);
    const item = messages[cursor];
    const top = messageGeometry[cursor].bottom - chatBoxHeight + 12;
    programmaticUntil = Date.now() + 800;
    // Do not use scrollIntoView: the surrounding LP must never be scrolled.
    chat.scrollTo({top:Math.max(chat.scrollTop,top),behavior:'smooth'});
    schedule(Math.max(4300, Math.min(7000,item.textContent.length * 40)));
  }
  function holdForReading() {
    readingUntil = Date.now() + READING_DELAY;
    programmaticUntil = 0;
    stop();
    clearTimeout(resumeTimer);
    resumeWhenReady(4300);
  }
  function resumeWhenReady(delay = 6000) {
    clearTimeout(resumeTimer); resumeTimer = 0;
    if (!visible || document.hidden || reduced.matches || pointerDown) return;
    const wait = readingUntil - Date.now();
    if (wait > 0) {
      resumeTimer = setTimeout(() => { resumeTimer = 0; syncToReadingPosition(); schedule(delay); }, wait + 20);
    } else schedule(delay);
  }
  function renderLanguage(value) {
    if (!copy[value]) return;
    language = value;
    stop(); clearTimeout(resumeTimer);
    readingUntil = 0; pointerDown = false; activeStage = -1; cursor = 0;
    chat.lang = value; title.textContent = copy[value].title;
    languageButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.demoLanguageButton === value)));
    const fragment = document.createDocumentFragment();
    copy[value].stages.forEach((stageMessages,stage) => stageMessages.forEach(([role,text]) => {
      const item = document.createElement('div');
      item.className = `line-message line-message--${role}`; item.dataset.stage = String(stage);
      if (role !== 'system') {
        const sender = document.createElement('span');
        sender.className = 'line-message__sender'; sender.textContent = copy[value][role]; item.append(sender);
      }
      const bubble = document.createElement('p'); bubble.textContent = text; item.append(bubble); fragment.append(item);
    }));
    chat.replaceChildren(fragment);
    messages = [...chat.querySelectorAll('.line-message')];
    geometryDirty = true;
    if (sizeObserver) {
      sizeObserver.disconnect(); sizeObserver.observe(chat);
      messages.forEach(message => sizeObserver.observe(message));
    }
    // All messages exist from the start, so manual scrolling can reach the whole example.
    chat.scrollTo({top:0,behavior:'instant'});
    setStage(0); schedule(6000);
  }
  languageButtons.forEach(button => button.addEventListener('click',() => renderLanguage(button.dataset.demoLanguageButton)));
  chat.addEventListener('pointerdown',() => { pointerDown = true; holdForReading(); });
  const release = () => { if (pointerDown) { pointerDown = false; holdForReading(); } };
  window.addEventListener('pointerup',release); window.addEventListener('pointercancel',release);
  chat.addEventListener('wheel',holdForReading,{passive:true});
  chat.addEventListener('keydown',event => {
    if (!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) return;
    event.preventDefault();
    holdForReading();
    const offsets = {ArrowUp:-45,ArrowDown:45,PageUp:-chat.clientHeight * .85,PageDown:chat.clientHeight * .85,' ':chat.clientHeight * .85};
    const top = event.key === 'Home' ? 0 : event.key === 'End' ? chat.scrollHeight : chat.scrollTop + offsets[event.key];
    chat.scrollTo({top,behavior:reduced.matches ? 'instant' : 'smooth'});
  });
  function queueReadingSync() {
    if (scrollFrame || !visible || document.hidden) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (!visible || document.hidden) return;
      syncToReadingPosition(Date.now() >= programmaticUntil);
      if (Date.now() >= programmaticUntil && (pointerDown || Date.now() < readingUntil)) holdForReading();
    });
  }
  chat.addEventListener('scroll',queueReadingSync,{passive:true});
  const invalidateGeometry = () => { geometryDirty = true; queueReadingSync(); };
  if ('ResizeObserver' in window) sizeObserver = new ResizeObserver(invalidateGeometry);
  else window.addEventListener('resize', invalidateGeometry, {passive:true});
  document.fonts?.ready.then(invalidateGeometry);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      demo.classList.toggle('is-demo-visible',visible);
      if (visible) { syncToReadingPosition(); resumeWhenReady(); } else suspend();
    },{threshold:.18}).observe(screen);
  } else { visible = true; demo.classList.add('is-demo-visible'); }
  document.addEventListener('visibilitychange',() => { if (document.hidden) suspend(); else resumeWhenReady(); });
  reduced.addEventListener('change',() => { stop(); clearTimeout(resumeTimer); readingUntil = 0; if (!reduced.matches) schedule(6000); });
  renderLanguage(language);
})();
