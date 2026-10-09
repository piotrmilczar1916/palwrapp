(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'power2.out';
  var DUR = 0.65;
  var STAGGER = 0.1;

  var lenis = null;
  var scrollLockCount = 0;
  var scrollCallbacks = [];

  function headerOffset() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim();
    var h = parseFloat(raw) || 72;
    return -(h + 16);
  }

  function scrollToSection(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: headerOffset(), duration: reduceMotion ? 0 : 1.15 });
      return;
    }
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function lockScroll() {
    scrollLockCount += 1;
    if (scrollLockCount === 1 && lenis) lenis.stop();
    document.documentElement.classList.add('is-scroll-locked');
  }

  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      if (lenis) lenis.start();
      document.documentElement.classList.remove('is-scroll-locked');
    }
  }

  function resetScrollLocks() {
    scrollLockCount = 0;
    if (lenis) lenis.start();
    document.documentElement.classList.remove('is-scroll-locked');
  }

  function onScroll(cb) {
    scrollCallbacks.push(cb);
    cb(typeof window.scrollY === 'number' ? window.scrollY : 0);
  }

  function emitScroll(y) {
    scrollCallbacks.forEach(function (cb) { cb(y); });
  }

  function animateAccordionBody(body, open) {
    if (!body) return Promise.resolve();
    if (reduceMotion || typeof gsap === 'undefined') {
      body.hidden = !open;
      return Promise.resolve();
    }

    gsap.killTweensOf(body);

    return new Promise(function (resolve) {
      if (open) {
        body.hidden = false;
        body.style.overflow = 'hidden';
        body.style.height = 'auto';
        var full = body.scrollHeight;
        body.style.height = '0px';
        gsap.fromTo(
          body,
          { height: 0, opacity: 0 },
          {
            height: full,
            opacity: 1,
            duration: 0.45,
            ease: EASE,
            onComplete: function () {
              body.style.height = '';
              body.style.overflow = '';
              resolve();
            }
          }
        );
      } else {
        body.style.overflow = 'hidden';
        var current = body.offsetHeight;
        gsap.fromTo(
          body,
          { height: current, opacity: 1 },
          {
            height: 0,
            opacity: 0,
            duration: 0.38,
            ease: EASE,
            onComplete: function () {
              body.hidden = true;
              body.style.height = '';
              body.style.overflow = '';
              resolve();
            }
          }
        );
      }
    });
  }

  function animateModelExpand(card, open, toggleBtn) {
    var specs = card.querySelector('.model-specs--expand');
    if (!specs) {
      card.classList.toggle('is-open', open);
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', String(open));
        toggleBtn.textContent = open ? 'Zwiń parametry ↑' : 'Zobacz model →';
      }
      return Promise.resolve();
    }

    if (reduceMotion || typeof gsap === 'undefined') {
      card.classList.toggle('is-open', open);
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', String(open));
        toggleBtn.textContent = open ? 'Zwiń parametry ↑' : 'Zobacz model →';
      }
      return Promise.resolve();
    }

    gsap.killTweensOf(specs);

    return new Promise(function (resolve) {
      if (open) {
        card.classList.add('is-open');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-expanded', 'true');
          toggleBtn.textContent = 'Zwiń parametry ↑';
        }
        specs.style.display = 'grid';
        specs.style.overflow = 'hidden';
        specs.style.height = 'auto';
        var full = specs.offsetHeight;
        specs.style.height = '0px';
        gsap.fromTo(
          specs,
          { height: 0, opacity: 0 },
          {
            height: full,
            opacity: 1,
            duration: 0.5,
            ease: EASE,
            onComplete: function () {
              specs.style.height = '';
              specs.style.overflow = '';
              var rows = specs.querySelectorAll('div');
              gsap.fromTo(
                rows,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: EASE }
              );
              resolve();
            }
          }
        );
      } else {
        specs.style.overflow = 'hidden';
        var h = specs.offsetHeight;
        gsap.fromTo(
          specs,
          { height: h, opacity: 1 },
          {
            height: 0,
            opacity: 0,
            duration: 0.38,
            ease: EASE,
            onComplete: function () {
              card.classList.remove('is-open');
              specs.style.display = '';
              specs.style.height = '';
              specs.style.overflow = '';
              if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.textContent = 'Zobacz model →';
              }
              resolve();
            }
          }
        );
      }
    });
  }

  function animateDetailsPanel(details, open) {
    var inner = details.querySelector('.benefit-list');
    if (!inner) {
      details.open = open;
      return Promise.resolve();
    }
    if (reduceMotion || typeof gsap === 'undefined') {
      details.open = open;
      return Promise.resolve();
    }

    gsap.killTweensOf(inner);

    return new Promise(function (resolve) {
      if (open) {
        details.open = true;
        inner.style.overflow = 'hidden';
        inner.style.height = 'auto';
        var full = inner.scrollHeight;
        inner.style.height = '0px';
        gsap.fromTo(
          inner,
          { height: 0, opacity: 0 },
          {
            height: full,
            opacity: 1,
            duration: 0.5,
            ease: EASE,
            onComplete: function () {
              inner.style.height = '';
              inner.style.overflow = '';
              resolve();
            }
          }
        );
      } else {
        inner.style.overflow = 'hidden';
        var cur = inner.offsetHeight;
        gsap.fromTo(
          inner,
          { height: cur, opacity: 1 },
          {
            height: 0,
            opacity: 0,
            duration: 0.4,
            ease: EASE,
            onComplete: function () {
              details.open = false;
              inner.style.height = '';
              inner.style.overflow = '';
              resolve();
            }
          }
        );
      }
    });
  }

  function initProofCountersFixed() {
    document.querySelectorAll('.proof-item').forEach(function (item, index) {
      var valueEl = item.querySelector('.proof-item__value');
      if (!valueEl || valueEl.classList.contains('proof-item__value--text')) return;

      var st = {
        trigger: item,
        start: 'top 88%',
        once: true,
        toggleActions: 'play none none none'
      };

      if (index === 0) {
        var p0 = { n: 0 };
        gsap.to(p0, {
          n: 50,
          duration: 1.1,
          ease: 'power1.out',
          scrollTrigger: st,
          onUpdate: function () { valueEl.textContent = String(Math.round(p0.n)); }
        });
      } else if (index === 1) {
        var mmSpan = valueEl.querySelector('span');
        var p1 = { n: 0 };
        gsap.to(p1, {
          n: 2200,
          duration: 1.15,
          ease: 'power1.out',
          scrollTrigger: st,
          onUpdate: function () {
            if (mmSpan) {
              valueEl.childNodes[0].textContent = String(Math.round(p1.n)) + ' ';
            } else {
              valueEl.textContent = String(Math.round(p1.n));
            }
          }
        });
      }
    });
  }

  function revealOnce(targets, vars) {
    if (!targets || !targets.length) return;
    var v = Object.assign({}, vars || {});
    var trigger = v.trigger || targets[0].parentElement || targets[0];
    delete v.trigger;
    gsap.from(targets, Object.assign({
      y: 18,
      opacity: 0,
      duration: DUR,
      ease: EASE,
      stagger: STAGGER,
      scrollTrigger: {
        trigger: trigger,
        start: 'top 88%',
        once: true,
        toggleActions: 'play none none none'
      },
      onComplete: function () {
        gsap.set(targets, { clearProps: 'transform,opacity' });
      }
    }, v));
  }

  function initMotion() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    document.documentElement.classList.add('is-smooth-scroll');

    if (typeof Lenis !== 'undefined' && !reduceMotion) {
      lenis = new Lenis({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.95
      });

      lenis.on('scroll', function (e) {
        ScrollTrigger.update();
        var y = typeof e === 'object' && e !== null && 'scroll' in e ? e.scroll : window.scrollY;
        emitScroll(y);
      });

      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener('scroll', function () {
        emitScroll(window.scrollY);
      }, { passive: true });
    }

    var header = document.getElementById('site-header');
    onScroll(function (y) {
      if (header) header.classList.toggle('is-stuck', y > 12);
    });

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link || link.getAttribute('href') === '#') return;
      var id = link.getAttribute('href');
      var target = document.querySelector(id);
      if (!target) return;
      if (link.classList.contains('skip-link')) return;
      e.preventDefault();
      scrollToSection(target);
    }, true);

    document.querySelectorAll('.benefit-details').forEach(function (details) {
      var summary = details.querySelector('summary');
      if (!summary) return;
      summary.addEventListener('click', function (e) {
        if (reduceMotion) return;
        e.preventDefault();
        animateDetailsPanel(details, !details.open);
      });
    });

    var heroCopy = document.querySelector('.hero__copy');
    if (heroCopy) {
      /* .hero__label jest teraz zagnieżdżony w <h1>, więc animujemy go
         razem z tytułem (osobny tween dawałby podwójne zanikanie). */
      var heroBits = [
        heroCopy.querySelector('.hero__title'),
        heroCopy.querySelector('.hero__lead')
      ].filter(Boolean);
      var actionBtns = heroCopy.querySelectorAll('.hero__actions > *');

      gsap.set(heroBits, { opacity: 0, y: 16 });
      gsap.set(actionBtns, { opacity: 0, y: 12 });

      var heroTl = gsap.timeline({ delay: 0.08 });
      heroTl.to(heroBits, {
        opacity: 1,
        y: 0,
        duration: DUR,
        ease: EASE,
        stagger: 0.12
      });
      heroTl.to(actionBtns, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: EASE,
        stagger: 0.08
      }, '-=0.25');
    }

    var hero = document.querySelector('.hero');
    var stage = document.querySelector('[data-hero-parallax]');
    if (hero && heroCopy) {
      gsap.to(heroCopy, {
        y: -36,
        opacity: 0.82,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }
    if (hero && stage && window.matchMedia('(min-width: 980px)').matches) {
      gsap.to(stage, {
        y: 24,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.85
        }
      });
    }

    var proofItems = gsap.utils.toArray('.proof-item');
    if (proofItems.length) {
      gsap.from(proofItems, {
        y: 20,
        opacity: 0,
        duration: DUR,
        ease: EASE,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.proof-strip',
          start: 'top 90%',
          once: true,
          toggleActions: 'play none none none'
        }
      });
      initProofCountersFixed();
    }

    gsap.utils.toArray('.section-header').forEach(function (headerEl) {
      gsap.from(headerEl.children, {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: {
          trigger: headerEl,
          start: 'top 88%',
          once: true,
          toggleActions: 'play none none none'
        }
      });
    });

    var legacy = document.querySelector('.compare__card--legacy');
    var arrow = document.querySelector('.compare__arrow');
    var pal = document.querySelector('.compare__card--palwrapp');
    if (legacy && pal) {
      var compareTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.compare',
          start: 'top 85%',
          once: true,
          toggleActions: 'play none none none'
        }
      });
      compareTl
        .from(legacy, { y: 22, opacity: 0, duration: DUR, ease: EASE })
        .from(arrow, { opacity: 0, scale: 0.85, duration: 0.45, ease: EASE }, '-=0.35')
        .from(pal, { y: 22, opacity: 0, duration: DUR, ease: EASE }, '-=0.2');

      gsap.utils.toArray('.compare__list li').forEach(function (li) {
        gsap.from(li, {
          x: li.closest('.compare__list--negative') ? -8 : 8,
          opacity: 0,
          duration: 0.5,
          ease: EASE,
          scrollTrigger: {
            trigger: li,
            start: 'top 92%',
            once: true,
            toggleActions: 'play none none none'
          }
        });
      });
    }

    gsap.from('.prose', {
      y: 18,
      opacity: 0,
      duration: DUR,
      ease: EASE,
      scrollTrigger: {
        trigger: '.prose',
        start: 'top 88%',
        once: true,
        toggleActions: 'play none none none'
      }
    });

    revealOnce(gsap.utils.toArray('.industry-card'), { trigger: document.querySelector('.industry-grid') });

    gsap.utils.toArray('.scenario-block__list li').forEach(function (li, i) {
      gsap.from(li, {
        x: -10,
        opacity: 0,
        duration: 0.5,
        ease: EASE,
        delay: i * 0.07,
        scrollTrigger: {
          trigger: '.scenario-block',
          start: 'top 85%',
          once: true,
          toggleActions: 'play none none none'
        }
      });
    });

    initSpecsSection();

    revealOnce(gsap.utils.toArray('.benefit-card'), { stagger: 0, trigger: document.querySelector('.benefit-cards') });

    revealOnce(gsap.utils.toArray('.model-showcase__card'), { stagger: 0.1, trigger: document.querySelector('.model-showcase') });

    revealOnce(gsap.utils.toArray('.equip-card'), { stagger: 0.08, trigger: document.querySelector('.equip-grid') });
    revealOnce(gsap.utils.toArray('.module-card'), { stagger: 0.07, trigger: document.querySelector('.module-grid') });

    var thumb = document.querySelector('.video-feature__thumb');
    if (thumb) {
      gsap.from(thumb, {
        scale: 0.96,
        opacity: 0.85,
        duration: 0.8,
        ease: EASE,
        scrollTrigger: {
          trigger: thumb,
          start: 'top 88%',
          once: true,
          toggleActions: 'play none none none'
        }
      });
    }

    gsap.from('.video-feature__copy > *', {
      y: 16,
      opacity: 0,
      duration: 0.55,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: {
        trigger: '.video-feature__copy',
        start: 'top 88%',
        once: true,
        toggleActions: 'play none none none'
      }
    });

    revealOnce(gsap.utils.toArray('.faq-item'), { stagger: 0.06, trigger: document.querySelector('.faq-grid') });

    gsap.from('.contact-layout__copy', {
      y: 18,
      opacity: 0,
      duration: DUR,
      ease: EASE,
      scrollTrigger: {
        trigger: '.contact-layout',
        start: 'top 88%',
        once: true,
        toggleActions: 'play none none none'
      }
    });
    gsap.from('.contact-layout__form', {
      y: 18,
      opacity: 0,
      duration: DUR,
      ease: EASE,
      delay: 0.1,
      scrollTrigger: {
        trigger: '.contact-layout',
        start: 'top 88%',
        once: true,
        toggleActions: 'play none none none'
      }
    });

    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
    ScrollTrigger.refresh();
  }

  function initSpecsSection() {
    var section = document.querySelector('#parametry');
    var layout = section && section.querySelector('.specs-layout');
    var media = layout && layout.querySelector('.specs-layout__media');
    var panel = layout && layout.querySelector('.specs-panel');
    var items = layout ? gsap.utils.toArray('.specs-panel__list > li', layout) : [];
    var aside = layout && layout.querySelector('.specs-panel__aside');
    if (!layout || !panel || !media || !items.length) return;

    var counted = {};
    var valueOriginals = items.map(function (li) {
      var valEl = li.querySelector('.specs-panel__value');
      if (!valEl) return '';
      var text = valEl.textContent.trim();
      valEl.setAttribute('data-value-original', text);
      return text;
    });

    function runCountUp(index) {
      if (counted[index]) return;
      var valEl = items[index].querySelector('.specs-panel__value');
      if (!valEl) return;

      var original = valueOriginals[index] || valEl.getAttribute('data-value-original') || '';

      if (index === 0 && /50/.test(original)) {
        counted[index] = true;
        var p0 = { n: 0 };
        gsap.to(p0, {
          n: 50,
          duration: 1,
          ease: 'power1.out',
          overwrite: true,
          onUpdate: function () {
            valEl.textContent = 'do ' + Math.round(p0.n) + ' cykli/min';
          },
        });
      } else if (index === 1 && /2200/.test(original)) {
        counted[index] = true;
        var p1 = { n: 0 };
        gsap.to(p1, {
          n: 2200,
          duration: 1.1,
          ease: 'power1.out',
          overwrite: true,
          onUpdate: function () {
            valEl.textContent = Math.round(p1.n) + ' mm';
          }
        });
      }
    }

    function setActive(index) {
      var safeIndex = Math.max(0, Math.min(items.length - 1, index));
      items.forEach(function (li, i) {
        li.classList.toggle('is-spec-active', i === safeIndex);
      });
      runCountUp(safeIndex);
    }

    var mediaImg = media.querySelector('img');
    if (mediaImg && !mediaImg.complete) {
      mediaImg.addEventListener('load', function () {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
    }

    gsap.matchMedia().add('(min-width: 1024px)', function () {
      var triggers = [];

      items.forEach(function (li, i) {
        li.classList.toggle('is-spec-active', i === 0);
      });

      items.forEach(function (li, i) {
        triggers.push(ScrollTrigger.create({
          trigger: li,
          start: 'top 58%',
          end: 'bottom 42%',
          onEnter: function () { setActive(i); },
          onEnterBack: function () { setActive(i); }
        }));
      });

      if (aside) {
        triggers.push(ScrollTrigger.create({
          trigger: aside,
          start: 'top 92%',
          once: true,
          onEnter: function () {
            gsap.fromTo(aside, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: DUR, ease: EASE });
          }
        }));
      }

      return function () {
        triggers.forEach(function (st) { st.kill(); });
        items.forEach(function (li, idx) {
          li.classList.remove('is-spec-active');
          gsap.set(li, { clearProps: 'opacity' });
          var valEl = li.querySelector('.specs-panel__value');
          if (valEl && valueOriginals[idx]) {
            valEl.textContent = valueOriginals[idx];
          }
        });
        counted = {};
      };
    });

    gsap.matchMedia().add('(max-width: 1023px)', function () {
      items.forEach(function (li) {
        li.classList.remove('is-spec-active');
        gsap.set(li, { clearProps: 'opacity' });
      });

      gsap.from(layout.querySelector('.specs-layout__media'), {
        y: 18,
        opacity: 0,
        duration: DUR,
        ease: EASE,
        scrollTrigger: {
          trigger: layout,
          start: 'top 88%',
          once: true,
          toggleActions: 'play none none none'
        },
        onComplete: function () {
          gsap.set(media, { clearProps: 'transform,opacity' });
        }
      });
      gsap.from(items, {
        y: 16,
        opacity: 0,
        duration: 0.55,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: {
          trigger: layout,
          start: 'top 85%',
          once: true,
          toggleActions: 'play none none none'
        },
        onComplete: function () {
          gsap.set(items, { clearProps: 'opacity' });
        }
      });
      if (aside) {
        gsap.from(aside, {
          y: 16,
          opacity: 0,
          duration: DUR,
          ease: EASE,
          scrollTrigger: {
            trigger: aside,
            start: 'top 90%',
            once: true,
            toggleActions: 'play none none none'
          }
        });
      }

      return function () {
        gsap.set(items, { clearProps: 'opacity' });
      };
    });
  }

  window.motionUi = {
    scrollToSection: scrollToSection,
    lockScroll: lockScroll,
    unlockScroll: unlockScroll,
    resetScrollLocks: resetScrollLocks,
    animateAccordionBody: animateAccordionBody,
    animateModelExpand: animateModelExpand,
    animateDetailsPanel: animateDetailsPanel,
    onScroll: onScroll,
    refresh: function () {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }
  };

  if (reduceMotion) {
    window.addEventListener('scroll', function () {
      emitScroll(window.scrollY);
    }, { passive: true });
    var headerRm = document.getElementById('site-header');
    onScroll(function (y) {
      if (headerRm) headerRm.classList.toggle('is-stuck', y > 12);
    });
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }
})();
