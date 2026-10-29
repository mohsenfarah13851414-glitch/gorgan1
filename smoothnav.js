/* پیمایش نرم و سریع بین بخش‌ها و صفحه‌ها (مشترک همه‌ی صفحه‌ها)
   - لینک به بخشی از همین صفحه: اسکرول سریع و نرم، بدون پرش
   - لینک به صفحه‌ی دیگر: صفحه از بالا باز می‌شود و سریع تا بخش مقصد می‌لغزد */
(function(){
  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,root=document.documentElement,raf=0,moved=false;
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function norm(p){return p.replace(/index\.html?$/,'').replace(/\/$/,'')}
  function offset(){var v=parseFloat(getComputedStyle(root).scrollPaddingTop);return v>0?v:72}
  function maxY(){return Math.max(0,root.scrollHeight-innerHeight)}
  function targetY(el){return Math.max(0,Math.min(maxY(),el.getBoundingClientRect().top+scrollY-offset()))}
  function idOf(h){try{return decodeURIComponent(h.slice(1))}catch(_){return h.slice(1)}}

  var evs=['wheel','touchstart','mousedown','keydown'];
  function userStop(){moved=true;stop()}
  function stop(){cancelAnimationFrame(raf);raf=0;root.style.scrollBehavior='';evs.forEach(function(n){removeEventListener(n,userStop)})}

  /* getY: مقصد را هر فریم دوباره می‌خواند، پس اگر عکسی لود شد و چیدمان عوض شد، باز هم دقیق می‌رسد */
  function animate(getY,done){
    stop();moved=false;
    var s=scrollY,y0=getY();
    if(rm||Math.abs(y0-s)<2){scrollTo(0,y0);if(done)done();return}
    var ms=Math.min(600,Math.max(300,Math.abs(y0-s)*.2)),t0=performance.now();
    root.style.scrollBehavior='auto';
    evs.forEach(function(n){addEventListener(n,userStop,{passive:true})});
    (function step(ts){
      var p=Math.min(1,(ts-t0)/ms);
      scrollTo(0,s+(getY()-s)*ease(p));
      if(p<1)raf=requestAnimationFrame(step);else{stop();if(done)done()}
    })(t0);
  }
  function scrollToHash(h,done){
    if(!h||h==='#'||h==='#top'){animate(function(){return 0},done);return true}
    var el=document.getElementById(idOf(h));if(!el)return false;
    animate(function(){return targetY(el)},done);return true;
  }

  /* ورود از صفحه‌ی دیگر */
  var arrival=null;
  try{
    var s=JSON.parse(sessionStorage.getItem('an')||'null');sessionStorage.removeItem('an');
    if(s&&Date.now()-s.t<8000&&norm(s.path)===norm(location.pathname))arrival=s;
  }catch(_){}
  if(arrival&&arrival.h&&arrival.h!=='#'){
    if('scrollRestoration' in history)history.scrollRestoration='manual';
    scrollTo(0,0);
    var go=function(){
      scrollTo(0,0);
      setTimeout(function(){
        var ok=scrollToHash(arrival.h,function(){
          if('scrollRestoration' in history)history.scrollRestoration='auto';
          /* اگر بعد از رسیدن عکسی لود شد و چیدمان جابه‌جا شد، یک بار دیگر دقیق تنظیم کن */
          var fix=function(){
            var el=document.getElementById(idOf(arrival.h));
            if(el&&!moved&&Math.abs(targetY(el)-scrollY)>6)animate(function(){return targetY(el)});
          };
          if(document.readyState==='complete')setTimeout(fix,0);else addEventListener('load',function(){setTimeout(fix,50)},{once:true});
        });
        if(!ok&&'scrollRestoration' in history)history.scrollRestoration='auto';
      },80);
    };
    if(document.readyState==='loading')addEventListener('DOMContentLoaded',go,{once:true});else go();
  }

  /* کلیک روی لینک‌های داخلی */
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button>0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a||a.target==='_blank'||a.hasAttribute('download')||a.hasAttribute('data-no-smooth'))return;
    var href=a.getAttribute('href');
    if(!href||href==='#'||/^(tel:|mailto:|sms:|javascript:)/i.test(href))return;
    var u;try{u=new URL(href,location.href)}catch(_){return}
    if(u.protocol!==location.protocol||u.host!==location.host)return;
    var catalogHash=/^#(cat-|cards=)/.test(u.hash); /* این‌ها را خودِ صفحه‌ی محصولات مدیریت می‌کند */
    var same=norm(u.pathname)===norm(location.pathname);

    if(same){
      if(catalogHash)return;
      if(u.hash&&u.hash!=='#top'&&!document.getElementById(idOf(u.hash)))return;
      e.preventDefault();scrollToHash(u.hash);return;
    }
    if(!/(\.html?|\/)$/.test(u.pathname)||catalogHash)return;
    e.preventDefault();
    var box=a.closest('[data-nav-delay]'),delay=box?+box.getAttribute('data-nav-delay')||0:0;
    try{sessionStorage.setItem('an',JSON.stringify({h:u.hash,k:a.getAttribute('data-k')||'',path:u.pathname,t:Date.now()}))}catch(_){}
    u.hash='';
    setTimeout(function(){location.href=u.href},delay);
  });

  window.AladdinNav={scrollToHash:scrollToHash,scrollToId:function(id){return scrollToHash('#'+id)},arrival:arrival};
})();
