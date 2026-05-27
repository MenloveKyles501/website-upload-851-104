
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function getParam(name) { return new URLSearchParams(window.location.search).get(name) || ''; }
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-site-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var slider = $('.hero-slider');
    if (!slider) return;
    var slides = $all('.hero-slide', slider);
    if (slides.length <= 1) return;
    var prev = $('[data-hero-prev]');
    var next = $('[data-hero-next]');
    var dots = $all('[data-hero-dot]');
    var index = slides.findIndex(function (s) { return s.classList.contains('active'); });
    if (index < 0) index = 0;
    function show(i) {
      slides.forEach(function (slide, n) { slide.classList.toggle('active', n === i); });
      dots.forEach(function (dot, n) { dot.classList.toggle('active', n === i); });
      index = i;
    }
    function step(dir) {
      show((index + dir + slides.length) % slides.length);
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); });
    });
    setInterval(function () { step(1); }, 5500);
  }

  function initLocalFilter() {
    var bar = $('[data-filter-bar]');
    if (!bar) return;
    var input = $('[data-filter-input]', bar);
    var chips = $all('[data-filter-chip]', bar);
    var cards = $all('[data-filter-card]');
    var empty = $('[data-filter-empty]');
    function apply() {
      var q = (input ? input.value : '').trim().toLowerCase();
      var active = chips.find(function (c) { return c.classList.contains('active'); });
      var type = active ? (active.getAttribute('data-filter-chip') || '') : '';
      var count = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.tags, card.dataset.year]
          .join(' ')
          .toLowerCase();
        var ok = !q || text.indexOf(q) !== -1;
        if (type && type !== 'all') {
          ok = ok && (card.dataset.bucket === type || card.dataset.genre.toLowerCase().indexOf(type) !== -1 || card.dataset.type.toLowerCase().indexOf(type) !== -1 || card.dataset.tags.toLowerCase().indexOf(type) !== -1);
        }
        card.style.display = ok ? '' : 'none';
        if (ok) count += 1;
      });
      if (empty) empty.style.display = count ? 'none' : 'block';
    }
    if (input) input.addEventListener('input', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        apply();
      });
    });
    apply();
  }

  function initPlayer() {
    var video = $('[data-player-video]');
    if (!video) return;
    var sources = [];
    try {
      sources = JSON.parse(video.getAttribute('data-sources') || '[]');
    } catch (e) {
      sources = [];
    }
    if (!sources.length) return;
    var buttons = $all('[data-stream-btn]');
    var hls = null;

    function activate(index) {
      index = Math.max(0, Math.min(index, sources.length - 1));
      var src = sources[index];
      buttons.forEach(function (btn, i) {
        btn.classList.toggle('active', i === index);
      });
      if (hls) {
        try { hls.destroy(); } catch (e) {}
        hls = null;
      }
      var canNative = video.canPlayType('application/vnd.apple.mpegurl');
      if (canNative) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      video.dataset.currentStream = src;
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener('click', function () { activate(i); });
    });

    activate(0);
  }

  function renderMovieCard(mv) {
    return '\n<article class="search-item movie-card" data-filter-card data-title="' + escHtml(mv.title) + '" data-genre="' + escHtml(mv.genre) + '" data-region="' + escHtml(mv.region) + '" data-type="' + escHtml(mv.type) + '" data-year="' + mv.year + '" data-tags="' + escHtml(mv.tags) + '" data-bucket="' + escHtml(mv.bucket) + '">\n' +
      '  <a class="card-link" href="' + escHtml(mv.url) + '\">\n' +
      '    <div class="poster-wrap"><img src="' + escHtml(mv.img) + '" alt="' + escHtml(mv.title) + '" loading="lazy"><span class="poster-badge">' + escHtml(mv.type) + '</span></div>\n' +
      '    <div class="card-body">\n' +
      '      <div class="card-meta-top"><h3>' + escHtml(mv.title) + '</h3><span class="year">' + mv.year + '</span></div>\n' +
      '      <p class="card-meta">' + escHtml(mv.region) + ' · ' + escHtml(mv.genre) + '</p>\n' +
      '      <p class="card-desc">' + escHtml(mv.one_line || mv.summary || '') + '</p>\n' +
      '    </div>\n' +
      '  </a>\n' +
      '</article>';
  }

  function initGlobalSearch() {
    var app = $('#globalSearchApp');
    if (!app || !window.MOVIES_INDEX) return;
    var input = $('#globalSearchInput');
    var select = $('#globalSearchType');
    var results = $('#globalSearchResults');
    var note = $('#globalSearchNote');
    var q = (getParam('q') || '').trim();
    if (input) input.value = q;

    function run() {
      var query = (input ? input.value : '').trim().toLowerCase();
      var type = select ? select.value : '';
      var list = window.MOVIES_INDEX.filter(function (mv) {
        var hay = [mv.title, mv.year, mv.region, mv.type, mv.genre, mv.tags, mv.summary, mv.one_line].join(' ').toLowerCase();
        var ok = !query || hay.indexOf(query) !== -1;
        if (type && type !== 'all') ok = ok && (mv.bucket === type || mv.type === type || mv.genre.indexOf(type) !== -1);
        return ok;
      });
      if (note) note.textContent = query ? ('找到 ' + list.length + ' 条结果') : ('展示 ' + list.length + ' 条热门内容');
      if (results) {
        results.innerHTML = list.slice(0, 180).map(renderMovieCard).join('') || '<div class="empty-state">没有找到匹配的影片，请尝试更短的关键词。</div>';
      }
    }

    if (input) input.addEventListener('input', run);
    if (select) select.addEventListener('change', run);
    run();
  }

  function initPageAnchors() {
    $all('[data-jump-to]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.querySelector(btn.getAttribute('data-jump-to'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeroSlider();
    initLocalFilter();
    initPlayer();
    initGlobalSearch();
    initPageAnchors();
  });
})();
