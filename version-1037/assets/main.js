(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var searchInput = document.querySelector("[data-search-input]");
    var clearButton = document.querySelector("[data-clear-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .category-large-card"));

    function applySearch() {
        if (!searchInput) {
            return;
        }

        var keyword = searchInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
            var text = (card.getAttribute("data-title") || card.textContent || "").toLowerCase();
            card.classList.toggle("is-hidden", keyword !== "" && text.indexOf(keyword) === -1);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applySearch);
    }

    if (clearButton && searchInput) {
        clearButton.addEventListener("click", function () {
            searchInput.value = "";
            applySearch();
            searchInput.focus();
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function startCarousel() {
        if (slides.length <= 1) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var next = Number(dot.getAttribute("data-hero-dot"));
            showSlide(next);
            if (timer) {
                window.clearInterval(timer);
                startCarousel();
            }
        });
    });

    showSlide(0);
    startCarousel();
})();

function initMoviePlayer(videoId, shellId, overlayId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var shell = document.getElementById(shellId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var prepared = false;

    if (!video || !shell || !streamUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        prepare();
        shell.classList.add("is-started");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
        overlay.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                start();
            }
        });
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        shell.classList.add("is-started");
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
