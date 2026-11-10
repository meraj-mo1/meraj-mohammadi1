/* ============================================================
   MERAJ MOHAMMADI — interactions
   Vanilla JS. Single rAF loop, IntersectionObservers,
   full respect for prefers-reduced-motion and touch devices.
   ============================================================ */
(function () {
  'use strict';

  var d = document;
  var root = d.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function $ (sel, ctx) { return (ctx || d).querySelector(sel); }
  function $$ (sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
  function clamp (v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp (a, b, t) { return a + (b - a) * t; }

  /* ---------------------------------------------- theme */
  (function initTheme() {
    var toggle = $('#theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('meraj-theme', next); } catch (e) {}
    });
  })();

  /* ---------------------------------------------- nav state */
  (function initNav() {
    var nav = $('#nav');
    var lastY = -1;
    function onScroll() {
      if (window.scrollY === lastY) return;
      lastY = window.scrollY;
      nav.classList.toggle('is-scrolled', window.scrollY > 32);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* active link */
    var links = {};
    $$('.nav-link').forEach(function (l) { links[l.getAttribute('data-section')] = l; });
    var sections = ['about', 'work', 'experience', 'capabilities', 'contact']
      .map(function (id) { return d.getElementById(id); })
      .filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.id;
          Object.keys(links).forEach(function (k) {
            links[k].classList.toggle('is-active', k === id);
          });
        });
      }, { rootMargin: '-42% 0px -52% 0px' });
      sections.forEach(function (s) { io.observe(s); });
    }

    /* mobile menu */
    var burger = $('#nav-burger');
    var menu = $('#mobile-menu');
    if (burger && menu) {
      function setMenu(open) {
        burger.classList.toggle('is-open', open);
        menu.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', String(!open));
        d.body.style.overflow = open ? 'hidden' : '';
      }
      burger.addEventListener('click', function () {
        setMenu(!menu.classList.contains('is-open'));
      });
      $$('a', menu).forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
      });
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
      });
    }
  })();

  /* ---------------------------------------------- reveals */
  (function initReveals() {
    var items = $$('[data-reveal]');
    if (!items.length) return;
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------- typewriter */
  (function initTypewriter() {
    var el = $('#typeword');
    if (!el) return;
    var phrases = ['engineered.', 'effortless.', 'inevitable.', 'human.'];
    if (reducedMotion.matches) { el.textContent = phrases[0]; return; }
    var pi = 0, ci = phrases[0].length, deleting = false;
    el.textContent = phrases[0];
    function tick() {
      var phrase = phrases[pi];
      var delay;
      if (!deleting) {
        ci++;
        el.textContent = phrase.slice(0, ci);
        if (ci >= phrase.length) {
          deleting = true;
          delay = 2200;
        } else {
          delay = 62 + Math.random() * 70;
        }
      } else {
        ci--;
        el.textContent = phrase.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          delay = 460;
        } else {
          delay = 30;
        }
      }
      window.setTimeout(tick, delay);
    }
    window.setTimeout(tick, 2400);
  })();

  /* ---------------------------------------------- counters */
  (function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function render(el, val) {
      var fmt = el.getAttribute('data-format') || 'int';
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      if (fmt === 'eur') {
        el.textContent = prefix + val.toFixed(2);
      } else {
        el.textContent = prefix + Math.round(val).toLocaleString('en-US') + suffix;
      }
    }
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reducedMotion.matches) { render(el, target); return; }
      var start = null, dur = 1500;
      function frame(ts) {
        if (start === null) start = ts;
        var p = clamp((ts - start) / dur, 0, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        render(el, target * eased);
        if (p < 1) window.requestAnimationFrame(frame);
        else render(el, target);
      }
      window.requestAnimationFrame(frame);
    }
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { animate(el); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animate(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------- pointer state */
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, px: 0, py: 0, has: false };
  window.addEventListener('pointermove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.has = true;
  }, { passive: true });

  /* ---------------------------------------------- cursor trail */
  (function initTrail() {
    var trail = $('#trail');
    if (!trail || !finePointer.matches) return;
    var x = mouse.x, y = mouse.y, o = 0;
    var active = false;
    window.addEventListener('pointermove', function () { active = true; }, { passive: true, once: true });
    function frame() {
      var dx = mouse.x - x;
      var dy = mouse.y - y;
      x = lerp(x, mouse.x, 0.13);
      y = lerp(y, mouse.y, 0.13);
      var vel = Math.sqrt(dx * dx + dy * dy);
      var targetO = active ? clamp(vel / 22, 0, 1) * 0.85 : 0;
      o = lerp(o, targetO, 0.1);
      if (o < 0.005) { o = 0; }
      var s = 1 + clamp(vel / 140, 0, 0.45);
      trail.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + s.toFixed(3) + ')';
      trail.style.opacity = o.toFixed(3);
      window.requestAnimationFrame(frame);
    }
    if (!reducedMotion.matches) window.requestAnimationFrame(frame);
  })();

  /* ---------------------------------------------- scene tilt */
  (function initTilt() {
    var tiltEl = $('#scene-tilt');
    if (!tiltEl || !finePointer.matches || reducedMotion.matches) return;
    var hero = $('.hero');
    var rx = 0, ry = 0, trx = 0, try_ = 0;
    function frame() {
      if (mouse.has) {
        var r = hero ? hero.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        var nx = clamp((mouse.x - (r.left + r.width / 2)) / (r.width / 2), -1.4, 1.4);
        var ny = clamp((mouse.y - (r.top + r.height / 2)) / (r.height / 2), -1.4, 1.4);
        trx = ny * -4.5;
        try_ = nx * 6.5;
      }
      rx = lerp(rx, trx, 0.05);
      ry = lerp(ry, try_, 0.05);
      tiltEl.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  })();

  /* ---------------------------------------------- click ripple */
  (function initRipple() {
    if (!finePointer.matches || reducedMotion.matches) return;
    d.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var el = d.createElement('span');
      el.className = 'ripple';
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
      d.body.appendChild(el);
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 950);
    }, { passive: true });
  })();

  /* ---------------------------------------------- magnetic elements */
  (function initMagnetic() {
    if (!finePointer.matches || reducedMotion.matches) return;
    $$('[data-magnetic]').forEach(function (el) {
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        if (raf) window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(function () {
          var strength = el.classList.contains('btn') || el.classList.contains('email-chip') ? 0.18 : 0.12;
          el.style.transform = 'translate(' + clamp(dx * strength, -9, 9).toFixed(1) + 'px,' + clamp(dy * strength, -7, 7).toFixed(1) + 'px)';
        });
      });
      el.addEventListener('pointerleave', function () {
        if (raf) window.cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  })();

  /* ---------------------------------------------- work data */
  var WORK = {
    'oriele-brand': {
      index: '01',
      title: 'ORiele — Brand & Website',
      meta: 'ORiele · 2025–26 · Brand / GTM / Web',
      tag: 'Brand / GTM / Web',
      result: 'Named it. Built it. 30+ pages live.',
      points: [
        'Named ORiele and built the standalone brand with the team’s designer — positioning, core messaging, visual identity and tone of voice.',
        'Helped reposition the company from a voice-AI product into an AI workforce platform, defining products, agents, target industries and integrations.',
        'Led information architecture for 30+ product, industry, solution, integration and campaign pages — user journeys, navigation and conversion paths.',
        'Wrote and art-directed copy and imagery across the site; set up measurement with GA4, GTM, dataLayer, UTMs and Looker Studio.',
        'Contributed to pricing and purchase-flow design: plan structure, an interactive prototype, an ROI calculator and demo-request journeys.'
      ],
      stack: 'Figma · WordPress · GA4 · GTM · Looker Studio · Notion'
    },
    'agent-explorer': {
      index: '02',
      title: 'Agent Explorer',
      meta: 'ORiele · 2025–26 · Product UX / SEO',
      tag: 'Product UX / SEO',
      result: 'A catalog of ~50 AI agents, findable and testable.',
      points: [
        'Designed Agent Explorer’s structure for discovering and testing approximately 50 AI agents — industry and use-case categories, dedicated pages and demo scenarios.',
        'Connected every entry to product pages and the main website, shaping the journey from discovery to evaluation.',
        'Built SEO, AEO and GEO into the system: keyword research, answer-oriented content, schema and internal linking across articles and the explorer.',
        'Wrote and tested conversation and lead-capture scripts for telephone and web agents; reviewed calls and transcripts for response quality and contact capture.'
      ],
      stack: 'Information architecture · SEO / AEO / GEO · Voice & web agents · GA4 · Schema'
    },
    'ocg': {
      index: '03',
      title: 'OCG — Content Generation System',
      meta: 'ORiele · 2025–26 · AI systems / Automation',
      tag: 'AI systems / Automation',
      result: 'Eight templates. One engine. WordPress-ready.',
      points: [
        'Designed the internal ORiele Content Generation System: eight templates spanning website articles, event pages, social posts and images.',
        'Defined the architecture — AI processing stages, prompts, source and quality controls, review flow and WordPress publishing.',
        'Documented requirements and coordinated implementation with developers; designed surrounding workflows with n8n, APIs, webhooks and permissions.',
        'Built a 5,000+ idea content database, prioritized through Semrush, Moz, Keyword Planner and recurring user questions.',
        'Ran experimental Reddit and community monitoring workflows to surface relevant discussions and scenario-based responses.'
      ],
      stack: 'AI agents · Prompt design · n8n · APIs & webhooks · Semrush · WordPress'
    },
    'workforce-film': {
      index: '04',
      title: 'Workforce Studio Film',
      meta: 'ORiele · 2025–26 · Video / AI production',
      tag: 'Video / AI production',
      result: 'Concept to final mix, end to end.',
      points: [
        'Researched the product and audience, then developed the concept and storyboard.',
        'Directed the visual language: AI-generated images and shots, refinement, and final asset preparation.',
        'Edited the picture, recorded the narration, and designed the sound.',
        'Also scripted and produced founder-led HeyGen videos — visuals, audio, editing and music.'
      ],
      stack: 'Storyboards · AI image & video · Premiere Pro · Audition · HeyGen · Sound design'
    },
    'google-ads': {
      index: '05',
      title: 'Google Ads Growth Engine',
      meta: 'GamerTag · 2024–25 · Paid growth',
      tag: 'Paid growth',
      result: '30,500 installs in one month at €0.06 CPI.',
      points: [
        'Planned, executed and optimized user acquisition on Google Ads: 30,500 installs in one month at 18.28% conversion and €0.06 CPI.',
        'Measured and improved performance with Adjust, Firebase, GA4 and Google Play Console.',
        'Display campaign: 377K impressions, 34K clicks and 2K conversions from €174 spent over eight days.',
        'Owned campaign strategy, copywriting, brand messaging, creative concepts and production management.',
        'Executed and tested user-acquisition campaigns on Meta Ads, Microsoft Ads and Reddit Ads alongside Google.',
        'Helped the app surpass 50K downloads within seven weeks of launch.'
      ],
      stack: 'Google Ads · Adjust · Firebase · GA4 · Play Console · Copywriting'
    },
    'creative-studio': {
      index: '06',
      title: 'GamerTag Creative Studio',
      meta: 'GamerTag · 2024–25 · Video / Social',
      tag: 'Video / Social',
      result: 'Seven creators. 100+ scripts. Shorts: ~200 → 98K.',
      points: [
        'Managed seven content creators — four in-house, three outsourced — through briefs, allocation, schedules, reviews and delivery in Jira.',
        'Wrote and optimized 100+ video scripts against audience retention, watch time and click-through rates.',
        'Supported YouTube Shorts growth from ~200 to 98K organic views.',
        'Ran influencer campaigns: production-team outreach, individual content briefs and giveaways.',
        'Promoted from Social Media Manager to Marketing Manager after seven months.'
      ],
      stack: 'Jira · Script writing · Premiere Pro · Influencer ops · Audience analytics'
    }
  };

  var PREVIEW_BG = {
    'oriele-brand': 'linear-gradient(135deg, #191734 0%, #3A2F8F 46%, #8278F5 100%)',
    'agent-explorer': 'linear-gradient(135deg, #0B2430 0%, #116E68 52%, #58D4CC 100%)',
    'ocg': 'linear-gradient(135deg, #131A33 0%, #2C4BA8 55%, #568BF5 100%)',
    'workforce-film': 'linear-gradient(135deg, #2B150D 0%, #A35425 50%, #FF785F 100%)',
    'google-ads': 'linear-gradient(135deg, #0E1A2B 0%, #1D5FBF 52%, #43C8F2 100%)',
    'creative-studio': 'linear-gradient(135deg, #261021 0%, #8E3D6C 52%, #EF4A9B 100%)'
  };

  /* ---------------------------------------------- work preview chip */
  (function initPreview() {
    var chip = $('#work-preview');
    var num = $('#wp-num');
    var label = $('#wp-label');
    var list = $('#work-list');
    if (!chip || !num || !label || !list || !finePointer.matches || reducedMotion.matches) return;

    var x = 0, y = 0, tx = 0, ty = 0, on = false, raf = null;
    function loop() {
      x = lerp(x, tx, 0.16);
      y = lerp(y, ty, 0.16);
      chip.style.left = x + 'px';
      chip.style.top = y + 'px';
      if (on || Math.abs(tx - x) > 0.5) raf = window.requestAnimationFrame(loop);
      else raf = null;
    }
    $$('.work-row', list).forEach(function (row) {
      row.addEventListener('pointerenter', function (e) {
        var id = row.getAttribute('data-work');
        var item = WORK[id];
        if (!item) return;
        num.textContent = item.index;
        label.textContent = item.tag + ' — view';
        chip.style.background = PREVIEW_BG[id] || 'linear-gradient(135deg, #191734, #8278F5)';
        on = true;
        chip.classList.add('is-on');
        tx = e.clientX;
        ty = e.clientY;
        if (!raf) { x = tx; y = ty; raf = window.requestAnimationFrame(loop); }
      });
      row.addEventListener('pointermove', function (e) {
        tx = e.clientX;
        ty = e.clientY;
      }, { passive: true });
      row.addEventListener('pointerleave', function () {
        on = false;
        chip.classList.remove('is-on');
      });
    });
  })();

  /* ---------------------------------------------- modal */
  (function initModal() {
    var modal = $('#work-modal');
    if (!modal) return;
    var panel = $('.modal-panel', modal);
    var mIndex = $('#modal-index');
    var mMeta = $('#modal-meta');
    var mTitle = $('#modal-title');
    var mResult = $('#modal-result');
    var mList = $('#modal-list');
    var mStack = $('#modal-stack');
    var lastFocus = null;
    var hideTimer = null;

    function open(id) {
      var item = WORK[id];
      if (!item) return;
      mIndex.textContent = item.index;
      mMeta.textContent = item.meta;
      mTitle.textContent = item.title;
      mResult.textContent = item.result;
      mStack.textContent = item.stack;
      mList.innerHTML = '';
      item.points.forEach(function (p) {
        var li = d.createElement('li');
        li.textContent = p;
        mList.appendChild(li);
      });
      lastFocus = d.activeElement;
      clearTimeout(hideTimer);
      modal.hidden = false;
      d.body.style.overflow = 'hidden';
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          modal.classList.add('is-open');
        });
      });
      var closeBtn = $('.modal-close', modal);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.classList.remove('is-open');
      d.body.style.overflow = '';
      hideTimer = window.setTimeout(function () { modal.hidden = true; }, 400);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    $$('.work-row').forEach(function (row) {
      row.addEventListener('click', function () { open(row.getAttribute('data-work')); });
    });
    $$('[data-close]', modal).forEach(function (el) {
      el.addEventListener('click', close);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
      /* rudimentary focus trap */
      if (e.key === 'Tab' && !modal.hidden) {
        var focusables = $$('button, a[href]', panel);
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && d.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && d.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  })();

  /* ---------------------------------------------- copy email */
  (function initCopy() {
    var btn = $('#copy-email');
    var toast = $('#toast');
    var EMAIL = 'merajmohammadi1@gmail.com';
    if (!btn || !toast) return;
    var toastTimer = null;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
    }
    btn.addEventListener('click', function () {
      function fallback() {
        var ta = d.createElement('textarea');
        ta.value = EMAIL;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        d.body.appendChild(ta);
        ta.select();
        try { d.execCommand('copy'); showToast('Email copied — talk soon.'); }
        catch (err) { showToast('Email: ' + EMAIL); }
        d.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(function () {
          showToast('Email copied — talk soon.');
        }, fallback);
      } else {
        fallback();
      }
    });
  })();

  /* ---------------------------------------------- footer year */
  (function initYear() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  })();
})();
