(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var button = qs('.mobile-menu-button');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function bindSearchForms() {
    qsa('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var url = './search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function bindHero() {
    var slides = qsa('[data-hero-slide]');
    if (!slides.length) {
      return;
    }
    var dots = qsa('[data-hero-dot]');
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setSlide(value) {
      index = (value + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function bindFilters() {
    var toolbar = qs('[data-filter-page]');
    var cards = qsa('[data-movie-card]');
    if (!toolbar || !cards.length) {
      return;
    }
    var keywordInput = qs('[data-filter-keyword]', toolbar);
    var yearSelect = qs('[data-filter-year]', toolbar);
    var typeSelect = qs('[data-filter-type]', toolbar);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && keywordInput) {
      keywordInput.value = initial;
    }

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function bindBackToTop() {
    var button = qs('.back-to-top');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('show', window.scrollY > 520);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
    bindBackToTop();
  });
})();
