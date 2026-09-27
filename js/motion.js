(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  var lenis = null;
  var scrollLockCount = 0;
  var headerOffset = 88;
  var pinMq = window.matchMedia('(min-width: 1024px)');

  function getHeaderOffset() {
    var header = document.getElementById('site-header');
    return header ? header.offsetHeight + 16 : headerOffset;
  }

  function formatCount(value, el) {
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var rounded = Math.round(value);
    return prefix + rounded.toLocaleString('pl-PL') + suffix;
  }

  function setCounterText(el, value) {
    el.textContent = formatCount(value, el);
  }

  function initCountersStatic() {
    document.querySelectorAll('.specs-panel__count[data-count-to]').forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count-to'), 10);
      if (!isNaN(to)) setCounterText(el, to);
    });
  }

  function lockScroll() {
    scrollLockCount += 1;
    if (lenis) lenis.stop();
    document.documentElement.classList.add('is-scroll-locked');
  }

  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      if (lenis) lenis.start();
      document.documentElement.classList.remove('is-scroll-locked');
    }
  }

  function resetScrollLock() {
    scrollLockCount = 0;
    if (lenis) lenis.start();
    document.documentElement.classList.remove('is-scroll-locked');
  }

  function scrollToSection(target, options) {
    options = options || {};
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    var offset = options.offset != null ? options.offset : -getHeaderOffset();

    if (lenis) {
      lenis.scrollTo(el, {
        offset: offset,
        duration: options.duration != null ? options.duration : 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
      });
      return;
    }

    var top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function animateModelExpand(card, open) {
    if (!hasGsap || reduceMotion || !card) return;

    var specs = card.querySelector('.model-specs--expand');
    if (!specs) return;

    gsap.killTweensOf(specs);

    if (open) {
      specs.style.display = 'grid';
      var height = specs.scrollHeight;
      gsap.fromTo(specs, { height: 0, opacity: 0.4 }, {
        height: height,
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out',
        onComplete: function () {
          specs.style.height = 'auto';
        }
      });
    } else {
      gsap.to(specs, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        onComplete: function () {
          specs.style.display = '';
        }
      });
    }
  }

  function bindAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;

      link.addEventListener('click', function (e) {
        var id = href.slice(1);
        var target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        scrollToSection(target);
      });
    });
  }

  function initHeroFloatingCta() {
    var floatingCtaBtn = document.querySelector('.floating-cta');
    var heroSection = document.querySelector('.hero');
    if (!floatingCtaBtn || !heroSection || !('IntersectionObserver' in window)) return;

    var heroCtaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatingCtaBtn.classList.toggle('is-hero-hidden', entry.isIntersecting);
      });
    }, { rootMargin: '-25% 0px -25% 0px', threshold: 0 });

    heroCtaObserver.observe(heroSection);
  }

  function initLenisScrollUi() {
    var header = document.getElementById('site-header');
    var backToTop = document.getElementById('back-to-top');

    var onScroll = function () {
      var scrollY = lenis ? lenis.scroll : window.scrollY;
      if (header) header.classList.toggle('is-stuck', scrollY > 12);
      if (backToTop) backToTop.classList.toggle('is-visible', scrollY > 400);
    };

    if (lenis) {
      lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    onScroll();
  }

  function initMotion() {
    if (!hasGsap || reduceMotion) {
      initCountersStatic();
      document.documentElement.classList.add('motion-reduced');
      bindAnchorScroll();
      initLenisScrollUi();
      initHeroFloatingCta();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('has-motion');

    if (hasLenis) {
      document.documentElement.classList.add('has-lenis');
      lenis = new Lenis({
        duration: 1.1,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        smoothTouch: false
      });

      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop: function (value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect: function () {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
          };
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed'
      });

      ScrollTrigger.addEventListener('refresh', function () {
        if (lenis) lenis.resize();
      });
    }

    bindAnchorScroll();
    initLenisScrollUi();
    initHeroFloatingCta();

    /* --- Hero --- */
    var hero = document.querySelector('.hero');
    var heroCopy = document.querySelector('.hero__copy');
    var heroStage = document.querySelector('[data-hero-parallax]');

    if (hero && heroCopy && heroStage) {
      gsap.to(heroCopy, {
        y: -90,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });

      gsap.to(heroStage, {
        scale: 1.1,
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    }

    /* --- Proof strip cascade --- */
    var proofItems = gsap.utils.toArray('.proof-item');
    if (proofItems.length) {
      gsap.from(proofItems, {
        y: 36,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.proof-strip',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    }

    /* --- Compare --- */
    var compareLegacy = document.querySelector('.compare__card--legacy');
    var comparePalwrapp = document.querySelector('.compare__card--palwrapp');
    var compareBlock = document.querySelector('.compare');

    if (compareBlock && compareLegacy && comparePalwrapp) {
      gsap.to(compareLegacy, {
        scale: 0.92,
        opacity: 0.45,
        ease: 'none',
        scrollTrigger: {
          trigger: compareBlock,
          start: 'top 70%',
          end: 'center 45%',
          scrub: 0.5
        }
      });

      gsap.fromTo(comparePalwrapp,
        { x: 48, opacity: 0.55, scale: 0.98 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: compareBlock,
            start: 'top 70%',
            end: 'center 45%',
            scrub: 0.5
          }
        }
      );
    }

    /* --- Pallet pin (desktop) / mobile auto --- */
    var parametrySection = document.getElementById('parametry');
    var pinRoot = document.querySelector('[data-pallet-pin]');
    var layers = gsap.utils.toArray('.pallet-scene__layer');
    var wrap = document.querySelector('.pallet-scene__wrap');
    var specItems = gsap.utils.toArray('.specs-panel__list li[data-spec-step]');
    var counters = gsap.utils.toArray('.specs-panel__count[data-count-to]');

    function setActiveSpec(index) {
      specItems.forEach(function (li, i) {
        li.classList.toggle('is-spec-active', i === index);
      });
    }

    function buildPalletTimeline(scrub) {
      var tl = gsap.timeline({
        scrollTrigger: scrub ? {
          trigger: pinRoot,
          start: 'top top',
          end: '+=220%',
          pin: true,
          pinSpacing: true,
          scrub: 0.55,
          anticipatePin: 1
        } : undefined
      });

      layers.forEach(function (layer, index) {
        gsap.set(layer, { y: -70 - index * 12, opacity: 0, scale: 0.96 });
      });
      if (wrap) gsap.set(wrap, { opacity: 0, scaleY: 0.1, transformOrigin: '50% 100%' });

      counters.forEach(function (counter) {
        var to = parseFloat(counter.getAttribute('data-count-to'), 10) || 0;
        var proxy = { val: 0 };
        counter._countProxy = proxy;
        setCounterText(counter, 0);
      });

      setActiveSpec(-1);

      layers.forEach(function (layer, index) {
        tl.to(layer, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: 'power2.out',
          onStart: function () { setActiveSpec(index); }
        }, index * 0.25);

        if (index === 0 && counters[0]) {
          tl.to(counters[0]._countProxy, {
            val: parseFloat(counters[0].getAttribute('data-count-to'), 10) || 50,
            duration: 0.25,
            ease: 'power1.out',
            onUpdate: function () { setCounterText(counters[0], counters[0]._countProxy.val); }
          }, index * 0.25);
        }

        if (index === 1 && counters[1]) {
          tl.to(counters[1]._countProxy, {
            val: parseFloat(counters[1].getAttribute('data-count-to'), 10) || 2200,
            duration: 0.25,
            ease: 'power1.out',
            onUpdate: function () { setCounterText(counters[1], counters[1]._countProxy.val); }
          }, index * 0.25);
        }
      });

      if (wrap) {
        tl.to(wrap, {
          opacity: 0.75,
          scaleY: 1,
          duration: 0.3,
          ease: 'power2.inOut',
          onStart: function () { setActiveSpec(3); }
        }, layers.length * 0.25);
      }

      return tl;
    }

    if (parametrySection && pinRoot && layers.length) {
      if (pinMq.matches) {
        buildPalletTimeline(true);
      } else {
        initCountersStatic();
        setActiveSpec(0);

        ScrollTrigger.create({
          trigger: pinRoot,
          start: 'top 80%',
          once: true,
          onEnter: function () {
            var mobileTl = gsap.timeline();
            layers.forEach(function (layer, index) {
              gsap.set(layer, { y: -40, opacity: 0 });
              mobileTl.to(layer, {
                y: 0,
                opacity: 1,
                duration: 0.35,
                ease: 'power2.out',
                onStart: function () { setActiveSpec(index); }
              }, index * 0.18);
            });
            if (wrap) {
              mobileTl.to(wrap, {
                opacity: 0.7,
                scaleY: 1,
                duration: 0.35,
                onStart: function () { setActiveSpec(3); }
              }, layers.length * 0.18);
            }
            counters.forEach(function (counter) {
              var to = parseFloat(counter.getAttribute('data-count-to'), 10) || 0;
              var proxy = { val: 0 };
              mobileTl.to(proxy, {
                val: to,
                duration: 0.6,
                ease: 'power1.out',
                onUpdate: function () {
                  setCounterText(counter, proxy.val);
                }
              }, 0);
            });
          }
        });
      }
    }

    pinMq.addEventListener('change', function () {
      ScrollTrigger.refresh(true);
    });

    /* --- Subtle reveals --- */
    gsap.utils.toArray('.industry-card, .equip-card, .module-card, .faq-item, .benefit-card, .contact-layout__copy, .contact-layout__form').forEach(function (el) {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    /* --- Models stagger --- */
    var modelCards = gsap.utils.toArray('.model-showcase__card');
    if (modelCards.length) {
      gsap.from(modelCards, {
        y: 40,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.model-showcase',
          start: 'top 80%'
        }
      });
    }

    /* --- Video thumb scale --- */
    var videoThumb = document.querySelector('.video-feature__thumb');
    if (videoThumb) {
      gsap.fromTo(videoThumb,
        { scale: 0.92, opacity: 0.85 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: videoThumb,
            start: 'top 85%',
            end: 'center 55%',
            scrub: 0.4
          }
        }
      );
    }

    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
  }

  window.motionUi = {
    lockScroll: lockScroll,
    unlockScroll: unlockScroll,
    scrollToSection: scrollToSection,
    animateModelExpand: animateModelExpand,
    refresh: function () {
      if (hasGsap && window.ScrollTrigger) ScrollTrigger.refresh();
      if (lenis) lenis.resize();
    },
    resetScrollLock: resetScrollLock
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotion);
  } else {
    initMotion();
  }

  window.addEventListener('pageshow', function () {
    if (window.motionUi) window.motionUi.refresh();
  });
})();
