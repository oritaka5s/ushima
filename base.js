/* Discover USHIMA 共通スクリプト（新デザイン用）。旧ページの script.js とは独立 */
(function(){
  var d=document, root=d.documentElement, lang='ja', KEY='ushima-lang';
  if(root.className.indexOf('js')<0){root.className+=' js';}
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header / menu ---- */
  var top=d.getElementById('top'), menu=d.getElementById('menu'), nav=d.getElementById('nav');
  var hero=d.querySelector('.hero');
  function onScroll(){
    var y=window.scrollY||0, h=hero?hero.offsetHeight:300;
    top.classList.toggle('solid', y>h*0.6 || nav.classList.contains('open') || !hero);
  }
  menu.addEventListener('click',function(){
    var open=!nav.classList.contains('open');
    nav.classList.toggle('open',open);
    top.classList.toggle('menu-open',open);
    menu.setAttribute('aria-expanded',open?'true':'false');
    onScroll();
  });
  nav.addEventListener('click',function(e){
    if(e.target.tagName==='A'&&nav.classList.contains('open')){menu.click();}
  });

  /* ---- language (保存あり) ---- */
  var langBtn=d.getElementById('lang');
  function store(v){try{localStorage.setItem(KEY,v);}catch(e){}}
  function read(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function each(sel,fn){var l=d.querySelectorAll(sel);for(var i=0;i<l.length;i++){fn(l[i]);}}
  function applyLang(){
    root.lang=lang;
    each('[data-ja][data-en]',function(el){el.textContent=el.getAttribute('data-'+lang);});
    each('[data-alt-ja]',function(el){el.setAttribute('alt',el.getAttribute('data-alt-'+lang));});
    each('[data-aria-ja]',function(el){el.setAttribute('aria-label',el.getAttribute('data-aria-'+lang));});
    each('[data-content-ja]',function(el){el.setAttribute('content',el.getAttribute('data-content-'+lang));});
    each('.zoom',function(b){
      var cap=b.getAttribute('data-cap-'+lang)||'';
      b.setAttribute('aria-label',(lang==='ja'?'写真を拡大：':'Enlarge photo: ')+cap);
    });
    langBtn.textContent=lang==='ja'?'EN':'JA';
  }
  langBtn.addEventListener('click',function(){
    lang=lang==='ja'?'en':'ja';
    store(lang);
    applyLang();
    if(lb.open){showLb(idx);}
  });

  /* ---- reveal ---- */
  var rv=d.querySelectorAll('.rv');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(el){io.observe(el);});
  }else{rv.forEach(function(el){el.classList.add('in');});}

  /* ---- toc ---- */
  var toc=d.getElementById('toc'), links=toc?toc.querySelectorAll('a'):[], secs=d.querySelectorAll('[data-toc]');
  function tocState(){
    if(!toc){return;}
    var y=window.scrollY||0, h=hero?hero.offsetHeight:300, mid=y+window.innerHeight*0.4, cur=null;
    toc.classList.toggle('on', y>h*0.7);
    secs.forEach(function(s){if(s.offsetTop<=mid){cur=s;}});
    links.forEach(function(a){
      var on=cur&&a.getAttribute('href')==='#'+cur.id;
      if(on){a.setAttribute('aria-current','true');}else{a.removeAttribute('aria-current');}
    });
    var probe=y+window.innerHeight/2, dark=false;
    each('[data-dark],.band',function(s){
      if(s.offsetTop<=probe && s.offsetTop+s.offsetHeight>probe){dark=true;}
    });
    toc.classList.toggle('dark',dark);
  }

  /* ---- parallax bands ---- */
  var bands=d.querySelectorAll('[data-parallax]');
  function par(){
    if(reduce){return;}
    var vh=window.innerHeight;
    bands.forEach(function(b){
      var r=b.getBoundingClientRect();
      if(r.bottom<0||r.top>vh){return;}
      var p=(r.top+r.height/2-vh/2)/vh;
      b.querySelector('img').style.transform='translate3d(0,'+(p*-9).toFixed(2)+'%,0)';
    });
  }

  var tick=false;
  function frame(){tick=false;onScroll();tocState();par();}
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(frame);}},{passive:true});
  window.addEventListener('resize',frame);

  /* ---- lightbox (前後移動つき) ---- */
  var lb=d.getElementById('lb'), lbimg=d.getElementById('lbimg'), lbcap=d.getElementById('lbcap');
  var prev=d.getElementById('lbprev'), next=d.getElementById('lbnext');
  var zooms=Array.prototype.slice.call(d.querySelectorAll('.zoom')), idx=0, last=null;
  function showLb(i){
    idx=(i+zooms.length)%zooms.length;
    var b=zooms[idx], img=b.querySelector('img');
    lbimg.src=b.getAttribute('data-full');
    lbimg.alt=img?img.getAttribute('alt'):'';
    lbcap.textContent=(b.getAttribute('data-cap-'+lang)||'')+(zooms.length>1?'  ('+(idx+1)+'/'+zooms.length+')':'');
  }
  function openLb(i){
    last=zooms[i];
    showLb(i);
    prev.hidden=next.hidden=zooms.length<2;
    if(lb.showModal){lb.showModal();}else{lb.setAttribute('open','');}
  }
  function closeLb(){if(lb.close){lb.close();}else{lb.removeAttribute('open');}}
  zooms.forEach(function(b,i){b.addEventListener('click',function(){openLb(i);});});
  prev.addEventListener('click',function(){showLb(idx-1);});
  next.addEventListener('click',function(){showLb(idx+1);});
  d.getElementById('lbclose').addEventListener('click',closeLb);
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.className==='lb'){closeLb();}});
  lb.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){showLb(idx-1);}
    else if(e.key==='ArrowRight'){showLb(idx+1);}
  });
  lb.addEventListener('close',function(){lbimg.removeAttribute('src');if(last){last.focus();}});

  /* ---- init ---- */
  if(read()==='en'){lang='en';}
  applyLang();
  frame();
})();
