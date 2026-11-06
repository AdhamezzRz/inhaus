/*!
 * INN HAUS — Wear it. Live in it.
 * Lightweight theme behaviour: no libraries, no animation loops.
 * One scroll moment (the arched window), gentle reveals, the cart pouch,
 * the menu, night mode, the shop filter and the product form.
 */
(function () {
  'use strict';

  var cfg = window.InnHaus || {};
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none), (pointer: coarse)').matches;

  /* Intro: the CSS plays it; we only tidy up (or skip it on a tap). */
  if (root.classList.contains('is-loading')) {
    var done = function () { root.classList.remove('is-loading'); };
    setTimeout(done, 2300);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      addEventListener(ev, done, { once: true, passive: true });
    });
  }

  /* Money in the store's own format */
  function money(cents) {
    var n = (cents || 0) / 100;
    var fmt = function (d, t, s) {
      var p = n.toFixed(d).split('.');
      p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, t);
      return p.join(s);
    };
    return (cfg.moneyFormat || '{{amount}}').replace(/\{\{\s*(\w+)\s*\}\}/, function (_, k) {
      if (k === 'amount_no_decimals') return fmt(0, ',', '.');
      if (k === 'amount_with_comma_separator') return fmt(2, '.', ',');
      if (k === 'amount_no_decimals_with_comma_separator') return fmt(0, '.', ',');
      return fmt(n % 1 === 0 ? 0 : 2, ',', '.');
    }).replace(/<[^>]+>/g, '');
  }

  /* Reveal: fade things up once as they enter */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function watch(scope) {
    $$('[data-reveal], .footer__giant', scope).forEach(function (el) {
      if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay + 's');
      io ? io.observe(el) : el.classList.add('is-in');
    });
  }

  /* One rAF-throttled scroll listener for everything that follows the scroll */
  var onScrollFns = [];
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      onScrollFns.forEach(function (f) { f(); });
    });
  }, { passive: true });

  /* The arched window: geometry once, then a single --p variable on scroll */
  function hero(el) {
    var stage = $('.hero__stage', el);
    var svg = $('.hero__outline', el);
    var video = $('video', el);
    var geo = function () {
      var w = stage.clientWidth, h = stage.clientHeight, mobile = w < 760;
      var ww = mobile ? w * 0.62 : Math.max(300, Math.min(470, w * 0.29));
      var wh = mobile ? h * 0.5 : Math.max(380, Math.min(640, h * 0.64));
      var B = h * (mobile ? 0.86 : 0.88), T = B - wh, L = (w - ww) / 2, R = L + ww, r = ww / 2;
      el.style.setProperty('--wt', T + 'px');
      el.style.setProperty('--wb', (h - B) + 'px');
      el.style.setProperty('--wl', L + 'px');
      el.style.setProperty('--wrt', (w - R) + 'px');
      el.style.setProperty('--wr0', r + 'px');
      el.style.setProperty('--ww', ww + 'px');
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      $('.hero__frame', el).setAttribute('d', 'M' + L + ' ' + B + ' V' + (T + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + R + ' ' + (T + r) + ' V' + B + ' Z');
      $('.hero__sill', el).setAttribute('d', 'M' + (L - 24) + ' ' + (B + 6) + ' H' + (R + 24));
    };
    var tone = 'dark';
    var progress = function () {
      var rect = el.getBoundingClientRect();
      var span = el.offsetHeight - innerHeight;
      var p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      el.style.setProperty('--p', p.toFixed(4));
      var t = p > 0.42 ? 'light' : 'dark';
      if (t !== tone) { tone = t; el.setAttribute('data-header-tone', t); }
    };
    geo();
    progress();
    var w0 = innerWidth;
    addEventListener('resize', function () {
      // Phones resize when the address bar slides; only re-measure on real changes.
      if (Math.abs(innerWidth - w0) > 40 || !touch) { w0 = innerWidth; geo(); }
      progress();
    });
    onScrollFns.push(progress);
    var start = function () {
      el.classList.add('is-ready');
      if (video) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); }
    };
    root.classList.contains('is-loading') ? setTimeout(start, 1700) : requestAnimationFrame(start);
    // Pause the film when it can't be seen
    if (video && io) new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); } else video.pause();
    }).observe(el);
  }

  /* Header: hide on the way down, tone from the section underneath, menu */
  (function header() {
    var el = $('[data-header]');
    if (!el) return;
    var last = scrollY, menuOpen = false;
    var update = function () {
      var y = scrollY;
      el.classList.toggle('is-scrolled', y > 30);
      if (!menuOpen) {
        if (y > 240 && y > last + 4) el.classList.add('is-hidden');
        else if (y < last - 4) el.classList.remove('is-hidden');
      }
      last = y;
      var tone = 'dark';
      $$('[data-header-tone]').forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.top <= 46 && r.bottom >= 46) tone = s.getAttribute('data-header-tone');
      });
      el.classList.toggle('is-light', tone === 'light' || menuOpen);
    };
    onScrollFns.push(update);
    update();

    var items = $$('.announce__item', el);
    if (items.length > 1) {
      var i = 0;
      setInterval(function () {
        items[i].classList.remove('is-active');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active');
      }, 4500);
    }

    var menu = $('[data-menu]'), toggle = $('[data-menu-toggle]', el);
    if (!menu || !toggle) return;
    var setMenu = function (open) {
      menuOpen = open;
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', !open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
      $('em', toggle).textContent = open ? 'Close' : 'Menu';
      el.classList.remove('is-hidden');
      root.style.overflow = open ? 'hidden' : '';
      update();
    };
    toggle.addEventListener('click', function () { setMenu(!menuOpen); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  })();

  /* Night mode */
  function setLightsText() {
    var night = root.dataset.theme === 'night';
    $$('[data-lights-text]').forEach(function (t) { t.textContent = night ? 'Lights on' : 'Lights off'; });
    $$('.bulb').forEach(function (b) { b.classList.toggle('is-off', night); });
  }
  setLightsText();
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-lights]')) return;
    e.preventDefault();
    var next = root.dataset.theme === 'night' ? 'day' : 'night';
    root.classList.add('theme-shift');
    root.dataset.theme = next;
    try { localStorage.setItem('innhaus-theme', next); } catch (err) {}
    setLightsText();
    setTimeout(function () { root.classList.remove('theme-shift'); }, 900);
  });

  /* The pouch (cart drawer) */
  var Pouch = (function () {
    var el = $('[data-pouch]');
    if (!el) return { add: function () { return Promise.resolve(); } };
    var lines = $('[data-pouch-lines]', el);
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var isOpen = false;

    function render(cart) {
      $$('[data-cart-count]').forEach(function (c) { c.textContent = cart.item_count; });
      $('[data-pouch-title]', el).textContent = cart.item_count === 0 ? 'still empty' : cart.item_count + ' soft thing' + (cart.item_count === 1 ? '' : 's');
      $('[data-pouch-subtotal]', el).textContent = money(cart.total_price);
      var co = $('[data-pouch-checkout]', el);
      if (co) co.disabled = cart.item_count === 0;
      var thread = $('[data-pouch-thread]', el), text = $('[data-pouch-thread-text]', el);
      if (thread && cfg.freeShipping > 0) {
        var left = Math.max(0, cfg.freeShipping - cart.total_price);
        thread.style.transform = 'scaleX(' + Math.min(1, cart.total_price / cfg.freeShipping) + ')';
        text.textContent = left ? 'You’re ' + money(left) + ' away from complimentary delivery' : 'Complimentary delivery — it’s on us';
      }
      if (!cart.items.length) {
        lines.innerHTML = '<div class="pouch__empty"><p>Nothing folded in here yet.</p><a href="' + esc(cfg.routes.shopAll) + '" class="btn btn--cream"><span>Find something soft</span></a></div>';
        return;
      }
      lines.innerHTML = cart.items.map(function (it) {
        var img = it.image ? it.image.replace(/(\.[a-z]+)(\?|$)/i, '_300x$1$2') : '';
        var v = it.variant_title && it.variant_title !== 'Default Title' ? it.variant_title : '';
        return '<article class="pouch__line"><a href="' + esc(it.url) + '" class="pouch__thumb"><img src="' + esc(img) + '" alt="" width="78" height="104"></a>' +
          '<div class="pouch__info"><h3>' + esc(it.product_title) + '</h3><p>' + esc(v) + '</p>' +
          '<div class="qty"><button type="button" data-qty="' + (it.quantity - 1) + '" data-key="' + esc(it.key) + '" aria-label="Remove one">−</button><span>' + it.quantity + '</span>' +
          '<button type="button" data-qty="' + (it.quantity + 1) + '" data-key="' + esc(it.key) + '" aria-label="Add one">+</button></div></div>' +
          '<div class="pouch__price"><span>' + esc(money(it.final_line_price)) + '</span><button type="button" class="ulink" data-qty="0" data-key="' + esc(it.key) + '">Remove</button></div></article>';
      }).join('');
    }
    var json = function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Something went wrong'); return j; }); };
    function fetchCart() { return fetch(cfg.routes.cartJs, { headers: { Accept: 'application/json' } }).then(json); }
    function open() {
      isOpen = true;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      root.style.overflow = 'hidden';
    }
    function close() {
      isOpen = false;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      root.style.overflow = '';
    }
    function bump() {
      var p = $('#pouch-target');
      if (p && p.animate && !reduce) p.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22) rotate(-6deg)' }, { transform: 'scale(1)' }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
    /* The piece glides into the pouch: a single native animation, no library */
    function fly(from, image) {
      var target = $('#pouch-target');
      if (!from || !target || reduce || !document.body.animate) return Promise.resolve();
      var a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
      var g = document.createElement('div');
      g.className = 'fly-ghost';
      g.style.cssText = 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px;background-image:url(' + image + ')';
      document.body.appendChild(g);
      var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), s = 24 / Math.max(a.width, a.height);
      var anim = g.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1, borderRadius: '4px' },
        { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 60) + 'px) scale(' + (s + 0.3) + ')', opacity: 1, borderRadius: '50%', offset: 0.55 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', opacity: 0.2, borderRadius: '50%' }
      ], { duration: 850, easing: 'cubic-bezier(.65,0,.15,1)' });
      return new Promise(function (res) { anim.onfinish = function () { g.remove(); res(); }; });
    }
    function add(id, from, image) {
      var hdr = $('[data-header]');
      if (hdr) hdr.classList.remove('is-hidden');
      var req = fetch(cfg.routes.cartAdd, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(id), quantity: 1 }] })
      }).then(json);
      return Promise.all([req, fly(from, image)]).then(fetchCart).then(function (cart) {
        render(cart);
        bump();
        if (touch) setTimeout(open, 350);
        return cart;
      });
    }
    function change(key, qty) {
      return fetch(cfg.routes.cartChange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      }).then(json).then(render);
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-pouch-open]')) { e.preventDefault(); open(); return; }
      if (e.target.closest('[data-pouch-close]')) { e.preventDefault(); close(); return; }
      var q = e.target.closest('[data-qty][data-key]');
      if (q && el.contains(q)) { e.preventDefault(); change(q.dataset.key, Number(q.dataset.qty)); }
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });
    fetchCart().then(render).catch(function () {});
    return { add: add };
  })();

  /* Quick add from product cards */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-quick-add]');
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    var frame = b.closest('.pcard__frame'), img = frame && $('img', frame);
    b.classList.add('is-busy');
    Pouch.add(b.dataset.quickAdd, frame, img ? img.currentSrc || img.src : '')
      .catch(function (err) { alert(err.message); })
      .then(function () { b.classList.remove('is-busy'); });
  }, true);

  /* Product cards: the lifestyle photo opens from where the cursor enters */
  document.addEventListener('pointerover', function (e) {
    var f = e.target.closest && e.target.closest('.pcard__frame');
    if (!f || f.contains(e.relatedTarget)) return;
    var r = f.getBoundingClientRect();
    f.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    f.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });

  /* Shop: room chips filter /collections/all in place, and sorting */
  function collection(el) {
    var grid = $('[data-grid]', el);
    if (!grid) return;
    var cards = function () { return $$('.pcard', grid); };
    var original = cards();
    var line = $('[data-roomline]', el);
    var swap = function (fn) {
      cards().forEach(function (c) { if (!c.hidden) c.classList.add('is-leaving'); });
      setTimeout(function () {
        fn();
        cards().forEach(function (c, i) {
          c.classList.add('is-leaving');
          setTimeout(function () { c.classList.remove('is-leaving'); }, 30 + i * 40);
        });
      }, 300);
    };
    if (grid.dataset.isAll === 'true') {
      $$('[data-room-chip]', el).forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          e.preventDefault();
          var room = chip.dataset.roomChip;
          $$('[data-room-chip]', el).forEach(function (c) { c.classList.toggle('is-on', c === chip); });
          swap(function () { cards().forEach(function (c) { c.hidden = room !== 'all' && c.dataset.room !== room; }); });
          history.replaceState(null, '', chip.href);
          if (line && chip.dataset.line) line.textContent = chip.dataset.line;
        });
      });
    }
    var sort = $('[data-sort]', el);
    if (sort) sort.addEventListener('change', function () {
      var list = original.slice();
      if (sort.value === 'low') list.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
      if (sort.value === 'high') list.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
      swap(function () { list.forEach(function (c) { grid.appendChild(c); }); });
    });
  }

  /* Product: sizes, add to pouch, accordions */
  function product(el) {
    var form = $('[data-product-form]', el), input = $('[data-variant-input]', el);
    var add = $('[data-add]', el), label = $('[data-add-label]', el);
    var prices = $$('[data-price]', el), tags = $$('.sizetag', el);
    var needs = add && add.dataset.needsSize === 'yes';
    var info = {};
    try { info = JSON.parse($('[data-product-json]', el).textContent); } catch (e) {}
    var chosen = needs ? null : { id: input && input.value, available: !(add && add.disabled), price: prices[0] && prices[0].textContent };
    var setLabel = function () {
      if (!label) return;
      label.textContent = !chosen ? 'Choose your size' : !chosen.available ? 'Sold out' : 'Add to pouch — ' + chosen.price;
      if (add) add.disabled = !!(chosen && !chosen.available);
    };
    tags.forEach(function (t) {
      t.addEventListener('click', function () {
        tags.forEach(function (o) { o.classList.toggle('is-on', o === t); o.setAttribute('aria-checked', o === t); });
        chosen = { id: t.dataset.variant, available: t.dataset.available === 'true', price: t.dataset.variantPrice };
        input.value = chosen.id;
        prices.forEach(function (p) { p.textContent = chosen.price; });
        setLabel();
      });
    });
    if (needs) setLabel();
    var nudge = function () {
      var s = $('.pv__sizes', el);
      if (s && s.animate) s.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 380 });
    };
    var submit = function () {
      if (!chosen) return nudge();
      if (!chosen.available) return;
      add.classList.add('is-busy');
      Pouch.add(chosen.id, $('[data-fly-source]', el), info.image).then(function () {
        label.textContent = 'Folded into your pouch ✓';
        setTimeout(setLabel, 2200);
      }).catch(function (err) { label.textContent = err.message; })
        .then(function () { add.classList.remove('is-busy'); });
    };
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    var mobileAdd = $('[data-mobile-add]', el);
    if (mobileAdd) mobileAdd.addEventListener('click', function () {
      if (!chosen) { var s = $('.pv__sizes', el); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'center' }); nudge(); return; }
      submit();
    });
    $$('.acc', el).forEach(function (acc) {
      var head = $('.acc__head', acc);
      head.addEventListener('click', function () { head.setAttribute('aria-expanded', acc.classList.toggle('is-open')); });
    });
  }

  /* The Haus: dye the section with a colour button */
  function palette(el) {
    $$('.palette__btn', el).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.palette__btn', el).forEach(function (o) { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', o === b); });
        el.style.backgroundColor = b.dataset.color;
        el.style.color = b.dataset.ink;
        $('[data-palette-name]', el).textContent = b.dataset.name;
        $('[data-palette-note]', el).textContent = b.dataset.note;
        el.setAttribute('data-header-tone', b.dataset.ink.toLowerCase() === '#f3f0e9' ? 'light' : 'dark');
      });
    });
  }

  var types = { hero: hero, collection: collection, product: product, palette: palette };
  function init(scope) {
    $$('[data-section-type]', scope).forEach(function (el) {
      var fn = types[el.dataset.sectionType];
      if (!fn || el.__ih) return;
      el.__ih = true;
      try { fn(el); } catch (err) { console.warn('[inn haus]', err); }
    });
    watch(scope);
  }
  init(document);
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
})();
