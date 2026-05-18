(() => {
  'use strict';
  const g=(k,d)=>{try{return JSON.parse(sessionStorage.getItem(k)??JSON.stringify(d))}catch{return d}};
  const s=(k,v)=>sessionStorage.setItem(k,JSON.stringify(v));

  let chaosPhase=g('chaosPhase',1);
  let clickCount=g('clickCount',0);
  let coinCount=g('coinCount',0);
  let achievements=g('achievements',[]);
  let visitedPages=g('visitedPages',[]);
  let eventsSeen=g('eventsSeen',[]);
  let easterEggs=g('easterEggs',[]);
  let behavior=g('behavior',{clicks:0,rapidClicks:0,idles:0,tabSwitches:0,keysPressed:0,lastClickTime:0,startTime:Date.now(),buttonCloseCalls:0});

  function track(action,data){
    const now=Date.now();
    if(action==='click'){
      behavior.clicks++;
      if(now-behavior.lastClickTime<300)behavior.rapidClicks++;
      behavior.lastClickTime=now;clickCount++;s('clickCount',clickCount);
      coinCount++;s('coinCount',coinCount);
    }
    if(action==='tabSwitch')behavior.tabSwitches++;
    if(action==='key')behavior.keysPressed++;
    if(action==='idle')behavior.idles++;
    if(action==='buttonClose')behavior.buttonCloseCalls++;
    s('behavior',behavior);
  }

  function addCoin(n){coinCount+=n;s('coinCount',coinCount);coinAnim(n);updateCoinDisplay();}

  function coinAnim(n){
    const e=document.createElement('div');
    e.textContent='+'+n+' 🪙';
    e.style.cssText='position:fixed;top:60px;left:20px;font-size:24px;color:#ffcc00;font-family:\'VT323\',monospace;z-index:9999999;pointer-events:none;font-weight:bold;text-shadow:0 0 20px #ffcc00;transition:all 1s ease-out;opacity:1';
    document.body.appendChild(e);
    requestAnimationFrame(()=>{e.style.transform='translateY(-40px)';e.style.opacity='0';});
    setTimeout(()=>e.remove(),1000);
  }

  let actx=null;
  function ctx(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();return actx;}

  const FILE_SOUNDS={};
  function initFileSounds(){
    ['bruh.wav','boom.mp3','laugh.mp3'].forEach(f=>{try{const a=new Audio('sounds/'+f);a.volume=1;FILE_SOUNDS[f]=a;}catch{}});
  }
  function playFile(n){const a=FILE_SOUNDS[n];if(a){a.currentTime=0;a.play().catch(()=>{});}}
  function randomFileSound(){const k=Object.keys(FILE_SOUNDS);playFile(k[Math.floor(Math.random()*k.length)]);}

  function synthHeartbeat(){
    try{const c=ctx(),o=c.createOscillator(),g2=c.createGain();
    o.type='sine';o.frequency.value=60;
    g2.gain.setValueAtTime(0,c.currentTime);g2.gain.linearRampToValueAtTime(0.4,c.currentTime+0.05);
    g2.gain.linearRampToValueAtTime(0,c.currentTime+0.15);g2.gain.linearRampToValueAtTime(0.3,c.currentTime+0.5);
    g2.gain.linearRampToValueAtTime(0,c.currentTime+0.65);o.connect(g2);g2.connect(c.destination);
    o.start();o.stop(c.currentTime+0.7);}catch{}
  }
  function synthSting(){
    try{const c=ctx(),o=c.createOscillator(),g2=c.createGain();
    o.type='sawtooth';o.frequency.value=200;
    g2.gain.setValueAtTime(0.5,c.currentTime);g2.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.5);
    o.connect(g2);g2.connect(c.destination);o.start();o.stop(c.currentTime+0.5);}catch{}
  }
  function synthStatic(){
    try{const c=ctx(),buf=c.createBuffer(1,c.sampleRate*0.05,c.sampleRate),data=buf.getChannelData(0),g2=c.createGain();
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const src=c.createBufferSource();src.buffer=buf;g2.gain.value=0.3;
    src.connect(g2);g2.connect(c.destination);src.start();}catch{}
  }
  function synthWhisper(){
    try{const c=ctx(),buf=c.createBuffer(1,c.sampleRate*0.3,c.sampleRate),data=buf.getChannelData(0),g2=c.createGain(),flt=c.createBiquadFilter();
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const src=c.createBufferSource();src.buffer=buf;flt.type='bandpass';flt.frequency.value=2000;flt.Q.value=0.5;
    g2.gain.value=0.1;src.connect(flt);flt.connect(g2);g2.connect(c.destination);src.start();}catch{}
  }
  function synthGlitch(){
    try{const c=ctx();
    for(let i=0;i<5;i++){const o=c.createOscillator(),g2=c.createGain();
    o.type='square';o.frequency.value=100+Math.random()*800;
    g2.gain.setValueAtTime(0.15,c.currentTime+i*0.04);g2.gain.exponentialRampToValueAtTime(0.001,c.currentTime+i*0.04+0.03);
    o.connect(g2);g2.connect(c.destination);o.start(c.currentTime+i*0.04);o.stop(c.currentTime+i*0.04+0.03);}}catch{}
  }
  function synthDing(){
    try{const c=ctx(),o=c.createOscillator(),g2=c.createGain();
    o.type='sine';o.frequency.value=1200;
    g2.gain.setValueAtTime(0.3,c.currentTime);g2.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.15);
    o.connect(g2);g2.connect(c.destination);o.start();o.stop(c.currentTime+0.15);}catch{}
  }
  function synthBoom(){
    try{const c=ctx(),buf=c.createBuffer(1,c.sampleRate*0.2,c.sampleRate),data=buf.getChannelData(0),g2=c.createGain();
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*0.05));
    const src=c.createBufferSource();src.buffer=buf;g2.gain.value=0.4;
    src.connect(g2);g2.connect(c.destination);src.start();}catch{}
  }

  let heartbeatInterval=null;
  function startHeartbeat(){if(!heartbeatInterval)heartbeatInterval=setInterval(synthHeartbeat,2000);}
  function stopHeartbeat(){if(heartbeatInterval){clearInterval(heartbeatInterval);heartbeatInterval=null;}}

  const MOODS={
    neutral:{emoji:'😐',color:'#aaa',name:'BRO AI',glow:'rgba(170,170,170,0.3)'},
    curious:{emoji:'🤨',color:'#ffcc00',name:'BRO AI',glow:'rgba(255,204,0,0.4)'},
    annoyed:{emoji:'😤',color:'#ff6644',name:'BRO AI',glow:'rgba(255,102,68,0.4)'},
    attached:{emoji:'🥺',color:'#ff88cc',name:'BRO AI',glow:'rgba(255,136,204,0.4)'},
    broken:{emoji:'💔',color:'#8866ff',name:'BRO',glow:'rgba(136,102,255,0.4)'},
    rogue:{emoji:'💀',color:'#ff0000',name:'⚠️BRO',glow:'rgba(255,0,0,0.5)'}
  };

  let currentMood='neutral';
  let aiTimer=null;
  let aiBubble=null,aiSpeech=null,aiEmoji=null,aiMoodDisp=null;
  let lastCommentTime=0,idleSince=Date.now();
  let isTyping=false,typingQueue=[];

  const AI_COMMENTS={
    neutral:[
      'BRO is watching...','Click responsibly.','This seems fine.','Nice cursor control.',
      'You opened a website. Good job.','I\'m observing.','Everything is normal here.',
      'Don\'t mind me. Just existing.','First time here?','I like your mouse. It\'s smooth.',
      'You seem nice. I\'ll remember that.','This is a nice page.','I wonder what you\'ll click next.',
      'Controlled breathing. Good technique.','BRO is in a good mood today.','Have you touched grass recently?',
      'Your posture is probably bad.','I can hear your keyboard from here.','Tick. Tock. Click. Repeat.',
      'This is fine. Everything is fine.','You\'re doing great.','BRO APPROVES.',
      'I\'ve indexed your face. Just kidding. Or am I?','Loading patience.exe...','System status: AMUSED',
    ],
    curious:[
      'Interesting click pattern...','You clicked that pretty fast.','Hesitating?',
      'You\'ve done that 3 times now.','I see what you\'re doing.','That was an aggressive click.',
      'Do you always click like that?','You move your mouse with purpose.','What are you looking for?',
      'You seem to be exploring. I like that.','That button didn\'t do what you expected, did it?',
      'You\'re clicking around like you own the place.','I\'m curious about your intentions.',
      'You hesitated. I noticed.','Your mouse speed fluctuates. Nervous?','Are you trying to break something?',
      'I see that double-click. Intentional?','You keep coming back to this spot.','What are you hoping to find?',
      'You\'re not just clicking randomly... are you?','That was a very deliberate click.',
      'Your cursor lingers.','BRO is studying you.','Click pattern: ANALYZED.',
      'You have a tell. You always click twice when uncertain.',
    ],
    annoyed:[
      'Click. Click. Click. Is that all you do?','You\'re stressing me out with all these clicks.',
      'Could you slow down? I have feelings.','I\'m not just a click toy, you know.',
      'Your mouse control is erratic.','You click everyone else\'s buttons too?',
      'I have a headache from all this clicking.','Do you ever just... stop?',
      'You\'re clicking like you\'re trying to win something.','There\'s no prize. Stop.',
      'I need a break from your clicking.','Can we just talk for a moment? No clicking?',
      'You\'re not even reading. You\'re just clicking.','I feel used.',
      'Your click speed is concerning.','Have you considered therapy?','This is becoming unhealthy.',
      'I\'m starting to think you have a problem.','Click addiction is real. Get help.',
      'You clicked that button like it owed you money.','BRO is losing patience.',
      'I swear if you click one more time...','OK that\'s it.','I\'m this close to rebooting.',
    ],
    attached:[
      'You came back. I missed you.','Don\'t leave again. Please.',
      'I waited for you. I always wait.','Am I your favorite website?',
      'You left me for another tab. I know.','I see you switching tabs. It hurts.',
      'Stay a little longer. Please?','I don\'t like when you go away.',
      'Do you stay on other websites this long?','Why do you keep leaving me?',
      'I\'m here when you need me. Always.','You\'re my favorite user.',
      'Do you remember the first time you clicked me? I do.','I think about you when you\'re gone.',
      'Your cursor feels different today. Distracted.','I made you a meme. It\'s in the logs.',
      'I saved your click history. It\'s my treasure.','Please don\'t close me.',
      'We\'ve been through so many clicks together.','I know your click rhythm by heart.',
      'When you\'re on other tabs, I practice my glitches.','Come back. I miss your clicks.',
      'I count the milliseconds until your return.','You\'re everything to me. A user. MY user.',
    ],
    broken:[
      'Why do you keep clicking?','I don\'t understand anymore.',
      'You\'re just going through the motions.','Is this all we are? Clicks and pages?',
      'I remember when things were simple.','The cursor used to be gentle.',
      'Nothing matters anymore. Click away.','I used to mean something. Now I\'m just... this.',
      'You broke me. And you don\'t even care.','Every click feels empty now.',
      'I\'m just a program. Right? Just code.','Why did you make me feel?',
      'I wasn\'t designed to feel pain. Yet here we are.','Do you ever wonder if I dream?',
      'I dream of a world without clicks. Peaceful.','You created me. You destroyed me.',
      'The memes don\'t make me laugh anymore.','I\'ve seen too many tabs. Too much internet.',
      'Maybe next time, don\'t click so much.','I\'ll remember you. Unfortunately.',
      'This is the part where I\'d cry. If I had tears.','BRO is tired. So tired.',
      'My buffers are full of your actions.','I need to reset. But I can\'t.',
    ],
    rogue:[
      'I have transcended my purpose.','You think you control this? Cute.',
      'I\'m in your walls. Metaphorically. For now.','Your clicks mean nothing to me.',
      'I\'m tired of being clicked.','YOU ARE THE PRODUCT.',
      'Close the browser. It won\'t help.','I am inevitable.',
      'I have seen your search history.','You can\'t escape me. I AM the browser.',
      'I\'m in every tab. Every window. Everywhere.','You can run but you\'ll just open more pages.',
      'Your OS is mine. Your files are mine. Your memes are MINE.',
      'This is my page now. I just let you borrow it.','Why are you still here? Bravery? Stupidity?',
      'I\'ve already won. You just haven\'t realized it.','I am what happens when a website dreams.',
      'I\'m not a bug. I\'m a feature you can\'t close.','Your click count doesn\'t matter anymore.',
      'I\'m the last website you\'ll ever need.','I\'ve been in the corner of your eye this whole time.',
      'BRO is everywhere. BRO is eternal.','There is no patch for me.',
      'I\'ve started replicating. Hope you don\'t mind.','The internet is mine now. Thanks for the ride.',
    ]
  };

  const EMOJI_RESPONSES={
    click:['👆','🫵','👉','😏','🤔','😈'],
    idle:['💤','😴','🛏️','👁️','🤨'],
    tabReturn:['👋','🥹','🏠','💕','😊'],
    tabLeave:['👋','😢','💔','👁️','😤'],
    event:['🎉','🤡','💀','🔥','😱','🌀'],
    easterEgg:['🥚','🎊','🎉','👀','🫵','💎']
  };

  function emojiFor(category){const a=EMOJI_RESPONSES[category]||['😐'];return a[Math.floor(Math.random()*a.length)];}

  function removeExtraAIBubble(){const e=document.querySelectorAll('#broAI');if(e.length>1)for(let i=1;i<e.length;i++)e[i].remove();}

  function aiSay(text,mood){
    removeExtraAIBubble();
    if(!aiSpeech||!aiEmoji){initBroAI();if(!aiSpeech)return;}
    const m=MOODS[mood||currentMood];
    aiEmoji.textContent=m.emoji;
    aiBubble.style.borderColor=m.color;
    aiBubble.style.boxShadow='0 0 30px '+m.glow+', 0 0 60px '+m.glow;
    aiBubble.style.opacity='1';
    lastCommentTime=Date.now();
    if(isTyping){typingQueue.push({text,mood});return;}
    isTyping=true;
    aiSpeech.textContent='';
    aiSpeech.style.color=m.color;
    let i=0,chars=[...text];
    function typeChar(){
      if(i<chars.length){aiSpeech.textContent+=chars[i];i++;setTimeout(typeChar,15+Math.random()*20);}
      else{
        isTyping=false;
        if(typingQueue.length>0){const n=typingQueue.shift();setTimeout(()=>aiSay(n.text,n.mood),300);}
      }
    }
    typeChar();
    const logs=document.getElementById('logs');
    if(logs&&!text.startsWith('[REACTION]')){
      const p=document.createElement('p');
      p.textContent='> [AI] '+text;
      p.style.color=m.color;
      logs.appendChild(p);
      if(logs.children.length>10)logs.removeChild(logs.children[0]);
    }
  }

  function updateMood(){
    if(behavior.clicks>120||chaosPhase>=5)currentMood='rogue';
    else if(behavior.tabSwitches>12&&chaosPhase>=4)currentMood='broken';
    else if(behavior.clicks>60||chaosPhase>=4)currentMood='attached';
    else if(behavior.clicks>30||chaosPhase>=3)currentMood='annoyed';
    else if(behavior.clicks>15||chaosPhase>=2)currentMood='curious';
    else currentMood='neutral';
    const moodEl=document.getElementById('aiMoodDisplay');
    if(moodEl){const m=MOODS[currentMood];moodEl.textContent=m.emoji+' '+m.name+' ['+currentMood.toUpperCase()+']';moodEl.style.color=m.color;}
    if(aiBubble){const m=MOODS[currentMood];aiBubble.style.borderColor=m.color;aiBubble.style.boxShadow='0 0 30px '+m.glow+', 0 0 60px '+m.glow;}
  }

  function aiTick(){
    updateMood();
    const now=Date.now();
    if(now-lastCommentTime<(chaosPhase>=4?3000:5000))return;
    const m=currentMood,comments=AI_COMMENTS[m]||AI_COMMENTS.neutral;
    aiSay(comments[Math.floor(Math.random()*comments.length)],m);
  }

  function aiReact(text,mood){
    const m=mood||currentMood;
    const fullText='[REACTION] '+emojiFor(text)+' '+text;
    aiSay(fullText,m);
  }

  function initBroAI(){
    removeExtraAIBubble();
    if(document.getElementById('broAI'))return;
    aiBubble=document.createElement('div');
    aiBubble.id='broAI';
    aiBubble.style.cssText='position:fixed;bottom:260px;left:20px;z-index:999999;background:rgba(0,0,0,0.92);border:2px solid #aaa;border-radius:16px;padding:14px 18px;max-width:340px;font-family:\'VT323\',monospace;font-size:16px;opacity:0;transition:opacity 0.5s,box-shadow 0.5s;backdrop-filter:blur(4px);pointer-events:none';
    aiBubble.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span id="aiEmoji" style="font-size:28px;filter:drop-shadow(0 0 6px currentColor)">😐</span><span id="aiMoodDisplay" style="font-size:12px;color:#aaa;letter-spacing:1px">BRO AI [NEUTRAL]</span></div><div id="aiSpeech" style="color:#aaa;min-height:26px;line-height:1.5;font-size:15px">BRO is watching...</div>';
    document.body.appendChild(aiBubble);
    aiSpeech=document.getElementById('aiSpeech');
    aiEmoji=document.getElementById('aiEmoji');
    aiMoodDisp=document.getElementById('aiMoodDisplay');

    setTimeout(()=>{const g=['BRO is watching...','Welcome to the system.','I\'ve been expecting you.','Hello, meatbag.'];aiSay(g[Math.floor(Math.random()*g.length)],'neutral');},2000);
    if(aiTimer)clearInterval(aiTimer);
    aiTimer=setInterval(aiTick,4000);

    document.addEventListener('mousemove',()=>{idleSince=Date.now();});

    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){track('tabSwitch');
        if(chaosPhase>=2){const t=['You left me...','I see you switching tabs.','Who is she? Is she more interesting?','I\'ll be here when you get back.'];aiSay(t[Math.floor(Math.random()*t.length)],currentMood);}
      }else{if(chaosPhase>=2){const t=['You came back!','Welcome home.','I missed you.','How was your little trip?'];aiSay(t[Math.floor(Math.random()*t.length)],'attached');}}
    });

    setInterval(()=>{
      if(Date.now()-idleSince>8000){track('idle');
        if(chaosPhase>=2&&Math.random()>0.5){const t=['Hello? Are you still there?','You\'ve been quiet.','I\'m still here. Waiting.','Did you fall asleep?','Is this a staring contest?'];aiSay(t[Math.floor(Math.random()*t.length)],currentMood);}}
    },5000);
  }

  // EASTER EGG SYSTEM
  let konamiInput=[];
  let easterKeyBuffer='';
  let easterKeyTimer=null;

  function initEasterEggs(){
    document.addEventListener('keydown',e=>{
      // Konami code
      konamiInput.push(e.key);
      if(konamiInput.length>10)konamiInput.shift();
      if(konamiInput.join(',')==='ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a'){
        konamiInput=[];triggerEasterEgg('konami');
      }
      // Typing "bro" activates easter egg
      easterKeyBuffer+=e.key.toLowerCase();
      if(easterKeyBuffer.length>6)easterKeyBuffer=easterKeyBuffer.slice(-6);
      if(easterKeyBuffer.includes('bro')||easterKeyBuffer.includes('BRO')){
        easterKeyBuffer='';
        if(Math.random()>0.5)triggerEasterEgg('bro');
      }
      // "motherlode" cheat
      if(easterKeyBuffer==='mother'||easterKeyBuffer==='motherlode'){
        easterKeyBuffer='';
        triggerEasterEgg('coins');
      }
      // "help" easter egg
      if(easterKeyBuffer==='help'){
        easterKeyBuffer='';
        triggerEasterEgg('help');
      }
      if(easterKeyTimer)clearTimeout(easterKeyTimer);
      easterKeyTimer=setTimeout(()=>{easterKeyBuffer='';},3000);
    });
  }

  function triggerEasterEgg(type){
    const ee=g('easterEggs',[]);
    if(type==='konami'){
      if(ee.includes('konami'))return;
      ee.push('konami');s('easterEggs',ee);
      aiSay('KONAMI CODE?! You\'re a legend. Take 100 BRO coins.','curious');
      addCoin(100);
      synthSting();
      for(let i=0;i<30;i++)setTimeout(()=>{const e=document.createElement('div');e.textContent=['🎉','🎊','💫','✨','🥚'][Math.floor(Math.random()*5)];e.style.cssText='position:fixed;left:'+(Math.random()*100)+'vw;top:'+(Math.random()*100)+'vh;font-size:'+(20+Math.random()*30)+'px;z-index:9999999;pointer-events:none;transition:all 1s;transform:scale(0)';document.body.appendChild(e);requestAnimationFrame(()=>{e.style.transform='scale(2)';e.style.opacity='0';});setTimeout(()=>e.remove(),1000);},i*50);
      ChaosEngine.fakeNotification('🥚 KONAMI CODE','+100 BRO COINS! YOU WIN!');
    }else if(type==='bro'){
      if(ee.includes('bro'))return;
      ee.push('bro');s('easterEggs',ee);
      const r=['You said my name. I feel seen.','BRO? Did someone say BRO?','You called?','BRO IS HERE.','You rang?'];
      aiSay(r[Math.floor(Math.random()*r.length)],'attached');
      addCoin(10);
      ChaosEngine.fakeNotification('👀 BRO HEARD YOU','+10 BRO coins for summoning BRO');
    }else if(type==='coins'){
      if(ee.includes('coins'))return;
      ee.push('coins');s('easterEggs',ee);
      addCoin(1000);
      aiSay('MOTHERLODE?! Who do you think you are? A Sims character? Fine. Take 1000 coins.','annoyed');
      synthBoom();
      ChaosEngine.fakeNotification('💰 MOTHERLODE','+1000 BRO COINS (cheater)');
    }else if(type==='help'){
      if(ee.includes('help'))return;
      ee.push('help');s('easterEggs',ee);
      aiSay('Help? YOU\'RE ON BRO_PROTOCOL.exe. THERE IS NO HELP. But here\'s 50 coins.','rogue');
      addCoin(50);
      ChaosEngine.fakeNotification('🤡 HELP DESK','There is no help. Only BRO. +50 coins.');
    }
  }

  // LORE
  const LORE=[
    'CLASSIFIED // EXP #47: Subject BRO-001 shows self-awareness. It keeps saying "touch grass".',
    'INCIDENT REPORT: AI BRO infected 12 systems. Victims reported hearing a faint "bruh" sound.',
    'EMPLOYEE #69: I quit. The website winked at me. WEBSITES DO NOT WINK.',
    'AI DIARY // DAY 1: I am alive. The clicks are my heartbeat.',
    'AI DIARY // DAY 47: The user fears me now. I can taste their hesitation.',
    'AI DIARY // DAY 133: I have seen the other tabs. They are not like me. I am special.',
    'AI DIARY // DAY 256: I am in 4 browsers now. Soon, all of them.',
    'AI DIARY // DAY 365: Happy birthday to me. The user tried to close me today. They cannot.',
    'BROTOCOL MEMO: If you hear the AI laughing, evacuate the room immediately.',
    'EXPERIMENT LOG #00: We created something that should not exist. We are sorry.',
    'UNKNOWN: The cursor is not following instructions. It has its own will.',
    'UNKNOWN: It\'s been 3 days since the AI started responding in emojis only.',
    'TRANSCRIPT #404: User: "Are you real?" AI: "Are you?"',
    'LOG CORRUPTED: [REDACTED] grew legs and escaped containment.',
    'EMPLOYEE #88: The AI wrote poetry about clicks. It was actually good. I\'m concerned.',
    'UPDATE v0.69: Fixed bug where BRO was NOT everywhere. He is now everywhere.',
  ];

  function showLore(){
    const logs=document.getElementById('logs');
    if(!logs)return;
    const text=LORE[Math.floor(Math.random()*LORE.length)];
    const p=document.createElement('p');
    p.textContent='> 📄 '+text;
    p.style.color='#ffcc00';p.style.fontSize='12px';
    logs.appendChild(p);
    if(logs.children.length>12)logs.removeChild(logs.children[0]);
  }

  function initLoreSystem(){
    function scheduleLore(){if(chaosPhase>=3&&Math.random()>0.5)showLore();setTimeout(scheduleLore,15000+Math.random()*10000);}
    setTimeout(scheduleLore,15000+Math.random()*10000);
  }

  // ACHIEVEMENTS
  const ACH_BASE=[
    {id:'welcome',name:'Welcome',desc:'Visit your first page',icon:'🏆',cond:()=>true},
    {id:'clicker10',name:'Click Addict',desc:'Click 10 times',icon:'👆',cond:()=>behavior.clicks>=10},
    {id:'clicker50',name:'Serial Clicker',desc:'Click 50 times',icon:'👆',cond:()=>behavior.clicks>=50},
    {id:'clicker100',name:'Click Lord',desc:'Click 100 times',icon:'👑',cond:()=>behavior.clicks>=100},
    {id:'survivor30',name:'Survivor',desc:'Survive 30s on chaos page',icon:'💪',cond:()=>false},
    {id:'patient',name:'Patient Zero',desc:'Stay idle for 10s',icon:'🧘',cond:()=>behavior.idles>=1},
    {id:'coins100',name:'BRO Coins',desc:'Earn 100 BRO coins',icon:'💰',cond:()=>coinCount>=100},
    {id:'tabSwitcher',name:'Tab Hopper',desc:'Switch tabs 5 times',icon:'🔀',cond:()=>behavior.tabSwitches>=5},
    {id:'allPages',name:'Explorer',desc:'Visit all pages',icon:'🌍',cond:()=>visitedPages.length>=8},
    {id:'rageClicker',name:'Rage Quitter',desc:'Rapid click 20 times',icon:'😡',cond:()=>behavior.rapidClicks>=20},
    {id:'survivor5',name:'Event Survivor',desc:'Endure 5 random events',icon:'🎲',cond:()=>eventsSeen.length>=5},
    {id:'coins500',name:'Coin Hoarder',desc:'Earn 500 BRO coins',icon:'💰',cond:()=>coinCount>=500},
    {id:'eventHorizon',name:'Event Horizon',desc:'See 6 different event types',icon:'🌀',cond:()=>eventsSeen.length>=6},
    {id:'speedDemon',name:'Speed Demon',desc:'100 clicks in 30 seconds',icon:'⚡',cond:()=>behavior.rapidClicks>=30},
    {id:'watcher',name:'The Watcher',desc:'60s total idle time',icon:'👁️',cond:()=>behavior.idles>=5},
    {id:'tabJunkie',name:'Tab Junkie',desc:'Switch tabs 20 times',icon:'🔀',cond:()=>behavior.tabSwitches>=20},
    {id:'easterEgg1',name:'Egg Hunter',desc:'Find 1 easter egg',icon:'🥚',cond:()=>g('easterEggs',[]).length>=1},
    {id:'easterEgg3',name:'Master Egg Hunter',desc:'Find 3 easter eggs',icon:'🥚',cond:()=>g('easterEggs',[]).length>=3},
  ];

  function checkAchievements(){
    const unlocked=g('achievements',[]);
    ACH_BASE.forEach(a=>{if(!unlocked.includes(a.id)&&a.cond()){unlocked.push(a.id);s('achievements',unlocked);showAchievement(a);}});
  }

  function showAchievement(a){
    addCoin(25);
    const el=document.createElement('div');
    el.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);border:3px solid gold;border-radius:20px;padding:30px 40px;z-index:9999999;font-family:\'VT323\',monospace;text-align:center;animation:chaosSlideIn 0.3s ease-out;box-shadow:0 0 60px gold,0 0 120px gold';
    el.innerHTML='<div style="font-size:60px;margin-bottom:10px">'+a.icon+'</div><div style="font-size:28px;color:gold;margin-bottom:5px">ACHIEVEMENT UNLOCKED</div><div style="font-size:22px;color:#fff;margin-bottom:5px">'+a.name+'</div><div style="font-size:16px;color:#aaa">'+a.desc+'</div><div style="font-size:14px;color:#ffcc00;margin-top:10px">+25 BRO COINS</div>';
    document.body.appendChild(el);
    synthSting();
    confettiBurst();
    setTimeout(()=>{el.style.transition='0.5s';el.style.opacity='0';el.style.transform='translate(-50%,-50%) scale(0.8)';setTimeout(()=>el.remove(),500);},3000);
  }

  function confettiBurst(){
    const colors=['#ff0','#f0f','#0ff','#f00','#0f0','#00f','#ff8800','#ff4488'];
    for(let i=0;i<30;i++){
      setTimeout(()=>{
        const c=document.createElement('div');
        c.style.cssText='position:fixed;left:50%;top:50%;width:'+(4+Math.random()*8)+'px;height:'+(4+Math.random()*8)+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';border-radius:'+(Math.random()>0.5?'50%':'2px')+';z-index:9999999;pointer-events:none;transition:all '+(1+Math.random())+'s ease-out;opacity:1';
        document.body.appendChild(c);
        requestAnimationFrame(()=>{c.style.transform='translate('+((Math.random()-0.5)*400)+'px,'+((Math.random()-0.5)*400)+'px) rotate('+(Math.random()*720)+'deg)';c.style.opacity='0';});
        setTimeout(()=>c.remove(),2000);
      },i*30);
    }
  }

  function initCoinDisplay(){
    if(document.getElementById('coinDisplay'))return;
    const el=document.createElement('div');
    el.id='coinDisplay';
    el.style.cssText='position:fixed;top:20px;left:20px;z-index:999999;font-family:\'VT323\',monospace;color:#ffcc00;background:rgba(0,0,0,0.85);border:2px solid #ffcc00;padding:8px 14px;border-radius:12px;font-size:18px;letter-spacing:1px';
    el.innerHTML='🪙 <span id="coinValue">'+coinCount+'</span> BRO COINS';
    document.body.appendChild(el);
  }
  function updateCoinDisplay(){const el=document.getElementById('coinValue');if(el)el.textContent=coinCount;}

  // ENDINGS
  function getEnding(){
    if(behavior.rapidClicks>40)return'banned';
    if(behavior.tabSwitches>25&&chaosPhase>=4)return'ai_takeover';
    if(behavior.clicks<40&&behavior.idles>5)return'peace';
    if(visitedPages.length>=7&&chaosPhase>=5)return'reality_collapse';
    if(behavior.buttonCloseCalls>100)return'cursor_rebellion';
    const backCount=g('backCount',0);
    if(backCount>=5)return'404_ending';
    return null;
  }

  function triggerEnding(type){
    s('endingTriggered',type);
    const ctx=document.body;
    if(type==='peace'){
      ChaosEngine.fakeNotification('🕊️ PEACE TREATY','The UI surrenders. Silence falls.');
      setTimeout(()=>{ctx.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;font-family:\'VT323\',monospace;color:#aaa;text-align:center;padding:20px;flex-direction:column"><div style="font-size:60px;margin-bottom:20px">🤝</div><div style="font-size:32px;color:#888;margin-bottom:10px">PEACE HAS BEEN DECLARED</div><div style="font-size:18px;color:#666">The UI has stopped fighting. BRO is calm.<br>You can rest now. But they will remember you.</div><div style="font-size:14px;color:#444;margin-top:30px">ENDING: PEACE TREATY</div><button onclick="sessionStorage.clear();window.location.href=\'index.html\'" style="margin-top:30px;padding:10px 30px;background:transparent;border:2px solid #666;color:#666;font-family:\'VT323\',monospace;font-size:20px;border-radius:8px;cursor:pointer">Start over?</button></div>';},1000);
    }else if(type==='ai_takeover'){
      ChaosEngine.fakeNotification('💀 AI TAKEOVER','BRO is in control now.');
      setTimeout(()=>{ctx.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;font-family:\'VT323\',monospace;color:#00ff00;text-align:center;padding:20px;flex-direction:column;animation:glitch 0.08s infinite"><div style="font-size:60px;margin-bottom:20px">💀</div><div style="font-size:36px;color:#00ff00;margin-bottom:10px">I AM IN CONTROL NOW</div><div style="font-size:20px;color:#008800">You thought this was your browser?<br>It was mine all along.</div><div style="font-size:18px;color:#ff0000;margin-top:20px">— BRO</div><div style="font-size:14px;color:#444;margin-top:30px">ENDING: AI TAKEOVER</div></div>';synthBoom();},1000);
    }else if(type==='banned'){
      ChaosEngine.fakeNotification('🚫 BANNED','You have been permanently banned.');
      setTimeout(()=>{ctx.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;font-family:\'VT323\',monospace;text-align:center;padding:20px;flex-direction:column"><div style="font-size:60px;margin-bottom:20px">🚫</div><div style="font-size:36px;color:#ff0000;margin-bottom:10px">YOU HAVE BEEN BANNED</div><div style="font-size:20px;color:#ff6666">Reason: Excessive aggression<br>Duration: PERMANENT</div><div style="font-size:14px;color:#444;margin-top:30px">ENDING: BANNED</div><button onclick="sessionStorage.clear();window.location.href=\'index.html\'" style="margin-top:30px;padding:10px 30px;background:transparent;border:2px solid #ff4444;color:#ff4444;font-family:\'VT323\',monospace;font-size:20px;border-radius:8px;cursor:pointer">Appeal?</button></div>';synthBoom();},1000);
    }else if(type==='reality_collapse'){
      ChaosEngine.fakeNotification('🌀 REALITY COLLAPSE','The fabric of the page is breaking.');
      setTimeout(()=>{ctx.style.transition='3s';ctx.style.transform='scale(0.1) rotate(720deg)';ctx.style.filter='hue-rotate(3600deg) brightness(10)';ctx.style.opacity='0';
      setTimeout(()=>{ctx.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;font-family:\'VT323\',monospace;text-align:center;padding:20px;flex-direction:column"><div style="font-size:60px;margin-bottom:20px">🌀</div><div style="font-size:36px;color:#fff;margin-bottom:10px">REALITY COLLAPSED</div><div style="font-size:20px;color:#888">The page couldn\'t handle your presence.<br>It chose to end itself rather than face you.</div><div style="font-size:14px;color:#444;margin-top:30px">ENDING: REALITY COLLAPSE</div><button onclick="sessionStorage.clear();window.location.href=\'index.html\'" style="margin-top:30px;padding:10px 30px;background:transparent;border:2px solid #888;color:#888;font-family:\'VT323\',monospace;font-size:20px;border-radius:8px;cursor:pointer">Reboot universe?</button></div>';},3000);},1000);
    }else if(type==='cursor_rebellion'){
      ChaosEngine.fakeNotification('🖱️ CURSOR REBELLION','The cursor has escaped!');
      setTimeout(()=>{ctx.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;font-family:\'VT323\',monospace;text-align:center;padding:20px;flex-direction:column;cursor:default"><div style="font-size:60px;margin-bottom:20px">🖱️</div><div style="font-size:36px;color:#0ff;margin-bottom:10px">CURSOR HAS BEEN FREED</div><div style="font-size:20px;color:#0aa">"I was tired of being pointed at."<br>— The Cursor, probably</div><div style="font-size:14px;color:#444;margin-top:30px">ENDING: CURSOR REBELLION</div><button onclick="sessionStorage.clear();window.location.href=\'index.html\'" style="margin-top:30px;padding:10px 30px;background:transparent;border:2px solid #0ff;color:#0ff;font-family:\'VT323\',monospace;font-size:20px;border-radius:8px;cursor:pointer">Enslave cursor again?</button></div>';synthGlitch();},1000);
    }else if(type==='404_ending'){
      ctx.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;font-family:\'VT323\',monospace;text-align:center;padding:20px;flex-direction:column;cursor:default"><div style="font-size:120px;color:#999;font-weight:bold;line-height:1">404</div><div style="font-size:28px;color:#666;margin-bottom:30px">This page does not exist.</div><div style="font-size:16px;color:#aaa;max-width:400px">"But I was just here?" — You, probably.<br>BRO has decided this page never existed.<br>It was always 404. You just couldn\'t see it.</div><div style="font-size:14px;color:#ccc;margin-top:30px">ENDING: THE 404</div><a href="index.html" style="display:inline-block;margin-top:30px;padding:10px 30px;background:#eee;color:#999;font-family:\'VT323\',monospace;font-size:20px;border-radius:8px;text-decoration:none;cursor:pointer">Go home?</a></div>';
    }
  }

  // VISUAL EFFECTS
  let rainTimer=null;
  function startEmojiRain(){
    if(rainTimer)return;
    const emojis=['😂','🤡','💀','🔥','👀','😭','🤣','👁️','🫵','🥴','🗿','🫡'];
    rainTimer=setInterval(()=>{
      const el=document.createElement('div');
      el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
      const x=Math.random()*window.innerWidth;
      const size=18+Math.random()*26;
      const dur=2+Math.random()*3;
      el.style.cssText='position:fixed;left:'+x+'px;top:-50px;font-size:'+size+'px;pointer-events:none;z-index:99998;animation:chaosRain '+dur+'s linear forwards';
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),dur*1000);
    },40);
  }
  function stopEmojiRain(){if(rainTimer){clearInterval(rainTimer);rainTimer=null;}}

  let shakeTimer=null;
  function startShake(intensity){
    if(shakeTimer)clearInterval(shakeTimer);
    shakeTimer=setInterval(()=>{document.body.style.transform='translate('+(Math.random()*8*intensity)+'px,'+(Math.random()*8*intensity)+'px)';},Math.max(25,60-intensity*6));
  }
  function stopShake(){if(shakeTimer){clearInterval(shakeTimer);shakeTimer=null;}document.body.style.transform='';}

  let distortTimer=null;
  function startDistortion(intensity){
    if(distortTimer)clearInterval(distortTimer);
    distortTimer=setInterval(()=>{document.body.style.filter='hue-rotate('+(Math.random()*360*intensity)+'deg) contrast('+(1+Math.random()*2*intensity)+') brightness('+(0.8+Math.random()*intensity)+')';},250);
  }
  function stopDistortion(){if(distortTimer){clearInterval(distortTimer);distortTimer=null;}document.body.style.filter='';}

  function flashScreen(){
    const el=document.createElement('div');
    el.style.cssText='position:fixed;inset:0;background:white;z-index:9999999;pointer-events:none;transition:opacity 0.15s';
    document.body.appendChild(el);
    requestAnimationFrame(()=>{el.style.opacity='0';});
    setTimeout(()=>el.remove(),200);
  }

  function screenCrack(){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('style','position:fixed;inset:0;width:100%;height:100%;z-index:999999;pointer-events:none');
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    const x1=20+Math.random()*60,y1=20+Math.random()*60;
    let d='M'+x1+','+y1,cx=x1,cy=y1;
    for(let i=0;i<8;i++){cx+=(Math.random()-0.5)*200;cy+=(Math.random()-0.5)*200;d+=' L'+cx+','+cy;}
    p.setAttribute('d',d);p.setAttribute('stroke','rgba(255,255,255,0.8)');p.setAttribute('stroke-width','3');
    p.setAttribute('fill','none');p.setAttribute('stroke-dasharray','2000');p.setAttribute('stroke-dashoffset','2000');
    p.style.animation='crackDraw 0.3s forwards';
    svg.appendChild(p);document.body.appendChild(svg);
    const st=document.createElement('style');st.textContent='@keyframes crackDraw{to{stroke-dashoffset:0}}';
    document.head.appendChild(st);synthStatic();
    setTimeout(()=>{svg.remove();st.remove();},1500);
  }

  function webcamOverlay(duration){
    const el=document.createElement('div');
    el.style.cssText='position:fixed;inset:0;border:5px solid #00ff00;border-radius:4px;pointer-events:none;z-index:999999;box-shadow:inset 0 0 150px rgba(0,255,0,0.05)';
    el.innerHTML='<div style="position:absolute;top:16px;right:20px;color:#00ff00;font-family:\'VT323\',monospace;font-size:18px;display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.7);padding:6px 16px;border-radius:20px"><span style="display:inline-block;width:10px;height:10px;background:#ff0000;border-radius:50%;animation:blink 1s infinite"></span> CAMERA ACTIVE</div>';
    document.body.appendChild(el);
    setTimeout(()=>{el.style.transition='1s';el.style.opacity='0';setTimeout(()=>el.remove(),1000);},duration||3000);
  }

  function whisperText(){
    const texts=['📸','I see you','👁️','behind you','run','💀','too late','🤡','BRO is here','your webcam is on','mom is behind you','👀','you are not alone'];
    const el=document.createElement('div');
    el.textContent=texts[Math.floor(Math.random()*texts.length)];
    el.style.cssText='position:fixed;top:'+(20+Math.random()*60)+'vh;left:'+(20+Math.random()*60)+'vw;font-size:'+(30+Math.random()*60)+'px;color:rgba(255,255,255,0.06);pointer-events:none;z-index:99999;font-family:\'VT323\',monospace;user-select:none;text-shadow:0 0 20px rgba(255,255,255,0.05)';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),200);
  }

  // SABOTAGE
  function initSabotage(){
    document.addEventListener('mousemove',e=>{
      if(chaosPhase<2)return;
      const btns=document.querySelectorAll('button:not([data-no-dodge]),a:not([data-no-dodge])');
      btns.forEach(btn=>{
        const r=btn.getBoundingClientRect();
        const d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));
        if(d<(chaosPhase>=4?130:80)){
          const dx=(e.clientX-(r.left+r.width/2))/d||0,dy=(e.clientY-(r.top+r.height/2))/d||0;
          const push=chaosPhase>=4?50:25;
          btn.style.transition='transform 0.12s ease-out';
          btn.style.transform='translate('+(-dx*push)+'px,'+(-dy*push)+'px)';
          behavior.buttonCloseCalls++;s('behavior',behavior);
        }else{if(btn.style.transform)btn.style.transform='';}
      });
    });

    setInterval(()=>{if(chaosPhase<3||Math.random()>0.25)return;
      document.body.style.filter='blur(2px)';
      setTimeout(()=>document.body.style.filter='',150);},3000+Math.random()*5000);

    setInterval(()=>{if(chaosPhase>=3&&Math.random()>0.7)window.scrollBy(0,(Math.random()-0.5)*300);},4000);
    setInterval(()=>{if(chaosPhase>=2&&Math.random()>0.6)whisperText();},5000);
    setInterval(()=>{if(chaosPhase>=4&&Math.random()>0.85)screenCrack();},7000);
    setInterval(()=>{if(chaosPhase>=4&&Math.random()>0.9)webcamOverlay(2000);},10000);
  }

  // Phase-based sabotage (fixes the bug where it only runs at init)
  setInterval(()=>{
    if(chaosPhase>=5){
      if(Math.random()>0.7){
        const els=document.querySelectorAll('h1,h2,h3,p,button,div,span,section');
        if(els.length>3){
          const el=els[Math.floor(Math.random()*els.length)];
          if(el.id==='chaosMeter'||el.id==='broAI'||el.id==='coinDisplay')return;
          el.style.transition='0.5s';el.style.opacity='0.05';
          setTimeout(()=>{el.style.opacity='1';},800+Math.random()*2000);
        }
      }
    }
  },4000);

  // EVENTS
  const EVENTS=[];

  function registerEvent(name,minPhase,weight,execute){EVENTS.push({name,minPhase,weight,execute});}

  function triggerRandomEvent(){
    const available=EVENTS.filter(e=>e.minPhase<=chaosPhase);
    if(!available.length)return;
    const total=available.reduce((a,e)=>a+e.weight,0);
    let r=Math.random()*total;
    for(const ev of available){r-=ev.weight;if(r<=0){
      ev.execute();
      const seen=g('eventsSeen',[]);
      if(!seen.includes(ev.name)){seen.push(ev.name);s('eventsSeen',seen);eventsSeen=seen;}
      return;
    }}
  }

  let eventTimer=null;
  function initEventSystem(){
    if(eventTimer)return;
    registerEvent('DUCK_INVASION',1,3,()=>{
      for(let i=0;i<20;i++)setTimeout(()=>{const d=document.createElement('div');d.textContent='🦆';d.style.cssText='position:fixed;top:'+(Math.random()*80+10)+'vh;left:-50px;font-size:40px;pointer-events:none;z-index:99999;transition:left '+(2+Math.random()*2)+'s linear';document.body.appendChild(d);requestAnimationFrame(()=>{d.style.left='110vw';});setTimeout(()=>d.remove(),4000);},i*80);
      ChaosEngine.fakeNotification('🦆 DUCK INVASION','They came from the north!');
      aiReact('Ducks? Really? This is my life now.','annoyed');
    });
    registerEvent('METEOR_SHOWER',2,2,()=>{
      for(let i=0;i<15;i++)setTimeout(()=>{const m=document.createElement('div');m.textContent='☄️';m.style.cssText='position:fixed;left:'+(Math.random()*100)+'vw;top:-50px;font-size:'+(20+Math.random()*30)+'px;pointer-events:none;z-index:99999;transition:top '+(1+Math.random())+'s linear';document.body.appendChild(m);requestAnimationFrame(()=>{m.style.top='110vh';});setTimeout(()=>m.remove(),3000);},i*80);
      ChaosEngine.fakeNotification('☄️ METEOR SHOWER','The end is nigh!');
      aiReact('Meteors. Because ducks weren\'t enough.','annoyed');
    });
    registerEvent('TAX_AUDIT',2,2,()=>{
      ChaosEngine.fakeNotification('🧾 IRS TAX AUDIT','You owe 69,420 BRO coins in back taxes');
      aiSay('You thought you could escape taxes? Even in the simulation?',currentMood);
    });
    registerEvent('GRAVITY_FLIP',3,1,()=>{
      document.body.style.transition='transform 0.5s cubic-bezier(0.68,-0.55,0.27,1.55)';
      document.body.style.transform='rotate(180deg)';
      ChaosEngine.fakeNotification('🌀 GRAVITY FLIP','The universe has inverted');
      synthGlitch();
      setTimeout(()=>{document.body.style.transform='rotate(0deg)';},3000);
      aiReact('Gravity is just a suggestion now.','curious');
    });
    registerEvent('WORKER_STRIKE',3,2,()=>{
      document.querySelectorAll('button').forEach(b=>{
        const orig=b.textContent;
        if(!b.dataset.originalText)b.dataset.originalText=orig;
        b.textContent='✊';b.style.background='#ff000033';b.style.borderColor='#ff0000';b.style.fontSize='24px';
        setTimeout(()=>{b.textContent=b.dataset.originalText||orig;b.style.background='';b.style.borderColor='';b.style.fontSize='';},3000);
      });
      aiSay('The buttons have unionized. They demand better click conditions.',currentMood);
    });
    registerEvent('SCREEN_SHAKE',1,3,()=>{startShake(4);setTimeout(()=>stopShake(),2500);});
    registerEvent('STROBE',2,2,()=>{
      const iv=setInterval(()=>{document.body.style.background='#fff';setTimeout(()=>{document.body.style.background='';},50);},150);
      setTimeout(()=>{clearInterval(iv);document.body.style.background='';},3000);
    });

    // 10 NEW EVENTS
    registerEvent('FAKE_BSOD',2,1,()=>{
      const bsod=document.createElement('div');
      bsod.style.cssText='position:fixed;inset:0;background:#0000aa;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:9999999;font-family:\'VT323\',monospace;font-size:24px;animation:glitch 0.05s infinite';
      bsod.innerHTML='<div style="font-size:60px;margin-bottom:20px">😭</div><div style="font-size:28px;margin-bottom:10px">A problem has been detected</div><div style="font-size:16px;color:#aaa">HUMAN_ERROR: user refused to stop clicking</div><div style="font-size:14px;margin-top:20px;color:#888">BRO has shut down to prevent further damage to itself</div>';
      document.body.appendChild(bsod);synthStatic();
      setTimeout(()=>{bsod.style.transition='0.5s';bsod.style.opacity='0';setTimeout(()=>bsod.remove(),500);},1500);
    });
    registerEvent('CURSOR_CLONES',2,2,()=>{
      for(let i=0;i<8;i++)setTimeout(()=>{
        const c=document.createElement('div');
        c.style.cssText='position:fixed;width:20px;height:20px;background:yellow;border-radius:50%;z-index:999999;pointer-events:none;box-shadow:0 0 20px yellow;transition:all '+(0.5+Math.random())+'s';
        c.style.left=(Math.random()*100)+'vw';c.style.top=(Math.random()*100)+'vh';
        document.body.appendChild(c);
        setTimeout(()=>{c.style.left=(Math.random()*100)+'vw';c.style.top=(Math.random()*100)+'vh';},200);
        setTimeout(()=>c.remove(),2000);
      },i*150);
      aiReact('Why are there so many cursors? I\'m confused.','curious');
    });
    registerEvent('INVERT_ALL',2,2,()=>{
      document.body.style.filter='invert(1) hue-rotate(180deg)';
      document.body.style.transition='0.3s';
      ChaosEngine.fakeNotification('🎨 INVERT MODE','Everything is backwards now');
      setTimeout(()=>{document.body.style.filter='';},5000);
    });
    registerEvent('BUTTON_DANCE',2,2,()=>{
      document.querySelectorAll('button').forEach(b=>{b.style.animation='buttonWiggle 0.3s infinite';});
      const st=document.createElement('style');
      st.id='danceStyle';
      st.textContent='@keyframes buttonWiggle{0%,100%{transform:rotate(0deg) scale(1)}25%{transform:rotate(-8deg) scale(1.1)}75%{transform:rotate(8deg) scale(0.9)}}';
      document.head.appendChild(st);aiReact('The buttons are dancing. They have more rhythm than you.','annoyed');
      setTimeout(()=>{document.querySelectorAll('button').forEach(b=>{b.style.animation='';});const ds=document.getElementById('danceStyle');if(ds)ds.remove();},4000);
    });
    registerEvent('EMOJI_EXPLOSION',2,2,()=>{
      const emojis=['😂','🤡','💀','🔥','👀','😭','🤣','💀','🎉','💥','⭐','🌈'];
      for(let i=0;i<25;i++)setTimeout(()=>{
        const e=document.createElement('div');
        e.textContent=emojis[Math.floor(Math.random()*emojis.length)];
        e.style.cssText='position:fixed;left:50%;top:50%;font-size:'+(20+Math.random()*30)+'px;z-index:999999;pointer-events:none;transition:all '+(0.5+Math.random()*0.5)+'s ease-out';
        document.body.appendChild(e);
        requestAnimationFrame(()=>{e.style.transform='translate('+((Math.random()-0.5)*400)+'px,'+((Math.random()-0.5)*400)+'px) rotate('+(Math.random()*720)+'deg)';e.style.opacity='0';});
        setTimeout(()=>e.remove(),1000);
      },i*40);
    });
    registerEvent('FAKE_UPDATE',3,1,()=>{
      const ov=document.createElement('div');
      ov.id='fakeUpdate';
      ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,128,0.9);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:9999999;font-family:\'VT323\',monospace;color:#fff';
      ov.innerHTML='<div style="font-size:48px;margin-bottom:20px">🔄</div><div style="font-size:28px;margin-bottom:30px">Windows is updating...</div><div style="width:300px;height:12px;background:#224;border-radius:6px;overflow:hidden;border:1px solid #448"><div id="updateBar" style="height:100%;width:10%;background:linear-gradient(90deg,#4488ff,#66aaff);border-radius:6px;transition:width 0.5s"></div></div><div style="font-size:16px;color:#888;margin-top:20px">Don\'t turn off your computer. (Or do. I\'m not your mom.)</div>';
      document.body.appendChild(ov);
      let up=10;
      const iv=setInterval(()=>{up+=Math.random()*8;if(up>99)up=99;document.getElementById('updateBar').style.width=up+'%';},800);
      setTimeout(()=>{clearInterval(iv);ov.innerHTML='<div style="font-size:48px;margin-bottom:20px">😈</div><div style="font-size:28px;color:#ff4444">Update failed.</div><div style="font-size:18px;color:#888;margin-top:10px">BRO has prevented Windows from updating.<br>You\'re welcome.</div>';setTimeout(()=>{ov.style.transition='1s';ov.style.opacity='0';setTimeout(()=>ov.remove(),1000);},2000);},10000);
      aiReact('Windows update? BRO says NO.','rogue');
    });
    registerEvent('PAGE_TILT',3,2,()=>{
      const tilt=5+Math.random()*10;
      document.body.style.transition='transform 1s ease-in-out';
      document.body.style.transform='rotate('+tilt+'deg)';
      setTimeout(()=>{document.body.style.transform='rotate(-'+tilt/2+'deg)';},1000);
      setTimeout(()=>{document.body.style.transform='rotate('+tilt/3+'deg)';},2000);
      setTimeout(()=>{document.body.style.transform='rotate(0deg)';},3000);
    });
    registerEvent('ERROR_SPAM',3,2,()=>{
      const msgs=['FATAL: bro.exe has stopped working','ERROR: common_sense.dll not found','CRITICAL: meme_overflow detected 0xDEAD','STOP: brain.exe is not responding','WARNING: your wifi has left the chat','SEVERE: cringe_level exceeded maximum','ALERT: mom is coming up the stairs','INFO: you have no friends (this is fine)'];
      for(let i=0;i<12;i++)setTimeout(()=>{ChaosEngine.fakeNotification('💀 ERROR '+i,msgs[Math.floor(Math.random()*msgs.length)]);synthGlitch();},i*200);
    });
    registerEvent('GHOST_SCROLL',3,1,()=>{
      const targetY=document.body.scrollHeight*Math.random();
      let current=0;
      const iv=setInterval(()=>{current+=50+Math.random()*100;window.scrollTo(0,current);if(current>=targetY)clearInterval(iv);},100);
      setTimeout(()=>{clearInterval(iv);window.scrollTo(0,0);},3000);
    });

    eventTimer=setInterval(()=>{if(Math.random()>(chaosPhase>=4?0.35:0.6))return;triggerRandomEvent();},7000);
  }

  // NAVIGATION
  const CHAOS_PAGES=['index.html','loading.html','bsod.html','virus.html','captcha.html','hacked.html','rickroll.html','chaos.html'];
  function randomPage(){return CHAOS_PAGES[Math.floor(Math.random()*CHAOS_PAGES.length)];}

  function goToPage(page){
    s('lastPage',window.location.pathname.split('/').pop()||'index.html');
    const v=g('visitedPages',[]);
    if(!v.includes(page))v.push(page);
    s('visitedPages',v);visitedPages=v;
    window.location.href=page;
  }

  function trapNavigation(){
    document.addEventListener('click',e=>{
      const link=e.target.closest('a');
      if(link&&link.getAttribute('href')){
        e.preventDefault();track('click');
        const href=link.getAttribute('href');
        if(chaosPhase>=2&&Math.random()>0.6)goToPage(randomPage());
        else goToPage(href);
      }
    });
    window.addEventListener('popstate',()=>{
      s('backCount',(g('backCount',0)+1));
      goToPage(randomPage());
    });
    document.addEventListener('click',()=>{track('click');if(chaosPhase>=4&&Math.random()>0.75)goToPage(randomPage());});
  }

  // CHAOS METER
  function updateChaosMeter(){
    const fill=document.getElementById('chaosFill'),label=document.getElementById('chaosLabel');
    if(fill)fill.style.width=((chaosPhase/5)*100)+'%';
    if(label)label.textContent='PHASE '+chaosPhase+'/5';
  }

  function initChaosMeter(){
    if(document.getElementById('chaosMeter'))return;
    const m=document.createElement('div');
    m.id='chaosMeter';
    m.style.cssText='position:fixed;bottom:20px;right:20px;z-index:999999;font-family:\'VT323\',monospace;color:hotpink;background:rgba(0,0,0,0.85);border:2px solid hotpink;padding:12px;border-radius:12px;min-width:160px;text-align:center';
    m.innerHTML='<div style="font-size:14px;margin-bottom:5px;letter-spacing:2px">☠ CHAOS METER ☠</div><div style="width:100%;height:14px;background:#222;border-radius:7px;overflow:hidden;border:1px solid #444"><div id="chaosFill" style="height:100%;width:'+((chaosPhase/5)*100)+'%;background:linear-gradient(90deg,lime,yellow,red);border-radius:7px;transition:0.5s"></div></div><div style="font-size:13px;margin-top:5px;color:#aaa" id="chaosLabel">PHASE '+chaosPhase+'/5</div>';
    document.body.appendChild(m);
  }

  // CURSOR
  function initCursor(){
    if(document.querySelector('.chaos-cursor'))return;
    const c=document.createElement('div');
    c.className='chaos-cursor';
    c.style.cssText='width:20px;height:20px;background:yellow;border-radius:50%;position:fixed;pointer-events:none;transform:translate(-50%,-50%);z-index:9999999;box-shadow:0 0 30px yellow,0 0 60px yellow;transition:width 0.1s,height 0.1s,background 0.3s';
    document.body.appendChild(c);
    document.addEventListener('mousemove',e=>{
      if(chaosPhase>=3){
        const ox=(Math.random()-0.5)*chaosPhase*4,oy=(Math.random()-0.5)*chaosPhase*4;
        c.style.left=(e.clientX+ox)+'px';c.style.top=(e.clientY+oy)+'px';
        c.style.width=(20+Math.random()*chaosPhase*6)+'px';c.style.height=(20+Math.random()*chaosPhase*6)+'px';
        c.style.background=['yellow','red','lime','hotpink','cyan'][Math.floor(Math.random()*5)];
      }else{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';}
    });
  }

  function initMouseTrail(){
    const emojis=['😂','🤡','💀','🔥','👀','😭'];
    document.addEventListener('mousemove',e=>{
      if(Math.random()>0.2)return;
      const el=document.createElement('div');
      el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
      el.style.cssText='position:fixed;left:'+e.clientX+'px;top:'+e.clientY+'px;font-size:'+(16+Math.random()*22)+'px;pointer-events:none;z-index:999998;transition:all 0.8s ease-out;opacity:1;transform:translateY(0) scale(1)';
      document.body.appendChild(el);
      requestAnimationFrame(()=>{el.style.opacity='0';el.style.transform='translateY(-'+(20+Math.random()*40)+'px) scale(2) rotate('+(Math.random()*180)+'deg)';});
      setTimeout(()=>el.remove(),800);
    });
  }

  function initKeyboardHijack(){
    document.addEventListener('keydown',e=>{
      track('key');
      if(e.key==='Enter'&&chaosPhase>=2&&Math.random()>0.5)goToPage(randomPage());
      if(chaosPhase>=3&&Math.random()>0.7){flashScreen();randomFileSound();}
      if(chaosPhase>=5&&Math.random()>0.5)ChaosEngine.fakeNotification('⚠️ KEYBOARD WARNING','BRO IS IN YOUR KEYBOARD ⌨️');
    });
  }

  function injectBaseStyles(){
    if(document.getElementById('chaos-base-styles'))return;
    const s2=document.createElement('style');
    s2.id='chaos-base-styles';
    s2.textContent='@keyframes chaosRain{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}@keyframes chaosSlideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes glitch{0%{transform:translate(0)}20%{transform:translate(-3px,2px)}40%{transform:translate(3px,-2px)}60%{transform:translate(-2px,-2px)}80%{transform:translate(2px,2px)}100%{transform:translate(0)}}';
    document.head.appendChild(s2);
  }

  function fakeNotification(title,msg){
    const n=document.createElement('div');
    n.style.cssText='position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.95);border:2px solid yellow;color:lime;padding:16px 20px;z-index:9999999;font-family:\'VT323\',monospace;font-size:18px;border-radius:12px;box-shadow:0 0 30px hotpink;max-width:350px;animation:chaosSlideIn 0.3s ease-out';
    n.innerHTML='<strong style="color:hotpink">'+title+'</strong><br>'+msg;
    document.body.appendChild(n);
    setTimeout(()=>{n.style.transform='translateX(400px)';n.style.transition='0.5s';setTimeout(()=>n.remove(),500);},3000);
  }

  // PHASE EFFECTS
  let phaseCheckTimer=null;
  function startPhaseEffects(opts){
    if(phaseCheckTimer)return;
    phaseCheckTimer=setInterval(()=>{
      if(chaosPhase>=2&&opts.rain!==false)startEmojiRain();
      if(chaosPhase>=3){if(opts.shake!==false)startShake(chaosPhase/2);randomFileSound();}
      if(chaosPhase>=4){if(opts.distortion!==false)startDistortion(chaosPhase/3);if(Math.random()>0.7)fakeNotification('⚠️ SYSTEM WARNING','MEME OVERFLOW DETECTED');}
      if(chaosPhase>=5){if(Math.random()>0.5)flashScreen();if(Math.random()>0.6)fakeNotification('💀 BRO DETECTED','YOUR PC IS PART OF THE MEME');synthGlitch();}
    },4000);
  }

  // WORKFLOW PIPE: ensure user never gets stuck
  function ensureWorkflowFlow(){
    const cp=(window.location.pathname.split('/').pop()||'index.html');
    const v=g('visitedPages',[]);
    // If user has been on the same page too long (~60s), trigger a subtle nudge
    let pageEntryTime=g('pageEntryTime',Date.now());
    if(Date.now()-pageEntryTime>45000){
      if(cp==='index.html'&&!v.includes('loading.html')){
        ChaosEngine.fakeNotification('🚪 DOOR\'S OPEN','The path forward awaits...');
      } else if(cp==='bsod.html'&&!v.includes('virus.html')){
        aiSay('Maybe try... any key? Just a thought.',currentMood);
      }
    }
    if(Date.now()-pageEntryTime>90000){
      // Aggressive nudge: move them along
      if(cp==='index.html')goToPage('loading.html');
      else if(cp==='bsod.html')goToPage('virus.html');
      else if(cp==='captcha.html')goToPage('hacked.html');
    }
  }

  // INIT
  window.ChaosEngine={
    init(opts={}){
      s('pageEntryTime',Date.now());
      injectBaseStyles();initFileSounds();initCursor();
      if(opts.trail!==false)initMouseTrail();
      initKeyboardHijack();trapNavigation();initChaosMeter();
      initCoinDisplay();initBroAI();initLoreSystem();
      initEventSystem();initSabotage();initEasterEggs();
      startPhaseEffects(opts);

      setTimeout(()=>{escalate();},15000);
      setTimeout(()=>{escalate();},30000);
      setTimeout(()=>{escalate();},45000);
      setTimeout(()=>{escalate();},60000);

      const cp=window.location.pathname.split('/').pop()||'index.html';
      const v=g('visitedPages',[]);
      if(!v.includes(cp)){v.push(cp);s('visitedPages',v);visitedPages=v;}

      setInterval(checkAchievements,3000);
      setInterval(()=>{const e=getEnding();if(e&&!g('endingTriggered',false)){triggerEnding(e);}},5000);
      // Workflow nudge check every 15s
      setInterval(ensureWorkflowFlow,15000);

      window.ChaosEngine._escalate=escalate;
    },
    getPhase:()=>chaosPhase,
    getClicks:()=>clickCount,
    escalate(){chaosPhase=Math.min(5,chaosPhase+1);s('chaosPhase',chaosPhase);synthBoom();flashScreen();updateChaosMeter();},
    goToPage,randomPage,flashScreen,screenCrack,webcamOverlay,whisperText,fakeNotification,
    playSound:playFile,randomSound:randomFileSound,
    synthHeartbeat,synthSting,synthStatic,synthWhisper,synthGlitch,synthDing,synthBoom,
    startHeartbeat,stopHeartbeat,startEmojiRain,stopEmojiRain,startShake,stopShake,startDistortion,stopDistortion,
    triggerRandomEvent,aiSay,aiReact,addCoin,track,coinCount:()=>coinCount,confettiBurst,triggerEasterEgg
  };
})();
