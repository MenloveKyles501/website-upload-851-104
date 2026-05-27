(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 6500);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function setupSearch() {
    var input = document.getElementById('movieSearch');
    var output = document.getElementById('searchResults');
    if (!input || !output || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function render(items, term) {
      if (!term) {
        output.innerHTML = '<p class="empty-state">请输入关键词搜索影片。</p>';
        return;
      }
      if (!items.length) {
        output.innerHTML = '<p class="empty-state">没有找到匹配影片。</p>';
        return;
      }
      output.innerHTML = items.slice(0, 80).map(function (item) {
        var meta = [item.year, item.region, item.type, item.genre].filter(Boolean).join(' · ');
        var badge = String(item.year || '影').slice(0, 4);
        return '<a class="search-item" href="' + item.url + '">' +
          '<span class="search-badge">' + badge + '</span>' +
          '<span>' +
            '<h2>' + escapeHtml(item.title) + '</h2>' +
            '<p>' + escapeHtml(meta) + '</p>' +
            '<p>' + escapeHtml(item.summary || '') + '</p>' +
          '</span>' +
        '</a>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function search() {
      var term = normalize(input.value);
      var terms = term.split(/\s+/).filter(Boolean);
      var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          (item.tags || []).join(' '),
          item.summary
        ].join(' '));
        return terms.every(function (part) {
          return haystack.indexOf(part) !== -1;
        });
      });
      render(results, term);
    }

    input.addEventListener('input', search);
    document.querySelectorAll('[data-search-word]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-search-word') || '';
        search();
        input.focus();
      });
    });
    render([], '');
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
}());
