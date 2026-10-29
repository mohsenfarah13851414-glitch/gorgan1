/* نوار پایین ثابت — مشترک همه‌ی صفحه‌ها
   - لینک‌ها همیشه href کامل (با #) دارند؛ جاوااسکریپت فقط انیمیشن اضافه می‌کند
   - همیشه فقط یک تب فعال است
   - فرورفتگی کم‌عمق و هم‌اندازه با دایره‌ی فعال */
(function(){
  var bar=document.querySelector('.tabbar');if(!bar)return;
  var NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');
  svg.setAttribute('class','tb-bg');svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs><linearGradient id="tbGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1B22"/><stop offset="1" stop-color="#140C11"/></linearGradient></defs><path/>';
  var path=svg.querySelector('path'),pill=document.createElement('span');pill.className='tb-pill';
  bar.prepend(pill);bar.prepend(svg);

  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,DUR=rm?0:380,x=null,anim=0;
  var R=18,NOTCH_W=42,NOTCH_D=29,PILL=54;

  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function centerOf(a){var br=bar.getBoundingClientRect(),r=a.getBoundingClientRect();return r.left-br.left+r.width/2}
  function cur(){return bar.querySelector('a.on')}
  function setOn(a){
    [].forEach.call(bar.querySelectorAll('a.on'),function(o){if(o!==a){o.classList.remove('on');o.removeAttribute('aria-current')}});
    a.classList.add('on');a.setAttribute('aria-current','page');
  }
  function draw(cx){
    var W=bar.clientWidth,H=bar.clientHeight;if(!W)return;
    var w=Math.max(34,Math.min(NOTCH_W,cx-R-1,W-cx-R-1)),d=NOTCH_D;
    path.setAttribute('d',
      'M'+R+',0 L'+(cx-w)+',0'+
      ' C'+(cx-w*.5)+',0 '+(cx-w*.58)+','+d+' '+cx+','+d+
      ' C'+(cx+w*.58)+','+d+' '+(cx+w*.5)+',0 '+(cx+w)+',0'+
      ' L'+(W-R)+',0 Q'+W+',0 '+W+','+R+' L'+W+','+(H-R)+' Q'+W+','+H+' '+(W-R)+','+H+
      ' L'+R+','+H+' Q0,'+H+' 0,'+(H-R)+' L0,'+R+' Q0,0 '+R+',0Z');
    pill.style.transform='translateX('+(cx-PILL/2)+'px)';x=cx;
  }
  function moveTo(a,instant){
    var to=centerOf(a),from=x==null?to:x;cancelAnimationFrame(anim);
    if(instant||!DUR||Math.abs(to-from)<1){draw(to);return}
    var t0=performance.now();
    (function step(ts){var p=Math.min(1,(ts-t0)/DUR);draw(from+(to-from)*ease(p));if(p<1)anim=requestAnimationFrame(step)})(t0);
  }
  function norm(p){return p.replace(/index\.html?$/,'').replace(/\/$/,'')}
  bar.setAttribute('data-nav-delay',String(DUR));

  /* حالت اولیه: تبِ مقصد (از صفحه‌ی قبل یا از #) و در نبودش تبِ فعالِ خودِ صفحه */
  var arrival=window.AladdinNav&&window.AladdinNav.arrival;
  function byKey(k){return k&&bar.querySelector('a[data-k="'+k+'"]')}
  function byHash(){
    if(!location.hash||location.hash==='#')return null;
    var hit=null;
    [].forEach.call(bar.querySelectorAll('a'),function(a){
      if(hit||/^tel:/i.test(a.getAttribute('href')))return;
      var u=new URL(a.getAttribute('href'),location.href);
      if(u.hash&&u.hash===location.hash&&norm(u.pathname)===norm(location.pathname))hit=a;
    });
    return hit;
  }
  var home=byKey(arrival&&arrival.k)||byHash()||cur()||bar.querySelector('a');
  setOn(home);draw(centerOf(home));

  addEventListener('resize',function(){var c=cur();if(c)draw(centerOf(c))});
  addEventListener('pageshow',function(e){if(e.persisted){setOn(home);draw(centerOf(home))}});

  /* کلیک: فقط دایره می‌لغزد. پیمایش و رفتن به صفحه‌ی دیگر را smoothnav.js انجام می‌دهد
     (اگر آن فایل نباشد، لینک‌ها همان لینک معمولی با آدرس کامل‌اند) */
  bar.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a||!bar.contains(a))return;
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0)return;
    var href=a.getAttribute('href');if(!href)return;
    var before=cur();
    if(/^tel:/i.test(href)){
      e.preventDefault();setOn(a);moveTo(a);
      setTimeout(function(){
        location.href=href;
        setTimeout(function(){if(before&&before!==a){setOn(before);moveTo(before)}},1200);
      },Math.round(DUR*.7));
      return;
    }
    setOn(a);moveTo(a);
  });
})();
