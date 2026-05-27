(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    var menuButton = one('[data-menu-button]');
    var mobileMenu = one('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = one('[data-hero]');

    if (hero) {
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        showSlide(0);
        startHero();
    }

    all('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = one('[name="q"]', form);
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || './search.html';
            window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
        });
    });

    var filterRoot = one('[data-filter-root]');

    if (filterRoot) {
        var cards = all('[data-search]', filterRoot);
        var searchInput = one('[data-filter-search]', filterRoot);
        var regionSelect = one('[data-filter-region]', filterRoot);
        var typeSelect = one('[data-filter-type]', filterRoot);
        var emptyState = one('[data-empty-state]', filterRoot);
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(searchInput && searchInput.value);
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
})();
