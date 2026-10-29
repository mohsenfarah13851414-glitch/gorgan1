/* هدر ساده: نشانگر فعال فقط یک لغزش کوتاه دارد */
(function(){
  var bar=document.querySelector('.sbar'),nav=bar&&bar.querySelector('.sbar-nav');if(!nav)return;
  var ind=nav.querySelector('.sbar-ind');
  bar.setAttribute('data-nav-delay','240');
  function cur(){return nav.querySelector('a.on')}
  function place(a){
    if(!a){nav.classList.remove('has-on');return}
    ind.style.width=a.offsetWidth+'px';ind.style.transform='translateX('+a.offsetLeft+'px)';nav.classList.add('has-on');
  }
  function setOn(a){
    [].forEach.call(nav.querySelectorAll('a.on'),function(o){if(o!==a){o.classList.remove('on');o.removeAttribute('aria-current')}});
    if(a){a.classList.add('on');a.setAttribute('aria-current','page')}
    place(a);
  }
  var start=cur();place(start);
  requestAnimationFrame(function(){requestAnimationFrame(function(){nav.classList.add('ready')})});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){place(cur())});
  addEventListener('resize',function(){place(cur())});
  nav.addEventListener('click',function(e){
    var a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button>0)return;
    var before=cur();setOn(a);
    if(/^tel:/i.test(a.getAttribute('href'))){
      /* بعد از باز شدن شماره‌گیر، نشانگر به حالت قبل برمی‌گردد */
      setTimeout(function(){setOn(before&&before!==a?before:null)},1200);
    }
  });
  addEventListener('pageshow',function(e){if(e.persisted){setOn(start)}});
})();
