
(function(){
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
  const $ = (s, el=document) => el.querySelector(s);

  function initNav() {
    const btn = $('[data-nav-toggle]');
    const nav = $('[data-nav]');
    if (btn && nav) {
      btn.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }

  function initHeroCarousel() {
    const slides = $$('[data-hero-slide]');
    const dotsWrap = $('[data-hero-dots]');
    if (!slides.length || !dotsWrap) return;
    let idx = 0;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', '切换到第 ' + (i + 1) + ' 个推荐');
      b.addEventListener('click', () => show(i));
      dotsWrap.appendChild(b);
      return b;
    });
    function show(i) {
      idx = i;
      slides.forEach((s, n) => s.classList.toggle('active', n === i));
      dots.forEach((d, n) => d.classList.toggle('active', n === i));
    }
    show(0);
    setInterval(() => show((idx + 1) % slides.length), 5200);
  }

  function matchesCard(card, q) {
    const hay = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.year, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
    return hay.includes(q);
  }

  function applyFilters(root) {
    const q = (root.querySelector('[data-search-input]')?.value || '').trim().toLowerCase();
    const year = root.querySelector('[data-filter-year]')?.value || '';
    const type = root.querySelector('[data-filter-type]')?.value || '';
    const cards = $$('.movie-card', root);
    let visible = 0;
    cards.forEach(card => {
      const okQ = !q || matchesCard(card, q);
      const okYear = !year || card.dataset.year === year;
      const okType = !type || card.dataset.type.includes(type);
      const show = okQ && okYear && okType;
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    const out = root.querySelector('[data-result-count]');
    if (out) out.textContent = visible;
    const empty = root.querySelector('[data-empty]');
    if (empty) empty.classList.toggle('hidden', visible !== 0);
  }

  function initFilterPanels() {
    $$('[data-filter-root]').forEach(root => {
      const fields = $$('input, select', root);
      fields.forEach(f => f.addEventListener('input', () => applyFilters(root)));
      applyFilters(root);
    });
  }

  function initSearchPage() {
    const mount = $('[data-search-results]');
    if (!mount || !window.MOVIES) return;
    const params = new URLSearchParams(location.search);
    const q = (params.get('q') || '').trim().toLowerCase();
    const type = (params.get('type') || '').trim().toLowerCase();
    const year = (params.get('year') || '').trim();
    const sort = params.get('sort') || 'relevance';
    const list = [...window.MOVIES];
    list.sort((a,b) => {
      if (sort === 'year') return (b.YEAR||0) - (a.YEAR||0) || (a.id - b.id);
      if (sort === 'title') return (a.TITLE||'').localeCompare(b.TITLE||'','zh-CN');
      return (b.score||0) - (a.score||0) || (a.id - b.id);
    });
    const result = list.filter(item => {
      const hay = [item.TITLE, item.REGION, item.TYPE, item.YEAR, item.GENRE, item.TAGS, item.ONE_LINE, item.SUMMARY].join(' ').toLowerCase();
      return (!q || hay.includes(q)) && (!type || (item.TYPE||'').toLowerCase().includes(type)) && (!year || String(item.YEAR) === year);
    });
    const count = $('[data-search-count]');
    if (count) count.textContent = result.length;
    mount.innerHTML = result.map(item => `
      <article class="movie-card" data-title="${escapeHtml(item.TITLE)}" data-genre="${escapeHtml(item.GENRE)}" data-tags="${escapeHtml(item.TAGS)}" data-year="${escapeHtml(item.YEAR)}" data-region="${escapeHtml(item.REGION)}" data-type="${escapeHtml(item.TYPE)}">
        <a class="movie-link" href="movie-${String(item.id).padStart(4,'0')}.html">
          <div class="poster" style="--hue:${item.hue};">
            <span class="poster-id">${String(item.id).padStart(4,'0')}</span>
            <strong>${escapeHtml(item.TITLE)}</strong>
            <em>${escapeHtml(item.YEAR)}</em>
          </div>
          <div class="movie-meta">
            <div class="movie-title-row">
              <h3>${escapeHtml(item.TITLE)}</h3>
              <span class="year-badge">${escapeHtml(item.YEAR)}</span>
            </div>
            <p class="movie-kicker">${escapeHtml(item.REGION)} · ${escapeHtml(item.TYPE)} · ${escapeHtml(item.GENRE)}</p>
            <p class="movie-one-line">${escapeHtml(item.ONE_LINE)}</p>
            <div class="movie-tags">${(item.tags || []).slice(0,3).map(t=>`<span class="mini-pill">${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </a>
      </article>
    `).join('') || '<div class="empty-state">没有找到符合条件的影片，请调整关键词、类型或年份。</div>';
    const filterRoot = mount.closest('[data-filter-root]');
    if (filterRoot) {
      const input = filterRoot.querySelector('[data-search-input]');
      if (input) input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function initVideoPlayer() {
    const video = $('[data-video-player]');
    if (!video) return;
    const source = video.getAttribute('data-src') || '';
    const poster = video.getAttribute('data-poster') || '';
    if (poster) video.setAttribute('poster', poster);
    if (!source) return;
    const isM3U8 = /\.m3u8(\?|$)/i.test(source);
    if (isM3U8 && window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isM3U8) {
      video.src = source;
    } else {
      video.src = source;
    }
    const playBtn = $('[data-play-btn]');
    if (playBtn) {
      playBtn.addEventListener('click', () => video.play().catch(()=>{}));
    }
    const reloadBtn = $('[data-reload-btn]');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        video.currentTime = 0;
        video.play().catch(()=>{});
      });
    }
  }

  initNav();
  initHeroCarousel();
  initFilterPanels();
  initSearchPage();
  initVideoPlayer();
})();
