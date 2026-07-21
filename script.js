(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* --- Tab switcher --- */
  var tabsContainer = document.querySelector('[data-tabs]');

  if (tabsContainer) {
    var tabButtons = tabsContainer.querySelectorAll('[role="tab"]');
    var tabPanels = tabsContainer.querySelectorAll('[role="tabpanel"]');

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

    function activateTab(btn) {
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
    }
  }

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

  /* --- Scroll spy (sidebar + header nav) --- */
  var sections = document.querySelectorAll('.article section[id], .article-hero[id], #kontakt');
  var navLinks = document.querySelectorAll('.sidebar__list a');

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
