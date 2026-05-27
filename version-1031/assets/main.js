(function () {
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5600);
      });
    });

    if (slides.length > 1) {
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var input = document.querySelector('[data-search-input]');
  var typeFilter = document.querySelector('[data-filter="type"]');
  var yearFilter = document.querySelector('[data-filter="year"]');
  var reset = document.querySelector('[data-filter-reset]');
  var empty = document.querySelector('[data-empty-state]');

  function pickQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
  }

  function applyFilters() {
    var query = input ? input.value.trim().toLowerCase() : '';
    var typeValue = typeFilter ? typeFilter.value : '';
    var yearValue = yearFilter ? yearFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var type = card.getAttribute('data-type') || '';
      var year = card.getAttribute('data-year') || '';
      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }

      if (typeValue && type !== typeValue) {
        matched = false;
      }

      if (yearValue && year.indexOf(yearValue) === -1) {
        matched = false;
      }

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (cards.length) {
    pickQuery();
    [input, typeFilter, yearFilter].forEach(function (item) {
      if (item) {
        item.addEventListener('input', applyFilters);
        item.addEventListener('change', applyFilters);
      }
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        applyFilters();
      });
    }
    applyFilters();
  }
})();
