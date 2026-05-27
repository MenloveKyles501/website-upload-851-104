(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var source = shell.getAttribute('data-source');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function initialize() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          window.setTimeout(resolve, 1200);
        });
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      return Promise.resolve();
    }

    function start() {
      initialize().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.setAttribute('controls', 'controls');
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        button.classList.add('is-hidden');
        start();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      if (button && !button.classList.contains('is-hidden')) {
        button.classList.add('is-hidden');
        start();
      }
    });

    video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        if (button) {
          button.classList.add('is-hidden');
        }
        start();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
}());
