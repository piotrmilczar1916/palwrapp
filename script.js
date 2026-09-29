(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function closeBenefitItem(item) {
    var btn = item.querySelector('.benefit-item__header');
    var body = btn && document.getElementById(btn.getAttribute('aria-controls'));
    item.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (window.motionUi && window.motionUi.animateAccordionBody) {
      return window.motionUi.animateAccordionBody(body, false);
    }
    if (body) body.hidden = true;
    return Promise.resolve();
  }

  function openBenefitItem(item) {
    var btn = item.querySelector('.benefit-item__header');
    var body = btn && document.getElementById(btn.getAttribute('aria-controls'));
    item.classList.add('is-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (window.motionUi && window.motionUi.animateAccordionBody) {
      return window.motionUi.animateAccordionBody(body, true);
    }
    if (body) body.hidden = false;
    return Promise.resolve();
  }

  /* --- Accordions --- */
  document.querySelectorAll('[data-accordion]').forEach(function (accordion) {
    var multi = accordion.hasAttribute('data-accordion-multi');

    accordion.querySelectorAll('.benefit-item__header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.benefit-item');
        var isOpen = item.classList.contains('is-open');

        if (isOpen && multi) {
          closeBenefitItem(item);
          return;
        }

        if (isOpen && !multi) {
          closeBenefitItem(item);
          return;
        }

        var closeOthers = [];
        if (!multi) {
          accordion.querySelectorAll('.benefit-item.is-open').forEach(function (other) {
            if (other !== item) closeOthers.push(closeBenefitItem(other));
          });
        }

        Promise.all(closeOthers).then(function () {
          openBenefitItem(item);
        });
      });
    });
  });

  /* --- Model cards expand --- */
  document.querySelectorAll('[data-model-card]').forEach(function (card) {
    var toggle = card.querySelector('.model-showcase__toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var willOpen = !card.classList.contains('is-open');
      if (window.motionUi && window.motionUi.animateModelExpand) {
        window.motionUi.animateModelExpand(card, willOpen, toggle);
        return;
      }
      card.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
      toggle.textContent = willOpen ? 'Zwiń parametry ↑' : 'Zobacz model →';
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
    if (window.motionUi && window.motionUi.lockScroll) window.motionUi.lockScroll();
    videoModalPlayer.currentTime = 0;
    videoModalPlayer.play().catch(function () { /* ignore */ });
  }

  function closeVideoModal() {
    if (!videoModal || !videoModalPlayer) return;
    videoModal.hidden = true;
    document.body.style.overflow = '';
    if (window.motionUi && window.motionUi.unlockScroll) window.motionUi.unlockScroll();
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

  function closeMobileNav() {
    if (!header || !navToggle) return;
    var wasOpen = header.classList.contains('is-nav-open');
    header.classList.remove('is-nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    if (wasOpen && window.motionUi && window.motionUi.unlockScroll) {
      window.motionUi.unlockScroll();
    }
  }

  function setModelsDropdownOpen(open) {
    var dropdown = document.querySelector('[data-nav-dropdown]');
    if (!dropdown) return;
    dropdown.classList.toggle('is-open', open);
    var toggle = dropdown.querySelector('.site-nav__dropdown-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
  }

  if (header && navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
      if (!open) setModelsDropdownOpen(false);
      if (window.motionUi) {
        if (open && window.motionUi.lockScroll) window.motionUi.lockScroll();
        else if (!open && window.motionUi.unlockScroll) window.motionUi.unlockScroll();
      }
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
        setModelsDropdownOpen(false);
      });
    });

    var modelsDropdownToggle = siteNav.querySelector('.site-nav__dropdown-toggle');
    if (modelsDropdownToggle) {
      modelsDropdownToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var dropdown = document.querySelector('[data-nav-dropdown]');
        if (!dropdown) return;
        setModelsDropdownOpen(!dropdown.classList.contains('is-open'));
      });
    }

    document.addEventListener('click', function (e) {
      var dropdown = document.querySelector('[data-nav-dropdown]');
      if (!dropdown || dropdown.contains(e.target)) return;
      setModelsDropdownOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setModelsDropdownOpen(false);
        closeMobileNav();
      }
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
    if (window.motionUi && window.motionUi.resetScrollLocks) window.motionUi.resetScrollLocks();

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
    setModelsDropdownOpen(false);
  }

  resetPageToDefaults();
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) resetPageToDefaults();
  });

  /* --- Back to top --- */
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    var toggleBackToTop = function (y) {
      var scrollY = typeof y === 'number' ? y : window.scrollY;
      backToTop.classList.toggle('is-visible', scrollY > 400);
    };
    if (window.motionUi && window.motionUi.onScroll) {
      window.motionUi.onScroll(toggleBackToTop);
    } else {
      window.addEventListener('scroll', function () { toggleBackToTop(window.scrollY); }, { passive: true });
      toggleBackToTop(window.scrollY);
    }
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.motionUi && window.motionUi.scrollToSection) {
        window.motionUi.scrollToSection('#top');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* --- Scroll spy (header nav) --- */
  var sections = document.querySelectorAll('main section[id], #kontakt');
  var navLinks = document.querySelectorAll('.site-nav__link[data-nav-section]');
  var navSectionIds = {
    'o-produkcie': true,
    'zastosowania': true,
    'korzysci': true,
    'modele': true,
    'faq': true
  };

  if (sections.length && navLinks.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          if (id && id.indexOf('model-palwrapp-') === 0) {
            id = 'modele';
          }
          if (!navSectionIds[id]) return;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('data-nav-section') === id);
          });
        }
      });
    }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
    document.querySelectorAll('.model-showcase__card[id]').forEach(function (card) {
      observer.observe(card);
    });
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
