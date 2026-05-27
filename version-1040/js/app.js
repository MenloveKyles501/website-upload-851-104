(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-live-search]"));
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    inputs.forEach(function (input) {
      if (input.hasAttribute("data-query-source") && initial) {
        input.value = initial;
      }
    });

    function apply() {
      var keyword = normalize(inputs.map(function (input) {
        return input.value;
      }).filter(Boolean).join(" "));
      var activeButton = document.querySelector("[data-filter-value].active");
      var filterValue = normalize(activeButton ? activeButton.getAttribute("data-filter-value") : "");

      grids.forEach(function (grid) {
        Array.prototype.slice.call(grid.querySelectorAll("[data-card]")).forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
          var filterOk = !filterValue || haystack.indexOf(filterValue) !== -1;
          card.hidden = !(keywordOk && filterOk);
        });
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        apply();
      });
    });

    apply();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-overlay");
      var message = shell.querySelector(".player-message");
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-src");
      var stream = null;
      var initialized = false;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("show");
      }

      function init() {
        if (initialized || !source) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          stream = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          stream.loadSource(source);
          stream.attachMedia(video);
          stream.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("播放暂时不可用，请稍后再试。");
            }
          });
        } else {
          video.src = source;
        }
      }

      function play() {
        init();
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            showMessage("播放暂时不可用，请稍后再试。");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (stream) {
          stream.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
