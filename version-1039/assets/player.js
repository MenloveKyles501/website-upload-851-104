(function () {
  window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-player-video]');
    var trigger = document.querySelector('[data-player-trigger]');
    if (!video || !trigger || !source) {
      return;
    }
    var started = false;
    var hls = null;

    function playVideo() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function start() {
      trigger.classList.add('hidden');
      video.controls = true;
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = source;
      video.load();
      playVideo();
    }

    trigger.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
