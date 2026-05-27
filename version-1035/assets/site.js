(function () {
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function initHero() {
    const track = qs('.hero-track');
    const dotsWrap = qs('.hero-dots');
    if (!track || !dotsWrap) return;
    const slides = qsa('.hero-slide', track);
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    function go(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      qsa('button', dotsWrap).forEach((btn, i) => btn.classList.toggle('active', i === index));
    }

    dotsWrap.innerHTML = slides.map((_, i) => '<button type="button" aria-label="切换推荐 ' + (i + 1) + '"' + (i === 0 ? ' class="active"' : '') + '></button>').join('');
    qsa('button', dotsWrap).forEach((btn, i) => btn.addEventListener('click', function () {
      go(i);
      restart();
    }));

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 5200);
    }

    go(0);
    restart();
  }

  function initPlayer() {
    const player = qs('[data-player]');
    if (!player) return;
    const lines = qsa('[data-line]');
    if (!lines.length) return;

    function activate(btn) {
      lines.forEach(function (x) { x.classList.toggle('active', x === btn); });
      const src = btn.getAttribute('data-src');
      if (src && player.getAttribute('src') !== src) {
        player.setAttribute('src', src);
        player.load();
      }
    }

    lines.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn);
        player.play().catch(function () {});
      });
    });
    activate(lines[0]);
  }

  function getParam(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }

  function renderMovieCard(rec) {
    return [
      '<article class="movie-card">',
      '<a class="movie-link" href="movie-' + rec.ID + '.html">',
      '<div class="poster" style="--poster: ' + rec.poster + ';">',
      '<div class="poster-glow"></div>',
      '<div class="poster-badge">' + escapeHtml(rec.YEAR) + '</div>',
      '<div class="poster-title">' + escapeHtml(rec.TITLE) + '</div>',
      '<div class="poster-meta">' + escapeHtml(rec.TYPE) + ' · ' + escapeHtml(rec.REGION) + '</div>',
      '</div>',
      '<div class="movie-body">',
      '<div class="movie-head"><h3>' + escapeHtml(rec.TITLE) + '</h3><span class="score">#' + rec.ID + '</span></div>',
      '<p class="movie-meta">' + escapeHtml(rec.YEAR) + ' · ' + escapeHtml(rec.REGION) + ' · ' + escapeHtml(rec.TYPE) + '</p>',
      '<p class="movie-desc">' + escapeHtml(rec.ONE_LINE) + '</p>',
      '<div class="movie-tags">' + rec.tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearch() {
    const root = qs('[data-search-root]');
    if (!root || !window.MOVIE_DATA) return;
    const input = qs('[data-search-input]', root);
    const results = qs('[data-search-results]', root);
    const chips = qsa('[data-chip]', root);
    const hint = qs('[data-search-hint]', root);
    const params = new URLSearchParams(location.search);
    const q0 = params.get('q') || '';
    const chip0 = params.get('chip') || 'all';
    const data = window.MOVIE_DATA;
    let activeChip = chip0;

    function filter() {
      const q = (input.value || '').trim().toLowerCase();
      const list = data.filter(function (rec) {
        const chipOk = activeChip === 'all' || rec.category === activeChip;
        const text = [rec.TITLE, rec.REGION, rec.TYPE, rec.YEAR, rec.GENRE, rec.TAGS, rec.ONE_LINE, rec.SUMMARY, rec.REVIEW].join(' ').toLowerCase();
        const qOk = !q || text.indexOf(q) !== -1;
        return chipOk && qOk;
      });
      hint.textContent = '共找到 ' + list.length + ' 条结果';
      results.innerHTML = list.slice(0, 800).map(renderMovieCard).join('') || '<div class="detail-panel"><p style="margin:0;color:var(--muted)">没有找到匹配结果，尝试更换关键词。</p></div>';
    }

    input.value = q0;
    chips.forEach(function (chip) {
      chip.classList.toggle('active', chip.getAttribute('data-chip') === activeChip);
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-chip');
        chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
        filter();
      });
    });
    input.addEventListener('input', filter);
    filter();
  }

  function initFormSearch() {
    qsa('[data-go-search]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = qs('input[name="q"]', form);
        const q = input ? input.value.trim() : '';
        location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initPlayer();
    initSearch();
    initFormSearch();
  });
})();
