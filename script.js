(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* --- Benefits accordion --- */
  var accordion = document.querySelector('[data-accordion]');

  if (accordion) {
    accordion.querySelectorAll('.benefit-item__header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.benefit-item');
        var body = document.getElementById(btn.getAttribute('aria-controls'));
        var isOpen = item.classList.contains('is-open');

        accordion.querySelectorAll('.benefit-item').forEach(function (other) {
          var otherBtn = other.querySelector('.benefit-item__header');
          var otherBody = document.getElementById(otherBtn.getAttribute('aria-controls'));
          other.classList.remove('is-open');
          otherBtn.setAttribute('aria-expanded', 'false');
          if (otherBody) otherBody.hidden = true;
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          if (body) body.hidden = false;
        }
      });
    });
  }

  /* --- Tab switcher --- */
  var tabsContainer = document.querySelector('[data-tabs]');
  var activateTab = null;

  if (tabsContainer) {
    var tabButtons = tabsContainer.querySelectorAll('[role="tab"]');
    var tabPanels = tabsContainer.querySelectorAll('[role="tabpanel"]');

    activateTab = function (btn) {
      var panelId = btn.getAttribute('aria-controls');

      tabButtons.forEach(function (b) {
        var isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-selected', String(isActive));
        b.tabIndex = isActive ? 0 : -1;
      });

      tabPanels.forEach(function (panel) {
        var isTarget = panel.id === panelId;
        panel.classList.toggle('is-active', isTarget);
        if (isTarget) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    };

    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activateTab(btn);
      });

      btn.addEventListener('keydown', function (e) {
        var index = Array.prototype.indexOf.call(tabButtons, btn);
        var target;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          target = tabButtons[(index + 1) % tabButtons.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          target = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
        } else if (e.key === 'Home') {
          e.preventDefault();
          target = tabButtons[0];
        } else if (e.key === 'End') {
          e.preventDefault();
          target = tabButtons[tabButtons.length - 1];
        }

        if (target) {
          activateTab(target);
          target.focus();
        }
      });
    });
  }

  /* --- Reset stanu przy każdym wejściu na stronę --- */
  function resetPageToDefaults() {
    document.querySelectorAll('.video-card__player').forEach(function (video) {
      try {
        video.pause();
        if (video.readyState >= 1) {
          video.currentTime = 0;
        } else {
          video.addEventListener('loadedmetadata', function onMeta() {
            video.currentTime = 0;
            video.removeEventListener('loadedmetadata', onMeta);
          });
        }
      } catch (err) { /* ignore */ }
    });

    if (accordion) {
      accordion.querySelectorAll('.benefit-item').forEach(function (item, index) {
        var btn = item.querySelector('.benefit-item__header');
        var body = btn && document.getElementById(btn.getAttribute('aria-controls'));
        var open = index === 0;
        item.classList.toggle('is-open', open);
        if (btn) btn.setAttribute('aria-expanded', String(open));
        if (body) body.hidden = !open;
      });
    }

    if (tabsContainer && activateTab) {
      var firstTab = tabsContainer.querySelector('[role="tab"]');
      if (firstTab) activateTab(firstTab);
    }

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

    var toc = document.querySelector('[data-mobile-toc]');
    if (toc) {
      toc.classList.remove('is-open');
      var toggle = document.getElementById('mobile-toc-toggle');
      var panel = document.getElementById('mobile-toc-panel');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    }
  }

  resetPageToDefaults();

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) resetPageToDefaults();
  });

  /* --- Reading progress --- */
  var progressBar = document.getElementById('reading-progress');
  var article = document.querySelector('.article');

  if (progressBar && article) {
    window.addEventListener('scroll', function () {
      var rect = article.getBoundingClientRect();
      var articleTop = rect.top + window.scrollY;
      var articleHeight = article.offsetHeight;
      var scrolled = window.scrollY - articleTop;
      var progress = Math.min(Math.max(scrolled / articleHeight, 0), 1);
      progressBar.style.width = (progress * 100) + '%';
    }, { passive: true });
  }

  /* --- Ukryj floating CTA na sekcji kontakt --- */
  var floatingCta = document.querySelector('.floating-cta');
  var kontaktSection = document.getElementById('kontakt');

  if (floatingCta && kontaktSection) {
    var kontaktObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatingCta.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, {
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.1
    });

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

  /* --- Mobile TOC toggle --- */
  var mobileToc = document.querySelector('[data-mobile-toc]');
  var mobileTocToggle = document.getElementById('mobile-toc-toggle');
  var mobileTocPanel = document.getElementById('mobile-toc-panel');

  if (mobileToc && mobileTocToggle && mobileTocPanel) {
    function closeMobileToc() {
      mobileToc.classList.remove('is-open');
      mobileTocToggle.setAttribute('aria-expanded', 'false');
      mobileTocPanel.hidden = true;
    }

    function openMobileToc() {
      mobileToc.classList.add('is-open');
      mobileTocToggle.setAttribute('aria-expanded', 'true');
      mobileTocPanel.hidden = false;
    }

    mobileTocToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (mobileTocPanel.hidden) {
        openMobileToc();
      } else {
        closeMobileToc();
      }
    });

    mobileTocPanel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileToc);
    });

    document.addEventListener('click', function (e) {
      if (!mobileToc.contains(e.target)) closeMobileToc();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileToc();
    });
  }

  /* --- Scroll spy (sidebar + mobile TOC) --- */
  var sections = document.querySelectorAll('.article section[id], #kontakt');
  var navLinks = document.querySelectorAll('.sidebar__list a, .mobile-toc__list a');

  if (sections.length && navLinks.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var isActive = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', isActive);
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* --- Lead form (wg wykladarkaspolex.netlify.app) --- */
  var form = document.getElementById('lead-form');
  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');
  var requiredFields = ['imie', 'firma', 'email', 'produkt'];

  if (!form) return;

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
    label.textContent = 'Wysyłanie…';
    status.className = 'form-status';

    window.setTimeout(function () {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      label.textContent = 'Wyślij zapytanie';
      setStatus('Dziękujemy — wiadomość dotarła (formularz demo: podłącz backend w polu action).', 'success');
      form.reset();
    }, 900);
  });
})();
