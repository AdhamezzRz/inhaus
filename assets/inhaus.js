/*!
 * INN HAUS — Wear it. Live in it.
 * Theme interactions: smooth scroll, the handwritten intro, linen-curtain page
 * transitions, the sewing-button cursor, the pull-cord light switch, the
 * linen-pouch cart and every section's choreography.
 */
(function () {
  'use strict';

  var gsap = window.gsap;
  var cfg = window.InnHaus || {};
  var root = document.documentElement;
  if (!gsap) {
    root.classList.remove('is-loading', 'is-arriving');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Draggable, CustomEase);
  ScrollTrigger.config({ ignoreMobileResize: true });
  CustomEase.create('haus', '0.65,0,0.15,1');
  CustomEase.create('silk', '0.22,1,0.36,1');
  gsap.defaults({ ease: 'silk', duration: 1 });

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  var design = !!cfg.designMode;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = gsap.utils.clamp;

  /* ------------------------------------------------------------------ *
   * Money
   * ------------------------------------------------------------------ */
  function money(cents) {
    var fmt = cfg.moneyFormat || '{{amount}}';
    var n = (cents || 0) / 100;
    var withDelims = function (num, decimals, thousands, dec) {
      var parts = num.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts.join(dec);
    };
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, key) {
      switch (key) {
        case 'amount_no_decimals': return withDelims(n, 0, ',', '.');
        case 'amount_with_comma_separator': return withDelims(n, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return withDelims(n, 0, '.', ',');
        case 'amount_with_space_separator': return withDelims(n, 2, ' ', ',');
        default: return withDelims(n, n % 1 === 0 ? 0 : 2, ',', '.');
      }
    }).replace(/<[^>]+>/g, '');
  }

  /* ------------------------------------------------------------------ *
   * Smooth scroll
   * ------------------------------------------------------------------ */
  var lenis = null;
  if (window.Lenis && !reduce && !design && cfg.smooth !== false) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (root.classList.contains('is-loading')) lenis.stop();
  }
  var lockScroll = function (on) {
    if (lenis) on ? lenis.stop() : lenis.start();
    root.style.overflow = on ? 'hidden' : '';
  };

  /* ------------------------------------------------------------------ *
   * Pens: round caps on a 0-length dash still paint a dot, so each stroke
   * stays hidden until its own draw tween starts.
   * ------------------------------------------------------------------ */
  function penReset(paths) {
    gsap.set(paths, { drawSVG: '0%' });
    paths.forEach(function (p) { p.classList.remove('is-drawing'); });
  }
  function penStart() {
    this.targets().forEach(function (t) { t.classList.add('is-drawing'); });
  }

  /* ------------------------------------------------------------------ *
   * Ready: everything waits for the intro (or runs at once without one)
   * ------------------------------------------------------------------ */
  var readyCbs = [];
  var isReady = false;
  function onReady(cb) { isReady ? cb() : readyCbs.push(cb); }
  function markReady() {
    if (isReady) return;
    isReady = true;
    readyCbs.splice(0).forEach(function (cb) { cb(); });
  }

  function runPreloader() {
    var el = $('.preloader');
    if (!el || !root.classList.contains('is-loading')) {
      if (el) el.remove();
      return false;
    }
    lockScroll(true);
    var pens = $$('.wordmark__pen path', el);
    var guides = $$('.preloader__guide', el);
    var nib = $('.preloader__nib', el);
    var counter = $('.preloader__count', el);
    var mark = $('.preloader__mark', el);
    var lens = guides.map(function (g) { return g.getTotalLength(); });
    var pen = { line: 0, p: 0 };
    var moveNib = function () {
      var g = guides[pen.line];
      if (!g || !nib) return;
      var pt = g.getPointAtLength(lens[pen.line] * pen.p);
      nib.setAttribute('cx', pt.x);
      nib.setAttribute('cy', pt.y);
    };
    var count = { v: 0 };
    penReset(pens);

    var tl = gsap.timeline({ delay: 0.15 });
    tl.to(count, { v: 100, duration: 1.75, ease: 'power2.inOut', onUpdate: function () { counter.textContent = String(Math.round(count.v)).padStart(3, '0'); } })
      .fromTo(nib, { attr: { r: 0 } }, { attr: { r: 9 }, duration: 0.2, ease: 'back.out(3)' }, 0.05)
      .to(pens[0], { drawSVG: '100%', duration: 0.9, ease: 'power1.inOut', onStart: penStart }, 0.1)
      .to(pen, { p: 1, duration: 0.9, ease: 'power1.inOut', onUpdate: moveNib }, 0.1)
      .set(pen, { line: 1, p: 0 })
      .to(pens[1], { drawSVG: '100%', duration: 0.8, ease: 'power1.inOut', onStart: penStart }, '>')
      .to(pen, { p: 1, duration: 0.8, ease: 'power1.inOut', onUpdate: moveNib }, '<')
      .to(nib, { attr: { r: 0 }, duration: 0.2 }, '>-0.05')
      .from($$('.preloader__tag span', el), { opacity: 0, y: 8, stagger: 0.02, duration: 0.4 }, '-=0.7')
      .add(function () { try { sessionStorage.setItem('innhaus-intro-seen', '1'); } catch (e) {} })
      .add(function () {
        var target = $('#header-logo');
        var exit = gsap.timeline({
          onComplete: function () {
            root.classList.remove('is-loading');
            lockScroll(false);
            el.remove();
            ScrollTrigger.refresh();
          }
        });
        exit.to($$('.preloader__tag, .preloader__count, .preloader__meta, .preloader__skip', el), { opacity: 0, duration: 0.3, ease: 'power2.in' });
        if (target && mark) {
          var a = mark.getBoundingClientRect();
          var b = target.getBoundingClientRect();
          exit.to(mark, {
            x: b.left + b.width / 2 - (a.left + a.width / 2),
            y: b.top + b.height / 2 - (a.top + a.height / 2),
            scale: b.width / a.width,
            duration: 0.95,
            ease: 'haus'
          }, '<0.05');
        }
        exit.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'haus' }, '<0.05')
          .add(markReady, '<0.3');
      }, '+=0.15');
    // Impatient? A tap, click, key or scroll skips straight to the exit.
    var skip = function () {
      if (tl.progress() < 0.9) {
        pens.forEach(function (p) { p.classList.add('is-drawing'); });
        tl.progress(0.999);
      }
      ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.removeEventListener(ev, skip); });
    };
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, skip, { passive: true }); });
    return true;
  }

  /* ------------------------------------------------------------------ *
   * Linen curtains between pages
   * ------------------------------------------------------------------ */
  var curtain = $('.curtain');
  var curtainL = curtain && $('.curtain__panel--l', curtain);
  var curtainR = curtain && $('.curtain__panel--r', curtain);
  var curtainMark = curtain && $('.curtain__mark', curtain);
  var curtainPens = curtain ? $$('.wordmark__pen path', curtain) : [];
  var curtainsOn = cfg.curtains !== false && !reduce && !design;

  function openCurtains(cb) {
    if (!curtain) return cb && cb();
    var tl = gsap.timeline({
      onComplete: function () {
        curtain.style.visibility = 'hidden';
        root.classList.remove('is-arriving');
        if (cb) cb();
      }
    });
    tl.to(curtainMark, { opacity: 0, y: -12, duration: 0.35, ease: 'power2.in' })
      .fromTo(curtainL, { xPercent: 0 }, { xPercent: -101, duration: 1.15, ease: 'haus' }, '<0.15')
      .fromTo(curtainR, { xPercent: 0 }, { xPercent: 101, duration: 1.15, ease: 'haus' }, '<')
      .to($$('.curtain__fold', curtain), { scaleX: 0.55, duration: 1.15, ease: 'haus' }, '<');
  }

  function closeCurtains(href) {
    if (!curtain || !curtainsOn) { location.href = href; return; }
    try { sessionStorage.setItem('innhaus-curtain', '1'); } catch (e) {}
    curtain.style.visibility = 'visible';
    gsap.set(curtainMark, { opacity: 1, y: 0 });
    penReset(curtainPens);
    gsap.timeline({ onComplete: function () { location.href = href; } })
      .fromTo(curtainL, { xPercent: -101 }, { xPercent: 0, duration: 0.9, ease: 'haus' })
      .fromTo(curtainR, { xPercent: 101 }, { xPercent: 0, duration: 0.9, ease: 'haus' }, '<')
      .fromTo($$('.curtain__fold', curtain), { scaleX: 0.55 }, { scaleX: 1, duration: 0.9, ease: 'haus' }, '<')
      .to(curtainPens, { drawSVG: '100%', duration: 0.8, stagger: { each: 0.4, onStart: penStart }, ease: 'power1.inOut' }, '-=0.35');
    // Coming back with the browser's back button restores this page from cache: reopen.
    window.addEventListener('pageshow', function (e) { if (e.persisted) openCurtains(); }, { once: true });
  }

  if (curtain) {
    if (root.classList.contains('is-arriving')) {
      curtain.style.visibility = 'visible';
      gsap.set(curtainL, { xPercent: 0 });
      gsap.set(curtainR, { xPercent: 0 });
    } else {
      gsap.set(curtainL, { xPercent: -101 });
      gsap.set(curtainR, { xPercent: 101 });
    }
  }

  document.addEventListener('click', function (e) {
    if (!curtainsOn || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-no-curtain') || a.hasAttribute('data-pouch-open')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (/^\/(checkout|account|cart\/|apps\/|services\/)/.test(url.pathname)) return;
    e.preventDefault();
    closeCurtains(url.href);
  });

  /* ------------------------------------------------------------------ *
   * Cursor
   * ------------------------------------------------------------------ */
  (function cursor() {
    var el = $('.cursor');
    if (!el || touch) { if (el) el.remove(); return; }
    root.classList.add('has-cursor');
    var btn = $('.cursor__btn', el);
    var label = $('.cursor__label', el);
    var xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
    var yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
    var lastX = 0, shown = false;
    window.addEventListener('pointermove', function (e) {
      if (!shown) { gsap.set(el, { x: e.clientX, y: e.clientY }); gsap.to(el, { opacity: 1, duration: 0.3 }); shown = true; }
      xTo(e.clientX); yTo(e.clientY);
      var v = e.clientX - lastX; lastX = e.clientX;
      gsap.to(btn, { rotation: '+=' + v * 0.6, duration: 0.6, overwrite: 'auto' });
    }, { passive: true });
    window.addEventListener('pointerover', function (e) {
      var t = e.target.closest('a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]');
      var mode = t && t.getAttribute('data-cursor');
      el.classList.toggle('is-link', !!t && !mode);
      el.classList.toggle('is-label', !!mode);
      label.textContent = mode || '';
    }, { passive: true });
    window.addEventListener('pointerdown', function () { el.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { el.classList.remove('is-down'); });
    root.addEventListener('pointerleave', function () { gsap.to(el, { opacity: 0, duration: 0.3 }); });
    root.addEventListener('pointerenter', function () { gsap.to(el, { opacity: 1, duration: 0.3 }); });
  })();

  /* ------------------------------------------------------------------ *
   * Lights (night mode) + the pull cord
   * ------------------------------------------------------------------ */
  function setLightsText() {
    var night = root.dataset.theme === 'night';
    $$('[data-lights-text]').forEach(function (t) { t.textContent = night ? 'Lights on' : 'Lights off'; });
    $$('.bulb').forEach(function (b) { b.classList.toggle('is-off', night); });
  }
  function toggleLights() {
    var next = root.dataset.theme === 'night' ? 'day' : 'night';
    root.classList.add('theme-shift');
    root.dataset.theme = next;
    try { localStorage.setItem('innhaus-theme', next); } catch (e) {}
    setLightsText();
    setTimeout(function () { root.classList.remove('theme-shift'); }, 900);
  }
  setLightsText();
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-lights]')) { e.preventDefault(); toggleLights(); }
  });

  (function lampCord() {
    var wrap = $('.lampcord');
    if (!wrap || touch) return;
    var h = $('.lampcord__tag', wrap);
    var line = $('line', wrap);
    var sync = function () {
      line.setAttribute('y2', 120 + Number(gsap.getProperty(h, 'y')));
      line.setAttribute('x2', 20 + Number(gsap.getProperty(h, 'x')));
    };
    var swing = function () { gsap.fromTo(h, { x: gsap.utils.random(-14, 14) }, { x: 0, duration: 2.2, ease: 'elastic.out(1, 0.2)', onUpdate: sync }); };
    Draggable.create(h, {
      type: 'x,y',
      bounds: { minX: -40, maxX: 40, minY: -10, maxY: 110 },
      edgeResistance: 0.75,
      onDrag: sync,
      onRelease: function () {
        var pulled = this.y > 55;
        gsap.to(h, { x: 0, y: 0, duration: 1.4, ease: 'elastic.out(1.1, 0.25)', onUpdate: sync });
        if (pulled) toggleLights();
      },
      onClick: function () {
        gsap.timeline({ onUpdate: sync })
          .to(h, { y: 70, duration: 0.18, ease: 'power2.in' })
          .add(toggleLights)
          .to(h, { y: 0, duration: 1.3, ease: 'elastic.out(1.1, 0.25)' });
      }
    });
    swing();
    setInterval(swing, 9000);
  })();

  /* ------------------------------------------------------------------ *
   * Header: hide on the way down, tone from the section underneath, menu
   * ------------------------------------------------------------------ */
  (function header() {
    var el = $('[data-header]');
    if (!el) return;
    var last = scrollY;
    var menuOpen = false;
    var onScroll = function () {
      var y = scrollY;
      el.classList.toggle('is-scrolled', y > 30);
      if (!menuOpen) {
        if (y > 240 && y > last + 2) el.classList.add('is-hidden');
        else if (y < last - 2) el.classList.remove('is-hidden');
      }
      last = y;
      var tone = 'dark';
      $$('[data-header-tone]').forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.top <= 46 && r.bottom >= 46) tone = s.getAttribute('data-header-tone');
      });
      el.classList.toggle('is-light', tone === 'light' || menuOpen);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var items = $$('.announce__item', el);
    if (items.length > 1) {
      var idx = 0;
      setInterval(function () {
        items[idx].classList.remove('is-active');
        idx = (idx + 1) % items.length;
        items[idx].classList.add('is-active');
      }, 4200);
    }

    var menu = $('[data-menu]');
    var toggle = $('[data-menu-toggle]', el);
    if (!menu || !toggle) return;
    gsap.set(menu, { visibility: 'hidden' });
    var setMenu = function (open) {
      menuOpen = open;
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
      $('em', toggle).textContent = open ? 'Close' : 'Menu';
      menu.setAttribute('aria-hidden', !open);
      el.classList.toggle('is-light', open);
      el.classList.remove('is-hidden');
      lockScroll(open);
      if (open) {
        gsap.timeline()
          .set(menu, { visibility: 'visible' })
          .fromTo(menu, { clipPath: 'circle(0% at 50% 0%)' }, { clipPath: 'circle(150% at 50% 0%)', duration: 1.1, ease: 'haus' })
          .fromTo($$('.menu__link', menu), { yPercent: 110, rotation: 4 }, { yPercent: 0, rotation: 0, stagger: 0.06, duration: 0.9 }, '<0.25')
          .fromTo($$('.menu__foot > *', menu), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.05 }, '<0.3');
      } else {
        gsap.to(menu, { clipPath: 'circle(0% at 50% 0%)', duration: 0.7, ease: 'power3.inOut', onComplete: function () { gsap.set(menu, { visibility: 'hidden' }); } });
        onScroll();
      }
    };
    toggle.addEventListener('click', function () { setMenu(!menuOpen); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  })();

  /* ------------------------------------------------------------------ *
   * The pouch (cart drawer)
   * ------------------------------------------------------------------ */
  var Pouch = (function () {
    var el = $('[data-pouch]');
    if (!el) return { add: function () {}, open: function () {} };
    var panel = $('.pouch__panel', el);
    var lines = $('[data-pouch-lines]', el);
    var isOpen = false;
    gsap.set(panel, { xPercent: 105 });
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

    function render(cart) {
      $$('[data-cart-count]').forEach(function (c) { c.textContent = cart.item_count; });
      $('[data-pouch-title]', el).textContent = cart.item_count === 0 ? 'still empty' : cart.item_count + ' soft thing' + (cart.item_count === 1 ? '' : 's');
      $('[data-pouch-subtotal]', el).textContent = money(cart.total_price);
      var co = $('[data-pouch-checkout]', el);
      if (co) co.disabled = cart.item_count === 0;
      var thread = $('[data-pouch-thread]', el);
      var threadText = $('[data-pouch-thread-text]', el);
      if (thread && cfg.freeShipping > 0) {
        var remaining = Math.max(0, cfg.freeShipping - cart.total_price);
        thread.style.transform = 'scaleX(' + Math.min(1, cart.total_price / cfg.freeShipping) + ')';
        threadText.textContent = remaining ? 'You’re ' + money(remaining) + ' away from complimentary delivery' : 'Complimentary delivery — it’s on us';
      }
      if (!cart.items.length) {
        lines.innerHTML = '<div class="pouch__empty"><p>Nothing folded in here yet.</p><a href="' + esc((cfg.routes && cfg.routes.root || '/') + 'collections/all') + '" class="btn btn--cream"><span>Find something soft</span></a></div>';
        return;
      }
      lines.innerHTML = cart.items.map(function (it) {
        var img = it.image ? it.image.replace(/(\.[a-z]+)(\?|$)/i, '_300x$1$2') : '';
        var variant = it.variant_title && it.variant_title !== 'Default Title' ? it.variant_title : '';
        return '<article class="pouch__line">' +
          '<a href="' + esc(it.url) + '" class="pouch__thumb"><img src="' + esc(img) + '" alt=""></a>' +
          '<div class="pouch__info"><h3>' + esc(it.product_title) + '</h3>' +
          '<p>' + esc(variant) + '</p>' +
          '<div class="qty"><button type="button" data-qty="' + (it.quantity - 1) + '" data-key="' + esc(it.key) + '" aria-label="Remove one">−</button>' +
          '<span>' + it.quantity + '</span>' +
          '<button type="button" data-qty="' + (it.quantity + 1) + '" data-key="' + esc(it.key) + '" aria-label="Add one">+</button></div></div>' +
          '<div class="pouch__price"><span>' + esc(money(it.final_line_price)) + '</span>' +
          '<button type="button" class="ulink" data-qty="0" data-key="' + esc(it.key) + '">Remove</button></div>' +
          '</article>';
      }).join('');
    }

    function fetchCart() {
      return fetch(cfg.routes.cartJs, { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); });
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      el.setAttribute('aria-hidden', 'false');
      lockScroll(true);
      gsap.timeline()
        .set(el, { visibility: 'visible' })
        .to($('.pouch__veil', el), { opacity: 1, duration: 0.6 })
        .fromTo(panel, { xPercent: 105, rotation: 3 }, { xPercent: 0, rotation: 0, duration: 1, ease: 'haus' }, '<')
        .fromTo($$('.pouch__ribbon path', el), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.1, stagger: 0.1, ease: 'power2.out' }, '<0.4')
        .fromTo($$('.pouch__line, .pouch__empty', el), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.7 }, '<0.1');
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      el.setAttribute('aria-hidden', 'true');
      lockScroll(false);
      gsap.timeline({ onComplete: function () { gsap.set(el, { visibility: 'hidden' }); } })
        .to(panel, { xPercent: 105, duration: 0.7, ease: 'power3.in' })
        .to($('.pouch__veil', el), { opacity: 0, duration: 0.5 }, '<0.2');
    }

    function bump() {
      var p = $('#pouch-target');
      if (!p) return;
      gsap.timeline()
        .to(p, { scale: 1.25, rotation: -8, duration: 0.18, ease: 'power2.out' })
        .to(p, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1.2, 0.35)' })
        .fromTo($('.pouch-bow', p), { scale: 0.2, transformOrigin: '50% 80%' }, { scale: 1, duration: 0.8, ease: 'elastic.out(1.4,0.4)' }, 0.1);
      $$('[data-cart-count]').forEach(function (c) { gsap.fromTo(c, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' }); });
    }

    function fly(from, image) {
      return new Promise(function (resolve) {
        var target = $('#pouch-target');
        if (!from || !target || reduce) return resolve();
        var a = from.getBoundingClientRect();
        var b = target.getBoundingClientRect();
        var ghost = document.createElement('div');
        ghost.className = 'fly-ghost';
        ghost.style.backgroundImage = 'url(' + image + ')';
        ghost.style.left = a.left + 'px';
        ghost.style.top = a.top + 'px';
        ghost.style.width = a.width + 'px';
        ghost.style.height = a.height + 'px';
        document.body.appendChild(ghost);
        gsap.timeline({ onComplete: function () { ghost.remove(); resolve(); } })
          .to(ghost, { scale: 0.92, borderRadius: '50% 50% 46% 54%', duration: 0.25, ease: 'power2.out' })
          .to(ghost, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: 0.9, ease: 'power1.inOut' }, '<0.1')
          .to(ghost, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: 0.9, ease: 'back.in(1.4)' }, '<')
          .to(ghost, { scale: 26 / Math.max(a.width, a.height), rotation: 200, duration: 0.9, ease: 'power3.in' }, '<')
          .to(ghost, { opacity: 0, duration: 0.15 }, '>-0.1');
      });
    }

    function add(variantId, from, image) {
      // Bring the header back so the piece has somewhere visible to land.
      var hdr = $('[data-header]');
      if (hdr) hdr.classList.remove('is-hidden');
      var request = fetch(cfg.routes.cartAdd, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(variantId), quantity: 1 }] })
      }).then(function (r) {
        return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Could not add'); return j; });
      });
      return Promise.all([request, fly(from, image)])
        .then(fetchCart)
        .then(function (cart) {
          render(cart);
          bump();
          if (touch) setTimeout(open, 650);
          return cart;
        });
    }

    function change(key, qty) {
      return fetch(cfg.routes.cartChange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      }).then(function (r) { return r.json(); }).then(render);
    }

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-pouch-open]');
      if (opener) { e.preventDefault(); open(); return; }
      if (e.target.closest('[data-pouch-close]')) { e.preventDefault(); close(); return; }
      var q = e.target.closest('[data-qty][data-key]');
      if (q && el.contains(q)) { e.preventDefault(); change(q.getAttribute('data-key'), Number(q.getAttribute('data-qty'))); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    fetchCart().then(render).catch(function () {});

    return { add: add, open: open, close: close };
  })();

  // Quick add from any product card
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-quick-add]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    var frame = b.closest('.pcard__frame');
    var img = frame && $('img', frame);
    b.classList.add('is-busy');
    Pouch.add(b.getAttribute('data-quick-add'), frame, img ? img.currentSrc || img.src : '')
      .catch(function (err) { alert(err.message); })
      .then(function () { b.classList.remove('is-busy'); });
  }, true);

  /* ------------------------------------------------------------------ *
   * Section choreography
   * ------------------------------------------------------------------ */
  var sections = {};

  sections.hero = function (el) {
    var stage = $('.hero__stage', el);
    var media = $('.hero__media', el);
    var video = $('video', el);
    var svg = $('.hero__outline', el);
    var frame = $('.hero__frame', el);
    var mullion = $('.hero__mullion', el);
    var sill = $('.hero__sill', el);
    var wordsL = $('.hero__word--l', el);
    var wordsR = $('.hero__word--r', el);
    var cap = $('.hero__caption', el);
    var sheers = $$('.hero__sheer', el);
    var w = 0, h = 0, geo = null;
    var state = { p: 0 };

    var measure = function () {
      w = stage.clientWidth; h = stage.clientHeight;
      var mobile = w < 760;
      var ww = mobile ? w * 0.62 : clamp(300, 470, w * 0.29);
      var wh = mobile ? h * 0.5 : clamp(380, 640, h * 0.64);
      var cx = w / 2;
      var bottom = h * (mobile ? 0.86 : 0.88);
      var top = bottom - wh;
      geo = { L: cx - ww / 2, R: cx + ww / 2, T: top, B: bottom, r: ww / 2, cx: cx, ww: ww };
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      var g = geo;
      frame.setAttribute('d', 'M' + g.L + ' ' + g.B + ' V' + (g.T + g.r) + ' A' + g.r + ' ' + g.r + ' 0 0 1 ' + g.R + ' ' + (g.T + g.r) + ' V' + g.B + ' Z');
      mullion.setAttribute('d', 'M' + g.cx + ' ' + g.T + ' V' + g.B + ' M' + g.L + ' ' + (g.T + g.r) + ' H' + g.R + ' M' + g.L + ' ' + (g.T + g.r + (g.B - g.T - g.r) * 0.5) + ' H' + g.R);
      sill.setAttribute('d', 'M' + (g.L - 26) + ' ' + (g.B + 6) + ' H' + (g.R + 26));
      paint();
    };
    var paint = function () {
      if (!geo) return;
      var k = 1 - state.p;
      media.style.clipPath = 'inset(' + (geo.T * k).toFixed(1) + 'px ' + ((w - geo.R) * k).toFixed(1) + 'px ' + ((h - geo.B) * k).toFixed(1) + 'px ' + (geo.L * k).toFixed(1) + 'px round ' + (geo.r * k).toFixed(1) + 'px ' + (geo.r * k).toFixed(1) + 'px 0px 0px)';
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    // The sheer panels sit on the window's edges, then part as you step in.
    var placeSheers = function () {
      if (!geo) return;
      sheers.forEach(function (s, i) {
        gsap.set(s, { width: geo.ww * 0.26, left: i === 0 ? geo.L : 'auto', right: i === 1 ? w - geo.R : 'auto' });
      });
    };
    placeSheers();
    ScrollTrigger.addEventListener('refresh', placeSheers);

    var splitL = SplitText.create(wordsL, { type: 'chars', mask: 'chars' });
    var splitR = SplitText.create(wordsR, { type: 'chars', mask: 'chars' });
    var splitC = SplitText.create(cap, { type: 'words', mask: 'words' });
    var narrow = w < 760;
    var paths = [frame, mullion, sill];

    gsap.set($$('.hero__meta > *, .hero__cue', el), { opacity: 0, y: 12 });
    gsap.set(splitL.chars.concat(splitR.chars), { yPercent: 115 });
    gsap.set(splitC.words, { yPercent: 115 });
    gsap.set(paths, { drawSVG: '0%' });
    gsap.set(media, { opacity: 0 });
    gsap.set(sheers, { scaleX: 0.2, opacity: 0 });
    if (video) gsap.set(video, narrow ? { scale: 1.3, yPercent: 6 } : { scale: 1.45, xPercent: -22, yPercent: 8 });

    var intro = gsap.timeline({ paused: true });
    intro.to(frame, { drawSVG: '100%', duration: 2.1, ease: 'power2.inOut' })
      .to([mullion, sill], { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut', stagger: 0.2 }, 0.6)
      .to(media, { opacity: 1, duration: 1.2, ease: 'power1.out' }, 0.9)
      .to(video, { scale: narrow ? 1.15 : 1.25, duration: 2.6, ease: 'silk' }, 0.9)
      .to(sheers, { scaleX: 1, opacity: 1, duration: 1.6, ease: 'silk', stagger: 0.1 }, 1)
      .to(mullion, { opacity: 0, duration: 1.2 }, 2.2)
      .to(splitL.chars, { yPercent: 0, stagger: 0.035, duration: 1.1 }, 0.7)
      .to(splitR.chars, { yPercent: 0, stagger: 0.035, duration: 1.1 }, 0.85)
      .to($$('.hero__meta > *, .hero__cue', el), { opacity: 1, y: 0, stagger: 0.08, duration: 0.9 }, 1.3);

    onReady(function () {
      reduce ? intro.progress(1) : intro.play();
      if (video) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: el, start: 'top top', end: '+=160%', pin: stage, scrub: 0.9,
        onUpdate: function (self) { el.setAttribute('data-header-tone', self.progress > 0.42 ? 'light' : 'dark'); }
      }
    });
    tl.to(state, { p: 1, duration: 1, ease: 'power2.inOut', onUpdate: paint }, 0)
      .to(video, { scale: 1, xPercent: 0, yPercent: 0, duration: 1, ease: 'power2.inOut' }, 0)
      .to(sheers[0], { xPercent: -140, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
      .to(sheers[1], { xPercent: 140, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
      .to(svg, { opacity: 0, duration: 0.35 }, 0)
      .to(wordsL, { xPercent: -60, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
      .to(wordsR, { xPercent: 60, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
      .to($$('.hero__meta, .hero__cue', el), { opacity: 0, duration: 0.25 }, 0)
      .to($('.hero__shade', el), { opacity: 1, duration: 0.5 }, 0.6)
      .to(splitC.words, { yPercent: 0, stagger: 0.05, duration: 0.4 }, 0.8)
      .to({}, { duration: 0.35 });

    return function () {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      ScrollTrigger.removeEventListener('refresh', placeSheers);
      splitL.revert(); splitR.revert(); splitC.revert();
    };
  };

  sections.manifesto = function (el) {
    var text = $('.manifesto__text', el);
    gsap.fromTo($$('.manifesto__w', el), { opacity: 0.12 }, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 45%', scrub: true } });
    gsap.fromTo($$('.manifesto__pill', el), { width: 0, opacity: 0 }, {
      width: function (i, t) { return t.getAttribute('data-w') + 'em'; }, opacity: 1, ease: 'power2.out', stagger: 0.3,
      scrollTrigger: { trigger: text, start: 'top 75%', end: 'bottom 55%', scrub: true }
    });
    gsap.to($('.manifesto__spin', el), { rotation: 720, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  };

  sections.marquee = function (el) {
    var track = $('.marquee__track', el);
    var loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 38, ease: 'none' });
    var dir = 1;
    var skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
    var settle = gsap.delayedCall(0.25, function () { gsap.to(loop, { timeScale: dir, duration: 1.2, overwrite: true }); skew(0); }).pause();
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { self.isActive ? loop.play() : loop.pause(); },
      onUpdate: function (self) {
        var v = self.getVelocity();
        dir = self.direction;
        gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 280, 6)), duration: 0.3, overwrite: true });
        skew(clamp(-8, 8, v / -180));
        settle.restart(true);
      }
    });
    return function () { loop.kill(); settle.kill(); };
  };

  sections.clothesline = function (el) {
    var track = $('.line__track', el);
    var rope = $('.line__rope path', el);
    var ropeSvg = $('.line__rope', el);
    var cards = $$('.peg-card', el);
    var thread = $('.line__thread span', el);
    var ROPE_Y = 36, pegs = [], velocity = 0, sag = 18;
    var measure = function () {
      pegs = cards.map(function (c) { return c.offsetLeft + c.offsetWidth / 2; });
      ropeSvg.setAttribute('width', track.scrollWidth);
      ropeSvg.setAttribute('viewBox', '0 0 ' + track.scrollWidth + ' 160');
    };
    measure();
    var springs = cards.map(function (_, i) { return { a: 0, v: 0, k: 0.035 + (i % 3) * 0.006, impulse: 0 }; });
    var rot = cards.map(function (c) { return gsap.quickSetter(c, 'rotation', 'deg'); });
    var lift = cards.map(function (c) { return gsap.quickSetter(c, 'y', 'px'); });
    var drawRope = function () {
      var total = track.scrollWidth, prevX = 0, d = 'M 0 ' + (ROPE_Y - 8);
      pegs.forEach(function (x) { d += ' Q ' + (prevX + x) / 2 + ' ' + (ROPE_Y + sag) + ' ' + x + ' ' + ROPE_Y; prevX = x; });
      d += ' Q ' + (prevX + total) / 2 + ' ' + (ROPE_Y + sag) + ' ' + total + ' ' + (ROPE_Y - 8);
      rope.setAttribute('d', d);
    };
    var tick = function () {
      var maxA = innerWidth < 760 ? 7 : 14;
      var target = clamp(-maxA, maxA, -velocity * 0.005);
      sag += (18 + Math.min(Math.abs(velocity) * 0.012, 26) - sag) * 0.08;
      springs.forEach(function (s, i) {
        s.v += (target + s.impulse - s.a) * s.k; s.v *= 0.92; s.a += s.v; s.impulse *= 0.9;
        rot[i](s.a); lift[i](Math.abs(s.a) * 0.25 + (sag - 18) * 0.4);
      });
      velocity *= 0.9;
      drawRope();
    };
    var io = new IntersectionObserver(function (en) {
      en[0].isIntersecting ? gsap.ticker.add(tick) : gsap.ticker.remove(tick);
    }, { rootMargin: '120px' });
    io.observe(el);
    var distance = function () { return track.scrollWidth - innerWidth + 40; };
    gsap.to(track, {
      x: function () { return -distance(); }, ease: 'none',
      scrollTrigger: {
        trigger: el, start: 'top top', end: function () { return '+=' + distance(); }, pin: $('.line__pin', el), scrub: 0.6,
        invalidateOnRefresh: true, onRefresh: measure,
        onUpdate: function (self) { velocity = self.getVelocity(); thread.style.transform = 'scaleX(' + self.progress + ')'; }
      }
    });
    var onMove = function (e) {
      var card = e.target.closest('.peg-card');
      var i = cards.indexOf(card);
      if (i >= 0) springs[i].impulse = clamp(-10, 10, springs[i].impulse + e.movementX * 0.35);
    };
    el.addEventListener('pointermove', onMove);
    return function () { io.disconnect(); gsap.ticker.remove(tick); el.removeEventListener('pointermove', onMove); };
  };

  var TINTS = { burgundy: 'var(--tint-burgundy)', sage: 'var(--tint-sage)', blue: 'var(--tint-blue)' };

  sections.rooms = function (el) {
    var imgs = $$('.rooms__img', el);
    var panels = $$('.room', el);
    var plate = $('.rooms__plate span', el);
    var visual = $('.rooms__visual', el);
    var active = -1;
    var show = function (i) {
      if (i === active) return;
      active = i;
      imgs.forEach(function (img, j) { gsap.to(img, { opacity: j === i ? 1 : 0, scale: j === i ? 1 : 1.12, duration: 1.2 }); });
      gsap.to(el, { backgroundColor: TINTS[panels[i].getAttribute('data-tint')] || TINTS.burgundy, duration: 1.2, ease: 'power2.out' });
      if (plate) { plate.textContent = panels[i].getAttribute('data-number'); gsap.fromTo(plate, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: 'back.out(2)' }); }
      gsap.fromTo(visual, { rotation: i % 2 ? -3 : 3 }, { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.5)' });
    };
    imgs.forEach(function (img, j) { gsap.set(img, { opacity: j === 0 ? 1 : 0 }); });
    if (panels.length) show(0);
    panels.forEach(function (p, i) {
      ScrollTrigger.create({ trigger: p, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive) show(i); } });
      gsap.from($$('.room__chip', p), { y: 50, opacity: 0, rotation: function (k) { return k % 2 ? 6 : -6; }, stagger: 0.1, duration: 1, scrollTrigger: { trigger: p, start: 'top 70%' } });
    });
  };

  sections.fabric = function (el) {
    var host = $('.fabric__canvas', el);
    if (!host || reduce) return;
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl2', { antialias: true });
    if (!gl) return;
    var vs = '#version 300 es\nin vec2 aPos;uniform float uTime,uPress,uAspect;uniform vec2 uMouse;out vec2 vUv;out vec3 vPos;' +
      'void main(){vUv=aPos;vec2 d=aPos-uMouse;d.x*=uAspect;float dist=length(d);' +
      'float ripple=sin(dist*34.0-uTime*6.0)*exp(-dist*6.0)*uPress;' +
      'float wind=sin(aPos.x*5.0+uTime*0.7)*0.010+sin(aPos.y*8.0+uTime*1.05)*0.007;' +
      'float dent=-exp(-dist*dist*55.0)*uPress;float z=ripple*0.045+wind+dent*0.09;' +
      'vec2 p=aPos*2.0-1.0;vPos=vec3(p.x*uAspect,p.y,z);gl_Position=vec4(p,0.0,1.0);}';
    var fs = '#version 300 es\nprecision highp float;uniform sampler2D uTex;uniform vec2 uCover;in vec2 vUv;in vec3 vPos;out vec4 o;' +
      'void main(){vec3 n=normalize(cross(dFdx(vPos),dFdy(vPos)));if(n.z<0.0)n=-n;' +
      'vec2 uv=(vUv-0.5)*uCover+0.5+n.xy*0.012;uv.y=1.0-uv.y;vec4 c=texture(uTex,uv);' +
      'float l=dot(n,normalize(vec3(-0.45,0.55,1.0)));c.rgb*=0.82+0.26*l;c.rgb+=pow(max(l,0.0),18.0)*0.07;o=c;}';
    var compile = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    var v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    var N = touch ? 80 : 140, verts = [], idx = [];
    for (var y = 0; y <= N; y++) for (var x = 0; x <= N; x++) verts.push(x / N, y / N);
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) { var i0 = y * (N + 1) + x; idx.push(i0, i0 + 1, i0 + N + 1, i0 + 1, i0 + N + 2, i0 + N + 1); }
    var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uTime', 'uPress', 'uAspect', 'uMouse', 'uTex', 'uCover'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    var tex = gl.createTexture();
    var imgAspect = 1, ready = false;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        imgAspect = img.width / img.height;
        ready = true;
        host.appendChild(canvas);
        host.classList.add('is-live');
        resize();
      } catch (err) { /* cross-origin image: keep the still photo */ }
    };
    img.src = host.getAttribute('data-texture');
    var resize = function () {
      var dpr = Math.min(devicePixelRatio || 1, touch ? 1.25 : 1.75);
      var w = host.clientWidth, h = host.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      var aspect = w / h;
      gl.uniform1f(U.uAspect, aspect);
      gl.uniform2f(U.uCover, aspect > imgAspect ? 1 : aspect / imgAspect, aspect > imgAspect ? imgAspect / aspect : 1);
    };
    var ro = new ResizeObserver(resize); ro.observe(host);
    var mouse = [0.5, 0.5], target = [0.5, 0.5], press = 0, pressU = 0, down = false, visible = false, t = 0, last = performance.now();
    host.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      press = Math.min(1.4, press + Math.hypot(x - target[0], y - target[1]) * 9);
      target = [x, y];
    });
    host.addEventListener('pointerdown', function () { down = true; });
    window.addEventListener('pointerup', function () { down = false; });
    var io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: '100px' }); io.observe(host);
    var raf = 0;
    var loop = function (now) {
      raf = requestAnimationFrame(loop);
      if (!visible || !ready) return;
      var dt = Math.min((now - last) / 1000, 0.05); last = now; t += dt;
      mouse[0] += (target[0] - mouse[0]) * 0.12; mouse[1] += (target[1] - mouse[1]) * 0.12;
      press += ((down ? 1.2 : 0) - press) * 0.04;
      pressU += (press - pressU) * 0.15;
      gl.uniform1f(U.uTime, t); gl.uniform1f(U.uPress, pressU); gl.uniform2f(U.uMouse, mouse[0], mouse[1]); gl.uniform1i(U.uTex, 0);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    };
    raf = requestAnimationFrame(loop);
    return function () { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); canvas.remove(); };
  };

  sections.polaroids = function (el) {
    var table = $('.polaroids__table', el);
    var cards = $$('.polaroid', el);
    var z = 10;
    gsap.from(cards, {
      y: function () { return -innerHeight * 0.6; }, rotation: function () { return gsap.utils.random(-40, 40); }, opacity: 0, duration: 1.4, ease: 'bounce.out',
      stagger: { each: 0.08, from: 'random' }, scrollTrigger: { trigger: table, start: 'top 75%' }
    });
    var drags = Draggable.create(cards, {
      type: 'x,y', bounds: table, edgeResistance: 0.6, zIndexBoost: false,
      onPress: function () { z += 1; gsap.set(this.target, { zIndex: z }); gsap.to(this.target, { scale: 1.06, boxShadow: '0 40px 60px -20px rgba(43,37,34,.45)', duration: 0.3 }); },
      onDrag: function () { gsap.to(this.target, { rotation: clamp(-18, 18, this.deltaX * 1.4), duration: 0.4 }); },
      onRelease: function () { gsap.to(this.target, { scale: 1, rotation: gsap.utils.random(-9, 9), boxShadow: '0 18px 30px -18px rgba(43,37,34,.35)', duration: 0.8, ease: 'elastic.out(1, 0.6)' }); }
    });
    return function () { drags.forEach(function (d) { d.kill(); }); };
  };

  sections.packaging = function (el) {
    var q = function (s) { return $$(s, el); };
    gsap.set(q('.pk-ribbon'), { drawSVG: '0%' });
    gsap.set(q('.pk-bow'), { drawSVG: '50% 50%' });
    gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: el, start: 'top top', end: '+=170%', pin: $('.pack__pin', el), scrub: 0.8 } })
      .from(q('.pk-pouch'), { y: 140, opacity: 0, duration: 0.6 })
      .from(q('.pk-card'), { y: -420, rotation: -14, duration: 0.9 }, 0.2)
      .to(q('.pk-card'), { y: 150, duration: 0.6, ease: 'power2.in' }, '>')
      .fromTo(q('.pk-flap'), { scaleY: -1 }, { scaleY: 1, duration: 0.5, transformOrigin: '50% 0%' }, '>-0.1')
      .to(q('.pk-ribbon'), { drawSVG: '100%', duration: 0.6, stagger: 0.1 }, '>')
      .to(q('.pk-bow'), { drawSVG: '0% 100%', duration: 0.6, stagger: 0.08 }, '>-0.2')
      .fromTo(q('.pk-knot'), { scale: 0 }, { scale: 1, duration: 0.25, transformOrigin: '50% 50%', ease: 'back.out(3)' }, '<0.3')
      .from(q('.pk-tag'), { y: -260, rotation: 40, duration: 0.7, ease: 'bounce.out' }, '>')
      .to(q('.pk-tag'), { rotation: -8, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '>')
      .from(q('.pack__step'), { opacity: 0.2, stagger: 0.6, duration: 0.3 }, 0.2);
  };

  sections.collection = function (el) {
    var grid = $('[data-grid]', el);
    if (!grid) return;
    var isAll = grid.getAttribute('data-is-all') === 'true';
    var cards = function () { return $$('.pcard', grid); };
    var original = cards();
    var line = $('[data-roomline]', el);
    // Cards fold away, the grid rearranges, and the new set rises in one by one.
    var flipIt = function (fn) {
      gsap.to(cards().filter(function (c) { return !c.hidden; }), {
        opacity: 0, y: 24, scale: 0.96, duration: 0.3, stagger: 0.02, ease: 'power2.in',
        onComplete: function () {
          fn();
          gsap.fromTo(cards().filter(function (c) { return !c.hidden; }), { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.05, ease: 'silk', clearProps: 'transform' });
          ScrollTrigger.refresh();
        }
      });
    };
    if (isAll) {
      $$('[data-room-chip]', el).forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var room = chip.getAttribute('data-room-chip');
          $$('[data-room-chip]', el).forEach(function (c) { c.classList.toggle('is-on', c === chip); });
          flipIt(function () { cards().forEach(function (c) { c.hidden = room !== 'all' && c.getAttribute('data-room') !== room; }); });
          history.replaceState(null, '', chip.href);
          if (line) { line.textContent = chip.getAttribute('data-line') || line.getAttribute('data-default') || line.textContent; }
        }, true);
      });
    }
    var sort = $('[data-sort]', el);
    if (sort) sort.addEventListener('change', function () {
      var list = original.slice();
      if (sort.value === 'low') list.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
      if (sort.value === 'high') list.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
      flipIt(function () { list.forEach(function (c) { grid.appendChild(c); }); });
    });
  };

  sections.product = function (el) {
    var form = $('[data-product-form]', el);
    var input = $('[data-variant-input]', el);
    var add = $('[data-add]', el);
    var label = $('[data-add-label]', el);
    var prices = $$('[data-price]', el);
    var tags = $$('.sizetag', el);
    var needsSize = add && add.getAttribute('data-needs-size') === 'yes';
    var info = {};
    try { info = JSON.parse($('[data-product-json]', el).textContent); } catch (e) {}
    var chosen = needsSize ? null : { id: input && input.value, available: !(add && add.disabled), price: prices[0] && prices[0].textContent };

    var setLabel = function () {
      if (!label) return;
      if (!chosen) label.textContent = 'Choose your size';
      else if (!chosen.available) label.textContent = 'Sold out';
      else label.textContent = 'Add to pouch — ' + chosen.price;
      if (add) add.disabled = !!(chosen && !chosen.available);
    };
    tags.forEach(function (t) {
      t.addEventListener('click', function () {
        tags.forEach(function (o) { o.classList.toggle('is-on', o === t); o.setAttribute('aria-checked', o === t); });
        chosen = { id: t.getAttribute('data-variant'), available: t.getAttribute('data-available') === 'true', price: t.getAttribute('data-variant-price') };
        input.value = chosen.id;
        prices.forEach(function (p) { p.textContent = chosen.price; });
        setLabel();
      });
    });
    if (needsSize) setLabel();

    var shakeSizes = function () { gsap.fromTo($('.pv__sizes', el), { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1.4, 0.2)' }); };
    var submit = function () {
      if (!chosen) return shakeSizes();
      if (!chosen.available) return;
      var src = $('[data-fly-source]', el);
      add.classList.add('is-busy');
      Pouch.add(chosen.id, src, info.image).then(function () {
        add.classList.add('is-added');
        label.textContent = 'Folded into your pouch ✓';
        setTimeout(function () { add.classList.remove('is-added'); setLabel(); }, 2400);
      }).catch(function (err) { label.textContent = err.message; })
        .then(function () { add.classList.remove('is-busy'); });
    };
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    var mobileAdd = $('[data-mobile-add]', el);
    if (mobileAdd) mobileAdd.addEventListener('click', function () {
      if (!chosen) { var s = $('.pv__sizes', el); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'center' }); shakeSizes(); return; }
      submit();
    });

    $$('.acc', el).forEach(function (acc) {
      var head = $('.acc__head', acc), body = $('.acc__body', acc);
      head.addEventListener('click', function () {
        var open = acc.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open);
        open ? gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: 0.7, ease: 'haus' }) : gsap.to(body, { height: 0, duration: 0.6, ease: 'haus' });
      });
    });

    gsap.from($$('.pv__panel > *', el), { y: 30, opacity: 0, stagger: 0.07, duration: 1, delay: 0.3 });
    $$('.pv__shot img', el).forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8, scale: 1.12 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    var tag = $('.pv__hangtag', el);
    if (tag) {
      var rot = gsap.quickTo(tag, 'rotation', { duration: 1.2, ease: 'elastic.out(1, 0.3)' });
      var mv = function (e) { rot(clamp(-14, 14, e.movementX * 0.8)); };
      addEventListener('pointermove', mv);
      return function () { removeEventListener('pointermove', mv); };
    }
  };

  sections.palette = function (el) {
    var btns = $$('.palette__btn', el);
    var st = { trigger: el, start: 'top 70%' };
    gsap.from(btns, { y: 120, opacity: 0, stagger: 0.1, duration: 1.4, ease: 'back.out(1.6)', scrollTrigger: st });
    gsap.from($$('.palette__btn svg', el), { rotation: -280, stagger: 0.1, duration: 1.8, ease: 'back.out(1.2)', scrollTrigger: st });
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (o) { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', o === b); });
        gsap.fromTo($('svg', b), { rotation: 0 }, { rotation: 360, duration: 1.2, ease: 'back.out(1.4)' });
        gsap.to(el, { backgroundColor: b.dataset.color, color: b.dataset.ink, duration: 0.9, ease: 'power2.out' });
        $('[data-palette-name]', el).textContent = b.dataset.name;
        $('[data-palette-note]', el).textContent = b.dataset.note;
        el.setAttribute('data-header-tone', b.dataset.ink.toLowerCase() === '#f3f0e9' ? 'light' : 'dark');
      });
    });
  };

  sections.footer = function (el) {
    var pens = $$('.footer__giant .wordmark__pen path', el);
    penReset(pens);
    gsap.timeline({ scrollTrigger: { trigger: $('.footer__giant', el), start: 'top 85%' } })
      .to(pens, { drawSVG: '100%', duration: 1.6, stagger: { each: 1.2, onStart: penStart }, ease: 'power1.inOut' });
    var bow = $$('.footer__ribbon path', el);
    if (bow.length) {
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%' } })
        .fromTo(bow, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.4, stagger: 0.12, ease: 'power2.out' })
        .from($('.footer__tag', el), { y: -120, rotation: 30, opacity: 0, duration: 1.4, ease: 'bounce.out' }, '-=0.6');
      gsap.to($('.footer__tag', el), { rotation: 4, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    ScrollTrigger.create({ trigger: el, start: 'top bottom', onEnter: function () { gsap.to($$('.footer__btn', el), { rotation: 360, duration: 2, stagger: 0.1 }); } });
  };

  sections.intro = function (el) {
    var pens = $$('.wordmark__pen path', el);
    if (!pens.length) return;
    penReset(pens);
    onReady(function () { gsap.to(pens, { drawSVG: '100%', duration: 1.4, delay: 0.3, stagger: { each: 1, onStart: penStart }, ease: 'power1.inOut' }); });
  };

  /* ------------------------------------------------------------------ *
   * Declarative effects for any section:
   *   data-reveal  data-split="lines|chars|words"  data-parallax  data-img-reveal
   * ------------------------------------------------------------------ */
  function scrollFX(scope) {
    var splits = [];
    $$('[data-reveal]', scope).forEach(function (el) {
      gsap.from(el, { y: 40, opacity: 0, duration: 1.2, delay: Number(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-split]', scope).forEach(function (el) {
      var type = el.dataset.split || 'lines';
      var split = SplitText.create(el, { type: type === 'lines' ? 'lines' : 'lines,' + type, mask: 'lines', linesClass: 'split-line' });
      splits.push(split);
      var targets = type === 'lines' ? split.lines : type === 'chars' ? split.chars : split.words;
      gsap.from(targets, { yPercent: 110, rotation: type === 'chars' ? 8 : 2, duration: type === 'chars' ? 1 : 1.25, stagger: type === 'chars' ? 0.025 : 0.08, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    $$('[data-parallax]', scope).forEach(function (el) {
      var amt = Number(el.dataset.parallax || 0.15);
      gsap.fromTo(el, { yPercent: -amt * 50 }, { yPercent: amt * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-img-reveal]', scope).forEach(function (el) {
      gsap.fromTo(el, { clipPath: 'inset(18% 12% 18% 12% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.6, ease: 'haus', scrollTrigger: { trigger: el, start: 'top 85%' } });
      var img = $('img', el);
      if (img) gsap.from(img, { scale: 1.3, duration: 2, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    return splits;
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  var live = new Map();
  function initSection(host) {
    var ctxs = [];
    var types = $$('[data-section-type]', host);
    if (host.matches && host.matches('[data-section-type]')) types.unshift(host);
    var ctx = gsap.context(function () {
      types.forEach(function (el) {
        var fn = sections[el.getAttribute('data-section-type')];
        if (!fn) return;
        try { var undo = fn(el); if (typeof undo === 'function') ctxs.push(undo); }
        catch (err) { console.warn('[inn haus] section failed', el.getAttribute('data-section-type'), err); }
      });
      if ($('.haus-hero', host)) sections.intro($('.haus-hero', host));
      if ($('.lost', host)) sections.intro($('.lost', host));
      var splits = reduce ? [] : scrollFX(host);
      ctxs.push(function () { splits.forEach(function (s) { s.revert(); }); });
    });
    live.set(host, function () { ctxs.forEach(function (f) { f(); }); ctx.revert(); });
  }

  function boot() {
    var hadIntro = false;
    try { hadIntro = runPreloader(); } catch (err) { console.warn('[inn haus] intro failed', err); }
    if (!hadIntro) { root.classList.remove('is-loading'); lockScroll(false); }
    if (root.classList.contains('is-arriving')) {
      curtainPens.forEach(function (p) { p.classList.add('is-drawing'); });
      openCurtains(markReady);
    } else if (!hadIntro) {
      markReady();
    }
    $$('.shopify-section, main > section').forEach(function (s) {
      if (!s.closest('.shopify-section') || s.classList.contains('shopify-section')) initSection(s);
    });
    requestAnimationFrame(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  // Theme editor: re-run a section's choreography when it is edited.
  document.addEventListener('shopify:section:unload', function (e) { var undo = live.get(e.target); if (undo) { undo(); live.delete(e.target); } });
  document.addEventListener('shopify:section:load', function (e) { initSection(e.target); ScrollTrigger.refresh(); });

  if (document.fonts && document.fonts.ready) {
    var started = false;
    var go = function () { if (!started) { started = true; boot(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1200);
  } else {
    boot();
  }
})();
