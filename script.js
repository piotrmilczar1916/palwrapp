(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Accordions --- */
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    var multi = accordion.hasAttribute('data-accordion-multi');

    accordion.querySelectorAll('.benefit-item__header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.benefit-item');
        var body = document.getElementById(btn.getAttribute('aria-controls'));
        var isOpen = item.classList.contains('is-open');

        if (!multi) {
          accordion.querySelectorAll('.benefit-item').forEach(function (other) {
            var otherBtn = other.querySelector('.benefit-item__header');
            var otherBody = document.getElementById(otherBtn.getAttribute('aria-controls'));
            other.classList.remove('is-open');
            otherBtn.setAttribute('aria-expanded', 'false');
            if (otherBody) otherBody.hidden = true;
          });
        }

        if (isOpen && multi) {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          if (body) body.hidden = true;
        } else if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          if (body) body.hidden = false;
        } else if (!multi) {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          if (body) body.hidden = true;
        }
      });
    });
  });

  /* --- Model cards expand --- */
  document.querySelectorAll('[data-model-card]').forEach(function (card) {
    var toggle = card.querySelector('.model-showcase__toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var open = card.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Zwiń parametry ↑' : 'Zobacz model →';
    });
  });

  /* --- Video modal --- */
  var videoModal = document.getElementById('video-modal');
  var videoModalPlayer = document.getElementById('video-modal-player');
  var playMain = document.getElementById('video-play-main');
  var playThumb = document.getElementById('video-play-thumb');

  function openVideoModal() {
    if (!videoModal || !videoModalPlayer) return;
    videoModal.hidden = false;
    document.body.style.overflow = 'hidden';
    videoModalPlayer.currentTime = 0;
    videoModalPlayer.play().catch(function () { /* ignore */ });
  }

  function closeVideoModal() {
    if (!videoModal || !videoModalPlayer) return;
    videoModal.hidden = true;
    document.body.style.overflow = '';
    videoModalPlayer.pause();
  }

  if (playMain) playMain.addEventListener('click', openVideoModal);
  if (playThumb) playThumb.addEventListener('click', openVideoModal);

  if (videoModal) {
    videoModal.querySelectorAll('[data-video-close]').forEach(function (el) {
      el.addEventListener('click', closeVideoModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !videoModal.hidden) closeVideoModal();
    });
  }

  /* --- Mobile nav --- */
  var header = document.getElementById('site-header');
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');

  if (header && navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('is-nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function resetPageToDefaults() {
    document.querySelectorAll('.video-card__player').forEach(function (video) {
      try {
        video.pause();
        if (video.readyState >= 1) video.currentTime = 0;
      } catch (err) { /* ignore */ }
    });

    if (videoModalPlayer) {
      videoModalPlayer.pause();
      if (videoModalPlayer.readyState >= 1) videoModalPlayer.currentTime = 0;
    }
    if (videoModal) videoModal.hidden = true;
    document.body.style.overflow = '';

    document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
      var multi = accordion.hasAttribute('data-accordion-multi');
      accordion.querySelectorAll('.benefit-item').forEach(function (item, index) {
        var btn = item.querySelector('.benefit-item__header');
        var body = btn && document.getElementById(btn.getAttribute('aria-controls'));
        var open = multi ? index === 0 : index === 0;
        if (multi && index > 0) open = false;
        item.classList.toggle('is-open', open);
        if (btn) btn.setAttribute('aria-expanded', String(open));
        if (body) body.hidden = !open;
      });
    });

    document.querySelectorAll('[data-model-card]').forEach(function (card) {
      card.classList.remove('is-open');
      var toggle = card.querySelector('.model-showcase__toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Zobacz model →';
      }
    });

    var formEl = document.getElementById('lead-form');
    if (formEl) {
      formEl.reset();
      formEl.querySelectorAll('[aria-invalid]').forEach(function (field) {
        field.setAttribute('aria-invalid', 'false');
      });
      formEl.querySelectorAll('.field-error.is-shown').forEach(function (err) {
        err.classList.remove('is-shown');
      });
      var formStatus = document.getElementById('form-status');
      if (formStatus) {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }
    }

    if (header && navToggle) {
      header.classList.remove('is-nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  resetPageToDefaults();
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) resetPageToDefaults();
  });

  /* --- Ukryj floating CTA na kontakt --- */
  var floatingCta = document.querySelector('.floating-cta');
  var kontaktSection = document.getElementById('kontakt');

  if (floatingCta && kontaktSection) {
    var kontaktObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatingCta.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, { rootMargin: '-10% 0px -10% 0px', threshold: 0.1 });
    kontaktObserver.observe(kontaktSection);
  }

  /* --- Back to top --- */
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    var toggleBackToTop = function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Scroll spy (header nav) --- */
  var sections = document.querySelectorAll('main section[id], #kontakt');
  var navLinks = document.querySelectorAll('.site-nav__link');

  if (sections.length && navLinks.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* --- Lead form --- */
  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');
  var requiredFields = ['imie', 'firma', 'email', 'produkt'];

  if (form && status && submitBtn) {
    function errorFor(id) { return document.getElementById('err-' + id); }

    function validateField(field) {
      var err = errorFor(field.id);
      var valid = field.checkValidity();
      if (err) err.classList.toggle('is-shown', !valid);
      field.setAttribute('aria-invalid', String(!valid));
      return valid;
    }

    function clearField(field) {
      if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
        field.setAttribute('aria-invalid', 'false');
        var err = errorFor(field.id);
        if (err) err.classList.remove('is-shown');
      }
    }

    function setStatus(message, type) {
      status.textContent = message;
      status.className = 'form-status is-visible' + (type ? ' is-' + type : '');
    }

    requiredFields.forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () { clearField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;

      requiredFields.forEach(function (id) {
        var field = document.getElementById(id);
        if (field && !validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        setStatus('Uzupełnij zaznaczone pola, aby wysłać zapytanie.', 'error');
        return;
      }

      var label = submitBtn.querySelector('.btn-label');
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      if (label) label.textContent = 'Wysyłanie…';
      status.className = 'form-status';

      var formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data.success) {
            setStatus(result.data.message, 'success');
            form.reset();
            return;
          }

          var message = (result.data && result.data.message)
            ? result.data.message
            : 'Nie udało się wysłać wiadomości. Spróbuj ponownie.';

          if (result.data && Array.isArray(result.data.fields)) {
            result.data.fields.forEach(function (id) {
              var field = document.getElementById(id);
              if (field) validateField(field);
            });
            var firstField = document.getElementById(result.data.fields[0]);
            if (firstField) firstField.focus();
          }

          setStatus(message, 'error');
        })
        .catch(function () {
          setStatus('Błąd połączenia. Sprawdź internet i spróbuj ponownie.', 'error');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
          if (label) label.textContent = 'Wyślij zapytanie →';
        });
    });
  }
})();

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('site-header');

  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  }

  var revealSelectors = [
    '.section-header',
    '.compare',
    '.prose',
    '.industry-card',
    '.specs-layout',
    '.benefit-card',
    '.model-showcase__card',
    '.equip-card',
    '.module-card',
    '.video-feature',
    '.faq-item',
    '.contact-layout__copy',
    '.contact-layout__form'
  ];

  var revealTargets = [];
  revealSelectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (revealTargets.indexOf(el) === -1) revealTargets.push(el);
    });
  });

  if (revealTargets.length && !reduceMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach(function (el) {
      el.setAttribute('data-reveal', '');
      var siblings = Array.prototype.filter.call(
        el.parentElement ? el.parentElement.children : [],
        function (node) { return node.hasAttribute && node.hasAttribute('data-reveal'); }
      );
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index, 6) * 60 + 'ms');
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  var floatingCtaBtn = document.querySelector('.floating-cta');
  var heroSection = document.querySelector('.hero');

  if (floatingCtaBtn && heroSection && 'IntersectionObserver' in window) {
    var heroCtaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatingCtaBtn.classList.toggle('is-hero-hidden', entry.isIntersecting);
      });
    }, { rootMargin: '-25% 0px -25% 0px', threshold: 0 });
    heroCtaObserver.observe(heroSection);
  }

  var stage = document.querySelector('[data-hero-parallax]');
  var hero = document.querySelector('.hero');

  if (stage && hero && !reduceMotion && window.matchMedia('(min-width: 980px)').matches) {
    var ticking = false;
    var updateParallax = function () {
      var heroHeight = hero.offsetHeight || 1;
      var progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      stage.style.transform = 'translate3d(0, ' + (progress * -28).toFixed(2) + 'px, 0)';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }, { passive: true });
    updateParallax();
  }
})();
